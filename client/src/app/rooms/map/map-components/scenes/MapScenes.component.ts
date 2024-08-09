import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {IScene} from "../../../scene/scene";
import {RoomService} from "../../../room.service";
import {SceneService} from "../../../scene/scene.service";
import {SceneAddDialogComponent} from "../../../scene/scene-add-dialog/SceneAddDialog.component";
import {Dialog} from "@angular/cdk/dialog";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'dndapp-map-scenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './MapScenes.component.html',
  styleUrl: './MapScenes.component.scss',
})
export class MapScenesComponent{
  scenes = computed<IScene[]>(() => this.scenesService.roomScenes());
  roomService= inject(RoomService);
  scenesService = inject(SceneService);
  dialog = inject(Dialog);
  roomId = computed(() => this.roomService.currentRoom()?.id ?? '');
  sceneId = computed(() => this.scenesService.currentScene()?.id ?? '');
  constructor() {
    effect(() => {
      console.log(this.scenes());
    });
  }
  addScene() {
    this.dialog.open(SceneAddDialogComponent, {data:{roomId:this.roomId()}});
  }

  async setScene(event: string) {
    const realScene = this.scenes().find(x=> x.id === event);
    if (!realScene) { return; }
    this.scenesService.currentScene.set(realScene);
  }
}
