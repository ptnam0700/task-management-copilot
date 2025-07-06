import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Priority routes - will be implemented with actual controllers later
router.get('/', protect, (req, res) => {
  res.status(200).json({ message: 'Get all priorities' });
});

router.get('/:id', protect, (req, res) => {
  res.status(200).json({ message: `Get priority with id ${req.params.id}` });
});

router.post('/', protect, (req, res) => {
  res.status(201).json({ message: 'Create new priority', data: req.body });
});

router.put('/:id', protect, (req, res) => {
  res.status(200).json({ message: `Update priority with id ${req.params.id}`, data: req.body });
});

router.delete('/:id', protect, (req, res) => {
  res.status(200).json({ message: `Delete priority with id ${req.params.id}` });
});

export default router;