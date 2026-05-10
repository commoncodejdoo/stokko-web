/**
 * Domain-level auth errors. The data layer wraps server errors into these.
 *
 * The unified server error shape carries `code` (SCREAMING_SNAKE_CASE)
 * which is used to discriminate. Falls back to `Unexpected` when unknown.
 */

export class InvalidCredentialsError extends Error {
  readonly code = 'INVALID_CREDENTIALS' as const;
  constructor() {
    super('Pogrešni email ili lozinka.');
  }
}

export class WeakPasswordError extends Error {
  readonly code = 'WEAK_PASSWORD' as const;
  constructor() {
    super('Lozinka je preslaba (min. 8 znakova).');
  }
}

export class RefreshTokenInvalidError extends Error {
  readonly code = 'REFRESH_TOKEN_INVALID' as const;
  constructor() {
    super('Sesija je istekla. Prijavi se ponovo.');
  }
}

export class PasswordChangeTokenInvalidError extends Error {
  readonly code = 'PASSWORD_CHANGE_TOKEN_INVALID' as const;
  constructor() {
    super('Token za promjenu lozinke je istekao. Prijavi se ponovo.');
  }
}

export class NetworkError extends Error {
  readonly code = 'NETWORK_ERROR' as const;
  constructor() {
    super('Nema povezanosti s poslužiteljem. Provjeri internet.');
  }
}

export class UnexpectedAuthError extends Error {
  readonly code = 'UNEXPECTED' as const;
  constructor(detail?: string) {
    super(detail ?? 'Dogodila se neočekivana greška.');
  }
}

export type AuthError =
  | InvalidCredentialsError
  | WeakPasswordError
  | RefreshTokenInvalidError
  | PasswordChangeTokenInvalidError
  | NetworkError
  | UnexpectedAuthError;
