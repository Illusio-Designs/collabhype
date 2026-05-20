import { Router } from 'express';
import { platformSettings } from '../../services/platformSettings.js';
import { authenticate, authorize } from '../../middleware/auth.js';

const router = Router();

// Get all settings (admin only, secrets excluded)
router.get('/', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const settings = await platformSettings.getAllSettings(false);
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single setting
router.get('/:key', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const value = await platformSettings.getSetting(req.params.key);
    if (!value) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ key: req.params.key, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update setting
router.put('/:key', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    const { value, type = 'string', isSecret = false } = req.body;
    const updated = await platformSettings.setSetting(req.params.key, value, type, isSecret);
    res.json({ key: req.params.key, value: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete setting
router.delete('/:key', authenticate, authorize('ADMIN'), async (req, res) => {
  try {
    await platformSettings.deleteSetting(req.params.key);
    res.json({ message: 'Setting deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
