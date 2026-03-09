export interface Question { id: string; text: string; type: 'open' | 'multiple'; options?: string[]; answer?: string; }
export interface Exam { title: string; instructions: string; questions: Question[]; }
