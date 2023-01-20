import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {LoaderDataService} from "./loader-data.service";
import { environment } from '.././../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoaderApiGithubService {

  public baseUri = "https://api.github.com/users/";
  public baseUriRaw = "https://raw.githubusercontent.com/"
  public nameUser: string = environment.nameGithub
  constructor(private http: HttpClient,
              private dataService: LoaderDataService) {
  }

  public fetchUserData(): Observable<any> {
    return this.http.get(this.baseUri + this.nameUser)
  }
  public fetchRepoData(): Observable<any> {
    return this.http.get(this.baseUri + this.nameUser + "/repos")
  }

  public getUrlForRowReadmeInMarkdown(urlRepo: string){
    var nameRepo = urlRepo.slice(urlRepo.lastIndexOf("/"))
    return this.baseUriRaw +  this.nameUser + nameRepo + "/master/README.md"
  }

}
