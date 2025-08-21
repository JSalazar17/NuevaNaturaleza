import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auditoria } from '../models/auditoria.model';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = 'https://localhost:44330/api/Auditoriums'; // ajusta a tu endpoint real

  constructor(private http: HttpClient) {}

  getAuditorias(): Observable<Auditoria[]> {
    return this.http.get<Auditoria[]>(this.apiUrl);
  }

  agregarAuditoria(auditoria: Auditoria): Observable<Auditoria> {
    return this.http.post<Auditoria>(this.apiUrl, auditoria);
  }

  actualizarAuditoria(id: string, auditoria: Auditoria): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, auditoria);
  }

  eliminarAuditoria(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
