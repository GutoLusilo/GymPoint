import { subDays } from 'date-fns';
import { Op } from 'sequelize';
import Checkin from '../models/Checkin';

class CheckinController {
  async show(req, res) {
    const checkins = await Checkin.findAll({
      where: { student_id: req.params.id },
      order: [['created_at', 'DESC']],
    });

    return res.json(checkins);
  }

  async store(req, res) {
    /**
     * Check if student checked in more than 5 times in the last 7 days
     */
    const last7DaysCheckins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
        created_at: {
          [Op.between]: [subDays(new Date(), 7), new Date()],
        },
      },
    });

    if (last7DaysCheckins.length >= 5)
      return res.status(400).json({
        error: "You can't checkin more than 5 times in 7 calendar days",
      });

    const checkin = await Checkin.create({ student_id: req.params.id });

    return res.json(checkin);
  }
}

export default new CheckinController();
