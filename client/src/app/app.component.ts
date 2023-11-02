import {Component} from '@angular/core';
import {RouterModule} from '@angular/router';
import {UserService} from "./auth/user.service";
@Component({
  standalone: true,
  imports: [RouterModule],
  providers:  [UserService],
  selector: 'dndapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent{
  title = 'DnD App';
  constructor() {}
}
