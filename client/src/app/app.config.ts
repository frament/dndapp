import {APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import {initServicesFactory} from "./init-service-factory";
import {DataBaseService} from "./data-base.service";
import {UserService} from "./auth/user.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    {
      provide: APP_INITIALIZER,
      useFactory: initServicesFactory,
      deps:[DataBaseService, UserService],
      multi: true
    }],
};
