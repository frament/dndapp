import {APP_INITIALIZER, ApplicationConfig} from '@angular/core';
import {
  provideRouter, withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withViewTransitions
} from '@angular/router';
import { appRoutes } from './app.routes';
import {initServicesFactory} from "./init-service-factory";
import {DataBaseService} from "./data-base.service";
import {UserService} from "./auth/user.service";
import {FileService} from "./files/file.service";

export const appConfig: ApplicationConfig = {
  providers: [
    {provide: UserService, useClass: UserService},
    provideRouter(appRoutes,
      withEnabledBlockingInitialNavigation(),
      withComponentInputBinding(),
      withViewTransitions(),
      ),
    {
      provide: APP_INITIALIZER,
      useFactory: initServicesFactory,
      deps:[DataBaseService, UserService, FileService],
      multi: true
    }],
};
