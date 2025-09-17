import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, QueryList, inject, signal, computed, PLATFORM_ID, HostListener } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Dispositivo } from '../../models/dispositivo.model';
import { ActuadorService } from '../../services/actuador.service';
import { SensorService } from '../../services/sensor.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { TipoMedicionService } from '../../services/tipomedicion.service';
import { MedicionService } from '../../services/medicion.service';
import { PuntoOptimoService } from '../../services/puntoOptimo.service';
import { UnidadMedidaService } from '../../services/unidadMedida.service';
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
@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  templateUrl: './gestion-dispositivos.html',
  imports: [CommonModule, BaseChartDirective,
    FormsModule,
    ReactiveFormsModule, MatSidenavModule, MatIconModule, MatSelectModule, MatMenuModule, MatSlideToggleModule],
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

  // filtrados con computed
  /*dispositivosFiltrados = computed(() => {
    const filtro = this.tipoSeleccionado();
    console.log(this.dispositivos());
    return filtro === 'Todos'
      ? this.dispositivos()
      : this.dispositivos().filter(d => d.idTipoDispositivoNavigation?.nombre === filtro);
  });*/
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
      console.log("actualizo",result)
      if (result) {
        // Si se guardó correctamente, refrescamos la lista
        this.cargarDispositivos();
      }
    });
  }

eliminarDispositivo(d: Dispositivo) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '800px',
      data: { message:"Se borraran todos los datos del dispositivo asi como sus actuadores o sensores ademas de los otros datos que le pertenezcan" }   // 👈 enviamos el modelo
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result) {
        // Si se guardó correctamente, refrescamos la lista
        this.dispositivoService.deleteDispositivo(d.idDispositivo as string).subscribe(data=>{

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
        console.log( this.selectedMeasurementType());
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
      
      this.selectedDeviceType.set(filters.deviceType ??this.selectedDeviceType());
      this.selectedMeasurementType.set(filters.measurementType ?? this.selectedMeasurementType());
      this.isDescending.set(filters.order ?? this.isDescending());
      
        console.log(this.selectedDeviceType());
        console.log( this.selectedMeasurementType());
        console.log(this.isDescending());
    });

  }
  allData = [
    { deviceType: 'Sensor 1', measurementType: 'Temperatura', value: 20 },
    { deviceType: 'Sensor 2', measurementType: 'Humedad', value: 40 },
    { deviceType: 'Sensor 1', measurementType: 'Presión', value: 1013 }
  ];
  filteredData = [...this.allData];

  getChartData(sen: Sensor): ChartConfiguration['data'] {
    return {
      labels: sen.medicions.map((m, i) => m.idFechaMedicion || 'M' + (i + 1)),
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

  constructor(
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private TipoDS: TipoDispositivoService,
    private TipMUMS: TipoMUnidadMService
  ) {
    this.cargarDispositivos()
    this.dispositivo$.subscribe(_d => {
    })

  }
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
}
