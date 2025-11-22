import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../models/login.model';
import { Observable } from 'rxjs';
import { CambiarContrasenaRequest } from '../models/cambiarcontraseña.model';
import { RecuperarRequest } from '../models/recuperar.model';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment+'/api/Auth'; // Ajusta tu endpoint real

  constructor(private http: HttpClient,private router: Router) {}

  login(user: LoginModel): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, user, { withCredentials: true });
  }

  saveUserSession(data: any): void {
    localStorage.setItem('user', JSON.stringify(data));
  }

  getUserRole(): string {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).rol : '';
  }
  getFullUser(): Usuario | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)as Usuario :null;
  }
  logout() {
    this.clearUserSession();
    this.router.navigate(['/login']);
    this.http.delete(`${this.apiUrl}/LogOut`).subscribe()
  }

  // Paso 1: Solicitar recuperación
  requestPassword(data: RecuperarRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover`, data);
  }

  // Paso 2: Cambiar contraseña con token
  recoverPassword(data: CambiarContrasenaRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/recover/${data.token}`, data);
  }




  getUserSession(): any {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  clearUserSession(): void {
    localStorage.removeItem('user');
  }


  isLoggedIn(): boolean {
    return !!this.getUserSession();
  }
}

