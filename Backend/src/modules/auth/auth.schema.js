import { z } from 'zod';

// E.164: leading '+', country digit 1-9, 6-14 more digits. Frontend's
// PhoneInput always emits this shape.
const PHONE_E164 = /^\+[1-9]\d{6,14}$/;
const phoneSchema = z
  .string()
  .trim()
  .regex(PHONE_E164, 'Phone must be in E.164 format, e.g. +919812345678')
  .optional();

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2),
    phone: phoneSchema,
    role: z.enum(['BRAND', 'INFLUENCER']),
    // optional profile bootstrap
    companyName: z.string().optional(), // brand
    city: z.string().optional(),        // influencer
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});
