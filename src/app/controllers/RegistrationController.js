import * as Yup from 'yup';
import { addMonths, parseISO, format } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';

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

    const student = await Student.findOne({ where: { id: student_id } });

    if (!student)
      return res.status(400).json({ error: 'Student does not exist' });

    const plan = await Plan.findOne({ where: { id: plan_id } });

    if (!plan) return res.status(400).json({ error: 'Plan does not exist' });

    const parsedStartDate = parseISO(start_date);

    const end_date = addMonths(parsedStartDate, plan.duration);

    const price = plan.duration * plan.price;

    const formattedStartDate = format(parsedStartDate, 'yyyy-MM-dd');
    const formattedEndDate = format(end_date, 'yyyy-MM-dd');

    await Registration.create({
      student_id,
      plan_id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      price,
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
    return res.json();
  }

  async delete(req, res) {
    return res.json();
  }
}

export default new RegistrationController();
