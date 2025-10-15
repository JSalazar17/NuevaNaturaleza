import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExcesoPuntoOptimo } from '../models/excesoPuntoOptimo.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ExcesoPOService {
  private apiUrl = environment+'/api/ExcesoPuntoOptimo'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los ExcesoPuntoOptimoes
  getExcesoPuntoOptimoes(): Observable<ExcesoPuntoOptimo[]> {
    return this.http.get<ExcesoPuntoOptimo[]>(this.apiUrl);
  }

  // Obtener un ExcesoPuntoOptimo por ID
  getExcesoPuntoOptimo(id: string): Observable<ExcesoPuntoOptimo> {
    return this.http.get<ExcesoPuntoOptimo>(`${this.apiUrl}/${id}`);
  }

  // Crear un ExcesoPuntoOptimo
  addExcesoPuntoOptimo(ExcesoPuntoOptimo: ExcesoPuntoOptimo): Observable<ExcesoPuntoOptimo> {
    return this.http.post<ExcesoPuntoOptimo>(this.apiUrl, ExcesoPuntoOptimo);
  }

  // Actualizar un ExcesoPuntoOptimo
  updateExcesoPuntoOptimo(id: string, ExcesoPuntoOptimo: ExcesoPuntoOptimo): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, ExcesoPuntoOptimo);
  }

  // Eliminar un ExcesoPuntoOptimo
  deleteExcesoPuntoOptimo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
