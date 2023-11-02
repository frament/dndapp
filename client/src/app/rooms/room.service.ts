import { Injectable } from '@angular/core';
import {DataBaseService} from "../data-base.service";
import {UserService} from "../auth/user.service";
import {Hero} from "../heroes/Hero";
import {Room} from "./room";

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  constructor(private surreal: DataBaseService, private user: UserService) { }

  async getList(): Promise<Room[]>{
    return this.surreal.select<Room>('select id, name from rooms;');
  }

  async getById(id:string): Promise<Room|null>{
    return this.surreal.selectOne<Room>('select id, name from heroes where id = $id;',{id});
  }

  async add(room: Partial<Room>): Promise<Room> {
    const [result] = await this.surreal.db.insert('rooms', {...room, admin: this.user.user.id, users:[]});
    return result as unknown as Room;
  }
}
