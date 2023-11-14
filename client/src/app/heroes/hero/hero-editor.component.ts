import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dndapp-hero-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-editor.component.html',
  styleUrls: ['./hero-editor.component.scss'],
})
export class HeroEditorComponent {}
