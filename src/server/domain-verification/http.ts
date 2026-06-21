import type { DomainVerificationResult } from "~/server/domain-verification/types";

interface VerifyDomainViaHttpInput {
  domain: string;
  token: string;
  timeoutMs: number;
}

const WELL_KNOWN_VERIFICATION_PATH = "/.well-known/fircle-verification";

function mapHttpStatusToResult(status: number): DomainVerificationResult["status"] {
  if (status === 404) {
    return "pending";
  }

  if (status >= 500) {
    return "unreachable";
  }

  return "invalid-proof";
}

export async function verifyDomainViaHttp(
  input: VerifyDomainViaHttpInput,
): Promise<DomainVerificationResult> {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await fetch(
      `https://${input.domain}${WELL_KNOWN_VERIFICATION_PATH}`,
      {
        method: "GET",
        signal: controller.signal,
        headers: {
          Accept: "text/plain",
        },
      },
    );

    const durationMs = Date.now() - startedAt;

    if (!response.ok) {
      return {
        status: mapHttpStatusToResult(response.status),
        method: "http",
        durationMs,
        message: `HTTP verification endpoint responded with ${response.status}`,
      };
    }

    const body = (await response.text()).trim();

    if (body === input.token) {
      return {
        status: "verified",
        method: "http",
        durationMs,
        message: "HTTP verification token matched",
      };
    }

    return {
      status: "invalid-proof",
      method: "http",
      durationMs,
      message: "HTTP verification token does not match",
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const isAbortError =
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      String(error.name) === "AbortError";

    if (isAbortError) {
      return {
        status: "timeout",
        method: "http",
        durationMs,
        message: "HTTP verification request timed out",
      };
    }

    return {
      status: "unreachable",
      method: "http",
      durationMs,
      message: "HTTP verification request failed",
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
}
