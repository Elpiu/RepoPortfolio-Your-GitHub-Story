import { Component } from '@angular/core';
import {DatabaseInfo} from "../mapper/database-info";
import {LoaderDataService} from "../services/loader-data.service";
import {MenuItem} from "../mapper/MenuItem";

@Component({
  selector: 'app-full-page',
  templateUrl: './full-page.component.html',
  styleUrls: ['./full-page.component.scss']
})
export class FullPageComponent {

  public loaded: boolean = false
  public dati !: DatabaseInfo
  public listMenu: MenuItem[]
  public imageUrls: string[]

  constructor(private loader: LoaderDataService){
    this.loader.getData().subscribe(e => {
      this.dati = e as DatabaseInfo
      //TODO rimuovere quando si ha con le richieste tempo in più
      setTimeout(()=>{this.loaded = true},2000)
      this.loaded = true
    })

    this.listMenu = [
      new MenuItem("Home", "Home", false),
      new MenuItem("Portfolio", "Portfolio", false),
      new MenuItem("About Me", "AboutMe", false),
      new MenuItem("GitHub", "https://github.com/Elpiu", true)
    ]

    this.imageUrls = [
      "assets/img/me/1-removebg-preview.png",
      "assets/img/me/2-removebg-preview.png",
      "assets/img/me/3-removebg-preview.png"
    ]
  }

}
