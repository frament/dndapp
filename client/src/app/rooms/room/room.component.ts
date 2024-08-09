import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChatComponent} from "../chat/chat.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faMapLocationDot, faMessage, faPerson} from "@fortawesome/free-solid-svg-icons";
import {MapComponent} from "../map/map.component";
import {Subscription} from "rxjs";
import {HeroComponent} from "../hero/hero.component";
import {SceneItemsComponent} from "../scene/scene-items.component";
import {UserService} from "../../services/user.service";
import {RoomService} from "../room.service";

@Component({
  selector: 'dndapp-room',
  standalone: true,
  imports: [CommonModule, ChatComponent, FontAwesomeModule, MapComponent, HeroComponent, SceneItemsComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy{
  rightMode: 'chat'|'hero'|'scene-items' = 'scene-items';
  chatIcon = faMessage;
  heroIcon = faPerson;
  sceneIcon = faMapLocationDot;
  @Input('id') roomId: string = '';
  paramsSub: Subscription|undefined;
  user = inject(UserService);
  roomService = inject(RoomService);

  constructor() {}

  async ngOnInit(): Promise<void> {
    console.log(this.roomId);
    await this.roomService.setCurrentRoom('rooms:'+this.roomId);
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

}
