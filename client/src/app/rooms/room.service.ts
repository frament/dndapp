import {Injectable, signal} from '@angular/core';
import {DataBaseService} from "../data-base.service";
import {UserService} from "../auth/user.service";
import {Room} from "./room";

export interface IRoomLog{
  room:string;
  type:string;
  user:string;
  value:any;
  version:Date;
}

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
    const [result] = await this.surreal.db.insert('rooms', {...room, admin: this.user.user.id, tst1:[this.user.user.id]});
    return result as unknown as Room;
  }

  currentRoomLogs = signal<IRoomLog[]>([]);
  currentRoom = signal<Room|undefined>(undefined);
  currentRoomUsers = signal<any[]>([]);

  async setCurrentRoom(roomId:string):Promise<void>{
    await this.subRoom(roomId);
    await this.subRoomLogs(roomId);
    // await this.addUserToRoom("rooms:"+roomId, 'user:v5gkhg2yxcdxndoa3ycn')
    await this.subRoomUsers(roomId);
  }

  async subRoom(roomId:string):Promise<void>{
    const room = (await this.surreal.db.query(
      'SELECT id, name, users, admin FROM ONLY $room',
      {room:'rooms:'+roomId}
    ))[0] as unknown as Room;
    this.currentRoom.set(room);
  }

  async addUserToRoom(roomId:string, userId:string):Promise<void>{
    await this.surreal.db.query('UPDATE $roomId SET users += $userId;', {roomId,userId});
  }

  async subRoomUsers(roomId:string):Promise<void>{
    const users = (await this.surreal.db.query(
      'SELECT users.* FROM ONLY $room',
      {room:'rooms:'+roomId}
    ))[0] as unknown as any[];
  }

  async subRoomLogs(roomId:string): Promise<void>{
    const logs = (await this.surreal.db.query(
      'SELECT * FROM room_logs where room = $room ORDER by version asc;',
      {room:'rooms:'+roomId}
    ))[0] as unknown as IRoomLog[];
    const liveId = (await this.surreal.db.query(
      'LIVE SELECT * FROM room_logs WHERE room = $room',
      {room:'rooms:'+roomId}
    ))[0] as unknown as string;
    this.currentRoomLogs.set(logs);
    await this.surreal.db.listenLive(liveId,
      ({ action, result}) => {
        if (action === "CREATE"){
          this.currentRoomLogs.update(old => {
            old.push(result as unknown as IRoomLog);
            return old;
          })
        }
      })
  }
}
