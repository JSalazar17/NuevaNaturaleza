import { Component, signal } from '@angular/core';
import { Client } from '@gradio/client';
import { ToggleService } from '../../services/toggle.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-analyzer',
  standalone: true,
  templateUrl: './iac.html',
  styleUrls: ['./iac.css']
})
export class Iac {
  inputImage = signal<string | null>(null);
  outputImage = signal<string | null>(null);
  recommendations = signal<string[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  /**
   *
   */
  constructor(
    private toggleService: ToggleService
  ) {


  }
  // 📸 Seleccionar imagen con clic en el panel
  onImageClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async (event: any) => {
      const file = event.target.files?.[0];
      if (!file) return;

      this.error.set(null);
      this.outputImage.set(null);
      this.recommendations.set([]);

      const reader = new FileReader();
      reader.onload = () => {
        this.inputImage.set(reader.result as string);
      };
      reader.readAsDataURL(file);

      // ✅ Permite volver a seleccionar la misma imagen si se desea
      event.target.value = '';
    };

    input.click();
  }

  // 🚀 Enviar imagen al modelo en Hugging Face
  async analyze() {
    const imageData = this.inputImage();
    if (!imageData) {
      this.toggleService.show('Debe ingresar una imagen adecuada', 'warning')

      return
    };

    this.loading.set(true);
    this.error.set(null);
    this.outputImage.set(null);
    this.recommendations.set([]);

    try {
      this.toggleService.show('Analizando ', 'loading')
      const client = await Client.connect('57r0ll3r/iaproyect');

      // Convertir Base64 a Blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      // Llamada al endpoint del modelo
      const result: any = await client.predict('/run_inference', {
        image_pil: blob
      });

      console.log('✅ Resultado recibido:', result);

      /**
       * Formato esperado:
       * {
       *   data: [
       *     { url: "https://.../image.webp", ... },
       *     "Texto con recomendaciones..."
       *   ]
       * }
       */

      const data = result?.data;
      if (Array.isArray(data) && data.length === 2) {
        const imageUrl = data[0]?.url;
        const text = data[1];

        this.outputImage.set(imageUrl || null);

        if (typeof text === 'string') {
          // Divide en líneas y elimina vacíos
          let cause = 0;
          let recomendai = 0;
          this.recommendations.set(
            text.split('\n').filter(line => {
              if (line.trim().length > 0) {
                if (line.includes("ausa:")) {
                  if (cause != 0)
                    return false
                  
                  cause = 1;
                }
                if (line.includes("Recomendación")) {
                  if (recomendai != 0)
                    return false
                  
                  recomendai = 1;
                }
              }
              return line.trim().length > 0
            })
          );
          if(this.recommendations().length>0){
            
      this.toggleService.show('Diagnostico confirmado, dirigase al apartado inferior', 'success')
          }
        }
      } else {
        this.error.set('Formato de respuesta inesperado del modelo.');
      }
    } catch (err) {
      console.error('❌ Error:', err);
      this.error.set('Hubo un problema al analizar la imagen.');
    } finally {
      this.loading.set(false);
    }
  }

    private async getBase64Image(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async imprimirDiagnostico() {
  if (!this.inputImage() || !this.outputImage() || this.recommendations().length === 0) {
    this.toggleService.show('No hay diagnóstico para imprimir', 'warning');
    return;
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(16);
  doc.text('Diagnóstico por Inteligencia Artificial', pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  doc.setFontSize(12);
  doc.text('Imagen de entrada', 10, y);
  y += 5;
  const inputImg = await this.getBase64Image(this.inputImage()!);
  doc.addImage(inputImg, 'PNG', 10, y, 80, 60);

  doc.text('Imagen procesada por IA', 110, y - 5);
  const outputImg = await this.getBase64Image(this.outputImage()!);
  doc.addImage(outputImg, 'PNG', 110, y, 80, 60);

  y += 70;
  doc.setFontSize(12);
  doc.text('Diagnóstico y recomendaciones', 10, y);
  y += 8;

  doc.setFontSize(10);
  this.recommendations().forEach(r => {
    const lines = doc.splitTextToSize(`• ${r}`, 180);
    if (y + lines.length * 5 > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, 10, y);
    y += lines.length * 5 + 2;
  });

  const blob = doc.output('blob');
  window.open(URL.createObjectURL(blob));
}


}
