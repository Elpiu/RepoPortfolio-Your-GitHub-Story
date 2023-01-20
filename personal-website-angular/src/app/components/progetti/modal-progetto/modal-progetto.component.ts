import {Component, ElementRef, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {LoaderDataService} from "../../../services/loader-data.service";
import {LoaderApiGithubService} from "../../../services/loader-api-github.service";

@Component({
  selector: 'app-modal-progetto',
  styleUrls: ['./modal-progetto.component.scss'],
  template: `

    <button [cModalToggle]="modalLg.id" #myButtonId class="invisible" cButton>Large modal</button>
    <c-modal #modalLg id="modalLg" size="lg">
      <c-modal-body class="bg-secondary">

        <div *ngIf="loaded;else other_content" class="">
        <markdown id="markdown" class="markdown-img container"
        [src]="urlRepo" (load)="changeImgUrls()"
        ></markdown>
        <button type="button"
                (click)="goToRepo()" class="btn btn-primary">GitHub</button>
        </div>
        <ng-template #other_content>
          <div class="text-center mt-5">
            <div class="spinner-grow text-primary text-center" role="status"
                 style="width: 6rem; height:6rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </ng-template>
      </c-modal-body>
    </c-modal>

  `
})
export class ModalProgettoComponent implements OnInit {

  @ViewChild('myButtonId') myButtonId!:ElementRef
  @Input() eventoEmitter!: EventEmitter<string[]>;
  public urlRepo!: string
  public linkRepo!: string
  @Input() public loaded: boolean = false

  constructor(private apiService: LoaderApiGithubService) {
  }

  public goToRepo(){
    window.open(this.linkRepo, '_blank')
  }

  ngOnInit(): void {
    setTimeout(()=>{this.loaded = true},2000)
    this.eventoEmitter.subscribe(evento => {
      this.myButtonId.nativeElement.click()
      this.linkRepo = evento[1]
      this.urlRepo = this.apiService.getUrlForRowReadmeInMarkdown(evento[0])
    });
  }

  public changeImgUrls(){
    var allImg = document.querySelectorAll("#markdown img")
    for (let i = 0; i < allImg.length; i++) {
      // @ts-ignore
      allImg[i]['src'] = allImg[i]['src'].replace("/blob/","/raw/")
      allImg[i].classList.add('w-75', 'class2');
    }
  }
}
