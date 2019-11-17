import React, { useState, useMemo, useEffect } from 'react';
import {
  format,
  subDays,
  addDays,
  isBefore,
  isEqual,
  parseISO,
} from 'date-fns';
import pt from 'date-fns/locale/pt';
import { utcToZonedTime } from 'date-fns-tz';

import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import api from '~/services/api';

import { Container, Time } from './styles';

const range = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [date, setDate] = useState(new Date());

  const dateFormatted = useMemo(
    () => format(date, "EEEE, d 'de' MMMM", { locale: pt }),
    [date]
  );

  function handlePrevDay() {
    setDate(subDays(date, 1));
  }

  function handleNextDay() {
    setDate(addDays(date, 1));
  }

  useEffect(() => {
    async function loadSchedule() {
      const dateFilter = format(date, "yyyy-MM-dd'T'HH:mm:ssxxx", {
        locale: pt,
      });

      const response = await api.get('schedule', {
        params: { date: dateFilter },
      });

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const data = range.map(hour => {
        const checkDate = new Date();
        checkDate.setUTCHours(hour, 0, 0, 0);
        const compareDate = utcToZonedTime(checkDate, timezone);
        const appointment = response.data.find(a =>
          isEqual(parseISO(a.date), compareDate)
        );

        return {
          time: `${hour}:00h`,
          past: isBefore(compareDate, new Date()),
          appointment,
        };
      });

      setSchedule(data);
    }

    loadSchedule();
  }, [date]);

  return (
    <Container>
      <header>
        <button type="button">
          <MdChevronLeft size={36} color="FFF" onClick={handlePrevDay} />
        </button>
        <strong>{dateFormatted}</strong>
        <button type="button">
          <MdChevronRight size={36} color="FFF" onClick={handleNextDay} />
        </button>
      </header>
      <ul>
        {schedule.map(time => (
          <Time key={time.time} past={time.past} available={!time.appointment}>
            <strong>{time.time}</strong>
            <span>
              {time.appointment ? time.appointment.user.name : 'Em aberto'}
            </span>
          </Time>
        ))}
      </ul>
    </Container>
  );
}
