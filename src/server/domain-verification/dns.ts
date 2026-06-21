import { resolveTxt } from "node:dns/promises";

import type { DomainVerificationResult } from "~/server/domain-verification/types";

interface VerifyDomainViaDnsInput {
  domain: string;
  token: string;
  timeoutMs: number;
}

function normalizeRecord(record: string): string {
  return record.trim();
}

export async function verifyDomainViaDns(
  input: VerifyDomainViaDnsInput,
): Promise<DomainVerificationResult> {
  const startedAt = Date.now();
  const dnsName = `_fircle-verification.${input.domain}`;

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error("DNS_TIMEOUT"));
    }, input.timeoutMs);
  });

  try {
    const records = await Promise.race([resolveTxt(dnsName), timeoutPromise]);
    const flattened = records.flat().map(normalizeRecord);
    const expectedValue = `fircle-verification=${input.token}`;
    const hasExpectedRecord = flattened.includes(expectedValue);

    if (hasExpectedRecord) {
      return {
        status: "verified",
        method: "dns",
        durationMs: Date.now() - startedAt,
        message: "DNS TXT verification record matched",
      };
    }

    const hasAnyFircleRecord = flattened.some((record) =>
      record.startsWith("fircle-verification="),
    );

    if (hasAnyFircleRecord) {
      return {
        status: "invalid-proof",
        method: "dns",
        durationMs: Date.now() - startedAt,
        message: "DNS TXT record exists but token does not match",
      };
    }

    return {
      status: "pending",
      method: "dns",
      durationMs: Date.now() - startedAt,
      message: "DNS TXT record not found yet",
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : null;

    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        status: "pending",
        method: "dns",
        durationMs,
        message: "DNS TXT record not found yet",
      };
    }

    if (code === "ETIMEOUT") {
      return {
        status: "timeout",
        method: "dns",
        durationMs,
        message: "DNS lookup timed out",
      };
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      String(error.message) === "DNS_TIMEOUT"
    ) {
      return {
        status: "timeout",
        method: "dns",
        durationMs,
        message: "DNS lookup timed out",
      };
    }

    return {
      status: "unreachable",
      method: "dns",
      durationMs,
      message: "DNS lookup failed",
    };
  }
}
