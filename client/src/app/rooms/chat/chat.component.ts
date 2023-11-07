import {
  AfterViewChecked, AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {DataBaseService, LiveActionType} from "../../data-base.service";
import {faPaperPlane} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {UserService} from "../../auth/user.service";
import {FormsModule} from "@angular/forms";
import {TextMessageComponent} from "./text-message.component";

export interface IRoomLog{
  room:string;
  type:string;
  user:string;
  value:any;
  version:Date;
}

@Component({
  selector: 'dndapp-chat',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, TextMessageComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit{
  constructor(private surreal: DataBaseService, private user: UserService) {}
  @Input() roomId: string = '';
  @ViewChild('messContainer') private messContainer!: ElementRef;
  @ViewChildren('messages') messagesEls!: QueryList<any>;
  messages: IRoomLog[] = [];
  sendIcon = faPaperPlane;
  currentMessage:string = '';

  userColorMap:{[user:string]:string} = {};

  getRandomColor():string{
    return '#'+(Math.random() * 0x1000000 | 0x1000000).toString(16).slice(1);
  }

  async ngOnInit(): Promise<void> {
    this.messages = (await this.surreal.db.query('SELECT id, type, user.name as user, value, version FROM room_logs where room = $room ORDER by version asc;',{room:'rooms:'+this.roomId}))[0]
        .result as unknown as IRoomLog[] ?? [];
    new Set(this.messages.map(x=>x.user)).forEach(x => this.userColorMap[x] = this.getRandomColor());
    const liveId = (await this.surreal.db.query(`LIVE SELECT id, type, user.name as user, value, version FROM room_logs WHERE room = rooms:${this.roomId}`))[0]
        .result as unknown as string;
    await this.surreal.db.listenLive(liveId,
      // ({ action, result}) => {
      (e: any) => {
        if (e.action === "CREATE"){
          if (!this.userColorMap.hasOwnProperty(e.result.user)){
            this.userColorMap[e.result.user] = this.getRandomColor();
          }
          this.messages.push(e.result as unknown as IRoomLog);
        }
      })
    this.scrollChat();
    this.messagesEls.changes.subscribe(() => this.scrollChat());
  }

  async sendMessage():Promise<void>{
    await this.surreal.db.insert('room_logs',{
      room: 'rooms:'+this.roomId,
      type: 'text',
      user: this.user.user.id,
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
