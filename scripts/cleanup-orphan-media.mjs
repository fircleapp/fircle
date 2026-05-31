#!/usr/bin/env node

/**
 * Cleanup orphaned media objects in R2 storage.
 * 
 * Compares objects in the R2 bucket against PostMedia table entries.
 * Objects not found in PostMedia are considered orphaned and can be deleted.
 * 
 * Usage:
 *   # Dry run (default, no deletions):
 *   pnpm media:cleanup
 * 
 *   # Real deletion:
 *   pnpm media:cleanup:delete
 *   node scripts/cleanup-orphan-media.mjs -DELETE
 */

import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

const requiredEnv = [
  "R2_ACCOUNT_ID",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "DATABASE_URL",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
}

const DRY_RUN = !process.argv.includes("-DELETE");
const POST_MEDIA_ONLY = true;
const LIST_PREFIX = process.env.LIST_PREFIX ?? "families/";
const DELETE_BATCH_SIZE = Math.min(
  1000,
  Math.max(1, Number.parseInt(process.env.DELETE_BATCH_SIZE ?? "500", 10)),
);

function isPostMediaKey(key) {
  // Only consider keys under /posts/ path as post media.
  // This protects avatars, family images, and other assets from accidental deletion.
  return key.includes("/posts/");
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = -1;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

async function listAllBucketKeys(s3, bucket, prefix) {
  const objects = [];
  let continuationToken = undefined;

  while (true) {
    const out = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      }),
    );

    for (const obj of out.Contents ?? []) {
      if (obj.Key) {
        objects.push({
          key: obj.Key,
          size: obj.Size ?? 0,
        });
      }
    }

    if (!out.IsTruncated) break;
    continuationToken = out.NextContinuationToken;
  }

  return objects;
}

async function deleteKeysInBatches(s3, bucket, keys, batchSize) {
  let deleted = 0;

  for (let i = 0; i < keys.length; i += batchSize) {
    const slice = keys.slice(i, i + batchSize);
    const out = await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: slice.map((Key) => ({ Key })),
          Quiet: true,
        },
      }),
    );

    deleted += out.Deleted?.length ?? 0;

    if ((out.Errors?.length ?? 0) > 0) {
      console.error("Delete errors:", out.Errors);
    }
  }

  return deleted;
}

async function main() {
  const bucket = process.env.R2_BUCKET;
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  console.log("Starting orphan media cleanup scan...\n");

  // Fetch all PostMedia entries.
  // PostMedia is populated during post creation in src/server/api/routers/post.ts
  const rows = await prisma.postMedia.findMany({
    select: { objectKey: true },
  });

  const dbKeys = new Set(rows.map((r) => r.objectKey));

  // List all objects in the bucket.
  const bucketObjectsRaw = await listAllBucketKeys(s3, bucket, LIST_PREFIX);
  const bucketObjects = POST_MEDIA_ONLY
    ? bucketObjectsRaw.filter((object) => isPostMediaKey(object.key))
    : bucketObjectsRaw;
  const bucketKeySet = new Set(bucketObjectsRaw.map((object) => object.key));

  // Find orphaned keys (in bucket but not in PostMedia).
  const orphanObjects = bucketObjects.filter((object) => !dbKeys.has(object.key));
  const orphanBytes = orphanObjects.reduce((total, object) => total + object.size, 0);
  
  // Find missing keys (in PostMedia but not in bucket).
  const missingInBucket = [...dbKeys].filter((k) => !bucketKeySet.has(k));

  console.log("=== Scan Summary ===");
  console.log({
    dryRun: DRY_RUN,
    listPrefix: LIST_PREFIX,
    postMediaOnly: POST_MEDIA_ONLY,
    dbPostMediaCount: dbKeys.size,
    bucketListedCount: bucketObjectsRaw.length,
    bucketComparedCount: bucketObjects.length,
    orphanCount: orphanObjects.length,
    orphanBytes,
    orphanSize: formatBytes(orphanBytes),
    dbMissingInBucketCount: missingInBucket.length,
  });

  if (orphanObjects.length > 0) {
    console.log("\n=== Sample Orphan Keys ===");
    console.log(
      orphanObjects.slice(0, 20).map((object) => ({
        key: object.key,
        sizeBytes: object.size,
        size: formatBytes(object.size),
      })),
    );
  }
  
  if (missingInBucket.length > 0) {
    console.log("\n=== Sample DB Keys Missing in Bucket ===");
    console.log(missingInBucket.slice(0, 20));
  }

  if (DRY_RUN) {
    console.log("\n⚠️  Dry run enabled. No deletions executed.");
    console.log("To delete orphaned objects, run:");
    console.log(`  node scripts/cleanup-orphan-media.mjs -DELETE`);
    return;
  }

  if (orphanObjects.length === 0) {
    console.log("\n✓ No orphaned objects found. Nothing to delete.");
    return;
  }

  console.log(
    `\n🗑️  Deleting ${orphanObjects.length} orphan objects (${formatBytes(orphanBytes)})...`,
  );
  const deleted = await deleteKeysInBatches(
    s3,
    bucket,
    orphanObjects.map((object) => object.key),
    DELETE_BATCH_SIZE,
  );
  console.log(`✓ Deleted ${deleted} orphan objects from bucket ${bucket}`);
}

main()
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
