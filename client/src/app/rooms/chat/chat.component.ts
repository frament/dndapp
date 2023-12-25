import {
  Component, effect,
  ElementRef, inject,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DataBaseService} from "../../data-base.service";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {UserService} from "../../auth/user.service";
import {FormsModule} from "@angular/forms";
import {TextMessageComponent} from "./text-message.component";
import {RoomService} from "../room.service";

@Component({
  selector: 'dndapp-chat',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, TextMessageComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit{
  @Input() roomId: string = '';
  @ViewChild('messContainer') private messContainer!: ElementRef;
  @ViewChildren('messages') messagesEls!: QueryList<any>;
  sendIcon = faPaperPlane;
  currentMessage:string = '';
  roomService = inject(RoomService);
  surreal = inject(DataBaseService);
  user = inject(UserService);

  constructor() {
    effect(()  => {
      const room = this.roomService.currentRoom();
      if (!room) return;
      this.userColorMap[room.admin] = this.getRandomColor();
      room.users.map(x => this.userColorMap[x] = this.getRandomColor());
    });
  }

  userColorMap:{[user:string]:string} = {};

  getRandomColor():string{
    return '#'+(Math.random() * 0x1000000 | 0x1000000).toString(16).slice(1);
  }

  async ngOnInit(): Promise<void> {
    await this.roomService.setCurrentRoom('rooms:'+this.roomId);
    this.scrollChat();
    this.messagesEls.changes.subscribe(() => this.scrollChat());
  }

  async sendMessage():Promise<void>{
    if (!this.user.user) { return; }
    await this.surreal.db.insert('room_logs',{
      room: 'rooms:'+this.roomId,
      type: 'text',
      user: this.user.user?.id,
      value: this.currentMessage,
    });
    this.currentMessage = '';
  }

  scrollChat(){
    try {
      this.messContainer.nativeElement.scrollTop = this.messContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
