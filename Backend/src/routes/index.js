import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import brandRoutes from '../modules/brand/brand.routes.js';
import campaignRoutes from '../modules/campaign/campaign.routes.js';
import deliverableRoutes from '../modules/campaign/deliverable.routes.js';
import cartRoutes from '../modules/cart/cart.routes.js';
import checkoutRoutes from '../modules/checkout/checkout.routes.js';
import {
  publicRouter as contentPublicRoutes,
  adminRouter as contentAdminRoutes,
} from '../modules/content/content.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import influencerRoutes from '../modules/influencer/influencer.routes.js';
import nicheRoutes from '../modules/niche/niche.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import oauthRoutes from '../modules/oauth/oauth.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import packageRoutes from '../modules/package/package.routes.js';
import supportRoutes from '../modules/support/support.routes.js';
import {
  publicRouter as trackingPublicRoutes,
  adminRouter as trackingAdminRoutes,
} from '../modules/tracking/tracking.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/niches', nicheRoutes);
router.use('/packages', packageRoutes);
router.use('/influencers', influencerRoutes);
router.use('/oauth', oauthRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/deliverables', deliverableRoutes);
router.use('/notifications', notificationRoutes);
router.use('/support', supportRoutes);

// Public content (SEO + page bodies)
router.use('/content', contentPublicRoutes);

// Tracking — public ingest endpoint, accepts events from frontend
router.use('/track', trackingPublicRoutes);

// Admin namespaces
router.use('/admin/content', contentAdminRoutes);
router.use('/admin/tracking', trackingAdminRoutes);

export default router;
