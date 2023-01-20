import {Component, Input, OnInit} from '@angular/core';
import {MenuItem} from "../../mapper/MenuItem";

@Component({
  selector: 'app-menu-full-screen',
  styleUrls: ['./menu-full-screen.component.scss'],
  template: `

    <div class="navigation">
      <input type="checkbox" class="navigation__checkbox"
             id="nav-toggle" [(ngModel)]="isChecked">
      <label for="nav-toggle" class="navigation__button">
        <span class="navigation__icon" aria-label="toggle navigation menu"></span>
      </label>
      <div class="navigation__background "
        [style]="{'background-color': colorBackground}"
      ></div>

      <nav class="navigation__nav" role="navigation"
        (click)="changeState()"
      >
        <ul class="navigation__list">
          <li class="navigation__item" *ngFor="let item of listItems">
            <app-item-of-menu coloreTesto="{{colorItemList}}"
                              class="m-1"
                              [menuItem]="item"  (clicked)="clicked($event)"
            ></app-item-of-menu>
          </li>
        </ul>
      </nav>
    </div>
  `
})
export class MenuFullScreenComponent implements OnInit {

  @Input() listItems !: MenuItem[]
  @Input() colorItemList ?: string
  @Input() colorBackground ?: string

  public isChecked !: boolean

  constructor() {
    this.isChecked = false
    if(!this.colorItemList) this.colorItemList = "white"
    if(!this.colorBackground) this.colorBackground = "black"
  }
  changeState(){
    this.isChecked = !this.isChecked
  }

  clicked(item: MenuItem) {
    if(item.isExternalLink){
      window.open(item.href, '_blank')
    }
    const sectionEle = document.getElementById(item.href)
    if(sectionEle)
      setTimeout(() => sectionEle.scrollIntoView(), 500)
  }


  ngOnInit(): void {
  }

}
