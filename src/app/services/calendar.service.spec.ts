import { CalendarService, CalendarInterval, CalendarTimeSlot } from './calendar.service';
import { Settings } from 'luxon';

describe('Calendar service', () => {
  Settings.defaultZoneName = 'Europe/Moscow';

  const service = new CalendarService();

  const intervals = [{
    start: '2019-11-27T07:15:00+00:00',
    end: '2019-11-27T08:00:00+00:00'
  }, {
    start: '2019-11-27T10:00:00+00:00',
    end: '2019-11-27T11:00:00+00:00'
  }, {
    start: '2019-11-27T12:00:00+00:00',
    end: '2019-11-27T14:00:00+00:00'
  }];

  describe('fetchMonths', () => {
    it('should return list with first active item', () => {
      const data = service.fetchMonths();
      expect(data[0].active).toBeTruthy();
    });
  });

  describe('getTimeSlotsByBusyTime', () => {
    const t = (index: number, times: string[]) => {
      const { start, end } = intervals[index];
      const expected = times.map(time => ({ time, index }));
      const slots = service.getTimeSlotsByBusyTime(start, end, index);
      expect(slots).toEqual(expected);
    };
    it('first interval', () => {
      t(0, ['10:00', '10:30', '11:00']);
    });
    it('second interval', () => {
      t(1, ['13:00', '13:30', '14:00']);
    });
    it('third interval', () => {
      t(2, ['15:00', '15:30', '16:00', '16:30', '17:00']);
    });
  });

  describe('getSlotsFromIntervals', () => {
    const t = (input: CalendarInterval[], expected: CalendarTimeSlot[]) => {
      const busySlots = service.getSlotsFromIntervals(input);
      expect(busySlots).toEqual(expected);
    };
    it('basic intervals', () => {
      const expected = [
        ['10:00', '10:30', '11:00'],
        ['13:00', '13:30', '14:00'],
        ['15:00', '15:30', '16:00', '16:30', '17:00']
      ]
        .map((arr, index) => arr.map(time => ({ time, index })))
        .reduce((arr, nx) => arr.concat(nx), []);
      t(intervals, expected);
    });
    it('test intervals 1', () => {
      const testIntervals = [{
        start: '2019-11-27T04:00:00+00:00',
        end: '2019-11-27T15:00:00+00:00'
      }];
      const expected = [
        ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
        '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00']
      ]
        .map((arr, index) => arr.map(time => ({ time, index })))
        .reduce((arr, nx) => arr.concat(nx), []);
      t(testIntervals, expected);
    });
  });

  describe('getTimeSlots', () => {
    const t = (input: CalendarInterval[], expected: CalendarTimeSlot[]) => {
      const busySlots = service.getSlotsFromIntervals(input);
      expect(service.getTimeSlots(busySlots, true)).toEqual(expected);
    };
    it('basic intervals', () => {
      const expected = [
        ['08:00', '08:30', '09:00', '09:30', '10:00'],
        ['11:00', '11:30', '12:00', '12:30', '13:00'],
        ['14:00', '14:30', '15:00'],
        ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
      ]
        .map((arr, index) => arr.map(time => ({ time, index })))
        .reduce((arr, nx) => arr.concat(nx), []);
      t(intervals, expected);
    });
    it('test intervals', () => {
      const testIntervals = [{
        start: '2019-11-27T04:00:00+00:00',
        end: '2019-11-27T15:00:00+00:00'
      }];
      const expected = [
        [],
        ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00']
      ]
        .map((arr, index) => arr.map(time => ({ time, index })))
        .reduce((arr, nx) => arr.concat(nx), []);
      t(testIntervals, expected);
    });
    it('test intervals 2', () => {
      const testIntervals = [
        { end: '2020-03-23T13:00:00+00:00', start: '2020-03-23T02:30:00+00:00' },
        { end: '2020-03-23T19:30:00+00:00', start: '2020-03-23T13:30:00+00:00' }
      ];
      const expected = [
        [],
        ['16:00', '16:30']
      ]
        .map((arr, index) => arr.map(time => ({ time, index })))
        .reduce((arr, nx) => arr.concat(nx), []);
      t(testIntervals, expected);
    });
  });

  describe('isBusyDay', () => {
    describe('when normal intervals', () => {
      it('should return true', () => {
        expect(service.isBusyDay(31, 12, intervals)).toBe(false);
      });
      it('should return false', () => {
        expect(service.isBusyDay(1, 1, intervals)).toBe(true);
      });
    });
    describe('when intervals is cover all work time', () => {
      it('should return true', () => {
        const testIntervals = [
          { end: '2020-03-13T04:00:00+00:00', start: '2020-03-13T00:00:00+00:00' },
          { end: '2020-03-13T18:00:00+00:00', start: '2020-03-13T05:00:00+00:00' }
        ];
        expect(service.isBusyDay(31, 12, testIntervals)).toBe(true);
      });
    });
    describe('when interval is 5 -> 18', () => {
      it('should return true', () => {
        const testIntervals = [
          { start: '2019-12-31T05:00:00+00:00', end: '2019-12-31T18:00:00+00:00' }
        ];
        expect(service.isBusyDay(31, 12, testIntervals)).toBe(true);
      });
    });
    describe('when interval is ended on next day', () => {
      it('should return true', () => {
        const testIntervals = [
          { start: '2019-12-31T00:00:00+00:00', end: '2019-01-01T00:00:00+00:00' }
        ];
        expect(service.isBusyDay(31, 12, testIntervals)).toBe(true);
      });
      it('should return false', () => {
        const testIntervals = [
          { start: '2019-12-31T10:00:00+00:00', end: '2019-01-01T00:00:00+00:00' }
        ];
        expect(service.isBusyDay(31, 12, testIntervals)).toBe(false);
      });
    });
  });
});
