import {Component, effect, inject, input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DialogModule} from "@angular/cdk/dialog";
import {SceneService} from "../scene.service";
import {FormsModule} from "@angular/forms";
import {BaseNode, IBaseNode} from "../../map/node";
import {delayedTask} from "../../../helpers/delayed-task";
import {FileService} from "../../../services/file.service";

@Component({
  selector: 'dndapp-scene-items',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule],
  templateUrl: './scene-items.component.html',
  styleUrls: ['./scene-items.component.scss'],
})
export class SceneItemsComponent {
  roomId = input<string, string>('', {transform: (v: string) => v.startsWith('rooms:') ? v : 'rooms:'+v});
  service = inject(SceneService);
  fileService = inject(FileService);
  confirmDelete = signal<boolean>(false);
  avatar_file = signal<File|undefined>(undefined);
  avatarObjUrl = signal<string>('');

  constructor() {
    effect(async () => {
      this.avatarObjUrl.set(this.service.nodesAvatars.get(this.service.currentNode()?.id ?? '') ?? '');
    }, {allowSignalWrites:true});
  }

  async setavatar(event:any) {
    this.avatar_file.set(event.target.files[0]);
    const avatar_name = this.service.currentNode()?.id+'_avatar';
    await this.fileService.saveFile(avatar_name, this.avatar_file() as File);
    await this.service.updateNodeAvatar(this.service.currentNode()?.id ?? '');
    this.avatarObjUrl.set(this.service.nodesAvatars.get(this.service.currentNode()?.id ?? '') ?? '');
  }

  async addNode(){
    await this.service.addNode();
  }

  async updateNodeKey(id:string, key:keyof BaseNode, value:any): Promise<void>{
    delayedTask(async () => {
      await this.service.updateNode({id, [key]:value}, true);
    }, 300, 'updateNode');
  }

  async deleteNode(id:string){
    await this.service.deleteNode(id);
    this.service.currentNode.set(undefined);
    this.confirmDelete.set(false);
  }

  async setCurrentNode(node:IBaseNode){
    this.service.currentNode.set(node);
  }

}
