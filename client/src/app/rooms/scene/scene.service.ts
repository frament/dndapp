import { Injectable } from '@angular/core';
import {DataBaseService} from "../../data-base.service";
import {UserService} from "../../auth/user.service";
import {IScene} from "./scene";

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  constructor(private surreal: DataBaseService, private user: UserService) { }

  async getSceneList(room:string): Promise<IScene[]> {
    const [result] = await this.surreal.db.query<[IScene[]]>(`select * from scenes where room = ${room}`);
    return result;
  }

  async addScene(scene:Partial<IScene>): Promise<void> {
    const result = await this.surreal.db.insert<IScene, Partial<IScene>>('scenes', scene);
    console.log('add', result);
  }

  async deleteScene(sceneId:string): Promise<void> {
    const result = await this.surreal.db.delete(sceneId);
    console.log(result);
  }

  async updateScene(sceneId:string, scene:Partial<IScene>): Promise<void> {
    const result = await this.surreal.db.update(sceneId, scene);
    console.log('update', result);
  }

  getSceneBackgroundFileName(roomId:string, sceneId:string): string{
    return roomId+'\\'+ sceneId+'\\background';
  }

}
