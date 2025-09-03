import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoNotificacion } from '../models/tiponotificacion';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoNotificacionService {
  private apiUrl = environment+'/api/TipoNotificacion';

  constructor(private http: HttpClient) { }

  getTipos(): Observable<TipoNotificacion[]> {
    return this.http.get<TipoNotificacion[]>(this.apiUrl);
  }

  getTipo(id: string): Observable<TipoNotificacion> {
    return this.http.get<TipoNotificacion>(`${this.apiUrl}/${id}`);
  }

  addTipo(tipo: TipoNotificacion): Observable<TipoNotificacion> {
    return this.http.post<TipoNotificacion>(this.apiUrl, tipo);
  }

  updateTipo(id: string, tipo: TipoNotificacion): Observable<TipoNotificacion> {
    return this.http.put<TipoNotificacion>(`${this.apiUrl}/${id}`, tipo);
  }

  deleteTipo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
