import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Dispositivo } from '../../models/dispositivo.model';
import { Marca } from '../../models/marca.model';
import { Sistema } from '../../models/sistema.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';

@Component({
  selector: 'app-agregar-dispositivo',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  templateUrl: './agregar-dispositivo.html',
  styleUrl: './agregar-dispositivo.css'
})
export class AgregarDispositivo {
  dispositivo!: Dispositivo;
  marcas: Marca[] = [];
  sistemas: Sistema[] = [];
  tiposDispositivo: TipoDispositivo[] = [];

  constructor(private http: HttpClient) {
    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get<Marca[]>('https://localhost:44330/api/Marcas').subscribe(data => this.marcas = data);
    this.http.get<Sistema[]>('https://localhost:44330/api/Sistemas').subscribe(data => this.sistemas = data);
    this.http.get<TipoDispositivo[]>('https://localhost:44330/api/TipoDispositivoes').subscribe(data => this.tiposDispositivo = data);
  }

  guardarDispositivo() {
    this.http.post('https://localhost:44330/api/TipoDispositivoes', this.dispositivo).subscribe({
      next: () => alert('Dispositivo guardado correctamente.'),
      error: err => alert('Error al guardar: ' + err.message)
    });
  }
}