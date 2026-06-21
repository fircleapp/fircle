import { isIP } from "node:net";

interface TargetValidationResult {
  ok: boolean;
  normalizedDomain?: string;
  message?: string;
}

const RESERVED_TLDS = [
  ".localhost",
  ".local",
  ".test",
  ".example",
  ".invalid",
] as const;

function isPrivateIpv4(address: string): boolean {
  const segments = address.split(".").map((part) => Number(part));
  if (segments.length !== 4 || segments.some(Number.isNaN)) {
    return false;
  }

  const a = segments[0] ?? -1;
  const b = segments[1] ?? -1;

  if (a === 10) {
    return true;
  }

  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  if (a === 192 && b === 168) {
    return true;
  }

  if (a === 169 && b === 254) {
    return true;
  }

  return false;
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  return normalized.startsWith("fc") || normalized.startsWith("fd");
}

function normalizeDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase();
  if (normalized.endsWith(".")) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

function isValidHostname(hostname: string): boolean {
  if (hostname.length < 1 || hostname.length > 253) {
    return false;
  }

  if (!/^[a-z0-9.-]+$/.test(hostname)) {
    return false;
  }

  const labels = hostname.split(".");
  return labels.every((label) => {
    if (label.length < 1 || label.length > 63) {
      return false;
    }
    if (label.startsWith("-") || label.endsWith("-")) {
      return false;
    }
    return /^[a-z0-9-]+$/.test(label);
  });
}

export function validateDomainVerificationTarget(
  domain: string,
  nodeEnv: "development" | "test" | "production",
): TargetValidationResult {
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedDomain) {
    return {
      ok: false,
      message: "Domain is empty",
    };
  }

  if (normalizedDomain.includes(":") || normalizedDomain.includes("/")) {
    return {
      ok: false,
      message: "Domain must not include protocol, path, or port",
    };
  }

  if (normalizedDomain === "localhost") {
    return {
      ok: false,
      message: "Localhost cannot be used for domain verification",
    };
  }

  const ipFamily = isIP(normalizedDomain);

  if (ipFamily === 4) {
    if (normalizedDomain === "127.0.0.1") {
      return {
        ok: false,
        message: "Loopback addresses cannot be used for domain verification",
      };
    }

    if (nodeEnv === "production" && isPrivateIpv4(normalizedDomain)) {
      return {
        ok: false,
        message: "Private IPv4 targets are not allowed in production",
      };
    }

    return {
      ok: true,
      normalizedDomain,
    };
  }

  if (ipFamily === 6) {
    if (normalizedDomain === "::1") {
      return {
        ok: false,
        message: "Loopback addresses cannot be used for domain verification",
      };
    }

    if (nodeEnv === "production" && isPrivateIpv6(normalizedDomain)) {
      return {
        ok: false,
        message: "Private IPv6 targets are not allowed in production",
      };
    }

    return {
      ok: true,
      normalizedDomain,
    };
  }

  if (!isValidHostname(normalizedDomain)) {
    return {
      ok: false,
      message: "Domain format is invalid",
    };
  }

  if (
    nodeEnv === "production" &&
    RESERVED_TLDS.some(
      (suffix) =>
        normalizedDomain === suffix.slice(1) || normalizedDomain.endsWith(suffix),
    )
  ) {
    return {
      ok: false,
      message: "Reserved local/test domains are not allowed in production",
    };
  }

  return {
    ok: true,
    normalizedDomain,
  };
}
