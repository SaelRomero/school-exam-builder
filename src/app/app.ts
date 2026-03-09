import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  activeTab = 'bank';
  
  newQText = '';
  newQType: 'open' | 'multiple' = 'open';
  newQOptions = '';

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
    
    // Obtener el elemento a imprimir
    const element = document.getElementById('exam-content');
    if (!element) {
      // Fallback a la impresion clasica si falla
      window.print();
      return;
    }

    // Configuracion de html2pdf
    const opt = {
      margin:       15,
      filename:     `${this.examTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'letter', orientation: 'portrait' as const }
    };

    // Para que el CSS funcione bien al renderizar, mostramos el div temporalmente
    element.style.display = 'block';
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Ocultarlo de nuevo despues de generar el PDF
      element.style.display = 'none';
    }).catch((err: any) => {
      console.error('Error al generar PDF:', err);
      element.style.display = 'none';
      window.print(); // Fallback
    });
  }
}
