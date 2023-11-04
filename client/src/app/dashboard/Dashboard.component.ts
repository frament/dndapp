import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Hero} from "../heroes/Hero";
import {HeroesService} from "../heroes/heroes.service";
import {Room} from "../rooms/room";
import {RoomService} from "../rooms/room.service";
import {Router} from "@angular/router";

@Component({
  selector: 'dndapp-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.scss'],
})
export class DashboardComponent implements OnInit{
  constructor(private heroesService: HeroesService,
              private roomsService: RoomService,
              private router: Router) {}

  heroes: Hero[] = [];
  rooms: Room[] = [];
  async ngOnInit(): Promise<void> {
    this.heroes = await this.heroesService.getList();
    this.rooms = await this.roomsService.getList();
  }

  async addHero(): Promise<void>{
    await this.heroesService.add({name:'test'+this.heroes.length});
    this.heroes = await this.heroesService.getList();
  }

  async addRoom(): Promise<void>{
    await this.roomsService.add({name:'test'+this.rooms.length});
    this.rooms = await this.roomsService.getList();
  }

  async goToRoom(id:string):Promise<void>{
    await this.router.navigateByUrl('/room/'+id.replace('rooms:',''));
  }

}
