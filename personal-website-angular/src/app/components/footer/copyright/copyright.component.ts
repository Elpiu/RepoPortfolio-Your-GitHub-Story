import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-copyright',
  styleUrls: ['./copyright.component.scss'],
  template: `
      <div class="copyright p-2 text-center text-white"
           style="background-color: #212529 ">
          <h5>
              <small>Copyright &copy; {{copyrightFullName}} {{copyrightYear}}</small>
          </h5>
      </div>
  `
})
export class CopyrightComponent implements OnInit {

  @Input() copyrightFullName !: string
  @Input() copyrightYear !: string
  constructor() { }

  ngOnInit(): void {
  }

}
