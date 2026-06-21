import { env } from "~/env";
import { verifyDomainViaDns } from "~/server/domain-verification/dns";
import { verifyDomainViaHttp } from "~/server/domain-verification/http";
import { logVerificationAttempt } from "~/server/domain-verification/logging";
import { validateDomainVerificationTarget } from "~/server/domain-verification/target";
import type {
  DomainVerificationMethod,
  DomainVerificationResult,
} from "~/server/domain-verification/types";

interface VerifyDomainOwnershipInput {
  domain: string;
  token: string;
  method: DomainVerificationMethod;
  timeoutMs?: number;
  maxAttempts?: number;
  retryDelayMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 500;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runSingleAttempt(
  input: VerifyDomainOwnershipInput,
): Promise<DomainVerificationResult> {
  if (input.method === "dns") {
    return verifyDomainViaDns({
      domain: input.domain,
      token: input.token,
      timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });
  }

  return verifyDomainViaHttp({
    domain: input.domain,
    token: input.token,
    timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  });
}

function shouldRetry(result: DomainVerificationResult): boolean {
  return result.status === "pending" || result.status === "timeout";
}

export async function verifyDomainOwnership(
  input: VerifyDomainOwnershipInput,
): Promise<DomainVerificationResult> {
  const timeoutMs = clampNumber(
    input.timeoutMs ?? env.DOMAIN_VERIFICATION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS,
    1_000,
    20_000,
  );
  const maxAttempts = clampNumber(
    input.maxAttempts ?? env.DOMAIN_VERIFICATION_MAX_ATTEMPTS ?? DEFAULT_MAX_ATTEMPTS,
    1,
    5,
  );
  const retryDelayMs = clampNumber(
    input.retryDelayMs ?? env.DOMAIN_VERIFICATION_RETRY_DELAY_MS ?? DEFAULT_RETRY_DELAY_MS,
    100,
    5_000,
  );

  if (!env.DOMAIN_VERIFICATION_ENABLED) {
    return {
      status: "verified",
      method: input.method,
      durationMs: 0,
      message: "Domain verification checks are disabled by configuration",
    };
  }

  const targetValidation = validateDomainVerificationTarget(input.domain, env.NODE_ENV);
  if (!targetValidation.ok || !targetValidation.normalizedDomain) {
    return {
      status: "invalid-proof",
      method: input.method,
      durationMs: 0,
      message: targetValidation.message ?? "Invalid domain verification target",
    };
  }

  const normalizedDomain = targetValidation.normalizedDomain;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await runSingleAttempt({
      ...input,
      domain: normalizedDomain,
      timeoutMs,
    });

    logVerificationAttempt({
      domain: normalizedDomain,
      method: input.method,
      status: result.status,
      attempt,
      durationMs: result.durationMs,
      message: result.message,
    });

    if (result.status === "verified") {
      return result;
    }

    if (!shouldRetry(result) || attempt === maxAttempts) {
      return result;
    }

    await sleep(retryDelayMs);
  }

  return {
    status: "unreachable",
    method: input.method,
    durationMs: 0,
    message: "Verification attempts exhausted",
  };
}
