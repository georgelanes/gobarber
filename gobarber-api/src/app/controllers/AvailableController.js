import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  parseISO,
} from 'date-fns';

import { format, utcToZonedTime } from 'date-fns-tz';
import enUS from 'date-fns/locale/en-US';

import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerid,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const datas = schedule.map(time => {
      const [hour, minute] = time.split(':');
      const value = setSeconds(
        setMinutes(setHours(searchDate, hour), minute),
        0
      );

      let formattedDate = format(value, "yyyy-MM-dd'T'HH:mm:ssxxx");
      formattedDate = formattedDate.replace('-02:00', '');

      return {
        time,
        value: formattedDate,
        available:
          isAfter(value, new Date()) &&
          !appointments.find(a => format(a.date, 'HH:mm') === time),
      };
    });

    return res.json(datas);
  }
}

export default new AvailableController();
