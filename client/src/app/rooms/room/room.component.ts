import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChatComponent} from "../chat/chat.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faCoffee, faMessage, faPerson} from "@fortawesome/free-solid-svg-icons";
import {MapComponent} from "../map/map.component";
import {Subscription} from "rxjs";
import {HeroComponent} from "../hero/hero.component";

@Component({
  selector: 'dndapp-room',
  standalone: true,
  imports: [CommonModule, ChatComponent, FontAwesomeModule, MapComponent, HeroComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy{
  rightMode: 'chat'|'hero' = 'chat';
  chatIcon = faMessage;
  heroIcon = faPerson;
  @Input('id') roomId: string = '';
  paramsSub: Subscription|undefined;

  constructor() {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

}
