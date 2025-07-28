import { Injectable } from '@angular/core';
import {Surreal} from "surrealdb.js";

export type LiveActionType = "CREATE" | "UPDATE" | "DELETE" | "CLOSE";

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  public db = new Surreal();
  async init():Promise<void>{
    await this.db.connect('http://localhost:8000/rpc', {namespace:'dnd', database: 'dnd'});
  }

  async select<T>(query: string, vars?: Record<string, unknown>): Promise<T[]>{
    return (await this.db.query<[Array<T & Record<any, any>>]>(query, vars))[0] ?? [];
  }
  async selectOne<T>(query: string, vars?: Record<string, unknown>): Promise<T|null>{
    return (await this.select<T>(query, vars))[0] ?? null;
  }
}
