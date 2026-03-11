import { Component, inject, signal } from '@angular/core';
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
  examQuestions = signal<Question[]>([]);
  
  newQText = '';
  newQType: 'open' | 'multiple' = 'open';
  newQOptions = '';
  newQAnswer = '';
  showAnswersInPdf = false;

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
      options: options.length > 0 ? options : undefined,
      answer: this.newQAnswer.trim() || undefined
    };
    
    this.examQuestions.set([...this.examQuestions(), q]);
    this.newQText = '';
    this.newQOptions = '';
    this.newQAnswer = '';
    this.showToast('Pregunta añadida manualmente.');
  }

  
  
  updateQuestionText(id: string, event: Event) {
    const newText = (event.target as HTMLElement).innerText.trim();
    if (newText) {
      const updated = this.examQuestions().map(q => q.id === id ? { ...q, text: newText } : q);
      this.examQuestions.set(updated);
    }
  }

  updateQuestionAnswer(id: string, event: Event) {
    const newAnswer = (event.target as HTMLElement).innerText.trim();
    if (newAnswer) {
      const updated = this.examQuestions().map(q => q.id === id ? { ...q, answer: newAnswer } : q);
      this.examQuestions.set(updated);
    }
  }


  
  toggleQuestionType(q: Question) {
    const newType = q.type === 'open' ? 'multiple' : 'open';
    let newOptions = q.options;
    
    // Si la convertimos a multiple y no tiene opciones, le generamos unas falsas temporales
    if (newType === 'multiple' && (!q.options || q.options.length === 0)) {
      newOptions = [q.answer || 'Opción A', 'Opción B', 'Opción C'];
    }

    const updated = this.examQuestions().map(item => 
      item.id === q.id ? { ...item, type: newType, options: newType === 'open' ? undefined : newOptions } : item
    );
    this.examQuestions.set(updated);
    this.showToast('Tipo de pregunta cambiado');
  }

  async regenerateQuestion(q: Question) {
    this.isGenerating.set(true);
    this.showToast('Regenerando pregunta con IA...');
    
    const prompt = `Improve, rewrite or generate a better version of this exam question. The output must be valid JSON in this exact format. 
DO NOT USE MARKDOWN BLOCK QUOTES AROUND THE JSON. NO OTHER TEXT. JUST RAW JSON.
Format:
{ "text": "The actual question", "type": "${q.type}", "options": ["opt1", "opt2", "opt3"], "answer": "The correct answer" }

Original Question: "${q.text}"`;

    try {
      const response = await fetch('/api/ollama/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-oss:20b-cloud',
          prompt: prompt,
          stream: false,
          format: 'json'
        })
      });

      const data = await response.json();
      let newQ = JSON.parse(data.response);
      
      const updated = this.examQuestions().map(item => 
        item.id === q.id ? { ...item, text: newQ.text, answer: newQ.answer, options: newQ.type === 'multiple' ? newQ.options : undefined } : item
      );
      this.examQuestions.set(updated);
      this.showToast('Pregunta regenerada con éxito');
    } catch (e) {
      console.error(e);
      this.showToast('Error al regenerar pregunta. Intenta de nuevo.');
    } finally {
      this.isGenerating.set(false);
    }
  }

  removeQuestion(id: string) {
    this.examQuestions.set(this.examQuestions().filter(q => q.id !== id));
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
    "options": [],
    "answer": "Respuesta correcta aquí"
  },
  {
    "text": "¿Pregunta múltiple?",
    "type": "multiple",
    "options": ["Opcion 1", "Opcion 2"],
    "answer": "Opcion 1"
  }
]`;

    const payload = {
      model: 'gpt-oss:20b-cloud',
      prompt: prompt,
      stream: false,
      format: 'json'
    };

    this.http.post<any>('/api/ollama/api/generate', payload).pipe(timeout(35000)).subscribe({
      next: (response) => {
        try {
          // Si por el Content-Type text/plain Angular no lo parseó como objeto, lo hacemos manual.
          const resObj = typeof response === 'string' ? JSON.parse(response) : response;
          const rawResponse = resObj.response;
          
          if (!rawResponse) {
             throw new Error("No se encontró la propiedad 'response' en el JSON devuelto por Ollama");
          }
          
          let jsonStr = rawResponse;
          // Safari Regex Fix: Eliminamos regex codicioso y usamos substrings directos para evitar cuelgues.
          const startIdx = jsonStr.indexOf('[');
          const endIdx = jsonStr.lastIndexOf(']');
          
          if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1);
          } else {
            throw new Error("No se encontraron corchetes de arreglo en la respuesta de la IA.");
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
                   options: isMultiple ? q.options : undefined,
                   answer: q.answer
                 };
                 this.examQuestions.set([...this.examQuestions(), newQ]);
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
        } catch (e: any) {
          console.error("Error parseando respuesta de IA:", e);
          this.aiError = 'Error interpretando (JS): ' + (e.message || e.toString()) + ' | Texto crudo: ' + (response ? JSON.stringify(response).substring(0, 50) : 'vacio');
        }
        this.isGenerating = false;
      },
      error: (err: any) => {
        console.error("Error de red con Ollama:", err);
        this.aiError = 'Falló la conexión o la petición tardó demasiado (Timeout). Error: ' + (err.message || 'Desconocido');
        this.isGenerating = false;
      }
    });
  }

  exportExam(withAnswers: boolean = false) {
    if (this.examQuestions().length === 0) return;
    this.showAnswersInPdf = withAnswers;
    setTimeout(() => {
    
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
    }, 100);
  }
}
