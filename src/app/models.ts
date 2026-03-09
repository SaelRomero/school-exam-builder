export interface Question { id: string; text: string; type: 'open' | 'multiple'; options?: string[]; }
export interface Exam { title: string; instructions: string; questions: Question[]; }
