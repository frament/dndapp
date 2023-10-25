import { Injectable } from '@angular/core';
import {DataBaseService} from "./data-base.service";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private surreal: DataBaseService) { }

  user:any;

  async getuser(user:string){
    const queries = [
      `SELECT * FROM ONLY name:${user};`,
      `SELECT * FROM user WHERE name = '${user}'`,
      `SELECT * FROM user`,
    ];
    for (const q of queries) {
        console.log(q);
        const t = await this.surreal.db.select(q);
        console.log(t);
    }
  }

  async signup(name:string, password:string, email:string): Promise<void> {
    try {
      const token = await this.surreal.db.signup({NS:'dnd', DB:'dnd', SC:'user', name, password, email});
      localStorage.setItem('user_jwt_token', token);
    } catch (e) {
      console.error(e);
    }
  }

  async signin(email:string, password:string): Promise<void> {
    try{
      const token = await this.surreal.db.signin({NS:'dnd', DB:'dnd', SC:'user', email, password});
      if (token) localStorage.setItem('user_jwt_token', token);
    } catch (e) {
      console.error(e);
    }
  }

  async auth() {
    const token = localStorage.getItem('user_jwt_token');
    if (!token) return false;
    try {
      return  await this.surreal.db.authenticate(token);
    } catch (e) {
      localStorage.removeItem('user_jwt_token')
      return false;
    }
  }
}
