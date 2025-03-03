import { ApplicationConfig } from '@angular/core';
import {provideRouter, withViewTransitions, withInMemoryScrolling, withComponentInputBinding} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideHttpClient(),
    BrowserModule,
    BrowserAnimationsModule,
  ]
};
