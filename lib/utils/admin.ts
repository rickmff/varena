/**
 * Admin utility functions for checking admin status
 */

/**
 * Get list of admin emails from environment variable
 * @returns Array of admin email addresses
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS || "";

  if (!adminEmails) {
    return [];
  }

  // Split by comma and trim whitespace
  return adminEmails
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

/**
 * Check if an email address is an admin
 * @param email - Email address to check
 * @returns true if the email is in the admin list
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const adminEmails = getAdminEmails();
  const normalizedEmail = email.trim().toLowerCase();

  return adminEmails.includes(normalizedEmail);
}

/**
 * Server-side check if current user is admin
 * @param session - User session object
 * @returns true if user is admin
 */
export function isAdmin(session: { user?: { email?: string } } | null): boolean {
  return isAdminEmail(session?.user?.email);
}

