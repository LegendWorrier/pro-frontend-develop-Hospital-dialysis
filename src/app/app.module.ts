import './utils';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ErrorHandler } from '@angular/core';

import { IonicModule, IonicRouteStrategy, IonNav } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicStorageModule } from '@ionic/storage-angular';

import { GlobalErrorHandler } from './global-error-handler';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppConfig } from './app.config';
import { PrettyPipe } from './pipes/pretty.pipe';
import { NoCommaPipe } from './pipes/no-comma.pipe';
import { AdsenseModule } from 'ng2-adsense';
import { DecimalPipe } from '@angular/common';
import { AuthGuard } from './auth/auth.guard';
import { InitGuard } from './init/init.guard';
import { NoAuthGuard } from './auth/noauth.guard';
import { NgxPrintModule } from 'ngx-print';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import * as $ from 'jquery';

export function initializeApp() { 
  return () => true;
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        IonicStorageModule.forRoot(),
        IonicModule.forRoot({
            innerHTMLTemplatesEnabled: true
        }),
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production, scope: '/' }),

        NgxPrintModule,
        MatNativeDateModule,

        AdsenseModule.forRoot({
            adClient: 'ca-pub-4917322502198553',
            adSlot: 7076082612,
        }),
    ],
    providers: [
        Title,
        AppConfig,
        { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppConfig], multi: true },
        AuthGuard,
        InitGuard,
        NoAuthGuard,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        IonNav,
        PrettyPipe,
        NoCommaPipe,
        DecimalPipe,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
