import {Component, computed, effect, inject, input, signal} from '@angular/core';
import {SceneService} from "../scene.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

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
  name = signal<string>('');
  sceneId = computed(() => this.sceneService.currentScene()?.id  ?? '');

  file = signal<File|undefined>(undefined);
  constructor() {
    effect(() => {
      this.name.set(this.sceneService.currentScene()?.name ?? '');
    }, {allowSignalWrites:true});
  }

  async setModelName(name:string){
    await this.sceneService.updateScene(this.sceneId(), {name})
  }
  async openfile(event:any) {
    this.file.set(event.target.files[0]);
  }
  async delete(){
    await this.sceneService.deleteScene(this.sceneId());
  }
}
