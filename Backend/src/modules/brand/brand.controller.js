import { updateBrandSchema } from './brand.schema.js';
import * as service from './brand.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getMe(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await service.getMyBrandProfile(req.user.sub);
  res.json({ profile });
}

export async function updateMe(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = updateBrandSchema.parse({ body: req.body });
  const profile = await service.updateMyBrandProfile(req.user.sub, body);
  res.json({ profile });
}
