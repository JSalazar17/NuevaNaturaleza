import { ElementRef, Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { Dispositivo } from "../models/dispositivo.model";
import pdfMake from "pdfmake/build/pdfmake";
import { DispositivoService } from "./dispositivos.service";
import { isPlatformBrowser } from "@angular/common";
import { Chart, registerables } from 'chart.js';
import { Sensor } from "../models/sensor.model";
import { Auditoria } from "../models/auditoria.model";
import { FechaMedicion } from "../models/fechaMedicion.model";
import { Console } from "console";
import { HttpClient } from "@angular/common/http";
import { PdfSensor } from "../models/pdfsensor.model";
import { environment } from "../environment/environment";
import { Observable } from "rxjs";
import { Response } from "../models/response.model";
import { Evento } from "../models/evento.model";

@Injectable({
    providedIn: 'root'
})
export class pdfService {
    private pdfMake: any;

    apiUrl = environment + '/api/Pdf'
    constructor(private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        if (isPlatformBrowser(this.platformId)) {
            // 👇 import dinámico solo en navegador
            import('pdfmake/build/pdfmake').then(pdfMakeModule => {
                import('pdfmake/build/vfs_fonts').then(pdfFontsModule => {
                    this.pdfMake = pdfMakeModule.default;
                    const vfs = (pdfFontsModule as any).pdfMake?.vfs || (pdfFontsModule as any).default?.pdfMake?.vfs;

                    if (vfs) {
                        this.pdfMake.vfs = vfs;
                    }
                });
            });
        }
    }

    pdfSens(pdfS: PdfSensor): Observable<Response> {
        return this.http.post<Response>(this.apiUrl+"/Sen", pdfS);
    }
    
    pdfAuditorias(pdfS: PdfSensor): Observable<Response> {
        return this.http.post<Response>(this.apiUrl+"/Audi", pdfS);
    } 
    pdfEventos(pdfS: PdfSensor): Observable<Response> {
        return this.http.post<Response>(this.apiUrl+"/Even", pdfS);
    }

    
    async PdfEventos(sensdata: PdfSensor) {
        this.pdfEventos(sensdata).subscribe(data => {

            Chart.register(...registerables);
            console.log(data)
            this.generatePdfEvento(data.data);
        })
    }


    async generatePdfEvento(eventos: Evento[]) {

        console.log("audis well");
        const content: any[] = [];

        let sensorIndex = 0;
        eventos.sort((a, b) =>
            new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime()
        );

        content.push({ text: "Eventos", style: "header" });
        content.push(
            {
                table: {
                    headerRows: 1,
                    widths: ["20%", "20%", "20%", "20%", "20%"],
                    body: [
                        [
                            { text: "Dispositivo", bold: true, alignment: "center" },
                            { text: "Accion", bold: true, alignment: "center" },
                            { text: "Usuario", bold: true, alignment: "center" },
                            { text: "Observacion", bold: true, alignment: "center" },
                            { text: "Fecha", bold: true, alignment: "center" }
                        ],
                        ...eventos.map(m => [
                            { text: m.idDispositivoNavigation.nombre ?? 'S/N', alignment: "center" },
                            { text: m.idImpactoNavigation.nombre, alignment: "center" },
                            { text: m.idDispositivoNavigation.idMarcaNavigation?.nombre?? 'S/N', alignment: "center" },
                            { text: m.idSistemaNavigation.nombre, alignment: "center" },
                            { text: m.fechaEvento, alignment: "center" }
                        ])
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 15]
            }

        );


        sensorIndex++;



        const docDefinition: any = {
            content,
            styles: {
                deviceHeader: { fontSize: 14, bold: true },
                header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] }
            }
        };


        pdfMake.createPdf(docDefinition).open();

    }






    async PdfAuditorias(sensdata: PdfSensor) {
        this.pdfAuditorias(sensdata).subscribe(data => {

            Chart.register(...registerables);
            console.log(data)
            this.generatePdfAuditorias(data.data);
        })
    }

 
    async generatePdfAuditorias(auditorias: Auditoria[]) {

        console.log("audis well");
        const content: any[] = [];

        let sensorIndex = 0;
        auditorias.sort((a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        content.push({ text: "Auditorias", style: "header" });
        content.push(
            {
                table: {
                    headerRows: 1,
                    widths: ["20%", "20%", "20%", "20%", "20%"],
                    body: [
                        [
                            { text: "Dispositivo", bold: true, alignment: "center" },
                            { text: "Accion", bold: true, alignment: "center" },
                            { text: "Usuario", bold: true, alignment: "center" },
                            { text: "Observacion", bold: true, alignment: "center" },
                            { text: "Fecha", bold: true, alignment: "center" }
                        ],
                        ...auditorias.map(m => [
                            { text: m.dispositivoNombre ?? 'S/N', alignment: "center" },
                            { text: m.accionNombre, alignment: "center" },
                            { text: m.usuarioNombre, alignment: "center" },
                            { text: m.observacion, alignment: "center" },
                            { text: m.fecha, alignment: "center" }
                        ])
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 15]
            }

        );


        sensorIndex++;



        const docDefinition: any = {
            content,
            styles: {
                deviceHeader: { fontSize: 14, bold: true },
                header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] }
            }
        };


        pdfMake.createPdf(docDefinition).open();

    }
    async generatePdfDispositivos(sensdata: PdfSensor, chartCanvas0: ElementRef<HTMLCanvasElement>) {
        let dispositivos: Dispositivo[];
        this.pdfSens(sensdata).subscribe(data => {

            Chart.register(...registerables);
            console.log(data)
            dispositivos = data.data
            this.structPdfSensor(dispositivos, chartCanvas0);
        })
    }

    async structPdfSensor(dispositivos: Dispositivo[], chartCanvas0: ElementRef<HTMLCanvasElement>) {

        let sensorIndex = 0;
        const content: any[] = [];
        for (const dispositivo of dispositivos) {
            // Título del dispositivo
            content.push({ text: dispositivo.nombre, style: "header" });

            for (const sensor of dispositivo.sensors as Sensor[]) {
                const valores = sensor.medicions.map(m => m.valor);
                const min = Math.min(...valores);
                const max = Math.max(...valores);
                const avg = valores.reduce((a, b) => a + b, 0) / valores.length;

                const canvas = chartCanvas0.nativeElement;
                sensor.medicions = sensor.medicions.map(r => ({
                    ...r,
                    fecha: new Date(r.fecha) // aquí ya lo guardas como Date
                }));
                // destruir gráfico previo si ya existía
                Chart.getChart(canvas)?.destroy();
                if (sensor.medicions.length > 0) {
                    new Chart(canvas, {
                        type: 'line',
                        data: {
                            labels: sensor.medicions.map(m => new Date(m.fecha).toLocaleDateString().substring(0, new Date(m.fecha).toLocaleDateString().lastIndexOf("/")) + " " + new Date(m.fecha).toTimeString().substring(0, new Date(m.fecha).toTimeString().lastIndexOf(":"))),
                            datasets: [{
                                label: sensor.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N',
                                data: valores,
                                borderColor: 'blue',
                                fill: false,
                                tension: 0.3,
                                pointRadius: 0,   // 👈 elimina los puntos
                                pointHoverRadius: 0
                            }]
                        },
                        options: { animation: false }
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 200));

                const chartImg = canvas.toDataURL('image/png');


                console.log(sensor.medicions);
                // Resumen + gráfico en el PDF
                content.push(


                    {
                        text: `Sensor: ${sensor.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N'} (${sensor.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre ?? 'S/N'})`,
                        bold: true,
                        margin: [0, 10, 0, 5],
                        alignment: "center"
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: ["20%", "*"],
                            body: this.buildMedicionesTable(sensor)
                        },
                        //layout: "lightHorizontalLines",
                        margin: [0, 0, 0, 15]
                    }
                    ,

                    {

                        table: {
                            headerRows: 1,
                            widths: ["20%", "20%", "20%", "20%", "20%"],
                            body: [


                                ["Sensor", "Unidad", "Mín", "Máx", "Promedio"],
                                [sensor.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N', sensor.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre ?? 'S/N', min, max, avg.toFixed(2)]
                            ]
                        },
                        margin: [0, 0, 0, 0],
                        //margin: [133, 0, 150, 10],


                    }
                );

                if (sensor.medicions.length > 0) {
                    content.push({ image: chartImg, width: 550, margin: [-15, 10, 0, 20] });
                }
                sensorIndex++;
            }
        }

        const docDefinition: any = {
            content,
            styles: {
                deviceHeader: { fontSize: 14, bold: true },
                header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] }
            }
        };


        pdfMake.createPdf(docDefinition).open();
    }



    buildMedicionesTable(sensor: any): any[] {
        const body: any[] = [];

        // Encabezados de tabla
        body.push([
            { text: "",  colSpan: 2, bold: true, alignment: "center", },
            {  }
        ]);
        /*body.push([
            { text: "Hora", bold: true, alignment: "center" },
            { text: "Valores", bold: true, alignment: "center" }
        ]);*/

        // 1️⃣ Agrupar por día
        const porDia: Record<string, any[]> = {};
        for (const m of sensor.medicions) {
            const fecha = new Date(m.fecha);
            const dia = "\n" + fecha.toISOString().split("T")[0]; // "2025-07-15"
            if (!porDia[dia]) porDia[dia] = [];
            porDia[dia].push(m);
        }

        // 2️⃣ Recorremos los días en orden
        const diasOrdenados = Object.keys(porDia).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        for (const dia of diasOrdenados) {
            const medicionesDelDia = porDia[dia];

            // Fila especial para el día (ocupa 2 columnas)
            body.push([
                { text: dia, bold: true, colSpan: 2, alignment: "center" },
                {} // celda vacía para completar colSpan
            ],[
                
            { text: "Hora", bold: true, alignment: "center" },
            { text: "Valores", bold: true, alignment: "center" }
            ]);

            // 3️⃣ Agrupar por hora dentro del día
            const porHora: Record<string, string[]> = {};
            for (const m of medicionesDelDia) {
                const fecha = new Date(m.fecha);
                const hora = fecha.getHours().toString().padStart(2, "0") + ":00";
                if (!porHora[hora]) porHora[hora] = [];
                porHora[hora].push(m.valor.toString());
            }

            // 4️⃣ Recorremos las horas en orden
            const horasOrdenadas = Object.keys(porHora).sort();
            for (const hora of horasOrdenadas) {
                body.push([
                    { text: hora, alignment: "center", bold: true },
                    { text: wrapValues(porHora[hora]), alignment: "left" } // multilinea
                ]);
            }
        }
        function wrapValues(values: string[]): string {
            let currentLine = "";
            const lines: string[] = [];

            for (let i = 0; i < values.length; i++) {
                const val = values[i];
                // Si agregamos este valor + coma se pasa del límite, hacemos salto de línea

                currentLine += (currentLine ? ", " : "") + val;

            }
            if (currentLine) lines.push(currentLine);

            return lines.join("\n"); // multilinea
        }

        return body;
    }


   




}