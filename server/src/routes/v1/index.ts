import { Router } from 'express';
import authRoutes from '../auth.routes';
import userRoutes from '../user.routes';
import taskRoutes from '../task.routes';
import categoryRoutes from '../category.routes';
import priorityRoutes from '../priority.routes';

const v1Routes = Router();

// API resources
v1Routes.use('/auth', authRoutes);
v1Routes.use('/users', userRoutes);
v1Routes.use('/tasks', taskRoutes);
v1Routes.use('/categories', categoryRoutes);
v1Routes.use('/priorities', priorityRoutes);

export default v1Routes;