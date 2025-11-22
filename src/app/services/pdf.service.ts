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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Medicion } from "../models/medicion.model";
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
        return this.http.post<Response>(this.apiUrl + "/Sen", pdfS);
    }

    pdfAuditorias(pdfS: PdfSensor): Observable<Response> {
        return this.http.post<Response>(this.apiUrl + "/Audi", pdfS);
    }
    pdfEventos(pdfS: PdfSensor): Observable<Response> {
        return this.http.post<Response>(this.apiUrl + "/Even", pdfS);
    }


    async PdfEventos(sensdata: PdfSensor) {
        this.pdfEventos(sensdata).subscribe(data => {

            Chart.register(...registerables);
            console.log(data)
            this.generatePdfEvento1(data.data);
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
                            { text: m.idDispositivoNavigation.idMarcaNavigation?.nombre ?? 'S/N', alignment: "center" },
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

    async generatePdfEvento1(eventos: Evento[]) {
        // Ordenar los eventos por fecha descendente
        eventos.sort((a, b) =>
            new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime()
        );

        // Fecha y hora de generación del documento
        const fechaGeneracion = new Date().toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        // Logo en base64 (asegúrate de tener el método getBase64ImageFromUrl disponible)
        const logoBase64 = await this.getBase64ImageFromUrl('assets/logo.jpeg');

        // Contenido principal
        const content: any[] = [
            { text: "Eventos", style: "header", alignment: "center", margin: [0, 20, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ["20%", "20%", "20%", "20%", "20%"],
                    body: [
                        [
                            { text: "Impacto", bold: true, alignment: "center", fillColor: "#1E88E5", color: "white" },
                            { text: "Dispositivo", bold: true, alignment: "center", fillColor: "#1E88E5", color: "white" },
                            { text: "Acción", bold: true, alignment: "center", fillColor: "#1E88E5", color: "white" },
                            { text: "Sistema", bold: true, alignment: "center", fillColor: "#1E88E5", color: "white" },
                            { text: "Fecha", bold: true, alignment: "center", fillColor: "#1E88E5", color: "white" }
                        ],
                        ...eventos.map(e => [
                            { text: e.idImpactoNavigation?.nombre ?? 'S/N', alignment: "center" },
                            { text: e.idDispositivoNavigation?.nombre ?? 'S/N', alignment: "center" },
                            { text: e.idAccionActNavigation?.accion ?? 'S/N', alignment: "center" },
                            { text: e.idSistemaNavigation?.nombre ?? 'S/N', alignment: "center" },
                            { text: new Date(e.fechaEvento).toLocaleString(), alignment: "center" }
                        ])
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 15]
            }
        ];

        // Definición general del PDF
        const docDefinition: any = {
            info: {
                title: 'Reporte de Eventos',
                author: 'Sistema Acuapónico - GISTFA',
                subject: 'Registro de eventos del sistema',
            },
            pageMargins: [40, 80, 40, 60],
            // Encabezado que se repite en todas las páginas
            header: (currentPage: number, pageCount: number) => ({
                margin: [40, 15, 40, 0],
                columns: [
                    { image: logoBase64, width: 40, height: 40 },
                    { text: 'Nueva Naturaleza', fontSize: 14, bold: true, margin: [10, 10, 0, 0] },
                    {
                        text: `Generado el: ${fechaGeneracion}`,
                        alignment: 'right',
                        fontSize: 10,
                        margin: [0, 15, 0, 0]
                    }
                ]
            }),

            // Pie de página con créditos del equipo de desarrollo
            footer: (currentPage: number, pageCount: number) => ({
                margin: [40, 0, 40, 20],
                columns: [
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'left', fontSize: 9 },
                    { text: 'Equipo de desarrolladores del grupo GISTFA', alignment: 'center', fontSize: 9 },
                    { text: 'David Ricardo Contreras Espinosa y Jorge Iván Salazar Gómez', alignment: 'right', fontSize: 9 }
                ]
            }),

            content,
            styles: {
                header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] }
            }
        };

        // Mostrar PDF en una nueva pestaña
        pdfMake.createPdf(docDefinition).open();
    }



    async PdfAuditorias(sensdata: PdfSensor) {
        let audis: Auditoria[] = []
        this.pdfAuditorias(sensdata).subscribe(data => {

            Chart.register(...registerables);
            console.log(data)
            let audis = data.data as Auditoria[]
            if (audis[0])
                this.generatePdfAuditorias1(data.data);
        })
        if (audis[0]) return true;
        return false;
    }

    async generatePdfAuditorias1(auditorias: Auditoria[]) {
        // Ordenar las auditorías por fecha descendente
        auditorias.sort((a, b) =>
            new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );

        // Fecha de generación
        const fechaGeneracion = new Date().toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short'
        });



        // Cargar logo en base64 (asegúrate que el método getBase64ImageFromUrl existe)
        const logoBase64 = await this.getBase64ImageFromUrl('assets/logo.jpeg');

        // Contenido principal del PDF
        const content: any[] = [
            { text: "Auditorías", style: "header", alignment: "center", margin: [0, 20, 0, 10] },
            {
                table: {
                    headerRows: 1,
                    widths: ["20%", "20%", "20%", "20%", "20%"],
                    body: [
                        [
                            { text: "Dispositivo", bold: true, alignment: "center", fillColor: "#2E7D32", color: "white" },
                            { text: "Acción", bold: true, alignment: "center", fillColor: "#2E7D32", color: "white" },
                            { text: "Usuario", bold: true, alignment: "center", fillColor: "#2E7D32", color: "white" },
                            { text: "Observación", bold: true, alignment: "center", fillColor: "#2E7D32", color: "white" },
                            { text: "Fecha", bold: true, alignment: "center", fillColor: "#2E7D32", color: "white" }
                        ],
                        ...auditorias.map(m => [
                            { text: m.dispositivoNombre ?? 'S/N', alignment: "center" },
                            { text: m.accionNombre, alignment: "center" },
                            { text: m.usuarioNombre, alignment: "center" },
                            { text: m.observacion, alignment: "center" },
                            { text: new Date(m.fecha).toLocaleString(), alignment: "center" }
                        ])
                    ]
                },
                layout: "lightHorizontalLines",
                margin: [0, 0, 0, 15]
            }
        ];

        // Definición del documento PDF
        const docDefinition: any = {
            info: {
                title: 'Reporte de Auditorías',
                author: 'Sistema Acuapónico - GISTFA',
                subject: 'Registro de auditorías del sistema',
            },
            pageMargins: [40, 80, 40, 60],
            // Encabezado en todas las páginas
            header: (currentPage: number, pageCount: number) => ({
                margin: [40, 15, 40, 0],
                columns: [
                    { image: logoBase64, width: 40, height: 40 },
                    { text: 'Nueva Naturaleza', fontSize: 14, bold: true, margin: [10, 10, 0, 0] },
                    {
                        text: `Generado el: ${fechaGeneracion}`,
                        alignment: 'right',
                        fontSize: 10,
                        margin: [0, 15, 0, 0]
                    }
                ]
            }),

            // Pie de página en todas las páginas
            footer: (currentPage: number, pageCount: number) => ({
                margin: [40, 0, 40, 20],
                columns: [
                    { text: `Página ${currentPage} de ${pageCount}`, alignment: 'left', fontSize: 9 },
                    { text: 'Equipo de desarrolladores del grupo GISTFA', alignment: 'center', fontSize: 9 },
                    { text: 'David Ricardo Contreras Espinosa y Jorge Iván Salazar Gómez', alignment: 'right', fontSize: 9 }
                ]
            }),

            content,
            styles: {
                header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] }
            }

        }
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
    generatePdfDispositivos(sensdata: PdfSensor, chartCanvas0: ElementRef<HTMLCanvasElement>) {
        let dispositivos: Dispositivo[];
        this.pdfSens(sensdata).subscribe(async data => {
            let sen

            Chart.register(...registerables);
            console.log(data)
            dispositivos = data.data
            let dispo!: Dispositivo;
            let sensors: Dispositivo[] = [];
            /*this.structPdfSensor(dispositivos, chartCanvas0);*/
            for (let dis = 0; dis < dispositivos.length; dis++) {
                dispo = dispositivos[dis]
                if (dispositivos && dispositivos.length > 0)
                    dispo = dispositivos[0];

                if (dispo && dispo.sensors && dispo.sensors.length > 0) {
                    sensors.push(dispositivos[dis])
                    sen = dispo.sensors[0]
                    console.log(dispo)

                }

            }
            if (sen) {

                console.log(dispo)
                this.generarPDFs(sensors, chartCanvas0, false)
                // this.generarPDF(sen, dispo as Dispositivo, chartCanvas0)
            }
        })
    }

    public async generarCSV(sensdata: PdfSensor) {
        this.pdfSens(sensdata).subscribe(async data => {
            let sen!: Sensor

            console.log(data)
            let dispositivos = data.data
            let dispo!: Dispositivo;
            /*this.structPdfSensor(dispositivos, chartCanvas0);*/
            let csvContent: string[] = [];

            console.log(dispositivos)
            for (let dis = 0; dis < dispositivos.length; dis++) {
                if (dispositivos && dispositivos.length > 0)
                    dispo = dispositivos[dis];

                if (dispo && dispo.sensors && dispo.sensors.length > 0) {
                    sen = dispo.sensors[0]
                    console.log("dis")
                    console.log(dispo)

                    csvContent.push(this.convertirACSV(sen.medicions.map(x => {
                        var hora = new Date(x.fecha).toLocaleTimeString();
                        let time = hora.split(":");
                        //console.log(hora.indexOf("p",6))
                        if (hora.indexOf("p", 6) > 0) {

                            time[0] = (12 + parseInt(time[0])).toString()
                            hora = time[0] + ":" + time[1]
                        } else {

                            if (time[0] === "12") {
                                time[0] = "00";
                            }
                            hora = time[0] + ":" + time[1]
                        }
                        return {
                            valor: x.valor,
                            fecha: new Date(x.fecha).toLocaleDateString() + " " + hora,
                            nombre: dispo.nombre,
                            unidadMedida: sen.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre
                        }
                    }) as { valor: number | string, fecha?: string, nombre?: string, unidadMedida: string }[]))

                }
            }
            if (sen) {



                const encabezados = ['Valor', 'Fecha', 'Nombre', 'Unidad medida'];
                const blob = new Blob([encabezados.join(',') + ('\n'), csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });

                // Crear un enlace temporal para descargarlo
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `mediciones_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        })
    }

    private convertirACSV(datos: { valor: number | string, fecha?: string, nombre?: string, unidadMedida: string }[]): string {

        const filas = datos.map(d =>
            `${d.valor},"${d.fecha}","${d.nombre}","${d.unidadMedida}"`
        );

        return [...filas].join('\n');
    }


    async generarPDF(sen: Sensor, dispo: Dispositivo, chartCanvas0: ElementRef<HTMLCanvasElement>, promediar: boolean = true) {

        const canvas = chartCanvas0.nativeElement; Chart.getChart(canvas)?.destroy();


        if (sen.medicions.length > 0) {

            const valores = sen.medicions.map(m => m.valor);
            new Chart(canvas, {
                type: 'line',
                data: {
                    labels: sen.medicions.map(m => new Date(m.fecha).toLocaleDateString().substring(0, new Date(m.fecha).toLocaleDateString().lastIndexOf("/")) + " " + new Date(m.fecha).toTimeString().substring(0, new Date(m.fecha).toTimeString().lastIndexOf(":"))),
                    datasets: [{
                        label: sen.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N',
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
        // Insertar el gráfico debajo del encabezado (por ejemplo, a los 40 mm)




        let mediciones: Medicion[] = sen.medicions;
        const doc = new jsPDF('p', 'mm', 'a4') as jsPDF & { lastAutoTable?: any; getNumberOfPages?: () => number; };

        const fechaGeneracion = new Date();
        const fechaTexto = fechaGeneracion.toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        // --- Encabezado global ---
        const addHeader = async () => {
            const logoBase64 = await this.getBase64ImageFromUrl('assets/logo.jpeg');
            doc.addImage(logoBase64, 'JPEG', 10, 8, 20, 20);

            doc.setFontSize(14);
            doc.text('Nueva Naturaleza', 40, 15);
            doc.setFontSize(10);
            doc.text(`Generado el: ${fechaTexto}`, 150, 15);
            doc.line(10, 30, 200, 30);
        };

        // --- Pie de página ---
        const addFooter = (pageNumber: number, totalPages: number) => {
            doc.setFontSize(9);
            doc.text(
                `Página ${pageNumber} de ${totalPages}`,
                10,
                doc.internal.pageSize.getHeight() - 10
            );
            doc.text(
                `Equipo de desarrolladores del grupo de investigación GISTFA`,
                60,
                doc.internal.pageSize.getHeight() - 15
            );
            doc.text(
                `David Ricardo Contreras Espinosa y Jorge Iván Salazar Gómez`,
                60,
                doc.internal.pageSize.getHeight() - 10
            );
        };

        // --- Agrupamiento opcional ---
        let datosFinales: { fecha?: string, valor: number | string, rango?: string }[] = [];

        if (promediar && mediciones.length > 100) {
            const bloque = Math.ceil(mediciones.length / 100);
            for (let i = 0; i < mediciones.length; i += bloque) {
                const grupo = mediciones.slice(i, i + bloque);
                const promedio =
                    grupo.reduce((acc, m) => acc + m.valor, 0) / grupo.length;
                datosFinales.push({
                    valor: promedio.toFixed(2),
                    rango: `${new Date(grupo[grupo.length - 1].fecha).toLocaleString()}      -     ${new Date(grupo[grupo.length - 1].fecha).toLocaleString()}`


                });
            }
        } else {
            datosFinales = mediciones.map((m) => ({
                valor: m.valor,
                fecha: m.fecha
            }));
        }

        // --- Colores por día ---
        const colores = [
            { fondo: [123, 124, 13] as [number, number, number], texto: [255, 255, 255] as [number, number, number] }, // verde
            { fondo: [70, 130, 180] as [number, number, number], texto: [255, 255, 255] as [number, number, number] }, // azul
            { fondo: [169, 169, 169] as [number, number, number], texto: [0, 0, 0] as [number, number, number] } // gris
        ];

        let currentY = 40; // 👈 empieza después del gráfico
        // --- Generar tabla ---
        await addHeader();
        if (dispo) {
            doc.setFontSize(10);
            doc.setFontSize(14);
            doc.text(`${dispo.nombre}`, 10, currentY);
            if (sen.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre != dispo.nombre) {
                doc.setFontSize(14);
                doc.text(`${dispo.nombre} `, 10, currentY);
                doc.text(`${sen.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre}   ${sen.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre}`, 10, currentY + 5);

                currentY += 10;
            }

            else {
                doc.setFontSize(14);
                doc.text(`${dispo.nombre}   ${sen.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre}`, 10, currentY);
                currentY += 5
            }
        }
        const chartImg = canvas.toDataURL('image/png');
        doc.addImage(chartImg, 'PNG', 10, currentY, 180, 80); // (x, y, width, height)
        // console.log(chartImg)
        // Luego de eso puedes comenzar la tabla

        let lastDate = '';
        let colorIndex = 0;

        currentY += 90;// 👈 empieza después del gráfico

        datosFinales.forEach((m, i) => {
            if (currentY > doc.internal.pageSize.getHeight() - 40) {
                doc.addPage();
                currentY = 20;
            }

            const fechaActual = new Date(m.fecha as string).toLocaleDateString();
            //console.log(fechaActual)
            const totalWidth = 180;
            const startX = (doc.internal.pageSize.getWidth() - totalWidth) / 2
            if (fechaActual !== lastDate) {
                const color = colores[colorIndex % colores.length];
                if (promediar) {
                    autoTable(doc, {
                        head: [[` Fecha: ${fechaActual}`]],
                        theme: 'plain',
                        styles: {
                            cellWidth: 181,
                            fillColor: color.fondo,
                            textColor: color.texto,
                            fontSize: 12,
                            halign: 'center',
                            cellPadding: 5
                        },
                        startY: currentY
                        //startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 5 : 35
                    });
                }
                currentY = (doc as any).lastAutoTable.finalY + 2;
                colorIndex++;
                lastDate = fechaActual;
                autoTable(doc, {
                    head: [[promediar ? 'Valor Promediado' : 'Valor', promediar ? 'Rango de Fechas' : 'Fecha']],
                    startY: currentY,
                    theme: 'grid',
                    styles: {
                        cellWidth: 90.5,
                        halign: 'center',
                    }
                });
                currentY = (doc as any).lastAutoTable.finalY + 2;

            }


            autoTable(doc, {
                body: [[
                    m.valor,
                    promediar
                        ? (m.rango as string)
                        : new Date(m.fecha as string).toLocaleDateString() +
                        ' ' +
                        new Date(m.fecha as string).toLocaleTimeString(),
                ]],
                startY: currentY,
                theme: 'grid',
                styles: {
                    cellWidth: 181,
                    halign: 'center',
                },
                columnStyles: {
                    0: { cellWidth: 80 }, // Columna 1 (Valor)
                    1: { cellWidth: 101 } // Columna 2 (Fecha o Rango)
                }
            });

            currentY = (doc as any).lastAutoTable.finalY + 1;
        });

        // --- Pie de página (último paso) ---
        const totalPages = (doc as any).internal?.getNumberOfPages?.() || 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(i, totalPages);
        }

        // doc.save('reporte-mediciones.pdf');
        const pdfBlob = doc.output('blob'); // genera el archivo en memoria
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl); // abre el PDF en otra pestaña
    }

    async generarPDFs(
        dispositivos: Dispositivo[],
        chartCanvas0: ElementRef<HTMLCanvasElement>,
        promediar: boolean = true
    ) {
        const doc = new jsPDF('p', 'mm', 'a4') as jsPDF & {
            lastAutoTable?: any;
            getNumberOfPages?: () => number;
        };

        const fechaGeneracion = new Date();
        const fechaTexto = fechaGeneracion.toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short',
        });

        const addHeader = async () => {
            const logoBase64 = await this.getBase64ImageFromUrl('assets/logo.jpeg');
            doc.addImage(logoBase64, 'JPEG', 10, 8, 20, 20);
            doc.setFontSize(14);
            doc.text('Nueva Naturaleza', 40, 15);
            doc.setFontSize(10);
            doc.text(`Generado el: ${fechaTexto}`, 150, 15);
            doc.line(0, 30, 250, 30);
        };

        const addFooter = (pageNumber: number, totalPages: number) => {
            doc.setFontSize(9);
            doc.text(`Página ${pageNumber} de ${totalPages}`, 10, doc.internal.pageSize.getHeight() - 10);
            doc.text(
                `Equipo de desarrolladores del grupo de investigación GISTFA`,
                60,
                doc.internal.pageSize.getHeight() - 15
            );
            doc.text(
                `David Ricardo Contreras Espinosa y Jorge Iván Salazar Gómez`,
                60,
                doc.internal.pageSize.getHeight() - 10
            );
        };

        const colores = [
            {
                fondo: [93, 97, 99
                ] as [number, number, number], texto: [255, 255, 255] as [number, number, number]
            },
            { fondo: [169, 169, 169] as [number, number, number], texto: [255, 255, 255] as [number, number, number] },
            { fondo: [85, 153, 171] as [number, number, number], texto: [0, 0, 0] as [number, number, number] },
        ];

        let currentY = 40;
        await addHeader();

        for (const dispo of dispositivos) {
            if (dispo.sensors?.length == 0 || !dispo.sensors)
                continue;
            const sen = dispo.sensors[0]; // siempre hay 1 sensor
            const canvas = chartCanvas0.nativeElement;
            Chart.getChart(canvas)?.destroy();

            if (sen.medicions.length > 0) {
                const valores = sen.medicions.map((m) => m.valor);
                new Chart(canvas, {
                    type: 'line',
                    data: {
                        labels: sen.medicions.map(
                            (m) =>
                                new Date(m.fecha).toLocaleDateString().substring(0, new Date(m.fecha).toLocaleDateString().lastIndexOf('/')) +
                                ' ' +
                                new Date(m.fecha).toTimeString().substring(0, new Date(m.fecha).toTimeString().lastIndexOf(':'))
                        ),
                        datasets: [
                            {
                                label: sen.idTipoMUnidadMNavigation?.idTipoMedicionNavigation.nombre ?? 'S/N',
                                data: valores,
                                borderColor: '#733200',
                                fill: false,
                                tension: 0.3,
                                pointRadius: 0,
                                pointHoverRadius: 0,
                            },
                        ],
                    },
                    options: {
                        animation: false, plugins: {
                            legend: {
                                display: false, // 👈 oculta la leyenda completa
                            },
                            title: {
                                display: false, // por si acaso había título
                            },
                        }
                    }
                });
            }

            // --- Título del dispositivo ---
            if (currentY > doc.internal.pageSize.getHeight() - 40) {
                doc.addPage();
                currentY = 40;
                await addHeader();
            }

            doc.setFontSize(14); currentY += 8;
            doc.text(`${dispo.nombre} (${sen.idTipoMUnidadMNavigation?.idUnidadMedidaNavigation.nombre})`, 10, currentY);



            doc.line(10, currentY + 2, 200, currentY + 2);
            currentY += 8;

            // --- Insertar gráfico ---
            // --- Insertar gráfico ---
            const chartHeight = 80; // altura del gráfico
            const marginBottom = 20; // espacio extra por seguridad

            // 🔍 Verificar si hay espacio suficiente
            if (currentY + chartHeight + marginBottom > doc.internal.pageSize.getHeight()) {
                doc.addPage();
                currentY = 40;
                await addHeader();
            }

            const chartImg = canvas.toDataURL('image/png');
            doc.addImage(chartImg, 'PNG', 10, currentY, 180, chartHeight);
            currentY += chartHeight + 10;


            // --- Tabla de datos ---
            let mediciones = sen.medicions;
            let datosFinales: { fecha?: string; valor: number | string; rango?: string }[] = [];

            if (promediar && mediciones.length > 100) {
                const bloque = Math.ceil(mediciones.length / 100);
                for (let i = 0; i < mediciones.length; i += bloque) {
                    const grupo = mediciones.slice(i, i + bloque);
                    const promedio = grupo.reduce((acc, m) => acc + m.valor, 0) / grupo.length;
                    datosFinales.push({
                        valor: promedio.toFixed(2),
                        rango: `${new Date(grupo[0].fecha).toLocaleString()} - ${new Date(grupo[grupo.length - 1].fecha).toLocaleString()}`,
                    });
                }
            } else {
                datosFinales = mediciones.map((m) => ({
                    valor: m.valor,
                    fecha: m.fecha,
                }));
            }

            let lastDate = '';
            let colorIndex = 0;

            for (const m of datosFinales) {
                if (currentY > doc.internal.pageSize.getHeight() - 40) {
                    doc.addPage();
                    currentY = 40;
                    await addHeader();
                }

                const fechaActual = new Date(m.fecha as string).toLocaleDateString();
                const color = colores[colorIndex % colores.length];

                if (fechaActual !== lastDate) {
                    autoTable(doc, {
                        head: [[` Fecha: ${fechaActual}`]],
                        theme: 'plain',
                        styles: {
                            cellWidth: 181,
                            fillColor: color.fondo,
                            textColor: color.texto,
                            fontSize: 12,
                            halign: 'center',
                            cellPadding: 5,
                        },
                        startY: currentY,
                    });
                    currentY = (doc as any).lastAutoTable.finalY + 2;

                    autoTable(doc, {
                        head: [[promediar ? 'Valor Promediado' : 'Valor', promediar ? 'Rango de Fechas' : 'Fecha']],
                        startY: currentY,
                        theme: 'grid',
                        styles: {
                            cellWidth: 90.5,
                            fillColor: colores[2].fondo,
                            halign: 'center',
                        },
                    });
                    currentY = (doc as any).lastAutoTable.finalY + 2;

                    lastDate = fechaActual;
                    colorIndex++;
                }

                autoTable(doc, {
                    body: [
                        [
                            m.valor,
                            promediar
                                ? (m.rango as string)
                                : new Date(m.fecha as string).toLocaleDateString() +
                                ' ' +
                                new Date(m.fecha as string).toLocaleTimeString(),
                        ],
                    ],
                    startY: currentY,
                    theme: 'grid',
                    styles: {
                        cellWidth: 181,
                        halign: 'center',
                    },
                    columnStyles: {
                        0: { cellWidth: 80 },
                        1: { cellWidth: 101 },
                    },
                });

                currentY = (doc as any).lastAutoTable.finalY + 2;
            }

            // espacio entre dispositivos
            currentY += 15;
            if (currentY > doc.internal.pageSize.getHeight() - 40) {
                doc.addPage();
                currentY = 40;
                await addHeader();
            }
        }

        // --- Pie de página ---
        const totalPages = (doc as any).internal?.getNumberOfPages?.() || 1;
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            addFooter(i, totalPages);
        }

        // --- Abrir PDF ---
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl);
    }


    private getBase64ImageFromUrl(url: string): Promise<string> {
        return fetch(url)
            .then((response) => response.blob())
            .then(
                (blob) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    })
            );
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
            { text: "", colSpan: 2, bold: true, alignment: "center", },
            {}
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
            ], [

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
