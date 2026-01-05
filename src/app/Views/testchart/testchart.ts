import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal,  AfterViewInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Checklist, ChecklistDetalle } from '../../models/checklist.model';
import { ChecklistService } from '../../services/checklist.service';
import { DispositivoService } from '../../services/dispositivos.service';
import { Dispositivo } from '../../models/dispositivo.model';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatOption, MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatDateRangePicker, MatDateRangeInput, MatDatepickerModule } from "@angular/material/datepicker";
import { MatMenu, MatMenuModule } from "@angular/material/menu";
import { AuthService } from '../../services/auth.service';
import { ToggleService } from '../../services/toggle.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import {jsPDF} from 'jspdf';


interface SerieGrafica {
  label: string;
  data: number[];
}

interface GraficaComparativa {
  idDispositivo: string;
  nombreDispositivo: string;
  fechas: string[];
  series: SerieGrafica[]; // Usuario vs Sistema
}

@Component({
  selector: 'app-testchart-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormField, MatLabel, MatOptionModule,
    MatFormFieldModule, 
    MatInputModule,
    MatSelectModule,
    MatButtonModule, MatIcon, MatDateRangePicker, MatDateRangeInput, MatMenu,
    MatMenuModule, ReactiveFormsModule,
    MatIconModule,
    MatDatepickerModule, MatSelectModule,
    MatInputModule,
    NgxPaginationModule,
    MatNativeDateModule],
  templateUrl: './testchart.html',
  styleUrls: ['./testchart.css']
})
export class testchartFormComponent implements OnInit, AfterViewInit, OnDestroy {
  dispositivos = signal<Dispositivo[]>([]);
  
  checklist: Checklist = {
    fecha: new Date(),
    observacionGeneral: '',
    detalles: []
  };
  charts: Chart[] = [];
  mensajeExito = '';
  fechaDesde: string = '';
  fechaHasta: string = '';
  itemsPorPagina = 4;
  paginaActual = 1;
  // 📊 Datos para gráficas comparativas
  graficasPorSensor = signal<GraficaComparativa[]>([]);
  checklistsFiltrados: Checklist[] = [];

  rango = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  rol: string;
  isAdmin = signal<boolean>(false);
  constructor(
    private checklistService: ChecklistService,
    private dispositivoService: DispositivoService,
    private authService: AuthService,
    private togleSvc: ToggleService
  ) {
    const usuarioGuardado = this.authService.getFullUser();
    console.log("this.authService.getUserRole()");
    console.log(this.authService.getUserRole());
    this.rol = this.authService.getUserRole();
    this.isAdmin.set(this.rol?.toString() === "Administrador");
    console.log(this.isAdmin());
  }

  ngOnInit(): void {
    this.cargarDispositivos();
  }

  ngAfterViewInit(): void {
    // necesario para cuando Angular termina de pintar los canvas
  }

  ngOnDestroy(): void {
    this.charts.forEach(c => c.destroy());
  }

  // totalPaginas para el paginador
  get totalPaginas() {
    return Math.max(1, Math.ceil(this.dispositivos().length / this.itemsPorPagina));
  }

  // Devuelve el índice real en checklist.detalles para una fila visual i
  indexReal(i: number): number {
    return (this.paginaActual - 1) * this.itemsPorPagina + i;
  }

  cargarDispositivos(): void {
    this.dispositivoService.getDispositivos().subscribe(data => {
      this.dispositivos.set(data.map(d => {
        let valorActual = 'Desconocido';
        if (d.sensors && d.sensors.length) {
          const mediciones = d.sensors[0].medicions ?? [];
          if (mediciones.length > 0) {
            valorActual = mediciones[mediciones.length - 1].valor.toString();
          }
        }
        else if (d.actuadores && d.actuadores.length > 0) {
          valorActual = d.actuadores[0].idAccionActNavigation?.accion ?? 'Desconocido';
        }
        return { ...d, valorActual };
      }));

      this.dispositivos.set(this.dispositivos().sort(x => x.idTipoDispositivo?.indexOf("efb53fa9-8f7a-4970-9fdf-7b85bdc9f382") ?? 1));

      // inicializar/actualizar detalles con el mismo orden y longitud que dispositivos
      this.checklist.detalles = this.dispositivos().map(d => ({
        idDispositivo: d.idDispositivo,
        valorRegistrado: '',
        ultimoValorMedido: (d.sensors && d.sensors.length && d.sensors[0].medicions) ? d.sensors[0].medicions[d.sensors[0].medicions.length - 1].valor.toString()
          : (d.actuadores && d.actuadores.length > 0) ? d.actuadores[0].idAccionActNavigation?.accion : 'Desconocido',
        estadoActuador: undefined
      } as ChecklistDetalle));

      // Reiniciar paginación cuando se cargan dispositivos
      this.paginaActual = 1;
    });
  }

  guardarChecklist(): void {
    let valido = false;
    if ((!this.checklist.detalles || !this.checklist.detalles[0]))
      valido = true;
    this.checklist.detalles.forEach((d, i) => {
      if (!d.valorRegistrado)
        valido = false;
    });
    if ((!this.checklist.observacionGeneral) || (!this.checklist.detalles || !this.checklist.detalles[0]) || !valido) {
      this.togleSvc.show('Por favor completa todos los campos antes de guardar', 'warning');
      return;
    }
    console.log(this.checklist);

    this.togleSvc.show('Campos completos guardando checklist', 'loading');
    this.checklistService.create(this.checklist).subscribe(() => {
      this.mensajeExito = 'Checklist guardado con éxito ✅';
      this.checklist = { fecha: new Date(), observacionGeneral: '', detalles: [] };
      setTimeout(() => (this.mensajeExito = ''), 360000);
      this.cargarDispositivos();
      this.togleSvc.show('Checklist almacenado correctamente', 'success');
    });
  }

