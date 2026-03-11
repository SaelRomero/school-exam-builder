import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { Question } from './models';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, NumberFormat, LevelFormat, AlignmentType } from 'docx';
import html2pdf from 'html2pdf.js';
import { StandardFormatComponent } from './exam-formats/standard-format/standard-format.component';
import { CristobalColonFormatComponent } from './exam-formats/cristobal-colon-format/cristobal-colon-format.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, StandardFormatComponent, CristobalColonFormatComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  http = inject(HttpClient);
  
  examTitle = '';
  examInstructions = 'Lee con atención cada una de las preguntas y responde claramente en el espacio indicado. No se permiten tachaduras.';
  teacherName = '';
  examPeriod = '';
  examGradeOrSemester = '';
  examQuestions = signal<Question[]>([]);
  
  newQText = '';
  newQType: 'open' | 'multiple' = 'open';
  newQOptions = '';
  newQAnswer = '';
  showAnswersInPdf = false;
  selectedFormat: 'standard' | 'cristobal_colon' = 'standard';

  aiTopic = '';
  aiQuantity = 3;
  aiLanguage = 'Spanish';
  aiDifficulty = 'medium';
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

  
  updateQuestionOption(id: string, optionIndex: number, event: Event) {
    const newOption = (event.target as HTMLElement).innerText.trim();
    if (newOption) {
      const updated = this.examQuestions().map(q => {
        if (q.id === id && q.options) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = newOption;
          return { ...q, options: newOptions };
        }
        return q;
      });
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
    const newType: "open" | "multiple" = q.type === 'open' ? 'multiple' : 'open';
    let newOptions = q.options;
    
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
    this.isGenerating = true;
    this.showToast('Regenerando pregunta con IA...');
    
    const prompt = `You are an expert exam teacher.
Generate a COMPLETELY NEW exam question related to the topic: "${this.aiTopic}"
Language of the exam: "${this.aiLanguage}"
Difficulty level: "${this.aiDifficulty}"

The new question must:
- be different from the original
- test a different concept within the topic
- not paraphrase the original question

Keep the same question type: "${q.type}"

The question, options, and answer MUST be written entirely in: "${this.aiLanguage}".
Never mix languages.

If multiple choice:
- 3 or 4 options
- only one correct answer
- distractors must be plausible
- options should have similar length

Return ONLY raw JSON. Do NOT include explanations, markdown, or text outside the JSON.

Format:
{
  "text": "New question",
  "type": "${q.type}",
  "options": ["opt1", "opt2", "opt3", "opt4"],
  "answer": "correct option"
}

Old Question to replace: "${q.text}"`;

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
      this.isGenerating = false;
    }
  }

  removeQuestion(id: string) {
    this.examQuestions.set(this.examQuestions().filter(q => q.id !== id));
  }

  generateAIQuestions() {
    if (!this.aiTopic.trim() || this.aiQuantity < 1) return;
    
    this.isGenerating = true;
    this.aiError = '';

    const prompt = `Actúa como un profesor experto que crea exámenes escolares.
Tema del examen: "${this.aiTopic}"
Idioma del examen: "${this.aiLanguage}"
Nivel de dificultad: "${this.aiDifficulty}"

Genera exactamente ${this.aiQuantity} preguntas.

Reglas pedagógicas:
- Evaluar comprensión real del tema y cubrir diferentes aspectos.
- Evitar ambigüedad y trivialidades.
- No repetir la misma estructura de pregunta.
- Evitar generar preguntas duplicadas. Cada pregunta debe evaluar un concepto distinto.

Reglas de idioma:
Todas las preguntas, opciones y respuestas deben estar completamente en el idioma especificado: "${this.aiLanguage}".
Nunca mezclar idiomas dentro del mismo examen.

Reglas para preguntas de opción múltiple (type: multiple):
- Entre 3 y 4 opciones con longitud similar.
- Solo una opción correcta.
- Las otras deben ser distractores plausibles. Evitar distractores absurdos o demasiado obvios.

Reglas para preguntas abiertas (type: open):
- La respuesta esperada debe ser corta.
- No generar párrafos. Debe ser fácil de evaluar.

Regla estricta de formato de salida:
La respuesta DEBE comenzar con '[' y terminar con ']'.
Cero saludos, explicaciones, markdown o bloques de código. SOLO JSON CRUDO VÁLIDO.
Asegúrate de que no hay comas sobrantes y las listas están correctamente cerradas.

Formato obligatorio de salida:
[
  {
    "text": "¿Pregunta abierta?",
    "type": "open",
    "options": [],
    "answer": "respuesta correcta corta"
  },
  {
    "text": "¿Pregunta de opción múltiple?",
    "type": "multiple",
    "options": ["opcion 1", "opcion 2", "opcion 3", "opcion 4"],
    "answer": "opcion correcta"
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

  
  async exportWord() {
    this.showToast('Generando archivo Word...');
    
    const children: any[] = [];
    
    children.push(new Paragraph({
      text: this.examTitle || 'Examen Sin Título',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    if (this.examInstructions) {
      children.push(new Paragraph({
        text: this.examInstructions,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }));
    }

    this.examQuestions().forEach((q, index) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${index + 1}. `, bold: true }),
          new TextRun({ text: q.text })
        ],
        spacing: { before: 400, after: 200 }
      }));

      if (q.type === 'multiple' && q.options) {
        const letters = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'];
        q.options.forEach((opt, optIdx) => {
          children.push(new Paragraph({
            text: `   ${letters[optIdx] || '○'} ${opt}`,
            spacing: { before: 100, after: 100 }
          }));
        });
      } else {
        for (let i = 0; i < 3; i++) {
          children.push(new Paragraph({
            text: "___________________________________________________________________________",
            spacing: { before: 200, after: 200 }
          }));
        }
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.examTitle || 'Examen'}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Descarga completada');
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
      margin: [10, 15, 10, 15] as [number, number, number, number],
      filename:     `${title}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'], avoid: '.question-block' }
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
