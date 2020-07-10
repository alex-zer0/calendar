import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth/core';
import { NgSelectConfig } from '@ng-select/ng-select';
import { environment } from '@env/environment';
import { initGA } from './analytics';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isProd = environment.production;

  constructor(
    public authService: AuthService,
    private config: NgSelectConfig
  ) {
    this.authService.authCallbackIfRequired();
    this.config.loadingText = 'Загрузка...';
    this.config.notFoundText = '';
  }

  ngOnInit() {
    if (this.isProd) {
      this.authService.getUserData().subscribe(user => initGA(user.name));
    }
  }
}
