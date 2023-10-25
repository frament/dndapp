import {Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import {UserService} from "./user.service";
import {DataBaseService} from "./data-base.service";

@Component({
  standalone: true,
  imports: [RouterModule],
  providers:  [UserService],
  selector: 'dndapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  title = 'client';
  constructor(private user: UserService, private surreal: DataBaseService) {
  }

  async ngOnInit(): Promise<void> {
    await this.surreal.db.connect('http://localhost:8000/rpc', {ns:'dnd', db: 'dnd'})
    if (!await this.user.auth()){
      await this.user.signin('frament@mail.ru','123');
      // await this.user.signup('shpa', '123', 'frament@mail.ru');

      /*try {
        await this.user.signin('frament@mail.ru','123');
      } catch (e) {
        await this.user.signup('shpa', '123', 'frament@mail.ru');
        await this.user.auth();
      }*/

    }
    await this.user.getuser('shpa');
  }
}
