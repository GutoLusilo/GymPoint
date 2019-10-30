import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

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
    return res.json();
  }
}

export default new AnswerHOController();
