const express = require('express');
const mongoose = require('mongoose');
const Program = require('../models/program');
const router = express.Router();
const categories = new Set(['Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Full Body', 'Cardio', 'Recovery']);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find({ owner: req.session.user.id }).select('_id date category supersetCount').sort({ date: 1, _id: 1 }).lean();
    res.json({ programs });
  } catch { res.status(500).json({ message: 'Unable to load programs. Please try again.' }); }
});
router.post('/', async (req, res) => {
  const { date, category, supersetCount } = req.body || {};
  const parsed = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T00:00:00Z') : null;
  if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date ||
      !categories.has(category) || !Number.isInteger(supersetCount) || supersetCount < 0 || supersetCount > 20) {
    return res.status(400).json({ message: 'Choose a valid date, category, and 0–20 supersets.' });
  }
  try {
    const program = await Program.create({ owner: req.session.user.id, date, category, supersetCount });
    res.status(201).json({ program: { _id: program._id, date, category, supersetCount } });
  } catch { res.status(500).json({ message: 'Unable to save program. Please try again.' }); }
});
router.delete('/:id', async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(400).json({ message: 'Invalid program.' });
  try {
    const result = await Program.deleteOne({ _id: req.params.id, owner: req.session.user.id });
    if (!result.deletedCount) return res.status(404).json({ message: 'Program not found.' });
    res.sendStatus(204);
  } catch { res.status(500).json({ message: 'Unable to delete program. Please try again.' }); }
});
module.exports = router;
