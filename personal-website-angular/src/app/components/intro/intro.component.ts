import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-intro',
  styleUrls: ['./intro.component.scss'],
  template: `
    <div id="Home" class="text-white p-2 strong"
         [style]="{'background-color': colorBackgroundDark}">
      <h2>ELPIDIO MAZZA</h2>
    </div>

    <div [style]="{'background-color': colorBackground}"
         class="text-center"
    >
      <app-image-con-bg [imageUrls]=imageUrls
                        class="m-5 animate-enter-image">
      </app-image-con-bg>
      <h1 class="text-white strong">Full-stack Developer</h1>
      <a href="mailto:{{email}}">
        <h3 class="animate-zoom">{{email}}</h3>
      </a>

      <div class="text-white row mt-3">
        <div class="col-6 mb-3">
          <h5>Il mio GitHub</h5>
          <a href="#" (click)="goToGithub()">
            <i class="fab fa-github fa-4x mt-2 animate-zoom"></i>
          </a>
        </div>
        <div class="col-6 mb-3">
          <h5>Il mio CV</h5>
          <a href="#" (click)="goToCV()"><i
            class="far fa-file-alt fa-4x mt-2 animate-zoom"></i>
          </a>
        </div>
      </div>
      <div class="text-white p-5">
        <h4 class="pb-2">{{intro}}</h4>
        <h4 class="pb-2">{{descrizione}}</h4>
      </div>
    </div>
  `
})

export class IntroComponent {

  @Input() colorBackground ?: string
  @Input() colorBackgroundDark ?: string
  @Input() imageUrls!: string[]
  @Input() email!: string
  @Input() linkCV!: string
  @Input() linkGithub!: string
  @Input() intro!: string
  @Input() descrizione!: string

  constructor() {
    if (!this.colorBackground) this.colorBackground = "#1abc9c"
    if (!this.colorBackgroundDark) this.colorBackgroundDark = "#2c3e50"
  }

  goToGithub() {
    window.open(this.linkGithub, '_blank')
  }

  goToCV() {
    window.open(this.linkCV, '_blank')
  }
}
