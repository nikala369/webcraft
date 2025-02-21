import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {ThemeStyleDto} from "./theme";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private apiUrl: string = environment.apiUrl
  private baseUrl: string = this.apiUrl + '/theme'
  private httpClient = inject(HttpClient);


  getById(id: number): Observable<ThemeStyleDto> {
    return this.httpClient.get<ThemeStyleDto>(`${this.baseUrl}/${id}`)
  }

  getAll(): Observable<ThemeStyleDto[]> {
    return this.httpClient.get<ThemeStyleDto[]>(`${this.baseUrl}/all`)
  }
}
