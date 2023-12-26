import {Component, computed, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilesSelectorDialogComponent, IFileDialogData} from "../../files/select-dialog/FilesSelectorDialog.component";
import {Dialog, DialogModule} from "@angular/cdk/dialog";
import {SceneService} from "./scene.service";
import {IScene} from "./scene";
import {FormsModule} from "@angular/forms";
import {SceneAddDialogComponent} from "./scene-add-dialog/SceneAddDialog.component";
import {RoomService} from "../room.service";

@Component({
  selector: 'dndapp-scene-items',
  standalone: true,
  imports: [CommonModule, DialogModule, FormsModule],
  templateUrl: './scene-items.component.html',
  styleUrls: ['./scene-items.component.scss'],
})
export class SceneItemsComponent implements OnInit {
  @Input({transform: (v: string) => v.startsWith('rooms:') ? v : 'rooms:'+v}) roomId = '';
  _roomId = signal<string>('');
  dialog = inject(Dialog);
  service = inject(SceneService);
  roomService = inject(RoomService);

  scenes = signal<IScene[]>([]);
  selectedSceneName: string = '';

  async ngOnInit() {
    this.scenes.set(await this.service.getSceneList(this.roomId));
  }

  async setScene(ev: string) {
    const realScene = this.scenes().find(x=> x.id === ev);
    if (!realScene) { return; }
    this.selectedSceneName = realScene.name;
    this.roomService.currentScene.set(realScene);
  }
  addScene() {
    this.dialog.open(SceneAddDialogComponent, {data:{roomId:this.roomId}});
  }

  addPlayer(){

  }
  addNPC(){

  }
  addEnemy(){

  }

  openFileDialog(){
    const dialogRef = this.dialog.open<File, IFileDialogData>(FilesSelectorDialogComponent, {
      data: {prefix: this.roomId},
    });

    dialogRef.closed.subscribe( (x:File|undefined) => {
      // Subscription runs after the dialog closes
      console.log(x?.name);
    });
  }
}
