import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import {UserService} from "./user.service";
import {Router} from "@angular/router";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'dndapp-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [UserService],
  templateUrl: './Auth.component.html',
  styleUrls: ['./Auth.component.scss'],
})
export class AuthComponent{
  constructor(private userService: UserService, private router: Router) {}
  mode:'signin'|'signup'|'error' = "signin";
  user:string = '';
  pass:string = '';
  mail:string = '';

  async signin():Promise<void> {
    try {
      await this.userService.signin(this.mail, this.pass);
    } catch (e) {
      this.mode = "error";
    }
    if (this.mode !== 'error') await this.router.navigateByUrl('/');
  }

  async signup():Promise<void> {
    try {
      await this.userService.signup(this.user, this.pass, this.mail);
    } catch (e) {
      this.mode = "error";
    }
    if (this.mode !== 'error') await this.router.navigateByUrl('/');
  }

  returnToLogin(){
    this.mode = 'signin';
  }

}
