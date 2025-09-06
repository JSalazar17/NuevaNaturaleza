import { Component, ViewChild, inject, DestroyRef, computed, signal, PLATFORM_ID  } from '@angular/core';
import { CommonModule, isPlatformBrowser} from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-testchart',
  standalone: true,                 // <-- obligatorio si usas `imports`
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './testchart.html',
  styleUrls: ['./testchart.css']    // <-- nota: styleUrls (plural), no styleUrl
})
export class Testchart {

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  // detectar si estamos en browser (evita errores en SSR/domino)
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // señales con datos y etiquetas iniciales
  labels = signal<string[]>(['Ene', 'Feb', 'Mar', 'Abr']);
  points = signal<number[]>([10, 20, 30, 40]);

  // tipo y opciones (tipos correctos)
  lineChartType: ChartType = 'line';
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    animation: false
  };

  // data calculada desde signals
  chartData = computed<ChartConfiguration['data']>(() => ({
    labels: this.labels(),
    datasets: [
      { data: this.points(), label: 'Ventas', fill: true, tension: 0.25 }
    ]
  }));

  private destroyRef = inject(DestroyRef);

  constructor() {
    // solo arrancar el intervalo en cliente
    if (this.isBrowser) {
      const id = setInterval(() => this.addPoint(), 2000);
      this.destroyRef.onDestroy(() => clearInterval(id));
    }
  }

  addPoint() {
    const nuevo = Math.floor(Math.random() * 100);
    const tag = `N${this.labels().length + 1}`;

    this.labels.update(ls => ls.length >= 6 ? [...ls.slice(1), tag] : [...ls, tag]);
    this.points.update(ds => ds.length >= 6 ? [...ds.slice(1), nuevo] : [...ds, nuevo]);

    this.chart?.update(); // opcional
  }
}
