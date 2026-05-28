// Shared username rules so the gate and the onboarding form agree.

export const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

export function emailLocalPart(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
}

// True when the stored username isn't a real, user-chosen nickname yet:
// either it's empty, or it still equals the email handle (the old default
// that leaked addresses onto the leaderboard).
export function needsUsername(
  username: string | null | undefined,
  email: string | null | undefined,
): boolean {
  if (!username) return true;
  const local = emailLocalPart(email);
  return local != null && username.toLowerCase() === local.toLowerCase();
}
