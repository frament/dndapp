import {Component, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {IRoomLog} from "../room.service";

@Component({
  selector: 'dndapp-text-message',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="flex flex-col rounded-md border-0 shadow-sm p-2">
    <div class="flex text-center">
      <span class="mr-2" [style]="'color:'+userColor()">{{message().user}}</span>
      <span class="flex-1"></span>
      <span class="text-sm">{{message().version | date:'H:m'}}</span></div>
    <p>{{message().value}}</p>
  </div>`,
  styles: [],
})
export class TextMessageComponent {
  message = input.required<IRoomLog>();
  userColor = input<string>('white');
}
