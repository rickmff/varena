import fs from "node:fs";
import path from "node:path";

const BLOCKLIST_PATH = path.join(process.cwd(), "data", "disposable_email_blocklist.conf");

let cachedBlockedDomains: Set<string> | null = null;

function parseDomainList(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

function loadBlockedDomains(): Set<string> {
  if (cachedBlockedDomains) {
    return cachedBlockedDomains;
  }

  const domains = new Set<string>();

  try {
    const blocklist = fs.readFileSync(BLOCKLIST_PATH, "utf8");

    for (const line of blocklist.split(/\r?\n/)) {
      const domain = line.trim().toLowerCase();
      if (domain && !domain.startsWith("#")) {
        domains.add(domain);
      }
    }
  } catch (error) {
    console.error("[Disposable Email] Failed to load blocklist:", error);
  }

  for (const domain of parseDomainList(process.env.BLOCKED_EMAIL_DOMAINS)) {
    domains.add(domain);
  }

  for (const domain of parseDomainList(process.env.ALLOWED_EMAIL_DOMAINS)) {
    domains.delete(domain);
  }

  cachedBlockedDomains = domains;
  return domains;
}

export function getEmailDomain(email: string | null | undefined): string | null {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return null;
  }

  return email.split("@").pop()?.trim().toLowerCase() || null;
}

export function isDisposableEmail(email: string | null | undefined): boolean {
  const emailDomain = getEmailDomain(email);
  if (!emailDomain) {
    return false;
  }

  const blockedDomains = loadBlockedDomains();
  let domainToCheck = emailDomain;

  while (domainToCheck) {
    if (blockedDomains.has(domainToCheck)) {
      return true;
    }

    const dotIndex = domainToCheck.indexOf(".");
    if (dotIndex === -1) {
      break;
    }

    domainToCheck = domainToCheck.slice(dotIndex + 1);
  }

  return false;
}
