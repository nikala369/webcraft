import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withViewTransitions,
  withInMemoryScrolling,
  withComponentInputBinding,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
} from '@angular/common/http';
import { appRoutes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Import auth interceptor
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withViewTransitions(),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    BrowserModule,
    importProvidersFrom(BrowserAnimationsModule),
  ],
};
