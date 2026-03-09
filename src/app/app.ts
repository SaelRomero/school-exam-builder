import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from './data.service';
import { Question } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  data = inject(DataService);
  activeTab = 'bank';
  
  newQText = '';
  newQType: 'open' | 'multiple' = 'open';
  newQOptions = '';

  examTitle = 'Examen Mensual';
  examInstructions = 'Lee con cuidado y responde.';
  selectedQuestions: Question[] = [];

  addQuestion() {
    if (!this.newQText) return;
    const q: Question = {
      id: Date.now().toString(),
      text: this.newQText,
      type: this.newQType,
      options: this.newQType === 'multiple' ? this.newQOptions.split(',').map(o => o.trim()) : []
    };
    this.data.addQuestion(q);
    this.newQText = '';
    this.newQOptions = '';
  }

  toggleExamQuestion(q: Question) {
    const exists = this.selectedQuestions.find(sq => sq.id === q.id);
    if (exists) {
      this.selectedQuestions = this.selectedQuestions.filter(sq => sq.id !== q.id);
    } else {
      this.selectedQuestions.push(q);
    }
  }

  printExam() {
    window.print();
  }
}
