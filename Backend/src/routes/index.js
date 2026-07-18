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
import {
  publicRouter as blogPublicRoutes,
  adminRouter as blogAdminRoutes,
} from '../modules/blog/blog.routes.js';
import healthRoutes from '../modules/health/health.routes.js';
import influencerRoutes from '../modules/influencer/influencer.routes.js';
import nicheRoutes from '../modules/niche/niche.routes.js';
import notificationRoutes from '../modules/notification/notification.routes.js';
import chatRoutes from '../modules/chat/chat.routes.js';
import oauthRoutes from '../modules/oauth/oauth.routes.js';
import orderRoutes from '../modules/order/order.routes.js';
import packageRoutes from '../modules/package/package.routes.js';
import supportRoutes from '../modules/support/support.routes.js';
import {
  publicRouter as trackingPublicRoutes,
  adminRouter as trackingAdminRoutes,
} from '../modules/tracking/tracking.routes.js';
import settingsRoutes from '../routes/admin/settings.js';
import adminRoutes from '../modules/admin/admin.routes.js';
import { cacheControl } from '../middleware/cache.js';

const router = Router();

// Public catalog reads are cacheable (short TTL + stale-while-revalidate). The
// middleware skips caching for authenticated or non-GET requests.
const publicCatalogCache = cacheControl(60, { sMaxAge: 300, swr: 600 });

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/niches', publicCatalogCache, nicheRoutes);
router.use('/packages', publicCatalogCache, packageRoutes);
router.use('/influencers', publicCatalogCache, influencerRoutes);
router.use('/oauth', oauthRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/deliverables', deliverableRoutes);
router.use('/notifications', notificationRoutes);
router.use('/chat', chatRoutes);
router.use('/support', supportRoutes);

// Public content (SEO + page bodies)
router.use('/content', publicCatalogCache, contentPublicRoutes);

// Public blog
router.use('/blog', publicCatalogCache, blogPublicRoutes);

// Tracking — public ingest endpoint, accepts events from frontend
router.use('/track', trackingPublicRoutes);

// Admin namespaces
router.use('/admin/content', contentAdminRoutes);
router.use('/admin/blog', blogAdminRoutes);
router.use('/admin/tracking', trackingAdminRoutes);
router.use('/admin/settings', settingsRoutes);

// Generic admin namespace (orders, users, packages, stats). Registered AFTER
// the specific /admin/* mounts above so those take precedence.
router.use('/admin', adminRoutes);

export default router;
