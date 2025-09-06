/*import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, ViewChildren, QueryList, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-gestion-dispositivos',
  standalone: true,
  templateUrl: './gestion-dispositivos.html',
  imports: [CommonModule, BaseChartDirective,FormsModule],
  styleUrls: ['./gestion-dispositivos.css']
})
export class GestionDispositivos {
  @ViewChildren(BaseChartDirective) chart: BaseChartDirective;
  

  
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  tipoSeleccionado = signal<string>('Todos');
  // 1) Fuente original de dispositivos
  private dispositivoSubject = new BehaviorSubject<Dispositivo[]>([]);
  dispositivo$: Observable<Dispositivo[]> = this.dispositivoSubject.asObservable();

  // 2) Filtro seleccionado
  private filtroSubject = new BehaviorSubject<string>('Todos');
  filtro$: Observable<string> = this.filtroSubject.asObservable();

  // 3) Dispositivos filtrados (derivado con combineLatest)

    dispositivosFiltrados$: Observable<Dispositivo[]> 
  /*combineLatest([
    this.dispositivo$,
    this.filtro$
  ]).pipe(
    map(([dispositivos, filtro]) =>
      filtro === 'Todos'
        ? dispositivos
        : dispositivos.filter(d => d.idTipoDispositivo === filtro)
    )
  );*/
/*
cambiarFiltro() {
  console.log(this.tipoSeleccionado())
  
            this.dispositivosFiltrados$  =
      combineLatest([
      this.dispositivo$,
      this.tipoSeleccionado()
    ]).pipe(
      map(([dispositivos, filtro]) =>{
        console.log(filtro)
        return filtro === 'Todos'
          ? dispositivos
          : dispositivos.filter(d => d.idTipoDispositivoNavigation?.nombre === filtro)}
      )
    );
  this.filtroSubject.next(this.tipoSeleccionado());
}



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

  labels = signal<string[]>(['Ene', 'Feb', 'Mar', 'Abr']);
  points = signal<number[]>([10, 20, 30, 40]);

  chartsData = computed<ChartConfiguration['data']>(() =>
  ({
    datasets: [
      { data: this.points(), 
        label: 'Ventas',
        fill: true, 
        tension: 0.25 }
    ]
  })
  );



  private destroyRef = inject(DestroyRef);

  constructor(
    private dispositivoService:DispositivoService,
    
  ) {
    this.dispositivoService.getDispositivos().subscribe(data=>{
      
      this.dispositivoSubject.next(data);

    });
    this.dispositivo$.subscribe(_d=>{
    })
    // generar datos solo en navegador
    if (this.isBrowser) {
      const id = setInterval(() => this.actualizarSensores(), 2000);
      this.destroyRef.onDestroy(() => clearInterval(id));
    }

  }

  private actualizarSensores() {

    
    const nuevo = Math.floor(Math.random() * 100);
    const tag = `N${this.labels().length + 1}`;
    this.labels.update(ls => ls.length >= 6 ? [...ls.slice(1), tag] : [...ls, tag]);
    this.points.update(ds => ds.length >= 6 ? [...ds.slice(1), nuevo] : [...ds, nuevo]);

    
  }
}
*/