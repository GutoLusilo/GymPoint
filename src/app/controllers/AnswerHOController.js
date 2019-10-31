import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

import AnswerHelpOrderMail from '../jobs/AnswerHelpOrderMail';
import Queue from '../../lib/Queue';

class AnswerHOController {
  async index(req, res) {
    const helpOrders = await HelpOrder.findAll({
      where: { answer: null },
      attributes: ['id', 'question'],
      include: {
        model: Student,
        as: 'student',
        attributes: ['name', 'email'],
      },
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    /**
     * Check validation of req.body
     */
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    /**
     * Check if student exists
     */
    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      include: {
        model: Student,
        as: 'student',
        attributes: ['name', 'email'],
      },
    });

    if (!helpOrder)
      return res.status(400).json({ error: 'Help order does not exist' });

    helpOrder.answer = req.body.answer;
    helpOrder.answer_at = new Date();

    helpOrder.save();

    /**
     * Sending email with question and answer
     */
    await Queue.add(AnswerHelpOrderMail.key, { helpOrder });

    return res.json(helpOrder);
  }
}

export default new AnswerHOController();
