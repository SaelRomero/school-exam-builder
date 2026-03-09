import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { DataService } from './data.service';
import { signal } from '@angular/core';
import { Question } from './models';

// Mock DataService
class MockDataService {
  questions = signal<Question[]>([]);
  addQuestion(q: Question) {
    this.questions.set([...this.questions(), q]);
  }
  deleteQuestion(id: string) {
    this.questions.set(this.questions().filter(q => q.id !== id));
  }
}

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let dataService: MockDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: DataService, useClass: MockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as unknown as MockDataService;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should add a valid open question', () => {
    component.newQText = 'What is 2+2?';
    component.newQType = 'open';
    component.addQuestion();

    expect(dataService.questions().length).toBe(1);
    expect(dataService.questions()[0].text).toBe('What is 2+2?');
    expect(component.newQText).toBe(''); // Should reset
  });

  it('should not add an empty question', () => {
    component.newQText = '   ';
    component.addQuestion();
    expect(dataService.questions().length).toBe(0);
  });

  it('should parse multiple choice options correctly', () => {
    component.newQText = 'Colors?';
    component.newQType = 'multiple';
    component.newQOptions = 'Red, Blue , Green,';
    component.addQuestion();

    const q = dataService.questions()[0];
    expect(q.options).toEqual(['Red', 'Blue', 'Green']);
  });

  it('should toggle selection of questions for the exam', () => {
    const q: Question = { id: '1', text: 'Test', type: 'open' };
    
    // Add to exam
    component.toggleExamQuestion(q);
    expect(component.selectedQuestions.length).toBe(1);
    expect(component.isSelected(q)).toBe(true);

    // Remove from exam
    component.toggleExamQuestion(q);
    expect(component.selectedQuestions.length).toBe(0);
    expect(component.isSelected(q)).toBe(false);
  });
});
