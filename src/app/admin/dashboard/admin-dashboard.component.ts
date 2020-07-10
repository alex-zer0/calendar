import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { TechSupportConfig } from '@app/models';
import { Store, Select } from '@ngxs/store';
import { UpdateConfig, GetConfig, ResetConfig } from '../state/admin.actions';
import { AdminStore } from '../state/admin.state';
import { first, skip } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @Select(AdminStore.config) config$: Observable<TechSupportConfig[]>;

  config: {[id: number]: string[]} = {};

  constructor(
    private store: Store
  ) {}

  ngOnInit() {
    this.store.dispatch(new GetConfig(1));

    this.config$
      .pipe(
        skip(1),
        first()
      )
      .subscribe(data => data.forEach(c => this.config[c.id] = JSON.parse(c.value).Link || ''));
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetConfig());
  }

  onSave(config: TechSupportConfig) {
    const value = JSON.parse(config.value);
    const newValue = JSON.stringify({ ...value, Link: this.config[config.id] || '' });
    if (newValue !== config.value) {
      this.store.dispatch(new UpdateConfig(config.id, newValue));
    }
  }
}
