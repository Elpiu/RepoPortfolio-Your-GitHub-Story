import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '.././../environments/environment';
import { DatabaseInfo } from '../mapper/database-info';

@Injectable({
  providedIn: 'root'
})
export class LoaderDataService {

  private URLDATAVARIABLE = environment.urldata

  constructor(private http: HttpClient) {}

  public getData(): Observable<DatabaseInfo>{
    return this.http.get<DatabaseInfo>(this.URLDATAVARIABLE)
  }

  //TODO cancellare
  public request(){
    this.http.get('www.google.it').subscribe(
      (result) => { //On Success
        console.log(result)
      },
      (err: any) => { //On Error
        console.log(err)
      },
      () => { //On Completion

      }
  );
  }

}
