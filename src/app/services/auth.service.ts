import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../models/login.model';
import { Observable } from 'rxjs';
import { CambiarContrasenaRequest } from '../models/cambiarcontraseña.model';
import { RecuperarRequest } from '../models/recuperar.model';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment+'/api/Auth'; // Ajusta tu endpoint real

  constructor(private http: HttpClient) {}

  login(user: LoginModel): Observable<any> {
    return this.http.post(this.apiUrl+"/login", user);
  }

  // Paso 1: Solicitar recuperación
  requestPassword(data: RecuperarRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover`, data);
  }

  // Paso 2: Cambiar contraseña con token
  recoverPassword(data: CambiarContrasenaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover/${data.token}`, data);
  }
}

