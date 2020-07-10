import { Directive, ElementRef, Output, EventEmitter } from '@angular/core';

const SCROLL_DISTANCE = 0;

@Directive({
  selector: '[infinite-scroll]',
  host: {
    '(scroll)': 'scrollCb($event)'
  }
})
export class InfiniteScrollDirective {
  @Output() onScroll = new EventEmitter();

  constructor(private element: ElementRef) {}

  scrollCb() {
    const el = this.element.nativeElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_DISTANCE) {
      this.onScroll.emit();
    }
  }
}
