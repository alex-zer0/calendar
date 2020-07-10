import { Component, OnDestroy, HostBinding } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseComponent } from '@app/base.component';

export interface ModalOptions {
  title?: string;
  text?: string;
  btnLabel?: string;
  data?: any;
}

@Component({
  selector: 'app-modal',
  template: `
    <div class="modal">
      <div class="modal__backdrop" (click)="close(false)"></div>
      <div class="modal__dialog">
        <div class="modal__body">
          <p>{{ options?.text }}</p>
        </div>
        <div class="modal__footer">
          <button class="btn btn-default" (click)="close(false)">
            Отмена
          </button>
          <button class="btn btn-primary" (click)="close(true)">
            {{ options?.btnLabel || 'OK' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent extends BaseComponent implements OnDestroy {
  @HostBinding('class.modal-opened')
  isOpened: boolean;

  options: ModalOptions;
  protected result$: Subject<boolean>;

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.result$) {
      this.close(false);
    }
  }

  open(options: ModalOptions) {
    this.isOpened = true;
    this.options = options;
    this.result$ = new Subject<boolean>();
    return this.result$.asObservable()
      .pipe(tap(() => this.isOpened = false));
  }

  close(result?: boolean) {
    this.result$.next(result);
    this.result$.complete();
  }
}
