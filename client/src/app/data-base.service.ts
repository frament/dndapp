import { Injectable } from '@angular/core';
import {Surreal} from "surrealdb.js";

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {
  public db = new Surreal();
  constructor() {}
}
