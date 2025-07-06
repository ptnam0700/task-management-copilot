import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Category routes - will be implemented with actual controllers later
router.get('/', protect, (req, res) => {
  res.status(200).json({ message: 'Get all categories' });
});

router.get('/:id', protect, (req, res) => {
  res.status(200).json({ message: `Get category with id ${req.params.id}` });
});

router.post('/', protect, (req, res) => {
  res.status(201).json({ message: 'Create new category', data: req.body });
});

router.put('/:id', protect, (req, res) => {
  res.status(200).json({ message: `Update category with id ${req.params.id}`, data: req.body });
});

router.delete('/:id', protect, (req, res) => {
  res.status(200).json({ message: `Delete category with id ${req.params.id}` });
});

export default router;