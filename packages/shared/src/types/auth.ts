import { z } from 'zod';
import {
  registerInputSchema,
  loginInputSchema,
  registerResponseSchema,
  loginResponseSchema,
  apiErrorSchema,
} from '../schemas/auth';

export type RegisterInput = z.infer<typeof registerInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;