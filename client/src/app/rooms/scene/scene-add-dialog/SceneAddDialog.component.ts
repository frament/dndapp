import {Component, computed, Inject, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";
import {SceneService} from "../scene.service";
import {IScene} from "../scene";
import {FileService} from "../../../services/file.service";

export type IAddSceneData = {roomId:string};

@Component({
  selector: 'dndapp-scene-add-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './SceneAddDialog.component.html',
  styleUrl: './SceneAddDialog.component.scss',
})
export class SceneAddDialogComponent {
  dialogRef = inject(DialogRef)
  data = inject<IAddSceneData>(DIALOG_DATA);
  service = inject(SceneService);
  fileService = inject(FileService);
  okDisabled = computed(() => !this.name() || !this.data.roomId || !this.file());
  name = signal<string>('');
  file = signal<File|undefined>(undefined);

  async saveChanges() {
    const new_scene: Partial<IScene> = {name: this.name(), room: this.data.roomId, gridStepWidth: 100};
    await this.service.addScene(new_scene);
    const newScene = this.service.roomScenes().find(x=> x.name === new_scene.name);
    if (!newScene || !this.file()){this.dialogRef.close(); return; }
    const fileprefix = this.service.getSceneBackgroundFileName(this.data.roomId, newScene.id);
    await this.fileService.saveFile(fileprefix, this.file() as File);
    this.dialogRef.close();
  }

  async openfile(event:any) {
    this.file.set(event.target.files[0]);
  }

}
