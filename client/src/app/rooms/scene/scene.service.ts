import {inject, Injectable, signal} from '@angular/core';
import {DataBaseService} from "../../services/data-base.service";
import {IScene} from "./scene";
import {BaseNode, IBaseNode} from "../map/node";
import {FileService} from "../../services/file.service";

export type IRightMode = 'chat'|'hero'|'scene-items'|'scene-options';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  surreal = inject(DataBaseService);
  files = inject(FileService);

  currentScene = signal<IScene|undefined>(undefined);
  currentNode =  signal<IBaseNode|undefined>(undefined);
  sceneNodes = signal<IBaseNode[]>([]);
  roomScenes = signal<IScene[]>([]);

  nodesAvatars = new Map<string, string>();

  rightMode = signal<IRightMode>('scene-options');
  currentRoom: string = '';

  async setCurrentScene(scene:string|IScene){
    const realScene: IScene|undefined = typeof scene === 'string'
      ? this.roomScenes().find(x=> x.id === scene)
      : scene;
    if (!realScene) { return; }
    this.currentScene.set(realScene);
    await this.setSceneNodes();
  }

  async setSceneNodes(){
    if (!this.currentScene()?.nodes?.length) return;
    // @ts-ignore
    const [nodes] = await this.surreal.db.query<[IBaseNode[]]>(`select * from [${this.currentScene().nodes.join(',')}]`);
    for (const node of nodes){
      await this.updateNodeAvatar(node.id);
    }
    this.sceneNodes.set(nodes);
  }

  async updateNodeAvatar(nodeid:string){
    const url = await this.files.getObjUrlForFile(nodeid+'_avatar');
    if (url) {
      this.nodesAvatars.set(nodeid, url);
    } else if (this.nodesAvatars.has(nodeid)) {
      this.nodesAvatars.delete(nodeid);
    }
  }

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

  async addNode(options: Partial<IBaseNode> = {}) {
    const base: BaseNode = new BaseNode({...options});
    const [result] = (await this.surreal.db.insert<IBaseNode, Partial<IBaseNode>>('scenes_nodes', base));
    this.sceneNodes.update(all =>
      [
        ...all,
        {...result}
      ]);
    await this.surreal.db.query(`UPDATE ${this.currentScene()?.id} SET nodes += ${result.id};`);
    // const result2 = await this.surreal.db.update(this.currentScene()?.id, scene);
  }

  async updateNode(node: {id:string} & Partial<IBaseNode>, triggerUpdate = false){
    const [updated] = await this.surreal.db.merge<IBaseNode>(node.id, node);
    if (triggerUpdate){
      this.sceneNodes.update(x => {
        const t = [...x];
        t.splice(t.findIndex(c => c.id === node.id), 1, updated);
        return t;
      })
    }
  }

  async deleteNode(nodeId:string){
    if (!this.currentScene()) return;
    await this.updateScene(
      (this.currentScene() as IScene).id,
      {nodes: (this.currentScene() as IScene).nodes.filter(x => x !== nodeId)}
    );
    await this.surreal.db.delete(nodeId);
    this.sceneNodes.update(n => n.filter(x => x.id !== nodeId));
    if (this.nodesAvatars.has(nodeId)){
      this.nodesAvatars.delete(nodeId);
    }
  }

}
