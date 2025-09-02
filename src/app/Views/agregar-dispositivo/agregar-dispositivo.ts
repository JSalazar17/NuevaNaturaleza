import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Dispositivo } from '../../models/dispositivo.model';
import { Marca } from '../../models/marca.model';
import { Sistema } from '../../models/sistema.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { CommonModule } from '@angular/common';
import { TipoMedicion } from '../../models/tipomedicion.model';

@Component({
  selector: 'app-agregar-dispositivo',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './agregar-dispositivo.html',
  styleUrl: './agregar-dispositivo.css'
})
export class AgregarDispositivo {
  dispositivo: Dispositivo = {   
    idDispositivo: '',
    nombre: '',
    sn: '',
    descripcion: '',
    image: '',
    idMarca: '',
    idSistema: '',
    idTipoDispositivo: '',
  };

  marcas: Marca[] = [];
  sistemas: Sistema[] = [];
  tiposDispositivo: TipoDispositivo[] = [];
  tiposMedicion: TipoMedicion[] = [];

  // 🔹 Campos adicionales
  mediciones: any[] = [];
  tipoSeleccionadoNombre: string = '';
  numeroMediciones: number = 1;
  medicionSeleccionada: string = '';
  letraOn: string = '';
  letraOff: string = '';
  numSensores: number = 0;

  constructor(private http: HttpClient) {
    this.cargarDatos();
  }

  cargarDatos() {
    this.http.get<Marca[]>('https://localhost:44330/api/Marcas')
      .subscribe(data => this.marcas = data);

    this.http.get<Sistema[]>('https://localhost:44330/api/Sistemas')
      .subscribe(data => this.sistemas = data);

    this.http.get<TipoDispositivo[]>('https://localhost:44330/api/TipoDispositivoes')
      .subscribe(data => this.tiposDispositivo = data);

    this.http.get<TipoMedicion[]>('https://localhost:44330/api/TipoMedicion')
      .subscribe(data => this.tiposMedicion = data);
  }

  
   onTipoDispositivoChange() {
    const tipoSeleccionado = this.tiposDispositivo.find(t => t.idTipoDispositivo === this.dispositivo.idTipoDispositivo);
    this.tipoSeleccionadoNombre = tipoSeleccionado ? tipoSeleccionado.nombre.toLowerCase() : '';
  }


  onNumeroMedicionesChange() {
    this.mediciones = Array(this.numeroMediciones).fill(null);
  }

  guardarDispositivo() {
    const payload = {
      ...this.dispositivo,
      numeroMediciones: this.tipoSeleccionadoNombre === 'sensor' ? this.numeroMediciones : null,
      tipoMedicion: this.tipoSeleccionadoNombre === 'sensor' ? this.medicionSeleccionada : null,
      on: this.tipoSeleccionadoNombre === 'actuador' ? this.letraOn : null,
      off: this.tipoSeleccionadoNombre === 'actuador' ? this.letraOff : null,
    };

    this.http.post('https://localhost:44330/api/Dispositivoes', payload)
      .subscribe({
        next: () => alert('Dispositivo guardado correctamente.'),
        error: err => alert('Error al guardar: ' + err.message)
      });
  }
}
