import type { DomainVerificationMethod, DomainVerificationStatus } from "~/server/domain-verification/types";

interface LogVerificationAttemptInput {
  domain: string;
  method: DomainVerificationMethod;
  status: DomainVerificationStatus;
  attempt: number;
  durationMs: number;
  message: string;
}

export function logVerificationAttempt(input: LogVerificationAttemptInput): void {
  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      ctx: "domain-verification",
      domain: input.domain,
      method: input.method,
      status: input.status,
      attempt: input.attempt,
      durationMs: input.durationMs,
      message: input.message,
    }),
  );
}
