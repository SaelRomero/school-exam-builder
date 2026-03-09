import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { Question } from './models';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html'
})
export class AppComponent {
  http = inject(HttpClient);
  
  examTitle = '';
  examInstructions = 'Lee con atención cada una de las preguntas y responde claramente en el espacio indicado. No se permiten tachaduras.';
  examQuestions: Question[] = [];
  
  newQText = '';
  newQType: 'open' | 'multiple' = 'open';
  newQOptions = '';

  aiTopic = '';
  aiQuantity = 3;
  isGenerating = false;
  aiError = '';
  
  toastMessage = '';
  toastTimeout: any;

  get isSaveDisabled(): boolean {
    const isTextEmpty = !this.newQText || !this.newQText.trim();
    if (this.newQType === 'open') return isTextEmpty;
    
    const options = this.newQOptions ? this.newQOptions.split(',').map(o => o.trim()).filter(o => o.length > 0) : [];
    return isTextEmpty || options.length < 2;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toastMessage = '';
    }, 4000);
  }

  addManualQuestion() {
    if (this.isSaveDisabled) return;
    
    let options: string[] = [];
    if (this.newQType === 'multiple' && this.newQOptions) {
      options = this.newQOptions.split(',').map(o => o.trim()).filter(o => o.length > 0);
    }

    const q: Question = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      text: this.newQText.trim(),
      type: this.newQType,
      options: options.length > 0 ? options : undefined
    };
    
    this.examQuestions.push(q);
    this.newQText = '';
    this.newQOptions = '';
    this.showToast('Pregunta añadida manualmente.');
  }

  removeQuestion(id: string) {
    this.examQuestions = this.examQuestions.filter(q => q.id !== id);
  }

  generateAIQuestions() {
    if (!this.aiTopic.trim() || this.aiQuantity < 1) return;
    
    this.isGenerating = true;
    this.aiError = '';

    const prompt = `Actúa como un profesor experto. Genera exactamente ${this.aiQuantity} preguntas sobre el tema "${this.aiTopic}".

REGLA ESTRICTA E INQUEBRANTABLE:
Tu respuesta DEBE empezar con '[' y terminar con ']'.
Cero saludos. Cero despedidas. Cero explicaciones. Cero Markdown.
SOLO JSON CRUDO.

Formato:
[
  {
    "text": "¿Pregunta abierta?",
    "type": "open",
    "options": []
  },
  {
    "text": "¿Pregunta múltiple?",
    "type": "multiple",
    "options": ["Opcion 1", "Opcion 2"]
  }
]`;

    const payload = {
      model: 'minimax-m2.5:cloud',
      prompt: prompt,
      stream: false,
      format: 'json'
    };

    this.http.post<any>('/api/ollama/api/generate', payload).pipe(timeout(35000)).subscribe({
      next: (response) => {
        try {
          const rawResponse = response.response;
          let jsonStr = rawResponse;
          const startIdx = jsonStr.indexOf('[');
          const endIdx = jsonStr.lastIndexOf(']');
          if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1);
          }
          const generatedQuestions = JSON.parse(jsonStr);
          
          if (Array.isArray(generatedQuestions)) {
            let count = 0;
            generatedQuestions.forEach((q: any) => {
               if (q.text && q.type) {
                 const isMultiple = q.type === 'multiple' || (Array.isArray(q.options) && q.options.length > 1);
                 const newQ: Question = {
                   id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                   text: q.text,
                   type: isMultiple ? 'multiple' : 'open',
                   options: isMultiple ? q.options : undefined
                 };
                 this.examQuestions.push(newQ);
                 count++;
               }
            });
            this.aiTopic = '';
            if (count > 0) {
              this.showToast(`¡Completado! Se generaron ${count} preguntas con IA.`);
            }
          } else {
            throw new Error("Formato inválido: se esperaba un arreglo");
          }
        } catch (e) {
          console.error("Error parseando respuesta de IA:", e);
          this.aiError = 'Ocurrió un error interpretando la respuesta de la IA. Inténtalo de nuevo.';
        }
        this.isGenerating = false;
      },
      error: (err) => {
        console.error("Error de red con Ollama:", err);
        this.aiError = 'Falló la conexión con el servidor de IA local. Verifica que Ollama esté corriendo.';
        this.isGenerating = false;
      }
    });
  }

  exportExam() {
    if (this.examQuestions.length === 0) return;
    
    const element = document.getElementById('exam-content');
    if (!element) {
      window.print();
      return;
    }

    const title = this.examTitle ? this.examTitle.trim().replace(/\s+/g, '_') : 'Examen';
    const opt = {
      margin:       15,
      filename:     `${title}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' as const }
    };

    element.style.display = 'block';
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
      this.showToast('El examen se exportó como PDF.');
    }).catch((err: any) => {
      console.error('Error al generar PDF:', err);
      element.style.display = 'none';
      window.print();
    });
  }
}
