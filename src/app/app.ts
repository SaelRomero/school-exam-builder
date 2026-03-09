import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './data.service';
import { Question } from './models';

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

  addQuestion() {
    if (!this.newQText.trim()) return;
    
    let options: string[] = [];
    if (this.newQType === 'multiple' && this.newQOptions.trim()) {
      options = this.newQOptions.split(',').map(o => o.trim()).filter(o => o.length > 0);
    }

    const q: Question = {
      id: Date.now().toString(),
      text: this.newQText.trim(),
      type: this.newQType,
      options: options.length > 0 ? options : undefined
    };
    
    this.data.addQuestion(q);
    
    // Reset form
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

  printExam() {
    window.print();
  }
}
