import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-base',
  template: '',
})
export class BaseComponent implements OnDestroy {
  protected readonly ngDestroy$ = new Subject();

  ngOnDestroy() {
    this.ngDestroy$.next();
    this.ngDestroy$.complete();
  }
}
