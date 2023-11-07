import {Component, OnDestroy, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ChatComponent} from "../chat/chat.component";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faCoffee, faMessage} from "@fortawesome/free-solid-svg-icons";
import {MapComponent} from "../map/map.component";
import {ActivatedRoute, Params} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'dndapp-room',
  standalone: true,
  imports: [CommonModule, ChatComponent, FontAwesomeModule, MapComponent],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy{
  rightMode: 'chat'|'nav' = 'chat';
  chatIcon = faMessage;
  navIcon = faCoffee;
  roomId: string = '';
  paramsSub: Subscription|undefined;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.paramsSub = this.route.params.subscribe((x: Params)=>{
      this.roomId = x['id'];
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

}
