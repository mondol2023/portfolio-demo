/** Generic API envelope shapes shared between client and server. */

export type ApiError = {
  error: string;
  message: string;
  details?: Record<string, string[]>;
};

export type ApiSuccess<T> = {
  data: T;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: string;
  user: { id: string; email: string; role: "admin" };
};
