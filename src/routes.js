import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import AnswerHOController from './app/controllers/AnswerHOController';

import authMiddleware from './app/middlewares/auth';
import checkStudentExists from './app/middlewares/checkStudentExists';

const routes = new Router();

routes.get('/', (req, res) => res.json({ projectName: 'GymPoint' }));

routes.post('/sessions', SessionController.store);

routes.get(
  '/students/:id/checkins',
  checkStudentExists,
  CheckinController.show
);
routes.post(
  '/students/:id/checkins',
  checkStudentExists,
  CheckinController.store
);

routes.get(
  '/students/:id/help-orders',
  checkStudentExists,
  HelpOrderController.show
);
routes.post(
  '/students/:id/help-orders',
  checkStudentExists,
  HelpOrderController.store
);

routes.use(authMiddleware); // Underneath from here requires authentication

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.post('/students', StudentController.store);
routes.put('/students/:id', checkStudentExists, StudentController.update);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/registrations', RegistrationController.index);
routes.post('/registrations', RegistrationController.store);
routes.put('/registrations/:id', RegistrationController.update);
routes.delete('/registrations/:id', RegistrationController.delete);

routes.get('/help-orders/unanswered', AnswerHOController.index);
routes.post('/help-orders/:id/answer', AnswerHOController.store);

export default routes;
