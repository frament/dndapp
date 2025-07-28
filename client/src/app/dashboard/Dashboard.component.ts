import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Hero} from "../heroes/Hero";
import {HeroesService} from "../heroes/heroes.service";
import {Room} from "../rooms/room";
import {RoomService} from "../rooms/room.service";
import {Router} from "@angular/router";
import {Dialog} from "@angular/cdk/dialog";
import {FilesSelectorDialogComponent} from "../files/select-dialog/FilesSelectorDialog.component";

@Component({
  selector: 'dndapp-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.scss'],
})
export class DashboardComponent implements OnInit{
  heroesService = inject(HeroesService);
  roomsService = inject(RoomService);
  router = inject(Router);
  heroes = signal<Hero[]>([]);
  rooms = signal<Room[]>([]);
  async ngOnInit(): Promise<void> {
    this.heroes.set(await this.heroesService.getList());
    this.rooms.set(await this.roomsService.getList());
  }

  async addHero(): Promise<void>{
    await this.heroesService.add({name:'test'+this.heroes().length});
    this.heroes.set(await this.heroesService.getList());
  }

  async deleteHero(id:string): Promise<void> {
    await this.heroesService.delete(id);
    this.heroes.set(await this.heroesService.getList());
  }

  async addRoom(): Promise<void>{
    await this.roomsService.add({name:'test'+this.rooms().length});
    this.rooms.set(await this.roomsService.getList());
  }

  async goToRoom(id:string):Promise<void>{
    await this.router.navigateByUrl('/room/'+id.replace('rooms:',''));
  }

  dialog = inject(Dialog)

  showDialog(){
    this.dialog.open(FilesSelectorDialogComponent);
  }

}
