import { Component, Inject, PLATFORM_ID , ViewChild, ElementRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DispositivoService } from '../../../services/dispositivos.service';
import { Dispositivo } from '../../../models/dispositivo.model';
import pdfMake from 'pdfmake/build/pdfmake';


import { Chart } from 'chart.js/auto';
import { pdfService } from '../../../services/pdf.service';
import { AuditoriaService } from '../../../services/auditoria.service';
import { Auditoria } from '../../../models/auditoria.model';
@Component({
  styleUrl:'pdf.css',
  selector: 'app-pdf',
  template: `
  <div class="hidden"><canvas #chartCanvas0  hidden></canvas></div>
  
  <button (click)="generateAudiPdf()">Generar PDF</button>`
})
export class PdfComponent {
  private pdfMake: any;
  private dispositivo:Dispositivo;
  private auditorias:Auditoria[];
  constructor(
    
    @Inject(PLATFORM_ID) private platformId: Object,
    private disSvc:DispositivoService,
    private pdfSvc:pdfService,
    private auSvc:AuditoriaService
  ) {
    
    if (isPlatformBrowser(this.platformId)) {
        this.cargarDatos();
      // 👇 import dinámico solo en navegador
      import('pdfmake/build/pdfmake').then(pdfMakeModule => {
        import('pdfmake/build/vfs_fonts').then(pdfFontsModule => {
          this.pdfMake = pdfMakeModule.default;
          this.pdfMake.vfs = (pdfFontsModule as any).pdfMake.vfs;
        });
      });
    }
  }
  cargarDatos(){
    this.disSvc.getDispositivoPorId('a4f4df58-342d-4833-8fee-dda5f4da4621').subscribe((data)=>{
        this.dispositivo=data
    })
    this.auSvc.getAuditorias().subscribe((data)=>{
      console.log(data)
      this.auditorias = data;
    })
  }
  // 3 canvases para los 3 sensores

  @ViewChild('chartCanvas0') chartCanvas0!: ElementRef<HTMLCanvasElement>;

  // Ejemplo: 2 dispositivos con sensores
 

  async generateAudiPdf() {
    
        this.pdfSvc.generatePdfAuditorias(this.auditorias)
     }


  async generateDispoPdf() {
   let  dispositivos = [
    {
      nombre: "Dispositivo A",
      sn:"",
      sensors: [
        {
          idTipoMUnidadMNavigation:{idTipoMedicionNavigation:{ nombre:"Temperatura"},
        idUnidadMedidaNavigation:{nombre:"°C"}},
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
    }as Dispositivo,
    {
      nombre: "Dispositivo B",
      sn:"",
      sensors: [
        {
          idTipoMUnidadMNavigation:{idTipoMedicionNavigation:{ nombre:"Ph"},
        idUnidadMedidaNavigation:{nombre:"Ph"}},
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

        this.pdfSvc.generatePdfDispositivos(dispositivos,this.chartCanvas0)
     }





}
