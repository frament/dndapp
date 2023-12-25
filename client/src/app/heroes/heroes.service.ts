import { Injectable } from '@angular/core';
import {DataBaseService} from "../data-base.service";
import {Hero} from "./Hero";
import {UserService} from "../auth/user.service";

@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  constructor(private surreal: DataBaseService, private user: UserService) { }

  async getList(): Promise<Hero[]>{
    return this.surreal.select<Hero>('select id, name from heroes;');
  }

  async getById(id:string): Promise<Hero|null>{
    return this.surreal.selectOne<Hero>('select id, name from heroes where id = $id;',{id});
  }

  async delete(id:string): Promise<void>{
    await this.surreal.db.delete(id);
  }

  async add(hero: Partial<Hero>): Promise<Hero> {
    const [result] = await this.surreal.db.insert('heroes', {...hero, user: this.user.user?.id});
    return result as unknown as Hero;
  }
}
