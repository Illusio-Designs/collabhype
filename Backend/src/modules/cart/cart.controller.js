import { addCartItemSchema, updateCartItemSchema } from './cart.schema.js';
import * as service from './cart.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function getCart(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const cart = await service.getCart(req.user.sub);
  res.json({ cart });
}

export async function addItem(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = addCartItemSchema.parse({ body: req.body });
  const item = await service.addItem(req.user.sub, body);
  res.status(201).json({ item });
}

export async function updateItem(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = updateCartItemSchema.parse({ body: req.body });
  const item = await service.updateItem(req.user.sub, req.params.itemId, body.qty);
  res.json({ item });
}

export async function removeItem(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const result = await service.removeItem(req.user.sub, req.params.itemId);
  res.json(result);
}

export async function clear(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const result = await service.clearCart(req.user.sub);
  res.json(result);
}
