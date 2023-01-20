import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-about',
  styleUrls: ['./about.component.scss'],
  template: `
    <div id="about" class="text-center text-white p-4" style="background-color: #1abc9c">
      <h1>ABOUT</h1>
      <div>
        <i class="fas fa-3x fa-ellipsis-h"></i>
        &nbsp;&nbsp;
        <i class="far fa-3x fa-smile-wink"></i>
        &nbsp;&nbsp;
        <i class="fas fa-3x fa-ellipsis-h"></i>
      </div>
      <div class="pt-2 pb-2">
        <p class="lead text-center"><em> Chi sono. </em>{{intro2}}</p>
        <br>
        <p class="lead text-center"><em>{{mission}}</em></p>
      </div>
    </div>
  `
})
export class AboutComponent {

  @Input() intro2 !: string;
  @Input() mission !: string;

  constructor() {
  }
}
