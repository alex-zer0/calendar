import { Injectable } from '@angular/core';
import { DateTime, Settings } from 'luxon';
Settings.defaultLocale = 'ru';

export interface CalendarMonth {
  id: number;
  title: string;
  active: boolean;
}
export interface CalendarDay {
  id: number;
  weekDay: number;
  weekDayShort: string;
  active: boolean;
  disabled: boolean;
}
export interface CalendarTimeSlot {
  time: string;
  index: number;
}
export interface CalendarInterval {
  start: string;
  end: string;
}

const CURRENT_YEAR = DateTime.local().year;

@Injectable({ providedIn: 'root' })
export class CalendarService {
  fetchMonths(date?: string): CalendarMonth[] {
    const start = this.getFirstActiveDay(DateTime.local());
    const selectedDate = date ? DateTime.fromISO(date) : null;

    return [start, start.plus({ months: 1 })]
      .map((month, index) => ({
        id: month.month,
        title: month.monthLong,
        active: selectedDate ? selectedDate.hasSame(month, 'month') : index === 0
      }));
  }

  fetchDaysByMonth(monthNum: number, date?: string): CalendarDay[] {
    const days = [];
    const selectedDate = date ? DateTime.fromISO(date) : null;

    let current = DateTime.local(CURRENT_YEAR, monthNum);
    while (current.month === monthNum) {
      days.push({
        id: current.day,
        weekDay: current.weekday,
        weekDayShort: current.weekdayShort,
        active: selectedDate && selectedDate.hasSame(current, 'day') || false
      });
      current = current.plus({ days: 1 });
    }
    return days;
  }

  getFirstActiveDay(date: DateTime): DateTime {
    const nextDate = date.plus({ days: 1 });
    if (this.isBusyDay(nextDate.day, nextDate.month, [], true)) {
      return this.getFirstActiveDay(nextDate);
    }
    return nextDate;
  }

  getDateByMonthDay(month: number, day: number): string {
    return DateTime.local(CURRENT_YEAR, month, day).toISO();
  }

  getTimeFromIsoDate(isoDate: string): string {
    return DateTime.fromISO(isoDate, { zone: 'utc' }).toLocal().toFormat('HH:mm');
  }

  getTimeSlotsByBusyTime(startDate: string, endDate: string, index: number): CalendarTimeSlot[] {
    let date = DateTime.fromISO(startDate, { zone: 'utc' }).toLocal();
    if (date.minute < 30) {
      date = date.set({ minute: 0 });
    } else if (date.minute !== 30) {
      date = date.set({ minute: 30 });
    }
    const dateTo = DateTime.fromISO(endDate, { zone: 'utc' }).toLocal();
    const slots = [{ index, time: date.toFormat('HH:mm') }];
    while (dateTo > date) {
      date = date.plus({ minutes: 30 });
      slots.push({ index, time: date.toFormat('HH:mm') });
    }
    return slots;
  }

  getSlotsFromIntervals(dateTimes: CalendarInterval[]): CalendarTimeSlot[] {
    return dateTimes.reduce((slots, nx, index) =>
      slots.concat(this.getTimeSlotsByBusyTime(nx.start, nx.end, index)), []);
  }

  getTimeSlots(busySlots: CalendarTimeSlot[], isIC?: boolean): CalendarTimeSlot[] {
    const slots = [];
    const end = DateTime.local()
      .startOf('day')
      .plus({ hours: isIC ? 21 : 18 });
    let date = DateTime.local()
      .startOf('day')
      .plus({ hours: isIC ? 8 : 9 });
    let index = 0;
    while (end >= date) {
      const time = date.toFormat('HH:mm');
      const busySlot = busySlots.find(s => s.time === time);
      if (!busySlot) {
        slots.push({ index, time });
      } else if (busySlot.index === index) {
        const last = busySlots.filter(b => b.index === index).pop();
        if (slots.length > 0) {
          slots.push({ index, time });
        }
        index += 1;
        slots.push({ index, time: last.time });
      }
      date = date.plus({ minutes: 30 });
    }
    return slots && slots.length > 1 ?
      slots.filter(slot => slots.filter(s => s.index === slot.index).length > 1) :
      [];
  }

  isBusyInterval({ start, end }: CalendarInterval) {
    const startDate = DateTime.fromISO(start, { zone: 'utc' });
    const endDate = DateTime.fromISO(end, { zone: 'utc' });
    return startDate.hour <= 5 && (startDate.day !== endDate.day || endDate.hour >= 18);
  }

  isBusyDay(day: number, month: number, intervals?: CalendarInterval[], isCreate?: boolean): boolean {
    const today = DateTime.utc();
    const toCompare = DateTime.utc(CURRENT_YEAR, month, day);
    if (today.startOf('day') >= toCompare.startOf('day')) {
      return true;
    }
    if (isCreate) {
      const isNextDay = today.hour > 15 || today.hour === 15 && today.minute >= 30;
      if (isNextDay && toCompare.toISODate() === today.plus({ days: 1 }).toISODate()) {
        return true;
      }
    }
    if (intervals && intervals.length > 0) {
      return intervals.some(t => this.isBusyInterval(t));
    }
    return false;
  }

  isSameDay(day: number, month: number, isoDate: string): boolean {
    const isoDay = DateTime.fromISO(isoDate, { zone: 'utc' }).startOf('day');
    const toCompare = DateTime.utc(CURRENT_YEAR, month, day).startOf('day');
    return isoDay.equals(toCompare);
  }

  parseDateTime(date: string, time: string): string {
    const [hours, minutes] = time.split(':');
    return DateTime
      .fromISO(date)
      .set({ hour: Number(hours), minute: Number(minutes) })
      .toUTC()
      .toISO({ includeOffset: false })
      .split('.')[0];
  }

  sortIntervals(a: CalendarInterval, b: CalendarInterval): number {
    return DateTime.fromISO(a.start).toMillis() - DateTime.fromISO(b.start).toMillis();
  }
}
