import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Accion } from '../models/accion.model';

@Injectable({
  providedIn: 'root'
})
export class AccionService {
  private apiUrl = 'https://localhost:44330/api/AccionActs'; 

  constructor(private http: HttpClient) {}

  getAcciones(): Observable<Accion[]> {
    return this.http.get<Accion[]>(this.apiUrl);
  }

  getAccionPorId(id: string): Observable<Accion> {
    return this.http.get<Accion>(`${this.apiUrl}/${id}`);
  }
}
