import { Component, signal } from '@angular/core';
import { Client } from '@gradio/client';
import { ToggleService } from '../../services/toggle.service';

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
}
