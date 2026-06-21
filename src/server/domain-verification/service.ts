import { verifyDomainViaDns } from "~/server/domain-verification/dns";
import { verifyDomainViaHttp } from "~/server/domain-verification/http";
import { logVerificationAttempt } from "~/server/domain-verification/logging";
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
  const maxAttempts = input.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryDelayMs = input.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await runSingleAttempt({
      ...input,
      timeoutMs: input.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    logVerificationAttempt({
      domain: input.domain,
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
