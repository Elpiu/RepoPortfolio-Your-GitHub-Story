import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-footer',
  styleUrls: ['./footer.component.scss'],
  template: `
    <div id="contact" style="background-color: #2c3e50"
         class="text-center text-white p-5">
      <div class="row">
        <div class="col">
          <h1>LOCATION</h1>
          <h5>{{state}}, {{location}}</h5>
        </div>

        <div class="col">
          <h1>CONTACT</h1>
          <c-avatar color="" size="md" class="border border-3 footer-btn
      m-1 btn btn-outline-light"
                    (click)="onClickWhatsapp()">
            <i class="fab fa-lg fa-whatsapp"></i>
          </c-avatar>
          <c-avatar color="" size="md" class="border border-3 footer-btn
      m-1 btn btn-outline-light"
                    (click)="onClickMobileCell()"
          >
            <i class="fas fa-mobile-alt"></i>
          </c-avatar>
          <c-avatar color="" size="md" class="border border-3 footer-btn
      m-1 btn btn-outline-light"
                    (click)="onClickMailTo()"
          >
            <i class="far fa-lg fa-envelope-open"></i>
          </c-avatar>
        </div>
      </div>
    </div>
    <app-copyright [copyrightFullName]="copyrightFullName"
                   [copyrightYear]="copyrightYear"></app-copyright>
  `
})
export class FooterComponent {


  constructor() {
  }

  @Input() state !: string
  @Input() location !: string
  @Input() whatsapp !: string
  @Input() gmail !: string
  @Input() telephone !: string
  @Input() copyrightFullName !: string
  @Input() copyrightYear !: string


  public onClickWhatsapp() {
    window.open("https://wa.me/" + this.whatsapp, '_blank')
  }

  public onClickMobileCell() {
    window.open("tel:+" + this.telephone, '_blank')
  }

  public onClickMailTo() {
    window.open("mailto:" + this.gmail, '_blank')
  }
}
