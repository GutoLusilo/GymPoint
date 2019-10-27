import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({
      attributes: ['id', 'title', 'duration', 'price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .positive()
        .required(),
      price: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { id, title, duration, price } = await Plan.create(req.body);

    return res.json({ id, title, duration, price });
  }

  async update(req, res) {
    /**
     * Check if plan with req.params.id exists
     */
    const plan = await Plan.findOne({ where: { id: req.params.id } });

    if (!plan) return res.status(400).json({ error: 'Plan does not exist' });

    /**
     * Check validation of req.body
     */
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number()
        .integer()
        .positive(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { id, title, duration, price } = await plan.update(req.body);

    return res.json({ id, title, duration, price });
  }

  async delete(req, res) {
    /**
     * Check if plan with req.params.id exists
     */
    const plan = await Plan.findOne({ where: { id: req.params.id } });

    if (!plan) return res.status(400).json({ error: 'Plan does not exist' });

    await plan.destroy();

    return res.json();
  }
}

export default new PlanController();
