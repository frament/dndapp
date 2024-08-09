import { Injectable } from '@angular/core';
import {DataBaseService} from "./data-base.service";
import {IUser} from "../auth/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private surreal: DataBaseService) { }

  user:IUser|undefined = undefined;

  async loadUser(){
    [this.user] = await this.surreal.db.query<[IUser]>('select id, email, name from only $auth');
  }

  async signup(name:string, password:string, email:string): Promise<void> {
    try {
      const token = await this.surreal.db.signup({namespace:'dnd', database:'dnd', scope:'user', name, password, email});
      localStorage.setItem('user_jwt_token', token);
      await this.loadUser();
    } catch (e) {
      console.error(e);
    }
  }

  async signin(email:string, password:string): Promise<void> {
    try{
      const token = await this.surreal.db.signin({namespace:'dnd', database:'dnd', scope:'user', email, password});
      if (token) localStorage.setItem('user_jwt_token', token);
      await this.loadUser();
    } catch (e) {
      console.error(e);
    }
  }

  async logout(): Promise<void>{
    localStorage.removeItem('user_jwt_token');
    this.user = undefined;
    await this.surreal.db.authenticate('null');
  }

  async auth() {
    const token = localStorage.getItem('user_jwt_token');
    if (!token) return false;
    try {
      const result = await this.surreal.db.authenticate(token);
      if (result && !this.user) await this.loadUser();
      if (!result) await this.logout();
      return result;
    } catch (e) {
      localStorage.removeItem('user_jwt_token');
      console.error(e);
      return false;
    }
  }
}
