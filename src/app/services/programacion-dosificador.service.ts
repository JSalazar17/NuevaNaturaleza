import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProgramacionDosificador } from '../models/programacion-dosificador.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramacionDosificadorService {
  private apiUrl = environment+'/api/ProgramacionDosificacion'; // tu endpoint .NET

  constructor(private http: HttpClient) {}

  // Obtener todas las programaciones
  getAll(): Observable<ProgramacionDosificador[]> {
    return this.http.get<ProgramacionDosificador[]>(this.apiUrl);
  }

  // Obtener programación por ID
  getById(id: string): Observable<ProgramacionDosificador> {
    return this.http.get<ProgramacionDosificador>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva programación
  create(programacion: ProgramacionDosificador): Observable<ProgramacionDosificador> {
    return this.http.post<ProgramacionDosificador>(this.apiUrl, programacion);
  }

  // Actualizar programación existente
  update(id: string, programacion: ProgramacionDosificador): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, programacion);
  }

  // Eliminar programación
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
