import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoMedicion } from '../models/tipomedicion.model';

@Injectable({
  providedIn: 'root'
})
export class TipoMedicionService {
  private apiUrl = 'https://localhost:44330/api/TipoMedicion'; // 👈 ajusta al endpoint real

  constructor(private http: HttpClient) {}

  // Obtener todos los tipos de medición
  getTipoMediciones(): Observable<TipoMedicion[]> {
    return this.http.get<TipoMedicion[]>(this.apiUrl);
  }

  // Obtener un tipo de medición por id
  getTipoMedicion(id: string): Observable<TipoMedicion> {
    return this.http.get<TipoMedicion>(`${this.apiUrl}/${id}`);
  }

  // Crear un tipo de medición
  addTipoMedicion(tipo: TipoMedicion): Observable<TipoMedicion> {
    return this.http.post<TipoMedicion>(this.apiUrl, tipo);
  }

  // Actualizar un tipo de medición
  updateTipoMedicion(id: string, tipo: TipoMedicion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, tipo);
  }

  // Eliminar un tipo de medición
  deleteTipoMedicion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
