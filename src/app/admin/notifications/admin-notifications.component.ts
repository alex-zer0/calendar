import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TechSupportConfig } from '@app/models';
import { Store, Select } from '@ngxs/store';
import { UpdateConfig, GetConfig, ResetConfig } from '../state/admin.actions';
import { AdminStore } from '../state/admin.state';
import { first, skip } from 'rxjs/operators';

@Component({
  selector: 'app-admin-notifications',
  templateUrl: './admin-notifications.component.html',
  styleUrls: ['./admin-notifications.component.scss']
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  @Select(AdminStore.config) config$: Observable<TechSupportConfig[]>;

  config: {[id: number]: string[]} = {};

  constructor(
    private store: Store
  ) {}

  ngOnInit() {
    this.store.dispatch(new GetConfig(2));

    this.config$
      .pipe(
        skip(1),
        first()
      )
      .subscribe(data => data.forEach(c => this.config[c.id] = JSON.parse(c.value).EmailTo || []));
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetConfig());
  }

  onSave(config: TechSupportConfig) {
    const value = JSON.parse(config.value);
    const newValue = JSON.stringify({ ...value, EmailTo: this.config[config.id] || [] });
    if (newValue !== config.value) {
      this.store.dispatch(new UpdateConfig(config.id, newValue));
    }
  }
}
