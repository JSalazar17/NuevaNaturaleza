import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, inject, signal, computed, PLATFORM_ID, HostListener, QueryList, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Dispositivo } from '../../models/dispositivo.model';
import { DispositivoService } from '../../services/dispositivos.service';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { TipoMUnidadMService } from '../../services/tipoMUnidadM.service';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { TipoMedicion } from '../../models/tipomedicion.model';
import { Sensor } from '../../models/sensor.model';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDispositivo } from '../agregar-dispositivo/agregar-dispositivo';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { FiltersPanelComponent } from '../gestion-dispositivos/filtercomponent/filters-panel.component';
import { MatIconModule } from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { pdfService } from '../../services/pdf.service';
import { PdfSensor } from  '../../models/pdfsensor.model';

@Component({
  selector: 'app-sensores',
  standalone: true,
  templateUrl: './sensores.html',
  imports: [CommonModule, BaseChartDirective,
    FormsModule, ReactiveFormsModule, MatSidenavModule,
    MatIconModule, MatSelectModule, MatMenuModule,
    MatButtonModule, MatSlideToggleModule,
  MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
     ],
  styleUrls: ['./sensores.css']
})
export class SensoresComponent {

  @ViewChildren(BaseChartDirective) chart: QueryList<BaseChartDirective>;
  private dispositivosSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivo$ = this.dispositivosSubject.asObservable();

  dispositivos = signal<Dispositivo[]>([]);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  deviceTypes: TipoDispositivo[] = [];
  measurementTypes: TipoMedicion[] = [];

  selectedDeviceType = signal<string>('');
  selectedMeasurementType = signal<string>('');
  isDescending = signal<boolean>(false);
items = computed(() => {
    let dispositivos = [...this.dispositivos()];
    dispositivos = dispositivos.filter(d => d.idTipoDispositivoNavigation?.nombre === 'Sensor');
  return dispositivos
});
  dispositivosFiltrados = computed(() => {
    let dispositivos = [...this.dispositivos()];
    dispositivos = dispositivos.filter(d => d.idTipoDispositivoNavigation?.nombre === 'Sensor');
    const tipo = this.selectedDeviceType();
    const tipoMedicion = this.selectedMeasurementType();
    const descendente = this.isDescending();

    if (tipo && tipo !== 'Todos') {
      dispositivos = dispositivos.filter(d => d.idTipoDispositivo === tipo);
    }

    if (tipoMedicion && tipoMedicion !== 'Todos') {
      dispositivos = dispositivos.filter(d =>
        d.sensors?.some(s =>
          s.idTipoMUnidadMNavigation?.idTipoMedicion === tipoMedicion
        )
      );
    }

    dispositivos.sort((a, b) => (a.nombre ?? '').localeCompare(b.nombre ?? ''));
    if (descendente) dispositivos.reverse();

    return dispositivos;
  });

  lineChartType: ChartType = 'line';
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: true } }
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private tipoDS: TipoDispositivoService,
    private tipMUMS: TipoMUnidadMService,
    private pdfSvc:pdfService
  ) {
    this.cargarDispositivos();
  }
toggleSensorInfo(sensor: any) {
  sensor.mostrarInfo = !sensor.mostrarInfo;
}
  rango = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  opciones = new FormControl<string[]>([]);

  isPlatformBrowser() {

  return isPlatformBrowser(this.platformId)
}
  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.asignarDatosE(data);
      this.dispositivos.set(data);
      this.dispositivosSubject.next(data);
    });
    this.tipoDS.obtenerTiposDispositivo().subscribe(data => this.deviceTypes = data);
    this.tipMUMS.getTipoMUnidadMs().subscribe(data => {
      data.forEach(i => {
        if (!this.measurementTypes.includes(i.idTipoMedicionNavigation)) {
          this.measurementTypes.push(i.idTipoMedicionNavigation);
        }
      });
    });
  }

asignarDatosE(data:Dispositivo[]){
  data.forEach(dispo => {
    if(dispo.sensors)
    dispo.sensors.forEach(element => {
      this.calcularDatosEstadisticos(element)
    });
  });
}
calcularDatosEstadisticos(sen: Sensor) {
  let valores = sen.medicions.map(x => x.valor).sort((a, b) => a - b); // ordenamos para mediana
  const n = valores.length;

  if (n === 0) return;

  // Media
  const suma = valores.reduce((acc, val) => acc + val, 0);
  let media = suma / n;

  // Varianza muestral
  let varianza = valores.reduce((acc, val) => acc + (val - media) ** 2, 0) / (n - 1);

  // Desviación estándar
  let desviacionE = Math.sqrt(varianza);

  // Mediana
  let mediana: number;
  if (n % 2 === 0) {
    mediana = (valores[n / 2 - 1] + valores[n / 2]) / 2;
  } else {
    mediana = valores[Math.floor(n / 2)];
  }

  // Moda
  const frecuencias: Record<number, number> = {};
  valores.forEach(v => {
    frecuencias[v] = (frecuencias[v] || 0) + 1;
  });

  let maxFrecuencia = Math.max(...Object.values(frecuencias));
  let moda = Object.keys(frecuencias)
    .filter(k => frecuencias[+k] === maxFrecuencia)
    .map(Number);
  media = Number(media.toFixed(3));
  varianza = Number(varianza.toFixed(3));
  desviacionE = Number(desviacionE.toFixed(3));
  mediana = Number(mediana.toFixed(3));
  if (moda.length > 3) {
    moda = moda.slice(0, 3);
  }
  // Guardar en el sensor
  sen.datosEstadisticos = {
    media,
    varianza,
    desviacionE,
    mediana,
    range: [Number(valores[0].toFixed(3)),Number(valores[valores.length-1].toFixed(3))],
    moda: moda.length === 1 ? Number(moda[0].toFixed(3)) : moda // si hay más de una, devuelvo array
  };
}
  onOrderChange($event: MatSlideToggleChange) {
  this.isDescending.set(!this.isDescending());
  }

  getChartData(sen: Sensor): ChartConfiguration['data'] {
    return {
      labels: sen.medicions.map((m, i) => new Date(m.fecha).toLocaleDateString() +" "+ new Date(m.fecha).toLocaleTimeString() || 'M' + (i + 1)),
      datasets: [{ data: sen.medicions.map(m => m.valor), label: 'Sensor', fill: true, tension: 0.25 }]
    };
  }

  editarDispositivo(dispositivo: Dispositivo) {
    const dialogRef = this.dialog.open(AgregarDispositivo, { width: '800px', data: { dispositivo } });
    dialogRef.afterClosed().subscribe(result => { if (result) this.cargarDispositivos(); });
  }

  eliminarDispositivo(d: Dispositivo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '800px',
      data: { message: "Se borrará este sensor y sus datos relacionados" }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dispositivoService.deleteDispositivo(d.idDispositivo as string).subscribe(() => this.cargarDispositivos());
      }
    });
  }

  @ViewChild('chartCanvas0') chartCanvas!: ElementRef<HTMLCanvasElement>;
async pdfSensGet(){
  if(this.rango.value.start == null ||
  this.rango.value.end == null)
  return;
  let psens:PdfSensor = {desde:(this.rango.value.start),hasta:this.rango.value.end,idsDipositivos :this.opciones.value as string[]}
  await this.pdfSvc.generatePdfDispositivos(psens,this.chartCanvas)
}
}
