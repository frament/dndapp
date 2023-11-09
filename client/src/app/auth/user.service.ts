import { Injectable } from '@angular/core';
import {DataBaseService} from "../data-base.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private surreal: DataBaseService) { }

  user:any = undefined;

  async loadUser(){
    this.user = (await this.surreal.db.query<{name:string, email:string}[]>('select id, email, name from only $auth'))?.[0];
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
    console.log('logout');
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
