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

@Injectable({
    providedIn: 'root'
})
export class pdfService {
    private pdfMake: any;


    constructor() {
        Chart.register(...registerables);
    }
    async generatePdfDispositivos(dispositivos: Dispositivo[], chartCanvas0: ElementRef<HTMLCanvasElement>) {


        const content: any[] = [];

        let sensorIndex = 0;

        for (const dispositivo of dispositivos) {
            // Título del dispositivo
            content.push({ text: dispositivo.nombre, style: "header" });

            for (const sensor of dispositivo.sensors as Sensor[]) {
                const valores = sensor.medicions.map(m => m.valor);
                const min = Math.min(...valores);
                const max = Math.max(...valores);
                const avg = valores.reduce((a, b) => a + b, 0) / valores.length;

                const canvas = chartCanvas0.nativeElement;

                // destruir gráfico previo si ya existía
                Chart.getChart(canvas)?.destroy();

                new Chart(canvas, {
                    type: 'line',
                    data: {
                        labels: sensor.medicions.map(m => m.fecha),
                        datasets: [{
                            label: sensor.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N',
                            data: valores,
                            borderColor: 'blue',
                            fill: false,
                            tension: 0.3
                        }]
                    },
                    options: { animation: false }
                });

                await new Promise(resolve => setTimeout(resolve, 200));

                const chartImg = canvas.toDataURL('image/png');

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
                            widths: ["*", "*"],
                            body: [
                                [
                                    { text: "Valor", bold: true, alignment: "center" },
                                    { text: "Fecha", bold: true, alignment: "center" }
                                ],
                                ...sensor.medicions.map(m => [
                                    { text: m.valor.toString(), alignment: "center" },
                                    { text: m.fecha, alignment: "center" }
                                ])
                            ]
                        },
                        layout: "lightHorizontalLines",
                        margin: [0, 0, 0, 15]
                    }
                    ,

                    {

                        table: {
                            body: [


                                ["Sensor", "Unidad", "Mín", "Máx", "Promedio"],
                                [sensor.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N', sensor.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre ?? 'S/N', min, max, avg.toFixed(2)]
                            ]
                        },
                        margin: [133, 0, 150, 10],


                    }
                );

                content.push({ image: chartImg, width: 450, margin: [45, 0, 100, 20] });

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





}