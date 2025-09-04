import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { Medicion } from '../models/medicion.model';

@Injectable({
  providedIn: 'root'
})
export class MedicionService {
  private apiUrl = environment+'/api/Medicions'; // ⚠️ Ajusta según tu ruta en .NET

  constructor(private http: HttpClient) {}

  // Obtener todos los Mediciones
  getMediciones(): Observable<Medicion[]> {
    return this.http.get<Medicion[]>(this.apiUrl);
  }

  // Obtener un Medicion por ID
  getMedicion(id: string): Observable<Medicion> {
    return this.http.get<Medicion>(`${this.apiUrl}/${id}`);
  }

  // Crear un Medicion
  addMedicion(Medicion: Medicion): Observable<Medicion> {
    return this.http.post<Medicion>(this.apiUrl, Medicion);
  }

  // Actualizar un Medicion
  updateMedicion(id: string, Medicion: Medicion): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, Medicion);
  }

  // Eliminar un Medicion
  deleteMedicion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
