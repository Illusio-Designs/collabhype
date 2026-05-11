import * as svc from './campaign.service.js';
import {
  browseCampaignsQuery,
  updateCampaignSchema,
  submitDraftSchema,
  markPostedSchema,
  requestRevisionSchema,
} from './campaign.schema.js';
import { ApiError } from '../../utils/ApiError.js';

function pageMeta(total, page, limit) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
}

// --- campaign listing/detail (role-aware) ---

export async function listMine(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const q = browseCampaignsQuery.parse(req.query);
  let result;
  if (req.user.role === 'BRAND') result = await svc.listForBrand(req.user.sub, q);
  else if (req.user.role === 'INFLUENCER') result = await svc.listForInfluencer(req.user.sub, q);
  else throw ApiError.forbidden('Only BRAND or INFLUENCER can view campaigns');
  res.json({ campaigns: result.items, meta: pageMeta(result.total, q.page, q.limit) });
}

export async function getOne(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  let campaign;
  if (req.user.role === 'BRAND') campaign = await svc.getForBrand(req.user.sub, req.params.id);
  else if (req.user.role === 'INFLUENCER')
    campaign = await svc.getForInfluencer(req.user.sub, req.params.id);
  else throw ApiError.forbidden();
  res.json({ campaign });
}

export async function updateBrief(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = updateCampaignSchema.parse({ body: req.body });
  const campaign = await svc.updateBrief(req.user.sub, req.params.id, body);
  res.json({ campaign });
}

// --- deliverable transitions ---

export async function submitDraft(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = submitDraftSchema.parse({ body: req.body });
  const deliverable = await svc.submitDraft(req.user.sub, req.params.delivId, body.draftUrl);
  res.json({ deliverable });
}

export async function approveDraft(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const deliverable = await svc.approveDraft(req.user.sub, req.params.delivId);
  res.json({ deliverable });
}

export async function requestRevision(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = requestRevisionSchema.parse({ body: req.body });
  const deliverable = await svc.requestRevision(req.user.sub, req.params.delivId, body.feedback);
  res.json({ deliverable });
}

export async function markPosted(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = markPostedSchema.parse({ body: req.body });
  const deliverable = await svc.markPosted(req.user.sub, req.params.delivId, body.postedUrl);
  res.json({ deliverable });
}

export async function releasePayment(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const deliverable = await svc.releasePayment(req.user.sub, req.params.delivId);
  res.json({ deliverable });
}
