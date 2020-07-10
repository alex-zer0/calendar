import { Component, Input, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Meeting, User, AccessRules, AuthConfig, CheckListControlTypes } from '@models';
import { Select, Store } from '@ngxs/store';
import { RegistryStore } from '../state/registry.state';
import { Observable, of, EMPTY } from 'rxjs';
import { ModalComponent } from '@app/shared/components/modal.component';
import { RemoveMeeting, UpdateMeeting, ResetMeeting, RemoveMeetingUI } from '../state/registry.actions';
import { RegistryActionModalComponent } from '../action/registry-action.component';
import { AuthService, MeetingService } from '@services';
import { exhaustMap, switchMap } from 'rxjs/operators';
import { RootStore } from '@app/state/root.state';

@Component({
  selector: 'app-registry-meeting',
  templateUrl: './registry-meeting.component.html',
  styleUrls: ['./registry-meeting.component.scss']
})
export class RegistryMeetingComponent implements OnInit, OnDestroy {
  @Select(RegistryStore.initiator) initiator$: Observable<User>;
  @Select(RegistryStore.finishingControl) finishingControl$: Observable<User[]>;
  @Select(RegistryStore.authControl) authControl$: Observable<User[]>;
  @Select(RegistryStore.buildControl) buildControl$: Observable<User[]>;
  @Select(RegistryStore.buildComfort) buildComfort$: Observable<User[]>;
  @Select(RegistryStore.isValidUsers) isValidUsers$: Observable<boolean>;
  @Select(RootStore.isIC) isIC$: Observable<boolean>;

  @ViewChild('modal', { static: true }) private confirmModal: ModalComponent;
  @ViewChild('edit', { static: true }) private editModal: ModalComponent;
  @ViewChild('confirm', { static: true }) private confirmActionModal: ModalComponent;
  @ViewChild('action', { static: true }) private actionModal: RegistryActionModalComponent;

  @Input() meeting: Meeting;

  auth$: Observable<AuthConfig>;
  showEdit$: Observable<boolean>;
  showDelete$: Observable<boolean>;
  accessRules = AccessRules;

  constructor(
    private store: Store,
    private service: MeetingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.auth$ = this.authService.listCurrent();
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetMeeting());
  }

  removeMeeting(meeting: Meeting) {
    this.confirmModal.open({ text: 'Вы действительно хотите удалить вызов?', btnLabel: 'Удалить' })
      .subscribe(res => res && this.store.dispatch(new RemoveMeeting(meeting.id)));
  }

  editMeeting(data: Meeting) {
    this.editModal.open({ data })
      .subscribe(res => res && this.store.dispatch(new UpdateMeeting(res)));
  }

  confirmMeeting(data: Meeting) {
    this.confirmActionModal.open({ data })
      .subscribe(res => res && this.store.dispatch(new UpdateMeeting(res, true)));
  }

  triggerAction(rule: AccessRules) {
    this.actionModal.open(rule, this.meeting)
      .pipe(
        exhaustMap((data) => {
          if (!data) {
            return of(null);
          }
          if (rule === AccessRules.REJECT) {
            return this.service.rejectMeeting({ ...data, meetingId: this.meeting.id });
          }
          if (rule === AccessRules.CONFIRM_DECISION) {
            return this.service.fixResult({ ...data, meetingId: this.meeting.id });
          }
          return of(null);
        })
      )
      .subscribe(res => res && this.store.dispatch(new RemoveMeetingUI()));
  }

  confirmWork(meeting: Meeting) {
    this.confirmModal.open({ text: 'Вы действительно хотите подтвердить вызов?', btnLabel: 'Подтвердить' })
      .pipe(switchMap(res => res ? this.service.confirmMeeting(meeting.id) : EMPTY))
      .subscribe(() => this.store.dispatch(new RemoveMeetingUI()));
  }

  closeMeeting() {
    this.store.dispatch(new ResetMeeting());
  }

  isDecoration(types: string[]): boolean {
    return types ? types.includes(CheckListControlTypes.DECORATION) : false;
  }

  getNames(arr: {name: string}[] | null) {
    return arr ? arr.map(i => i.name).join(', ') : '';
  }
}
