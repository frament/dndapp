import {Component, effect, inject, input, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChatComponent} from "../chat/chat.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faMapLocationDot, faMessage, faPerson, faWrench} from "@fortawesome/free-solid-svg-icons";
import {MapComponent} from "../map/map.component";
import {HeroComponent} from "../hero/hero.component";
import {SceneItemsComponent} from "../scene/scene-items/scene-items.component";
import {UserService} from "../../services/user.service";
import {RoomService} from "../room.service";
import {SceneOptionsComponent} from "../scene/scene-options/scene-options.component";
import {DataBaseService} from "../../services/data-base.service";
import {SceneService} from "../scene/scene.service";

@Component({
  selector: 'dndapp-room',
  standalone: true,
  imports: [CommonModule, ChatComponent, FontAwesomeModule, MapComponent, HeroComponent, SceneItemsComponent, SceneOptionsComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent {
  rightMode = signal<'chat'|'hero'|'scene-items'|'scene-options'>('scene-items');
  chatIcon = faMessage;
  heroIcon = faPerson;
  sceneIcon = faMapLocationDot;
  sceneOptionsIcon = faWrench;
  roomId = input<string>('',{alias:'id'});
  user = inject(UserService);
  roomService = inject(RoomService);
  sceneService = inject(SceneService);

  constructor() {
    effect(async () => {
      await this.roomService.setCurrentRoom('rooms:'+this.roomId());
    });
  }
}
