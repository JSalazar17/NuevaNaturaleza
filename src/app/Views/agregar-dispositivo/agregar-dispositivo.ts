import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dispositivo } from '../../models/dispositivo.model';
import { Marca } from '../../models/marca.model';
import { Sistema } from '../../models/sistema.model';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { TipoMedicion } from '../../models/tipomedicion.model';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { MarcaService } from '../../services/marcas.service';
import { SistemaService } from '../../services/sistemas.service';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { TipoMedicionService } from '../../services/tipomedicion.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { Actuador } from '../../models/actuador.model';
import { Sensor } from '../../models/sensor.model';

@Component({
  selector: 'app-agregar-dispositivo',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  
  marcas$ = new BehaviorSubject<Marca[]>([]);
  sistemas$ = new BehaviorSubject<Sistema[]>([]);
  tiposDispositivo$ = new BehaviorSubject<TipoDispositivo[]>([]);
  tiposMedicion$ = new BehaviorSubject<TipoMedicion[]>([]);


  mediciones: any[] = [];
  tipoSeleccionadoNombre: string = '';
  numeroMediciones: number = 1;
  medicionSeleccionada: string = '';
  letraOn: string = '';
  letraOff: string = '';
  numSensores: number = 0;

  constructor(
    private marcaService:MarcaService,
    private sistemaService:SistemaService,
    private tiposDispositivoService:TipoDispositivoService,
    private tipoMedicionService:TipoMedicionService,
    private dispositivoService:DispositivoService
  ) {
    this.cargarDatos();
  }

  cargarDatos() {
    this.marcaService.obtenerMarcas()
      .subscribe(data => this.marcas$.next(data));

    this.sistemaService.obtenerSistemas()
      .subscribe(data => this.sistemas$.next(data));

    this.tiposDispositivoService.obtenerTiposDispositivo()
      .subscribe(data => this.tiposDispositivo$.next(data));

    this.tipoMedicionService.getTipoMediciones()
      .subscribe(data => this.tiposMedicion$.next(data));
  }

  onTipoDispositivoChange() {
    const tipoSeleccionado = this.tiposDispositivo$.value.find(
      t => t.idTipoDispositivo === this.dispositivo.idTipoDispositivo
    );
    this.tipoSeleccionadoNombre = tipoSeleccionado ? tipoSeleccionado.nombre.toLowerCase() : '';
  }

  onNumeroMedicionesChange() {
    this.mediciones = Array(this.numeroMediciones).fill(null);
  }

  private buildPayload(): any {
  const payload: any = { ...this.dispositivo };

  if (this.tipoSeleccionadoNombre === 'sensor') {
    payload.numeroMediciones = this.numeroMediciones;
    payload.tipoMedicion = this.medicionSeleccionada;
  }

  if (this.tipoSeleccionadoNombre === 'actuador') {
    payload.on = this.letraOn;
    payload.off = this.letraOff;
  }

  return payload;
}

private buildPayloadTipoDispo():  Sensor | Actuador|null {
/*
  // Si es sensor → valido que tenga datos de sensor
  if (this.numeroMediciones && this.mediciones.length > 0) {
    return {
      idDispositivo: this.dispositivo.idDispositivo,
      IdTipoMedicion: this.dispositivo.idTipoMedicion,
      IdUnidadMedida: "",

    } as Sensor;
  }

  // Si es actuador → valido que tenga datos de actuador
  if (this.letraOn && this.letraOff) {
    return {
      idDispositivo: this.dispositivo.idDispositivo,
      on: this.letraOn,
      off: this.letraOff
    } as Actuador;
  }*/
  return null
}










  guardarDispositivo() {
    const payload = this.buildPayload();

    this.dispositivoService.createDispositivo(payload)
      .subscribe({
        next: () => alert('Dispositivo guardado correctamente.'),
        error: err => alert('Error al guardar: ' + err.message)
      });
  }

}
