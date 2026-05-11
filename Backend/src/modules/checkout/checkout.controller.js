import { verifyPaymentSchema } from './checkout.schema.js';
import * as service from './checkout.service.js';
import { ApiError } from '../../utils/ApiError.js';

export async function createOrder(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const result = await service.createOrder(req.user.sub);
  res.status(201).json(result);
}

export async function verify(req, res) {
  if (!req.user) throw ApiError.unauthorized();
  const { body } = verifyPaymentSchema.parse({ body: req.body });
  const order = await service.verifyPayment(body);
  if (order.brandUserId !== req.user.sub) throw ApiError.forbidden();
  res.json({
    status: 'success',
    orderId: order.id,
    orderNumber: order.orderNumber,
    paidAt: order.paidAt,
  });
}

export async function webhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  // req.rawBody is captured by the express.json() verify hook in app.js
  const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
  const result = await service.handleWebhook(rawBody, signature);
  res.json(result);
}
