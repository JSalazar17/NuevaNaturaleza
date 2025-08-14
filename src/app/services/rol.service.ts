// src/app/services/rol.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = 'https://localhost:44330/api/Rol'; // ajusta si tu endpoint es distinto

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }
}
