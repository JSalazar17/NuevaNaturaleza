import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, inject, signal, computed, PLATFORM_ID, HostListener, Inject, ViewChild, ElementRef } from '@angular/core';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Dispositivo } from '../../models/dispositivo.model';
import { DispositivoService } from '../../services/dispositivos.service';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Sensor } from '../../models/sensor.model';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from "@angular/material/icon";
import { MatDialog } from '@angular/material/dialog';
import { AgregarDispositivo } from '../agregar-dispositivo/agregar-dispositivo';
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { MatSidenavModule } from '@angular/material/sidenav';
import { FiltersPanelComponent } from './filtercomponent/filters-panel.component';
import { TipoDispositivoService } from '../../services/tipodispositivos.service';
import { TipoDispositivo } from '../../models/tipodispositivo.model';
import { TipoMUnidadM } from '../../models/tipoMUnidadM.model';
import { TipoMUnidadMService } from '../../services/tipoMUnidadM.service';
import { TipoMedicion } from '../../models/tipomedicion.model';
import { ConfirmDialogComponent } from '../ConfirmDialog/confirmDialog';
import { MatButtonModule } from '@angular/material/button';
import { pdfService } from '../../services/pdf.service';
@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  templateUrl: './gestion-dispositivos.html',
  imports: [CommonModule, BaseChartDirective,
    FormsModule,
    ReactiveFormsModule, MatSidenavModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatMenuModule, MatSlideToggleModule],
  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos {
  @ViewChildren(BaseChartDirective) chart: BaseChartDirective;

  filtersOpen = false;
  selectedDeviceType = signal<string>(''); // o null
  selectedMeasurementType = signal<string>(''); // o null
  isDescending = signal<boolean>(false);

  deviceTypes: TipoDispositivo[] = [];
  measurementTypes: TipoMedicion[] = [];


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private TipoDS: TipoDispositivoService,
    private TipMUMS: TipoMUnidadMService,
    private pdfSvc: pdfService,
  ) {
    if (isPlatformBrowser(this.platformId)) {
    this.cargarDispositivos()
      // Import dinámico solo en navegador
      import('pdfmake/build/pdfmake').then(pdfMakeModule => {
        import('pdfmake/build/vfs_fonts').then(pdfFontsModule => {
          this.pdfMake = pdfMakeModule.default;

          // 👇 detectar dónde viene el vfs
          const vfs = (pdfFontsModule as any).pdfMake?.vfs || (pdfFontsModule as any).default?.pdfMake?.vfs;

          if (vfs) {
            this.pdfMake.vfs = vfs;
          }
        });
      });
    }
    this.dispositivo$.subscribe(_d => {
    })

  }
  toggleFilters(event: MouseEvent) {
    event.stopPropagation();
    this.filtersOpen = !this.filtersOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    this.filtersOpen = false; // se oculta si clickeas fuera
  }


  labels = signal<string[]>(['Ene', 'Feb', 'Mar', 'Abr']);
  points = signal<number[]>([10, 20, 30, 40]);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private dispositivosSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivo$ = this.dispositivosSubject.asObservable();

  // filtro como signal
  tipoSeleccionado = signal<string>('Todos');

  // signal auxiliar para mantener dispositivos actualizados
  dispositivos = signal<Dispositivo[]>([]);


  dispositivosFiltrados = computed(() => {
    let dispositivos = [...this.dispositivos()]; // copia local

    const tipo = this.selectedDeviceType();
    const tipoMedicion = this.selectedMeasurementType();
    const descendente = this.isDescending();

    // 🔹 Filtro por tipo de dispositivo
    if (tipo && tipo !== 'Todos') {
      dispositivos = dispositivos.filter(
        d => d.idTipoDispositivo === tipo
      );
    }

    // 🔹 Filtro por tipo de medición (dentro de sensores)
    if (tipoMedicion && tipoMedicion !== 'Todos') {
      dispositivos = dispositivos.filter(d =>
        d.sensors?.some(s =>
          s.idTipoMUnidadMNavigation?.idTipoMedicion === tipoMedicion
        )
      );
    }

    // 🔹 Ordenar por nombre (ejemplo, puedes cambiar la propiedad)
    dispositivos.sort((a, b) => {
      const nA = a.nombre?.toLowerCase() ?? '';
      const nB = b.nombre?.toLowerCase() ?? '';
      return nA.localeCompare(nB);
    });

    if (descendente) {
      dispositivos.reverse();
    }

    return dispositivos;
  });



  lineChartType: ChartType = 'line';


  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { display: false },
      y: { display: true }
    }
  };
  editarDispositivo(dispositivo: any) {
    const dialogRef = this.dialog.open(AgregarDispositivo, {
      width: '800px',
      data: { dispositivo }   // 👈 enviamos el modelo
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("actualizo", result)
      if (result) {
        // Si se guardó correctamente, refrescamos la lista
        this.cargarDispositivos();
      }
    });
  }

  eliminarDispositivo(d: Dispositivo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '800px',
      data: { message: "Se borraran todos los datos del dispositivo asi como sus actuadores o sensores ademas de los otros datos que le pertenezcan" }   // 👈 enviamos el modelo
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        // Si se guardó correctamente, refrescamos la lista
        this.dispositivoService.deleteDispositivo(d.idDispositivo as string).subscribe(data => {

        })
        this.cargarDispositivos();
      }
    });
  }

  openFilters() {
    const opened = this.dialog.openDialogs.find(
      d => d.componentInstance instanceof FiltersPanelComponent
    );

    if (opened) {
      // Si ya está abierto, lo cerramos
      opened.close();
      return;
    }

    console.log(this.selectedDeviceType());
    console.log(this.selectedMeasurementType());
    console.log(this.isDescending());
    // Si no está abierto, lo abrimos
    const dialogRef = this.dialog.open(FiltersPanelComponent, {
      panelClass: 'custom-filters-dialog',
      backdropClass: 'filters-backdrop',
      position: { right: '0', top: '60px' },
      width: '320px',
      data: {
        deviceTypes: this.deviceTypes,
        measurementTypes: this.measurementTypes,
        // 👇 Mandamos también los valores actuales ya seleccionados
        selectedDeviceType: this.selectedDeviceType(),
        selectedMeasurementType: this.selectedMeasurementType(),
        isDescending: this.isDescending()
      }
    });

    dialogRef.componentInstance.filtersChanged.subscribe(filters => {
      console.log('Filtros aplicados dinámicamente:', filters);

      this.selectedDeviceType.set(filters.deviceType ?? this.selectedDeviceType());
      this.selectedMeasurementType.set(filters.measurementType ?? this.selectedMeasurementType());
      this.isDescending.set(filters.order ?? this.isDescending());

      console.log(this.selectedDeviceType());
      console.log(this.selectedMeasurementType());
      console.log(this.isDescending());
    });

  }

