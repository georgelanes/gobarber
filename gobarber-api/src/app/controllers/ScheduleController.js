import * as Yup from 'yup';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class ScheduleController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!isProvider) {
      return res.status(401).json({ error: 'User is not a provider.' });
    }

    const { date } = req.query;
    // console.log('DATE FILTER: ', date);

    const parseDate = parseISO(date);

    const startDay = startOfDay(parseDate);
    const endDay = endOfDay(parseDate);

    // console.log(startDay, ' - ', endDay);

    const list = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startDay, endDay],
        },
      },
      order: ['date'],
      limite: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(list);
  }
}

export default new ScheduleController();
