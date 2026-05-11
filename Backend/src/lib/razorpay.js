import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let _client = null;

export function getRazorpayClient() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw ApiError.badRequest('Razorpay is not configured on the server');
  }
  if (!_client) {
    _client = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }
  return _client;
}

export function getPublicKey() {
  if (!env.RAZORPAY_KEY_ID) throw ApiError.badRequest('Razorpay is not configured');
  return env.RAZORPAY_KEY_ID;
}
