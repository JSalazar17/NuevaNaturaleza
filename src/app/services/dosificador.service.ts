import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dosificador } from '../models/dosificador.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class DosificadorService {
  private apiUrl = environment+'/api/Dosificador';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Dosificador[]> {
    return this.http.get<Dosificador[]>(this.apiUrl);
  }

  getById(id: string): Observable<Dosificador> {
    return this.http.get<Dosificador>(`${this.apiUrl}/${id}`);
  }

  create(dosificador: Dosificador): Observable<Dosificador> {
    return this.http.post<Dosificador>(this.apiUrl, dosificador);
  }

  update(id: string, dosificador: Dosificador): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, dosificador);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
