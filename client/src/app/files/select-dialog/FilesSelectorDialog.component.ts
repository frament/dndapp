import {Component, Inject, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileService} from "../../services/file.service";
import {DIALOG_DATA, DialogRef} from '@angular/cdk/dialog';

export type IFileDialogData = { prefix?:string;};

@Component({
  selector: 'dndapp-files-selector-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './FilesSelectorDialog.component.html',
  styleUrls: ['./FilesSelectorDialog.component.scss'],
})
export class FilesSelectorDialogComponent implements OnInit{
  constructor(private dialogRef: DialogRef,
              @Inject(DIALOG_DATA) public data: IFileDialogData) {
  }
  service = inject(FileService);
  list = signal<string[]>([]);
  selected: File|undefined;
  mode = signal<'list'|'add'>('list');
  async ngOnInit(): Promise<void> {
    await this.setList();
  }

  async setList(): Promise<void> {
    let list = await this.service.getFileList();
    if (this.data?.prefix){
      list = list.filter(x=>x.startsWith(this.data.prefix+'/')).map(x=>x.replace(this.data.prefix+'/',''));
    }
    this.list.set(list);
  }

  async selectFile(fileName:string): Promise<void>{
    this.selected = await this.service.getFile(this.prepareName(fileName));
    this.dialogRef.close(this.selected);
  }

  async openfile(event:any) {
    await Promise.all([...event.target.files].map((x: File) => this.service.saveFile(this.prepareName(x.name), x)));
    await this.setList();
  }

  prepareName(name:string):string{
    return (this.data?.prefix ? this.data?.prefix+'/' : '') + name;
  }
}
