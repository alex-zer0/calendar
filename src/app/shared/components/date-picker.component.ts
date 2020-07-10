import flatpickr from 'flatpickr';
import { Russian } from 'flatpickr/dist/l10n/ru.js';
import { Component, ElementRef, Output, EventEmitter, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'app-date-picker',
  template: ``
})
export class DatePickerComponent implements AfterViewInit {
  @Input() options = {};
  @Output() dateChanged = new EventEmitter();

  instance: flatpickr.Instance;

  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.instance = flatpickr(this.elementRef.nativeElement, {
      ...this.options,
      locale: Russian
    });
  }
}
