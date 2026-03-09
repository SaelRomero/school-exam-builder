import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { Question } from './models';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html'
})
export class AppComponent {
  data = inject(DataService);
  http = inject(HttpClient);
  activeTab = 'bank';
  
  newQText = '';
  newQType: 'open' | 'multiple' = 'open';
  newQOptions = '';

  aiTopic = '';
  aiQuantity = 3;
  isGenerating = false;
  aiError = '';

  examTitle = 'Examen de Evaluación';
  examInstructions = 'Lee con atención cada una de las preguntas y responde claramente en el espacio indicado. No se permiten tachaduras.';
  selectedQuestions: Question[] = [];

  get isSaveDisabled(): boolean {
    const isTextEmpty = !this.newQText || !this.newQText.trim();
    if (this.newQType === 'open') return isTextEmpty;
    
    const options = this.newQOptions ? this.newQOptions.split(',').map(o => o.trim()).filter(o => o.length > 0) : [];
    return isTextEmpty || options.length < 2;
  }

  addQuestion() {
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
    
    this.data.addQuestion(q);
    this.newQText = '';
    this.newQOptions = '';
  }

  generateAIQuestions() {
    if (!this.aiTopic.trim() || this.aiQuantity < 1) return;
    
    this.isGenerating = true;
    this.aiError = '';

    const prompt = `Actúa como un profesor experto. Genera exactamente ${this.aiQuantity} preguntas sobre el tema "${this.aiTopic}". 
Devuelve ÚNICAMENTE un JSON válido con este arreglo:
[
  {
    "text": "Texto de la pregunta",
    "type": "open",
    "options": []
  },
  {
    "text": "Texto de la pregunta de opcion multiple",
    "type": "multiple",
    "options": ["opcion1", "opcion2", "opcion3"]
  }
]
No incluyas markdown (como \`\`\`json), ni explicaciones ni texto adicional fuera del JSON crudo. Solo el arreglo de objetos.`;

    const payload = {
      model: 'qwen3.5:397b-cloud',
      prompt: prompt,
      stream: false,
      format: 'json'
    };

    this.http.post<any>('/api/ollama/api/generate', payload).subscribe({
      next: (response) => {
        try {
          const rawResponse = response.response;
          const generatedQuestions = JSON.parse(rawResponse);
          
          if (Array.isArray(generatedQuestions)) {
            generatedQuestions.forEach((q: any) => {
               if (q.text && q.type) {
                 const isMultiple = q.type === 'multiple' || (Array.isArray(q.options) && q.options.length > 1);
                 const newQ: Question = {
                   id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                   text: q.text,
                   type: isMultiple ? 'multiple' : 'open',
                   options: isMultiple ? q.options : undefined
                 };
                 this.data.addQuestion(newQ);
               }
            });
            this.aiTopic = '';
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

  isSelected(q: Question): boolean {
    return this.selectedQuestions.some(sq => sq.id === q.id);
  }

  toggleExamQuestion(q: Question) {
    if (this.isSelected(q)) {
      this.selectedQuestions = this.selectedQuestions.filter(sq => sq.id !== q.id);
    } else {
      this.selectedQuestions.push(q);
    }
  }

  selectAll() {
    const allQuestions = this.data.questions();
    if (this.selectedQuestions.length === allQuestions.length) {
      this.selectedQuestions = []; 
    } else {
      this.selectedQuestions = [...allQuestions]; 
    }
  }

  printExam() {
    if (this.selectedQuestions.length === 0) return;
    
    const element = document.getElementById('exam-content');
    if (!element) {
      window.print();
      return;
    }

    const opt = {
      margin:       15,
      filename:     `${this.examTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' as const }
    };

    element.style.display = 'block';
    
    html2pdf().set(opt).from(element).save().then(() => {
      element.style.display = 'none';
    }).catch((err: any) => {
      console.error('Error al generar PDF:', err);
      element.style.display = 'none';
      window.print();
    });
  }
}
