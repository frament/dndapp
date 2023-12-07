import {Component, inject, Input, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilesSelectorDialogComponent, IFileDialogData} from "../../files/select-dialog/FilesSelectorDialog.component";
import {Dialog, DialogModule} from "@angular/cdk/dialog";

@Component({
  selector: 'dndapp-scene-items',
  standalone: true,
  imports: [CommonModule, DialogModule],
  templateUrl: './scene-items.component.html',
  styleUrls: ['./scene-items.component.scss'],
})
export class SceneItemsComponent {
  @Input() roomId: string = '';
  dialog = inject(Dialog);


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
