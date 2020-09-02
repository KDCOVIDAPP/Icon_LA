import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {AppConfig} from './../app.config'
@Injectable({
  providedIn: 'root'
})
export class QuestionnaireService {

  constructor(private http: HttpClient) { }

  getLocations(){
    return this.http.get(AppConfig.API_PATH + AppConfig.getLocations)
  }

  saveQuestionaire(body){
    return this.http.post(AppConfig.API_PATH + AppConfig.saveQuestionaire,body)
  }
}
