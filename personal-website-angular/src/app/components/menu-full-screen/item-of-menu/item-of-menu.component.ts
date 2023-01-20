import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MenuItem} from "../../../mapper/MenuItem";

@Component({
  selector: 'app-item-of-menu',
  styleUrls: ['./item-of-menu.component.scss'],
  template: `
  <h1 class="hoverMeZoom" [ngStyle]="{'color': coloreTesto}"
      (click)="clicked.emit(menuItem)">{{menuItem.name}}</h1>
  `
})
export class ItemOfMenuComponent {

  @Input() menuItem!: MenuItem
  @Input() coloreTesto !: string

  @Output() clicked = new EventEmitter<MenuItem>()

}
