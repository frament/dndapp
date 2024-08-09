import {Component, output} from '@angular/core';
import { CommonModule } from '@angular/common';

export type ZoomValue = 'in'|'out'|number;

@Component({
  selector: 'dndapp-map-zoom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './MapZoom.component.html',
  styleUrl: './MapZoom.component.scss',
})
export class MapZoomComponent {
  zoom = output<ZoomValue>();
}
