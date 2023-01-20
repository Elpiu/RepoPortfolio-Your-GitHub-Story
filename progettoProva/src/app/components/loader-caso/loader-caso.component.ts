import { Component, OnInit } from '@angular/core';
import {DatabaseInfo} from "../../mapper/database-info";
import {LoaderDataService} from "../../services/loader-data.service";

@Component({
  selector: 'app-loader-caso',
  styleUrls: ['./loader-caso.component.scss'],
  template: `

  <div *ngIf="loaded;else other_content">
    <h3>{{dati.nome + " " + dati.cognome}}</h3>
    <h1>{{dati.email}}</h1>
    <h2>{{dati.curriculum_link}}</h2>
  </div>

  <ng-template #other_content>
    <div class="text-center mt-5">
        <div class="spinner-grow text-secondary text-center" role="status" style="width: 6rem; height:6rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </ng-template>

  `
})
export class LoaderCasoComponent {

  public loaded: boolean = false
  public dati !: DatabaseInfo

  constructor(private loader: LoaderDataService){
    this.loader.getData().subscribe(e => {
      this.dati = e as DatabaseInfo
      //TODO EM Rimuovere inutile
      setTimeout(()=>{this.loaded = true},2000)
      //this.loaded = true
    })
  }

}
