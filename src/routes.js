import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentsController from './app/controllers/StudentController';

import authMiddleware from './app/middlewares/auth';
import checkStudentExists from './app/middlewares/checkStudentExists';

const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'Hello World' }));

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/students', StudentsController.store);
routes.put('/students/:id', checkStudentExists, StudentsController.update);

export default routes;
