import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {LoaderApiGithubService} from "../../services/loader-api-github.service";

@Component({
  selector: 'app-progetti',
  styleUrls: ['./progetti.component.scss'],
  template: `
      <div id="Portfolio" class="text-center text-white pt-2"
           [style]="{'background-color': colorBackground}"
      >
          <div class="pt-4 pb-4">
              <h1>Progetti</h1>
              <div>
                  <i class="fas fa-3x fa-ellipsis-h"></i>
                  &nbsp;
                  <i class="fas fa-archive fa-3x"></i>
                  &nbsp;
                  <i class="fas fa-3x fa-ellipsis-h"></i>
              </div>
              <div class="row">
                  <div *ngFor="let item of dataRepos; index as i"
                       class="col-md-6">
                      <app-card-progetto
                        [bgImageUrl]="finalBgUrls[i]"
                        [item]="item"
                        (clickedThis)="this.childEmitter.emit([item['url'],item['svn_url']])"
                      >
                      </app-card-progetto>
                  </div>
                <app-modal-progetto
                    [eventoEmitter]="childEmitter"
                    [loaded]="false"
                >
                </app-modal-progetto>
              </div>
          </div>
      </div>
  `
})
export class ProgettiComponent implements OnInit {

  @Input() nomeUtenteGithub!: string
  public urlOfBgImageBase: string = "assets/img/bgGenerated/bg"
  public numberOfImagesBg = 20
  @Input() noShowThisRepository!: string[]
  @Input() colorBackground!: string
  public dataRepos: any
  public finalBgUrls: string[] = new Array()

  public childEmitter = new EventEmitter<string[]>()

  constructor(private loaderApiGithub: LoaderApiGithubService) {
    if (!this.colorBackground) this.colorBackground = "#2c3e50"
    this.loaderApiGithub.fetchRepoData().subscribe(data => {
      this.dataRepos = data
      this.filterRepo()
      this.setImgUrl()
      //console.log(data)
    })
  }

  ngOnInit(): void {
  }

  public setImgUrl(){
    for (let i = 0; i < this.dataRepos['length']; i++) {
      this.finalBgUrls.push(
        this.urlOfBgImageBase +
        (Math.floor(Math.random() * this.numberOfImagesBg) + 1) + ".svg"
      )
    }
  }

  public filterRepo() {
    let filtered = new Array()
    for (let i = 0; i < this.dataRepos['length']; i++) {
        if (!this.containThisName(this.dataRepos[i]['name'])){
          filtered.push(this.dataRepos[i])
        }
    }
    this.dataRepos = filtered
  }

    private containThisName(name: string){
      for (let i = 0; i < this.noShowThisRepository['length']; i++) {
        if(this.noShowThisRepository[i] == name)
          return true
      }
      return false
    }

}
