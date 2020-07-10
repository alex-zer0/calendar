import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF, registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import ru from '@angular/common/locales/ru';
import { environment } from '@env/environment';
import { AuthModule, AUTH_SETTINGS, AuthService, AuthSettings } from '@auth/cire';
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

import { AppRoutingModule } from './app-routing.module';
import { RootStore } from './state/root.state';
import { AppComponent } from './app.component';
import { BaseComponent } from './base.component';
import { AccessRulesGuard } from './access-rules.guard';

registerLocaleData(ru);

export function initAuthFactory(): AuthSettings {
  return {
    client_id: environment.auth.client_id,
    needAuth: environment.needAuth,
    scope: environment.auth.scope,
    authEnvironment: environment.auth.authEnvironment,
    allowExternal: true,
    showHeaderForExternal: false,
  };
}

@NgModule({
  declarations: [
    AppComponent,
    BaseComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,

    AuthModule.forRoot(),
    NgxsModule.forRoot([RootStore], {
      developmentMode: !environment.production
    }),
    NgxsStoragePluginModule.forRoot({ key: ['workControl', 'root'] })
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: '/'
    },
    {
      multi: false,
      provide: AUTH_SETTINGS,
      useFactory: initAuthFactory
    },
    AuthService,
    AccessRulesGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
