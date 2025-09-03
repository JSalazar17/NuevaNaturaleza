// src/app/services/rol.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol } from '../models/rol.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment}/api/Rol`; // ajusta si tu endpoint es distinto

  constructor(private http: HttpClient) {}

  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  createRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }
}
