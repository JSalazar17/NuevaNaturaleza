import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../models/login.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:44330/api/Auth/login'; // Ajusta tu endpoint real

  constructor(private http: HttpClient) {}

  login(user: LoginModel): Observable<any> {
    return this.http.post(this.apiUrl, user);
  }
}
