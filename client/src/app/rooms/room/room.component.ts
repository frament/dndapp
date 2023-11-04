import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChatComponent} from "../chat/chat.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faCoffee, faMessage} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'dndapp-room',
  standalone: true,
  imports: [CommonModule, ChatComponent, FontAwesomeModule],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent {
  rightMode: 'chat'|'nav' = 'chat';
  chatIcon = faMessage;
  navIcon = faCoffee;

  constructor() {
  }

}
