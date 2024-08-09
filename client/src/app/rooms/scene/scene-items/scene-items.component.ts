import {Component, computed, inject, input, Input, OnInit, signal, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilesSelectorDialogComponent, IFileDialogData} from "../../../files/select-dialog/FilesSelectorDialog.component";
import {Dialog, DialogModule} from "@angular/cdk/dialog";
import {SceneService} from "../scene.service";
import {IScene} from "../scene";
import {FormsModule} from "@angular/forms";
import {SceneAddDialogComponent} from "../scene-add-dialog/SceneAddDialog.component";
import {RoomService} from "../../room.service";

@Component({
  selector: 'dndapp-scene-items',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule],
  templateUrl: './scene-items.component.html',
  styleUrls: ['./scene-items.component.scss'],
})
export class SceneItemsComponent {
  roomId = input<string, string>('', {transform: (v: string) => v.startsWith('rooms:') ? v : 'rooms:'+v});
  dialog = inject(Dialog);
  service = inject(SceneService);

  async addPlayer(){
    await this.service.addNode();
  }
  async addNPC(){
    await this.service.setRoomScenes(this.roomId());
  }
  addEnemy(){

  }

  openFileDialog(){
    const dialogRef = this.dialog.open<File, IFileDialogData>(FilesSelectorDialogComponent, {
      data: {prefix: this.roomId()},
    });

    dialogRef.closed.subscribe( (x:File|undefined) => {
      // Subscription runs after the dialog closes
      console.log(x?.name);
    });
  }
}
