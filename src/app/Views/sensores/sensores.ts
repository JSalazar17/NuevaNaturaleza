import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, inject, signal, computed, PLATFORM_ID, HostListener, QueryList, Inject, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import { Dispositivo } from '../../models/dispositivo.model';
import { DispositivoService } from '../../services/dispositivos.service';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { TipoMUnidadMService } from '../../services/tipoMUnidadM.service';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { TipoMedicion } from '../../models/tipomedicion.model';
import { Sensor } from '../../models/sensor.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AgregarDispositivo } from '../agregar-dispositivo/agregar-dispositivo';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { FiltersPanelComponent } from '../gestion-dispositivos/filtercomponent/filters-panel.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { pdfService } from '../../services/pdf.service';
import { PdfSensor } from '../../models/pdfsensor.model';
import { AreaService } from '../../services/area.service';
import { Area } from '../../models/area.model';
import { SignalRService } from '../../services/signalr.service';
import { AuthService } from '../../services/auth.service';
import { ToggleService } from '../../services/toggle.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChangeDetectorRef } from '@angular/core';

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
    NgxPaginationModule,
    MatNativeDateModule,
  ],
  styleUrls: ['./sensores.css']
})
export class SensoresComponent implements OnInit, OnDestroy {

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
  areas = signal<Area[]>([])
  areaSelect: string;
  intento = 0;
  itemsPorPagina = 3;
  paginaActual = 1;
// dentro de la clase SensoresComponent
private _zoomPanTimers = new WeakMap<Chart, number | undefined>();
private _zoomPanDelay = 150; // ms, ajuste fino: 100-300 ms suele ir bien

  private sub!: Subscription;
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


