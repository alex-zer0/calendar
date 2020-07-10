import { Component, Input, OnInit, ViewChild, OnChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DateTime } from 'luxon';
import { CalendarTimeSlot, CalendarService } from '@services';
import { takeUntil } from 'rxjs/operators';
import { FreeBusyData } from '@models';
import { Options } from 'flatpickr/dist/types/options';
import { DatePickerComponent } from '../date-picker.component';
import { BaseComponent } from '@app/base.component';

interface TimeSlotOption {
  id: string;
  title: string;
}

@Component({
  selector: 'app-work-time-control',
  templateUrl: './work-time-control.component.html',
  styleUrls: ['./work-time-control.component.scss']
})
export class WorkTimeControlComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() form: FormGroup;
  @Input() freeBusy: FreeBusyData;
  @Input() disabled: boolean;

  @ViewChild('datePicker', { static: true })
  private datePicker: DatePickerComponent;

  datePickerOptions: Options = {
    inline: true,
    onChange: (dates: Date[]) => this.setDate(dates ? dates[0] : null),
    disable: [
      (date) => {
        if (this.disabled || date.getDay() === 0 || date.getDay() === 6) {
          return true;
        }
        return this.isDayDisabled(DateTime.fromJSDate(date), this.freeBusy);
      }
    ],
  };

  dateControl: FormControl;
  timeSlots: CalendarTimeSlot[];
  timeStartOptions: TimeSlotOption[] = [];
  timeEndOptions: TimeSlotOption[] = [];

  constructor(private calendarService: CalendarService) {
    super();
  }

  ngOnInit() {
    this.dateControl = this.form.get('date') as FormControl;
    this.form.get('time').get('start').valueChanges
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe((startTime) => {
        if (!this.timeSlots) {
          return;
        }
        const slot = this.timeSlots.find(s => s.time === startTime);
        if (slot) {
          this.form.get('time').get('end').reset();
          this.initTimeEndOptions(slot.index, slot.time);
        }
      });
    if (this.dateControl.value) {
      const dateTime = DateTime.fromISO(this.dateControl.value);
      this.initTimeSlots(this.freeBusy, dateTime.day, dateTime.month);
    }
  }

  ngOnChanges() {
    if (this.datePicker.instance) {
      this.datePicker.instance.redraw();
    }
  }

  private isDayDisabled(dateTime: DateTime, freeBusy: FreeBusyData): boolean {
    if (dateTime.weekday === 7 || dateTime.weekday === 6) {
      return true;
    }
    if (!this.freeBusy) {
      return false;
    }
    const freeBusyDate = Object.keys(this.freeBusy)
      .find(k => this.calendarService.isSameDay(dateTime.day, dateTime.month, k));
    return this.calendarService.isBusyDay(dateTime.day, dateTime.month, freeBusyDate && freeBusy[freeBusyDate]);
  }

  private setDate(jsDate?: Date|null, isToday?: boolean) {
    let date = null;
    if (isToday) {
      date = DateTime.utc().toISODate();
    } else if (jsDate) {
      date = DateTime.fromJSDate(jsDate).toISODate();
    }
    this.dateControl.setValue(date);
    const dateTime = DateTime.fromISO(date);
    this.initTimeSlots(this.freeBusy || {}, dateTime.day, dateTime.month);
    this.form.get('time').reset();
  }

  private initTimeStartOptions(): void {
    const edgeTimes = this.timeSlots
      .reduce((pr, cur, index, arr) => {
        const isLast = arr[index + 1] ? arr[index + 1].index > cur.index : true;
        return isLast ? [...pr, cur.time] : pr;
      }, []);
    this.timeStartOptions = this.timeSlots
      .filter(t => !edgeTimes.includes(t.time) && t.time !== '21:00')
      .map(t => ({ id: t.time, title: 'с ' + t.time }));
  }

  private initTimeEndOptions(index?: number, time?: string): void {
    this.timeEndOptions = this.timeSlots
      .filter((s, i) => index == null ||
        s.index === index && (!time || s.time > time))
      .map(t => ({ id: t.time, title: 'до ' + t.time }));
  }

  private initTimeSlots(freeBusy: FreeBusyData, day: number, month: number): void {
    const freeBusyDate = Object.keys(freeBusy)
      .find(k => this.calendarService.isSameDay(day, month, k));

    let busyTimeSlots = [];
    if (freeBusyDate) {
      const dateTimes = freeBusy[freeBusyDate].sort(this.calendarService.sortIntervals);
      busyTimeSlots = this.calendarService.getSlotsFromIntervals(dateTimes);
    }

    this.timeSlots = this.calendarService.getTimeSlots(busyTimeSlots, true);
    if (this.timeSlots.length > 0) {
      const { time, index } = this.timeSlots[0];
      this.initTimeStartOptions();
      this.initTimeEndOptions(index, time);

      const slotsByIndex = this.timeSlots.filter(s => s.index === index);
      this.form.get('time').patchValue({
        start: time || '00:00',
        end: slotsByIndex.pop().time || '00:00',
      }, { emitEvent: false });
    }
  }
}
