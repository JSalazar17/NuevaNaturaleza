import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { PuntoOptimo } from '../models/puntoOptimo.model';

@Injectable({
  providedIn: 'root'
})
export class PuntoOptimoService {
  private apiUrl = environment+'/api/PuntoOptimoes'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los PuntoOptimoes
  getPuntoOptimoes(): Observable<PuntoOptimo[]> {
    return this.http.get<PuntoOptimo[]>(this.apiUrl);
  }

  // Obtener un PuntoOptimo por ID
  getPuntoOptimo(id: string): Observable<PuntoOptimo> {
    return this.http.get<PuntoOptimo>(`${this.apiUrl}/${id}`);
  }

  // Crear un PuntoOptimo
  addPuntoOptimo(PuntoOptimo: PuntoOptimo): Observable<PuntoOptimo> {
    return this.http.post<PuntoOptimo>(this.apiUrl, PuntoOptimo);
  }

  // Actualizar un PuntoOptimo
  updatePuntoOptimo(id: string, PuntoOptimo: PuntoOptimo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, PuntoOptimo);
  }

  // Eliminar un PuntoOptimo
  deletePuntoOptimo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
