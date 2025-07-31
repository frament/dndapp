import {inject, Injectable, signal} from '@angular/core';
import {DataBaseService} from "../services/data-base.service";
import {UserService} from "../services/user.service";
import {IRoom, Room} from "./room";
import {IUser} from "../auth/user";
import {SceneService} from "./scene/scene.service";

export type IRoomLog = {
  id:string;
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
  private surreal = inject(DataBaseService);
  private user = inject(UserService);
  scenesService = inject(SceneService);

  async getList(): Promise<Room[]>{
    return this.surreal.select<Room>('select id, name from rooms;');
  }

  async getById(id:string): Promise<Room|null>{
    return this.surreal.selectOne<Room>(`select id, name from heroes where id = ${id};`);
  }

  async add(room: Partial<Room>): Promise<Room> {
    const [result] = await this.surreal.db.insert('rooms', {...room, admin: this.user.user?.id, users:[this.user.user?.id]});
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
    await this.scenesService.setRoomScenes(roomId);
  }

  async subRoom(room:string):Promise<void>{
    const [roomReal] = await this.surreal.db.query<[IRoom]>(`SELECT id, name, users, admin FROM ONLY ${room}`);
    this.currentRoom.set(roomReal);
  }

  async addUserToRoom(roomId:string, userId:string):Promise<void>{
    await this.surreal.db.query(`UPDATE ${roomId} SET users += ${userId};`);
  }

  async subRoomUsers(room:string):Promise<void>{
    const [users] = await this.surreal.db.query<[IUser[]]>(`SELECT users.* FROM ONLY ${room}`);
    this.currentRoomUsers.set(users);
  }

  async subRoomLogs(room:string): Promise<void>{
    const sql = `SELECT * FROM room_logs WHERE room = ${room}`;
    const [liveId] = await this.surreal.db.query<[string]>('LIVE '+sql);
    await this.surreal.db.live<IRoomLog>(liveId, (action, result) => {
      if (action === "CREATE" && result){
        this.currentRoomLogs.update(old =>  [...old, result]);
      }
    });
    const [logs] = await this.surreal.db.query<[IRoomLog[]]>(sql+' ORDER by version asc;');
    this.currentRoomLogs.set(logs);
  }
}
