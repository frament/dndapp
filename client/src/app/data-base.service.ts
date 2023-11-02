import { Injectable } from '@angular/core';
import {Surreal} from "surrealdb.js";

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  public db = new Surreal();
  constructor() {}
  async init():Promise<void>{
    await this.db.connect('http://localhost:8000/rpc', {ns:'dnd', db: 'dnd'});
  }

  async select<T>(query: string, vars?: Record<string, unknown>): Promise<T[]>{
    return (await this.db.query<[Array<T & Record<any, any>>]>(query, vars))[0].result ?? [];
  }
  async selectOne<T>(query: string, vars?: Record<string, unknown>): Promise<T|null>{
    return (await this.select<T>(query, vars))[0] ?? null;
  }
}
