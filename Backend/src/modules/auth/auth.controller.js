import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  deleteAccountSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import * as authService from './auth.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function register(req, res) {
  const { body } = registerSchema.parse({ body: req.body });
  const result = await authService.register(body);
  res.status(201).json(result);
}

export async function login(req, res) {
  const { body } = loginSchema.parse({ body: req.body });
  const result = await authService.login(body);
  res.json(result);
}

export async function me(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const user = await authService.me(req.user.sub);
  res.json({ user });
}

export async function changePassword(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = changePasswordSchema.parse({ body: req.body });
  await authService.changePassword(req.user.sub, body.currentPassword, body.newPassword);
  res.json({ ok: true });
}

export async function deleteMe(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = deleteAccountSchema.parse({ body: req.body });
  await authService.deleteAccount(req.user.sub, body.password);
  res.json({ ok: true });
}

export async function forgotPassword(req, res) {
  const { body } = forgotPasswordSchema.parse({ body: req.body });
  const result = await authService.forgotPassword(body.email);
  res.json(result);
}

export async function resetPassword(req, res) {
  const { body } = resetPasswordSchema.parse({ body: req.body });
  await authService.resetPassword(body.token, body.newPassword);
  res.json({ ok: true });
}
