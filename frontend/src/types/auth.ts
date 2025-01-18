export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export type ApiError = {
  error: string;
};