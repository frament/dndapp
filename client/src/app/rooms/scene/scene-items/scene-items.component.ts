import {Component, computed, inject, input, Input, OnInit, signal, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilesSelectorDialogComponent, IFileDialogData} from "../../../files/select-dialog/FilesSelectorDialog.component";
import {Dialog, DialogModule} from "@angular/cdk/dialog";
import {SceneService} from "../scene.service";
import {IScene} from "../scene";
import {FormsModule} from "@angular/forms";
import {SceneAddDialogComponent} from "../scene-add-dialog/SceneAddDialog.component";
import {RoomService} from "../../room.service";
import {BaseNode} from "../../map/node";
import {delayedTask} from "../../../helpers/delayed-task";

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
  confirmDelete = signal<boolean>(false);
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
  }

}
