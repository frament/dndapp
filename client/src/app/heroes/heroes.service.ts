import { Injectable } from '@angular/core';
import {DataBaseService} from "../data-base.service";
import {Hero} from "./Hero";

@Injectable({
  providedIn: 'root'
})
export class HeroesService {

  constructor(private surreal: DataBaseService) { }

  async getList(): Promise<Hero[]>{
    return this.surreal.select<Hero>('select id, name from heroes;');
  }
}
