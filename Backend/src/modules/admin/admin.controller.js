import * as svc from './admin.service.js';
import {
  listOrdersQuery,
  listUsersQuery,
  listPackagesQuery,
  updateUserSchema,
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

// ---- Users ----

export async function listUsers(req, res) {
  const q = listUsersQuery.parse(req.query);
  const { items, total } = await svc.listUsers(q);
  res.json({ users: items, meta: meta(total, q) });
}

export async function updateUser(req, res) {
  const { body } = updateUserSchema.parse({ body: req.body });
  const user = await svc.setUserActive(req.params.id, body.isActive);
  res.json({ user });
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
