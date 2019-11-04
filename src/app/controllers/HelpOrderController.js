import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';

class HelpOrderController {
  async show(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      attributes: ['id', 'question', 'answer', 'answer_at'],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    /**
     * Check validation of req.body
     */
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { question } = req.body;

    await HelpOrder.create({
      student_id: req.params.id,
      question,
    });

    return res.json({
      student_id: req.params.id,
      question,
    });
  }
}

export default new HelpOrderController();
