export type DomainVerificationMethod = "dns" | "http";

export type DomainVerificationStatus =
  | "verified"
  | "pending"
  | "invalid-proof"
  | "unreachable"
  | "timeout";

export interface DomainVerificationResult {
  status: DomainVerificationStatus;
  method: DomainVerificationMethod;
  durationMs: number;
  message: string;
}
