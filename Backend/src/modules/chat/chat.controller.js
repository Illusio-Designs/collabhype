import * as service from './chat.service.js';
import { ApiError } from '../../utils/ApiError.js';

function requireUser(req) {
  if (!req.user) throw ApiError.unauthorized();
  return req.user;
}

export async function getConsent(req, res) {
  const user = requireUser(req);
  res.json(await service.getConsent(user.sub));
}

export async function acceptConsent(req, res) {
  const user = requireUser(req);
  res.json(await service.acceptConsent(user.sub));
}

export async function listConversations(req, res) {
  const user = requireUser(req);
  const conversations = await service.listConversations(user);
  res.json({ conversations });
}

export async function startConversation(req, res) {
  const user = requireUser(req);
  const conversation = await service.startConversation(user, req.body?.influencerId);
  res.status(201).json({ conversation });
}

export async function getMessages(req, res) {
  const user = requireUser(req);
  const data = await service.getMessages(user, req.params.id);
  res.json(data);
}

export async function sendMessage(req, res) {
  const user = requireUser(req);
  const message = await service.sendMessage(user, req.params.id, req.body?.body);
  res.status(201).json({ message });
}

export async function sendOffer(req, res) {
  const user = requireUser(req);
  const message = await service.sendOffer(user, req.params.id, {
    deliverable: req.body?.deliverable,
    price: req.body?.price,
  });
  res.status(201).json({ message });
}

export async function acceptOffer(req, res) {
  const user = requireUser(req);
  const message = await service.acceptOffer(user, req.params.id, req.params.messageId);
  res.json({ message });
}

export async function declineOffer(req, res) {
  const user = requireUser(req);
  const message = await service.declineOffer(user, req.params.id, req.params.messageId);
  res.json({ message });
}
