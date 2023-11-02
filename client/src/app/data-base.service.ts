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
    return (await this.db.query(query, vars))[0].result as unknown as T[] ?? [];
  }
  selectAll = this.db.select;
  query = this.db.query;
  delete = this.db.delete;
  patch = this.db.patch;
  merge = this.db.merge;
  update = this.db.update;
  insert = this.db.insert;
  create = this.db.create;
  kill = this.db.kill;
  listenLive = this.db.listenLive;
  live = this.db.live;
  unset = this.db.unset;
  let = this.db.let;
  info = this.db.info;
}
