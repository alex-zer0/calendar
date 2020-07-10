import { Component, OnDestroy, HostBinding } from '@angular/core';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseComponent } from '@app/base.component';

export interface ModalOptions {
  title?: string;
  text?: string;
  btnLabel?: string;
  status?: string;
}

@Component({
  selector: 'app-info-modal',
  template: `
    <div class="modal info-modal" [ngSwitch]="options?.status">
      <div class="modal__backdrop" (click)="close(false)"></div>
      <div class="modal__dialog">
        <div class="modal__body">
          <svg *ngSwitchCase="'ERROR'" width="80" height="80" fill="#E73D3D" style="float: right">
            <use xlink:href="#info-circle"></use>
          </svg>
          <h2 class="modal__title">{{ options?.title || 'Вызов не сформирован' }}</h2>
          <p>Информация о данном инциденте уже направлена в службу поддержки пользователей.</p>
          <p>{{ options?.text || 'В ближайшее время мы решим возникшую проблему и сообщим на Ваш электронный адрес о возможности создавать вызовы на требуемый корпус.' }}</p>
          <span *ngSwitchCase="'ERROR'">Приносим извинения за доставленные неудоства</span>
        </div>
        <div class="modal__footer">
          <a class="btn btn-primary" routerLink="/registry" (click)="close(true)">{{ options?.btnLabel || 'Хорошо' }}</a>
        </div>
      </div>
    </div>
  `
})
export class InfoModalComponent extends BaseComponent implements OnDestroy {
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
