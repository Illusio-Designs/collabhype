import * as svc from './admin.service.js';
import { recomputeAllTiers } from '../influencer/influencer.service.js';
import {
  listOrdersQuery,
  listUsersQuery,
  listPackagesQuery,
  listPayoutsQuery,
  updateUserSchema,
  updateOrderSchema,
  updatePayoutSchema,
  createPackageSchema,
  updatePackageSchema,
} from './admin.schema.js';

function meta(total, q) {
  return { total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1 };
}

export async function stats(_req, res) {
  res.json(await svc.platformStats());
}

// ---- Orders ----

export async function listOrders(req, res) {
  const q = listOrdersQuery.parse(req.query);
  const { items, total } = await svc.listOrders(q);
  res.json({ orders: items, meta: meta(total, q) });
}

export async function updateOrder(req, res) {
  const { body } = updateOrderSchema.parse({ body: req.body });
  const order = await svc.updateOrderStatus(req.params.id, body.status);
  res.json({ order });
}

// ---- Users ----

export async function listUsers(req, res) {
  const q = listUsersQuery.parse(req.query);
  const { items, total } = await svc.listUsers(q);
  res.json({ users: items, meta: meta(total, q) });
}

export async function updateUser(req, res) {
  const { body } = updateUserSchema.parse({ body: req.body });
  const user = await svc.updateUser(req.params.id, body);
  res.json({ user });
}

export async function deleteUser(req, res) {
  const result = await svc.deleteUser(req.params.id);
  res.json(result);
}

// Re-tier all creators using the current (admin-configured) thresholds.
export async function recomputeTiers(_req, res) {
  const result = await recomputeAllTiers();
  res.json(result);
}

// ---- Payouts ----

export async function listPayouts(req, res) {
  const q = listPayoutsQuery.parse(req.query);
  const { items, total } = await svc.listPayouts(q);
  res.json({ payouts: items, meta: meta(total, q) });
}

export async function updatePayout(req, res) {
  const { body } = updatePayoutSchema.parse({ body: req.body });
  const payout = await svc.updatePayoutStatus(req.params.id, body.status, body.failureReason);
  res.json({ payout });
}

// ---- Packages ----

export async function listPackages(req, res) {
  const q = listPackagesQuery.parse(req.query);
  const { items, total } = await svc.listPackages(q);
  res.json({ packages: items, meta: meta(total, q) });
}

export async function createPackage(req, res) {
  const { body } = createPackageSchema.parse({ body: req.body });
  const pkg = await svc.createPackage(body);
  res.status(201).json({ package: pkg });
}

export async function updatePackage(req, res) {
  const { body } = updatePackageSchema.parse({ body: req.body });
  const pkg = await svc.updatePackage(req.params.id, body);
  res.json({ package: pkg });
}

export async function deletePackage(req, res) {
  const result = await svc.deletePackage(req.params.id);
  res.json(result);
}
