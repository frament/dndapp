import {effect, Injectable, signal} from '@angular/core';
import {DataBaseService} from "../../services/data-base.service";
import {UserService} from "../../services/user.service";
import {IScene} from "./scene";
import {BaseNode, NodeLayer} from "../map/node";

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  constructor(private surreal: DataBaseService, private user: UserService) {}

  currentScene = signal<IScene|undefined>(undefined);
  sceneNodes = signal<NodeLayer[]>([]);
  roomScenes = signal<IScene[]>([]);
  currentRoom: string = '';

  async setRoomScenes(room:string): Promise<void> {
    if (!room) {return;}
    this.currentRoom = room;
    const [result] = await this.surreal.db.query<[IScene[]]>(`select * from scenes where room = ${room}`);
    this.roomScenes.set(result);
  }

  async addScene(scene:Partial<IScene>): Promise<void> {
    const [result] = await this.surreal.db.insert<IScene, Partial<IScene>>('scenes', scene);
    this.roomScenes.update(x =>  [...x,result]);
  }

  async deleteScene(sceneId:string): Promise<void> {
    await this.surreal.db.delete(sceneId);
    this.roomScenes.update(x => x.filter(x => x.id !== sceneId));
    if (sceneId === this.currentScene()?.id){
      this.currentScene.set(undefined);
    }
  }

  async updateScene(sceneId:string, scene:Partial<IScene>): Promise<void> {
    const [updated] = await this.surreal.db.merge<IScene>(sceneId, scene);
    this.roomScenes.update(x => {
      const t = [...x];
      t.splice(t.findIndex(c => c.id === sceneId), 1, updated);
      return t;
    });
    // await this.setRoomScenes(this.currentRoom);
    if (sceneId === this.currentScene()?.id){
      this.currentScene.set(this.roomScenes().find(x => x.id === sceneId));
    }
  }

  getSceneBackgroundFileName(roomId:string, sceneId:string): string{
    return roomId+'\\'+ sceneId+'\\background';
  }


  async addNode(options: Partial<BaseNode> = {}) {
    const base: Partial<BaseNode> = {
      width: 100,
      height: 100,
      positionX: 50,
      positionY: 50,
      rotate: 0,
      color: 'white',
      rx: 10,
      ry: 10,
      ...options
    };
    const [result] = (await this.surreal.db.insert<BaseNode, Partial<BaseNode>>('scenes_nodes', base));
    this.sceneNodes.update(all =>
      [
        ...all,
        {...result, isSelected: false, shadowFilter: 'url(#shadow)'}
      ]);
    await this.surreal.db.query(`UPDATE ${this.currentScene()?.id} SET nodes += ${result.id};`);

    // const result2 = await this.surreal.db.update(this.currentScene()?.id, scene);
  }

}
