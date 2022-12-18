import { Component, OnInit } from '@angular/core';
import {DatabaseInfo} from "../mapper/database-info";
import {LoaderDataService} from "../services/loader-data.service";

@Component({
  selector: 'app-full-page',
  templateUrl: './full-page.component.html',
  styleUrls: ['./full-page.component.scss']
})
export class FullPageComponent {

  public loaded: boolean = false
  public dati !: DatabaseInfo

  constructor(private loader: LoaderDataService){
    this.loader.getData().subscribe(e => {
      this.dati = e as DatabaseInfo
      //TODO EM Rimuovere inutile
      //setTimeout(()=>{this.loaded = true},2000)
      this.loaded = true
    })
  }
}
