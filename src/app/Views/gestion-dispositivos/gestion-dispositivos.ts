import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dispositivo } from '../../models/dispositivo.model';

@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gestion-dispositivos.html',
  styleUrl: './gestion-dispositivos.css'
})
export class GestionDispositivos {
  sensores: Dispositivo[] = [];
  tipoSeleccionado = '';
  dispositivos: any[] = [];

  seleccionarTipo(tipo: string) {
    this.tipoSeleccionado = tipo;
    this.cargarDispositivos();
  }

  onTipoChange(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  this.seleccionarTipo(selectElement.value);
}


  cargarDispositivos() {
    if (this.tipoSeleccionado === 'sensor') {
      this.dispositivos = [
        { nombre: 'Sensor de pH', imagen: 'ph.png', datos: [6.8, 7.0, 7.1] },
        { nombre: 'Sensor de Temperatura', imagen: 'temp.png', datos: [24, 25, 26] }
      ];
    } else if (this.tipoSeleccionado === 'actuador') {
      this.dispositivos = [
        { nombre: 'Bomba de Agua', imagen: 'bomba.png' },
        { nombre: 'Aireador', imagen: 'aireador.png' }
      ];
    } else {
      this.dispositivos = [];
    }
  }

  activar(d: any) {
    console.log('Activar', d.nombre);
  }

  desactivar(d: any) {
    console.log('Desactivar', d.nombre);
  }
}

