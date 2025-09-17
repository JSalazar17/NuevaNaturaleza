import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoMUnidadM } from '../models/tipoMUnidadM.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoMUnidadMService {
  private apiUrl = environment+'/api/TipoMUnidadM';

  constructor(private http: HttpClient) { }

  getTipoMUnidadMs(): Observable<TipoMUnidadM[]> {
    return this.http.get<TipoMUnidadM[]>(this.apiUrl);
  }

  getTipoMUnidadM(id: string): Observable<TipoMUnidadM> {
    return this.http.get<TipoMUnidadM>(`${this.apiUrl}/${id}`);
  }

  addTipoMUnidadM(TipoMUnidadM: TipoMUnidadM): Observable<TipoMUnidadM> {
    return this.http.post<TipoMUnidadM>(this.apiUrl, TipoMUnidadM);
  }

  updateTipoMUnidadM(id: string, TipoMUnidadM: TipoMUnidadM): Observable<TipoMUnidadM> {
    return this.http.put<TipoMUnidadM>(`${this.apiUrl}/${id}`, TipoMUnidadM);
  }

  deleteTipoMUnidadM(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
