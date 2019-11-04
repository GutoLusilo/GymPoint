import * as Yup from 'yup';
import { addMonths, parseISO, format, isBefore } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

import NewRegistrationMail from '../jobs/NewRegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      order: ['start_date'],
      attributes: ['id', 'start_date', 'end_date', 'price'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(registrations);
  }

  async store(req, res) {
    /**
     * Check validation of req.body
     */
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .integer()
        .required(),
      plan_id: Yup.number()
        .integer()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    /**
     * Check if Student and Plan exists
     */
    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findByPk(student_id);

    if (!student)
      return res.status(400).json({ error: 'Student does not exist' });

    const plan = await Plan.findByPk(plan_id);

    if (!plan) return res.status(400).json({ error: 'Plan does not exist' });

    const parsedStartDate = parseISO(start_date);

    if (isBefore(parsedStartDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permited' });
    }

    const end_date = addMonths(parsedStartDate, plan.duration);

    const price = plan.duration * plan.price;

    const formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd');
    const formattedEndDate = format(end_date, 'yyyy-MM-dd');

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      price,
    });

    /**
     * Sending email to student after creating registration
     */
    await Queue.add(NewRegistrationMail.key, {
      student,
      plan,
      registration,
    });

    return res.json({
      student_id,
      plan_id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      price,
    });
  }

  async update(req, res) {
    /**
     * Check validation of req.body
     */
    const schema = Yup.object().shape({
      student_id: Yup.number().integer(),
      plan_id: Yup.number().integer(),
      start_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const registration = await Registration.findByPk(req.params.id);

    if (!registration)
      return res.status(400).json({ error: 'Registration does not exist' });

    const { student_id, plan_id, start_date } = req.body;

    /**
     * Assigning `student` and `plan` variables to their new valeus only
     * if they've changed. Otherwise, they get their former valeus.
     */
    const newStudentId = student_id || registration.student_id;

    const plan = plan_id
      ? await Plan.findByPk(plan_id)
      : await Plan.findByPk(registration.plan_id);

    if (start_date) {
      const parsedStartDate = parseISO(start_date);

      if (isBefore(parsedStartDate, new Date())) {
        return res.status(400).json({ error: 'Past dates are not permited' });
      }

      const end_date = addMonths(parsedStartDate, plan.duration);

      const price = plan.duration * plan.price;

      const formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd');
      const formattedEndDate = format(end_date, 'yyyy-MM-dd');

      await registration.update({
        student_id: newStudentId,
        plan_id: plan.id,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        price,
      });
    }

    return res.json(registration);
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration)
      return res.status(400).json({ error: 'Registration does not exist' });

    await registration.destroy();

    return res.json();
  }
}

export default new RegistrationController();
