import { Route } from '@angular/router';
import {AuthComponent} from "./auth/Auth.component";
import {DashboardComponent} from "./dashboard/Dashboard.component";
import {authGuard} from "./auth/auth.guard";

export const appRoutes: Route[] = [
  {path:'', component:DashboardComponent, canActivate: [authGuard]},
  {path:'auth', component: AuthComponent},
];
