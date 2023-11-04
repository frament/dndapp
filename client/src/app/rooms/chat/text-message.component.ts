import {Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {IRoomLog} from "./chat.component";

export interface IChatTextMessage extends IRoomLog{
  type:'text';
  value:string;
}

@Component({
  selector: 'dndapp-text-message',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="flex flex-col rounded-md border-0 shadow-sm ring-1 ring-inset ring-gray-300 m-1">
    <div class="flex text-center"><span class="mr-2">{{message.user}}</span><span class="text-sm">{{message.version | date:'H:m'}}</span></div>
    <p>{{message.value}}</p>
  </div>`,
  styles: [],
})
export class TextMessageComponent {
  @Input() message!: IRoomLog;
}
