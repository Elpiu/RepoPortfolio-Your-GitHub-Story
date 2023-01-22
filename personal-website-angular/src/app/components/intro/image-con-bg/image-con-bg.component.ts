import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-image-con-bg',
  styleUrls: ['./image-con-bg.component.scss'],
  template: `
      <div class="text-center animation-image"
      >
          <img class="img-fluid" src="{{imageUrl}}">
      </div>
  `
})
export class ImageConBgComponent implements OnInit {

  @Input() imageUrls!: string[]
  public imageUrl: string = ""

  constructor() {
  }

  ngOnInit(): void {
    if (this.imageUrls.length != 0) {
      this.imageUrl =
        this.imageUrls[Math.floor(Math.random() * this.imageUrls.length)]
    }

  }
}
