import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {SceneService} from "../scene.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {IScene} from "../scene";
import {delayedTask} from "../../../helpers/delayed-task";
import {FileService} from "../../../services/file.service";

@Component({
  selector: 'dndapp-scene-options',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './scene-options.component.html',
  styleUrl: './scene-options.component.scss'
})
export class SceneOptionsComponent {
  roomId = input.required<string>();
  sceneService = inject(SceneService);
  fileService = inject(FileService);
  name = computed<string>(() => this.sceneService.currentScene()?.name ?? '');
  sceneId = computed(() => this.sceneService.currentScene()?.id  ?? '');
  confirmDelete = signal<boolean>(false);
  backgroundURL = signal<string>('');
  constructor() {
    effect(async () => {
      if (!this.roomId() || !this.sceneId()) return;
      await this.setUrl();
    }, {allowSignalWrites:true});
  }

  async setUrl() {
    const fileprefix = this.sceneService.getSceneBackgroundFileName('rooms:'+this.roomId(), this.sceneId());
    const file = await this.fileService.getObjUrlForFile(fileprefix);
    if (file) {
      this.backgroundURL.set(file);
    }
  }

  async updateSceneOption(key:keyof IScene, value:any, delayed = false){
    if (delayed){
      delayedTask(async () => await this.sceneService.updateScene(this.sceneId(), {[key]:value}), 300, 'updateSceneOption');
    } else {
      await this.sceneService.updateScene(this.sceneId(), {[key]:value});
    }
  }
  async openfile(event:any) {
    const fileprefix = this.sceneService.getSceneBackgroundFileName(this.roomId(), this.sceneId());
    await this.fileService.saveFile(fileprefix, event.target.files[0] as File);
    await this.setUrl();
  }
  async delete(){
    await this.sceneService.deleteScene(this.sceneId());
    this.confirmDelete.set(false);
  }
}
