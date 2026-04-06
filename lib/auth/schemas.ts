import { z } from 'zod';

import { normalizeEmail } from './normalization';

export const passwordSchema = z
  .string()
  .trim()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

export const optionalNameSchema = z
  .string()
  .trim()
  .min(2, 'Full name must be at least 2 characters long.')
  .max(100, 'Full name must be 100 characters or fewer.')
  .or(z.literal(''))
  .transform((value) => value.trim());

export const bootstrapAdminSchema = z
  .object({
    fullName: optionalNameSchema,
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Enter a valid email address.')
      .transform(normalizeEmail),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const optionalExpirationSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.coerce
    .number()
    .int('Expiration must be a whole number of days.')
    .min(1, 'Expiration must be at least 1 day.')
    .max(30, 'Expiration cannot exceed 30 days.')
    .optional()
);

export const createInviteSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.')
    .transform(normalizeEmail),
  role: z.enum(['admin', 'responder']),
  expiresInDays: optionalExpirationSchema,
});

export const reissueInviteSchema = z.object({
  inviteId: z.string().uuid('Invite id is invalid.'),
});

export const changeManagedUserRoleSchema = z.object({
  userId: z.string().uuid('User id is invalid.'),
  role: z.enum(['admin', 'responder']),
});

export const setManagedUserActivationSchema = z.object({
  userId: z.string().uuid('User id is invalid.'),
  nextStatus: z.enum(['activate', 'deactivate']),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().trim().min(1, 'Invite token is required.'),
    fullName: optionalNameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const updateOwnProfileSchema = z.object({
  fullName: optionalNameSchema,
});
