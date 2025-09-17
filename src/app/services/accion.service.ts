import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Accion } from '../models/accion.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AccionService {
  private apiUrl = environment+'/api/AccionActs'; 

  constructor(private http: HttpClient) {}

  getAcciones(): Observable<Accion[]> {
    return this.http.get<Accion[]>(this.apiUrl);
  }

  getAccionPorId(id: string): Observable<Accion> {
    return this.http.get<Accion>(`${this.apiUrl}/${id}`);
  }
}
