import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Hero} from "../heroes/Hero";
import {HeroesService} from "../heroes/heroes.service";

@Component({
  selector: 'dndapp-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './Dashboard.component.html',
  styleUrls: ['./Dashboard.component.scss'],
})
export class DashboardComponent implements OnInit{
  constructor(private heroesService: HeroesService) {}

  heroes: Hero[] = [];
  async ngOnInit(): Promise<void> {
    this.heroes = await this.heroesService.getList();
  }

}
