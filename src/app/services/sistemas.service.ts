import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sistema } from '../models/sistema.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SistemaService {
  private url = 'https://localhost:44330/api/Sistemas';

  constructor(private http: HttpClient) {}

  obtenerSistemas(): Observable<Sistema[]> {
    return this.http.get<Sistema[]>(this.url);
  }
}
