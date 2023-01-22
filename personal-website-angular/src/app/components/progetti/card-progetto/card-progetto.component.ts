import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-card-progetto',
  styleUrls: ['./card-progetto.component.scss'],
  template: `

    <div id="" class="rounded-6 m-3 hover-effect "
         (click)="onClick()"
         (mouseenter)="hoverEffect()"
         (mouseleave)="hoverEffect()"
         [class]="enablehover? 'border border-3 border-warning': ''"
         style="background-size: cover"
         [ngStyle]="{'background-image': 'url('+bgImageUrl+')'}">
      <div class="m-2">
        <h3 class="pt-2">{{item['name']}}</h3>
        <p class="pt-2 pb-2">{{item['description']}}</p>
      </div>
    </div>

  `
})
export class CardProgettoComponent implements OnInit {

  @Input() bgImageUrl!: string
  @Input() item!: any
  public urlRepository!: string
  public enablehover: boolean = false
  @Output() clickedThis = new EventEmitter<string>()

  constructor() {
  }

  ngOnInit(): void {
    this.urlRepository = this.item['url']
  }

  public onClick() {
    this.clickedThis.emit(this.urlRepository)
  }

  public hoverEffect() {
    this.enablehover = !this.enablehover
  }

}

