import { z } from 'zod';

export const loginSchema = z.object({
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  studentId: z
    .string()
    .min(1, 'Student ID is required')
    .max(50, 'Student ID is too long'),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
