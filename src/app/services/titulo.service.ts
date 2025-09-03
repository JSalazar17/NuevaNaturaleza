import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Titulo } from '../models/titulo';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class TituloService {
  private apiUrl = environment+'/api/Titulo';

  constructor(private http: HttpClient) { }

  getTitulos(): Observable<Titulo[]> {
    return this.http.get<Titulo[]>(this.apiUrl);
  }

  getTitulo(id: string): Observable<Titulo> {
    return this.http.get<Titulo>(`${this.apiUrl}/${id}`);
  }

  addTitulo(titulo: Titulo): Observable<Titulo> {
    return this.http.post<Titulo>(this.apiUrl, titulo);
  }

  updateTitulo(id: string, titulo: Titulo): Observable<Titulo> {
    return this.http.put<Titulo>(`${this.apiUrl}/${id}`, titulo);
  }

  deleteTitulo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