    plugins: {
      legend: { display: false },
      zoom: {
        
        pan: {
          enabled: true, // permite desplazarse
          mode: 'x',     // solo en eje X
   // onPan existe en todas las versiones, lo usamos y debounceamos

        },
        zoom: {
          wheel: {
            enabled: true, // zoom con la rueda del mouse
          },
          pinch: {
            enabled: true, // zoom con los dedos (touch)
          },
          mode: 'x',
          
        },
      },
      
    // 👇 estos e
    },
    scales: {
      x: {
        display: true,
        position: 'bottom',
        offset: false, // deja espacio adicional al inicio y fin
        ticks: {
    autoSkip: false, // mostramos solo lo que decidimos manualmente
    maxRotation: 0,
    minRotation: 0,
    align: 'center',
    callback: function (value, index, ticks) {
      // Mostrar solo el primero y el último del rango visible
      if (index === 0 || index === ticks.length - 1) {
        // Mostrar el valor original del eje (por ejemplo, el número o timestamp)
        return this.getLabelForValue(value as number);
      }
      return ''; // no muestra los intermedios
    },},
        grid: {

          drawOnChartArea: false
        }
      },
      y: {
        display: true,
        beginAtZero: true
      }
    },
  };
  isAdmin = signal<boolean>(false);
  rol: string;
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private tipoDS: TipoDispositivoService,
    private tipMUMS: TipoMUnidadMService,
    private pdfSvc: pdfService,
    private areaSvc: AreaService,
    private signalRService: SignalRService,
    private authService: AuthService,
    private togleSvc: ToggleService,
    private cdr: ChangeDetectorRef
  ) {

    const usuarioGuardado = this.authService.getFullUser();
    console.log("this.authService.getUserRole()")
    console.log(this.authService.getUserRole())
    this.rol = this.authService.getUserRole()
    this.isAdmin.set(this.rol?.toString() === "Administrador")
    console.log(this.isAdmin())


    this.signalRService = inject(SignalRService)
    this.cargarDispositivos();
    this.areaSvc.getAreas().subscribe(x => { this.areas.set(x) })
  }


  signalRLogic(data: any) {
    if (!data) return;
    console.log(data)
    // Identifica el tipo de evento recibido
    if (data.tipo === 'medicion') {
      this.cargarDispositivos();
    }
  }


  whileConected() {
    if (this.intento === 3) {

      if (this.signalRService)
        this.signalRService.iniciarConexion();
      else { this.signalRService = inject(SignalRService) }
    }
    setTimeout(() => {

      if (this.signalRService) {
        console.log('✅ SignalR listo, suscribiendo a eventos');
        this.sub = this.signalRService.eventoGeneral$.subscribe(data => {
          if (data) console.log('📢 Evento recibido en actuadores:', data);
          this.signalRLogic(data)
        });
      } else {
        console.error('❌ SignalRService no está disponible');
        this.whileConected()
        this.intento++;
      }
    }, 1000);
  }
  ngOnInit() {

    this.whileConected()
    console.log('SignalRService inyectado:', this.signalRService);



    if (!this.signalRService) {
      console.error('❌ SignalRService no está disponible');
      return;
    }



  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
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
      //console.log(data)
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

  get totalPaginas() {
  return Math.ceil(this.dispositivosFiltrados().length / this.itemsPorPagina);
}

// Devuelve solo los sensores que se muestran en la página actual


// Cambiar página


refrescarGraficas() {
  if (this.charts) {
    this.charts.forEach(c => c?.chart?.update());
  }
}

ngAfterViewInit() {
  this.charts.changes.subscribe(() => this.refrescarGraficas());
}

  asignarDatosE(data: Dispositivo[]) {
    data.forEach(dispo => {
      if (dispo.sensors)
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
      range: [Number(valores[0].toFixed(3)), Number(valores[valores.length - 1].toFixed(3))],
      moda: moda.length === 1 ? Number(moda[0].toFixed(3)) : moda // si hay más de una, devuelvo array
    };
  }
  onOrderChange($event: MatSlideToggleChange) {
    this.isDescending.set(!this.isDescending());
  }

// dentro de la clase SensoresComponent
private chartDataCache = new Map<string, ChartConfiguration['data']>();

getCachedChartData(sen: Sensor): ChartConfiguration['data'] {
  const key:string = sen.idSensor ?? (sen.idTipoMUnidadMNavigation?.idTipoMedicionNavigation?.nombre  ?? JSON.stringify(sen).toString() ) ;
  const existing = this.chartDataCache.get(key);
  const newData = {
    labels: sen.medicions.map((m, i) => new Date(m.fecha).toLocaleDateString() + " " + new Date(m.fecha).toLocaleTimeString() || 'M' + (i + 1)),
    datasets: [{ data: sen.medicions.map(m => m.valor), label: 'Sensor', fill: true, tension: 0.25 }]
  };

  // Comparar superficialmente para actualizar solo si cambió el contenido
  if (!existing) {
    this.chartDataCache.set(key, newData);
    return newData;
  }

  // comparar longitudes y valores (rápido)
  const oldVals = existing.datasets![0].data as number[];
  const newVals = newData.datasets![0].data as number[];
  const sameLength = oldVals.length === newVals.length;
  let equal = sameLength;
  if (sameLength) {
    for (let i = 0; i < oldVals.length; i++) {
      if (oldVals[i] !== newVals[i]) { equal = false; break; }
    }
  }
  if (!equal) {
    // mutar la referencia existente para evitar crear nueva referencia completa
    existing.labels = newData.labels;
    existing.datasets![0].data = newVals;
    return existing;
  }
  // si no cambió, devolvemos la misma referencia
  return existing;
}


  getChartData(sen: Sensor): ChartConfiguration['data'] {

    //console.log(sen)
    return {
      labels: sen.medicions.map((m, i) => new Date(m.fecha).toLocaleDateString() + " " + new Date(m.fecha).toLocaleTimeString() || 'M' + (i + 1)),
      datasets: [{ data: sen.medicions.map(m => m.valor), label: 'Sensor', fill: true, tension: 0.25 }]
    };
  }

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  resetAllZoom() {
    this.charts.forEach(chartDirective => {
      chartDirective.chart?.resetZoom(); // método propio del plugin
    });
  }



  @ViewChild('chartCanvas0') chartCanvas!: ElementRef<HTMLCanvasElement>;
  async pdfSensGet() {
    if (this.rango.value.start == null ||
      this.rango.value.end == null)
     {
              this.togleSvc.show('Valores incompletos', 'warning'); return;}
    let psens: PdfSensor = { desde: (this.rango.value.start), hasta: this.rango.value.end, idsDispositivos: this.opciones.value as string[] }
console.log("PdfSensor");
console.log(psens)
console.log(this.opciones.value)
    this.togleSvc.show('Cargando PDF', 'loading')
    this.pdfSvc.generatePdfDispositivos(psens, this.chartCanvas)
  }
  async generarCSV() {
    if (this.rango.value.start == null ||
      this.rango.value.end == null) { 
              this.togleSvc.show('Valores incompletos', 'warning'); return; }
    let psens: PdfSensor = { desde: (this.rango.value.start), hasta: this.rango.value.end, idsDispositivos: this.opciones.value as string[] }
    this.togleSvc.show('Cargando archivo CSV', 'loading')
    await this.pdfSvc.generarCSV(psens)
  }

  async getRangoDevices() {
    if (this.rango.value.start == null ||
      this.rango.value.end == null) { 
        
              this.togleSvc.show('Valores incompletos', 'warning')
        console.log("valores incompletoas"); return; }
    let psens: PdfSensor = { desde: (this.rango.value.start), hasta: this.rango.value.end, idsDispositivos: [] as string[] }


    this.togleSvc.show('Cargando datos en las graficas', 'loading')
    this.pdfSvc.pdfSens(psens).subscribe(async data => {
      console.log(data)
      this.dispositivos.set(data.data)
    })
  }
}
