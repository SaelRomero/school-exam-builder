import { Injectable, signal } from '@angular/core';
import { Question } from './models';

@Injectable({ providedIn: 'root' })
export class DataService {
  questions = signal<Question[]>(this.loadQuestions());

  private loadQuestions(): Question[] {
    const data = localStorage.getItem('questions');
    return data ? JSON.parse(data) : [];
  }

  addQuestion(q: Question) {
    const updated = [...this.questions(), q];
    this.questions.set(updated);
    localStorage.setItem('questions', JSON.stringify(updated));
  }

  
  updateQuestion(id: string, partialUpdate: Partial<Question>) {
    const updated = this.questions().map(q => q.id === id ? { ...q, ...partialUpdate } : q);
    this.questions.set(updated);
    localStorage.setItem('questions', JSON.stringify(updated));
  }

  deleteQuestion(id: string) {
    const updated = this.questions().filter(q => q.id !== id);
    this.questions.set(updated);
    localStorage.setItem('questions', JSON.stringify(updated));
  }
}
