import { Router } from 'express';
import * as controller from './package.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(controller.browse));
router.get('/:slug', asyncHandler(controller.getOne));

export default router;