  // 🔹 Exportar reportes a CSV según rango de fechas
  exportarCSV(): void {
    if (this.rango.value.start == null || this.rango.value.end == null) return;

    this.checklistService.getChecklistsPorFechas(this.rango.value.start.toUTCString(), this.rango.value.end.toUTCString()).subscribe((data: Checklist[]) => {
      if (data.length === 0) {
        this.togleSvc.show('No hay registros en el rango seleccionado.', 'warning')
        return;
      }
      this.togleSvc.show('Generando CSV.', 'loading')
      data.forEach(d => { d.detalles.sort(x => x.idDispositivoNavigation?.idTipoDispositivo?.indexOf("1ac93c53-2951-46ae-bbfd-6011281856a4") ?? -1) })
      const csv = this.convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `checklist_${this.rango.value.start?.toLocaleDateString()}_a_${this.rango.value.end?.toLocaleDateString()}.csv`;
      link.click();
    });
  }

  cargarDatosGraficas(): void {
    if (!this.rango.value.start || !this.rango.value.end) {
      this.togleSvc.show('Selecciona un rango de fechas', 'warning');
      return;
    }

    this.togleSvc.show('Cargando gráficas...', 'loading');

    this.checklistService
      .getChecklistsPorFechas(
        this.rango.value.start.toUTCString(),
        this.rango.value.end.toUTCString()
      )
      .subscribe(data => {
        this.construirGraficasPorSensor(data);
        this.togleSvc.show('Gráficas cargadas', 'success');
      });
  }

  private construirGraficasPorSensor(data: Checklist[]): void {
    const mapa = new Map<string, GraficaComparativa>();

    data.forEach(checklist => {
      const fecha = new Date(checklist.fecha as Date).toLocaleString();

      checklist.detalles.forEach(d => {
        if (
          !d.idDispositivoNavigation ||
          d.idDispositivoNavigation.idTipoDispositivoNavigation?.nombre !== 'Sensor'
        ) return;

        const id = d.idDispositivo;
        if (!id) return;

        if (!mapa.has(id)) {
          mapa.set(id, {
            idDispositivo: id,
            nombreDispositivo: d.nombreDispositivo ?? 'Sensor',
            fechas: [],
            series: [
              { label: 'Valor Sistema', data: [] },
              { label: 'Valor Usuario', data: [] }
            ]
          });
        }

        const g = mapa.get(id)!;
        g.fechas.push(fecha);
        g.series[0].data.push(Number(d.ultimoValorMedido));
        g.series[1].data.push(Number(d.valorRegistrado));
      });
    });

    this.graficasPorSensor.set([...mapa.values()]);
    this.renderizarGraficas();
  }

  private renderizarGraficas(): void {
    // destruir anteriores
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    // esperar a que Angular pinte los canvas del *ngFor
    setTimeout(() => {
      this.graficasPorSensor().forEach((g, i) => {
        const canvas = document.getElementById(`chart-${i}`) as HTMLCanvasElement;
        if (!canvas) return;

        const config: ChartConfiguration = {
          type: 'line' as ChartType,
          data: {
            labels: g.fechas,
            datasets: g.series.map(s => ({
              label: s.label,
              data: s.data,
              tension: 0.3
            }))
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              zoom: {
                zoom: {
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  mode: 'x'
                },
                pan: {
                  enabled: true,
                  mode: 'x'
                }
              }
            }
          }
        };

        this.charts.push(new Chart(canvas, config));
      });
    }, 0);
  }

  exportarGraficaPDF(index: number, nombre: string): void {
    const canvas = document.getElementById(`chart-${index}`) as HTMLCanvasElement;
    if (!canvas) {
      this.togleSvc.show('No se encontró la gráfica', 'error');
      return;
    }

    const img = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height + 60]
    });

    pdf.setFontSize(16);
    pdf.text(`Gráfica: ${nombre}`, 20, 30);
    pdf.addImage(img, 'PNG', 20, 50, canvas.width - 40, canvas.height - 20);
    pdf.save(`grafica_${nombre}.pdf`);
  }

  private convertToCSV(objArray: Checklist[]): string {
    let headers = ["Usuario", "Fecha", "Observacion", "Dispositivo", "Ultimo Valor Medido", "Valor Registrado"].join(",");
    let rows = objArray.map(x => {
      let hora = new Date(x.fecha as Date).toLocaleTimeString()
      let time = hora.split(":")
      if (hora.indexOf("p", 6) > 0) {
        time[0] = (12 + parseInt(time[0])).toString()
        hora = time[0] + ":" + time[1]
      } else {
        if (time[0] === "12") {
          time[0] = "00";
        }
        hora = time[0] + ":" + time[1]
      }
      return x.detalles.map(d => {
        return ([x.usuario as string, new Date(x.fecha as Date).toLocaleDateString() + " " + hora, x.observacionGeneral as string, d.nombreDispositivo as string,
          d.ultimoValorMedido as string, d.valorRegistrado as string]).join(",") as string
      }).join('\n')
    });
    return [headers, ...rows].join('\n');
  }
}
