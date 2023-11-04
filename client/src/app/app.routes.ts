import { Route } from '@angular/router';
import {AuthComponent} from "./auth/Auth.component";
import {DashboardComponent} from "./dashboard/Dashboard.component";
import {authGuard} from "./auth/auth.guard";
import {RoomComponent} from "./rooms/room/room.component";

export const appRoutes: Route[] = [
  {path:'auth', component: AuthComponent},
  {path:'', component:DashboardComponent, canActivate: [authGuard]},
  {path:'room/:id', component: RoomComponent, canActivate:[authGuard]}
];
