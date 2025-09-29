import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, inject, signal, computed, PLATFORM_ID, HostListener, QueryList } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-sensores',
  standalone: true,
  templateUrl: './sensores.html',
  imports: [CommonModule, BaseChartDirective,
    FormsModule, ReactiveFormsModule, MatSidenavModule,
    MatIconModule, MatSelectModule, MatMenuModule, MatSlideToggleModule],
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

  dispositivosFiltrados = computed(() => {
    let dispositivos = [...this.dispositivos()];
    // 🔹 SOLO sensores
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
    private dispositivoService: DispositivoService,
    private dialog: MatDialog,
    private tipoDS: TipoDispositivoService,
    private tipMUMS: TipoMUnidadMService
  ) {
    this.cargarDispositivos();
  }

  cargarDispositivos() {
    this.dispositivoService.getDispositivos().subscribe(data => {
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

  getChartData(sen: Sensor): ChartConfiguration['data'] {
    return {
      labels: sen.medicions.map((m, i) => m.idFechaMedicion || 'M' + (i + 1)),
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

  openFilters() {
    const dialogRef = this.dialog.open(FiltersPanelComponent, {
      panelClass: 'custom-filters-dialog',
      backdropClass: 'filters-backdrop',
      position: { right: '0', top: '60px' },
      width: '320px',
      data: {
        deviceTypes: this.deviceTypes,
        measurementTypes: this.measurementTypes,
        selectedDeviceType: this.selectedDeviceType(),
        selectedMeasurementType: this.selectedMeasurementType(),
        isDescending: this.isDescending()
      }
    });

    dialogRef.componentInstance.filtersChanged.subscribe(filters => {
      this.selectedDeviceType.set(filters.deviceType ?? this.selectedDeviceType());
      this.selectedMeasurementType.set(filters.measurementType ?? this.selectedMeasurementType());
      this.isDescending.set(filters.order ?? this.isDescending());
    });
  }
}
