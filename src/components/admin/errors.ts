/** Firebase errors in plain words. */

const AUTH: Record<string, string> = {
  'auth/invalid-credential': 'The email or password is not right.',
  'auth/invalid-login-credentials': 'The email or password is not right.',
  // never say which of the two was wrong: that would tell a stranger the account exists
  'auth/wrong-password': 'The email or password is not right.',
  'auth/user-not-found': 'The email or password is not right.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/missing-password': 'Enter the password.',
  'auth/user-disabled': 'This account has been switched off in Firebase.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes before trying again, or reset the password.',
  'auth/network-request-failed': 'There is no connection to Firebase. Check the internet connection and try again.',
  'auth/weak-password': 'Firebase rejected this password as too weak. Choose a longer one.',
  'auth/requires-recent-login': 'For safety, sign out and sign in again, then change the password.',
  'auth/operation-not-allowed':
    'Email sign-in is not switched on for this Firebase project yet (Firebase console → Authentication → Sign-in method → Email/Password).',
  'auth/configuration-not-found':
    'Firebase Authentication is not set up for this project yet (Firebase console → Authentication → Get started, then switch on Email/Password).',
  'auth/password-does-not-meet-requirements': 'The new password does not meet the password policy set in Firebase.',
};

export function codeOf(error: unknown): string {
  return typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
}

export function authMessage(error: unknown): string {
  const code = codeOf(error);
  return AUTH[code] ?? `That did not work${code ? ` (${code})` : ''}. Try again in a moment.`;
}

export function isPermissionDenied(error: unknown): boolean {
  const text = `${codeOf(error)} ${error instanceof Error ? error.message : String(error)}`.toLowerCase();
  return text.includes('permission') && text.includes('denied');
}

export function writeMessage(error: unknown): string {
  if (isPermissionDenied(error))
    return 'Firebase refused the change: this account is not allowed to publish prices, or a value is outside the allowed range.';
  const text = error instanceof Error ? error.message : String(error);
  return `The prices were not published (${text}). Nothing on the site has changed.`;
}