onDeviceTypeChange(){

}

      
onMeasurementTypeChange(){

}

onOrderChange($event:any){
      this.isDescending.set(! this.isDescending());
this.dispositivosFiltrados
}
  allData = [
    { deviceType: 'Sensor 1', measurementType: 'Temperatura', value: 20 },
    { deviceType: 'Sensor 2', measurementType: 'Humedad', value: 40 },
    { deviceType: 'Sensor 1', measurementType: 'Presión', value: 1013 }
  ];
  filteredData = [...this.allData];

  getChartData(sen: Sensor): ChartConfiguration['data'] {
      sen.medicions = sen.medicions.map(r => ({
    ...r,
    fecha: new Date(r.fecha) // aquí ya lo guardas como Date
  }));
    return {
      labels: sen.medicions.map((m, i) => m.fecha || 'M' + (i + 1)),
      datasets: [
        {
          data: sen.medicions.map(m => m.valor),
          label: 'Sensor',
          fill: true,
          tension: 0.25
        }
      ]
    };
  }

  private destroyRef = inject(DestroyRef);
  private pdfMake: any;



  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos.set(data);
      this.dispositivosSubject.next(data);
      console.log(data)
    });
    this.TipoDS.obtenerTiposDispositivo().subscribe(data => this.deviceTypes = data)
    this.TipMUMS.getTipoMUnidadMs().subscribe(data => {
      data.forEach(i => {
        let existe = false
        this.measurementTypes.forEach(mt => {
          if (i.idTipoMedicionNavigation == mt) { existe = true; }
        })
        if (!existe) {
          this.measurementTypes.push(i.idTipoMedicionNavigation);
        }
      });

    }
    )
  }


  @ViewChild('chartCanvas0') chartCanvas0!: ElementRef<HTMLCanvasElement>;
  async generarpdfsensor() {

    let dispositivos = [
      {
        nombre: "Dispositivo A",
        sn: "",
        sensors: [
          {
            idTipoMUnidadMNavigation: {
              idTipoMedicionNavigation: { nombre: "Temperatura" },
              idUnidadMedidaNavigation: { nombre: "°C" }
            },
            medicions: [
              { valor: 22.5, fecha: "2025-09-17 08:00" },
              { valor: 23.0, fecha: "2025-09-17 09:00" },
              { valor: 23.8, fecha: "2025-09-17 10:00" }
            ]
          },
          {
            nombre: "Humedad",
            unidad: "%",
            medicions: [
              { valor: 55, fecha: "2025-09-17 08:00" },
              { valor: 57, fecha: "2025-09-17 09:00" },
              { valor: 54, fecha: "2025-09-17 10:00" }
            ]
          }
        ]
      } as Dispositivo,
      {
        nombre: "Dispositivo B",
        sn: "",
        sensors: [
          {
            idTipoMUnidadMNavigation: {
              idTipoMedicionNavigation: { nombre: "Ph" },
              idUnidadMedidaNavigation: { nombre: "Ph" }
            },
            medicions: [
              { valor: 6.8, fecha: "2025-09-17 08:00" },
              { valor: 6.9, fecha: "2025-09-17 09:00" },
              { valor: 7.0, fecha: "2025-09-17 10:00" }
            ]
          }
        ]
      } as Dispositivo
    ];

    const canvas = this.chartCanvas0.nativeElement;
    console.log(this.dispositivos())
    this.pdfSvc.generatePdfDispositivos(this.dispositivos(), this.chartCanvas0)
  }
}
