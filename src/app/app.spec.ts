import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app';
import { DataService } from './data.service';
import { signal } from '@angular/core';
import { Question } from './models';

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
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        { provide: DataService, useClass: MockDataService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService) as unknown as MockDataService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should disable save button if question text is empty', () => {
      component.newQText = '   ';
      component.newQType = 'open';
      expect(component.isSaveDisabled).toBe(true);
    });

    it('should disable save button if multiple choice has less than 2 options', () => {
      component.newQText = 'Valid text';
      component.newQType = 'multiple';
      component.newQOptions = 'Option 1'; 
      expect(component.isSaveDisabled).toBe(true);
      
      component.newQOptions = 'Option 1, Option 2'; 
      expect(component.isSaveDisabled).toBe(false);
    });
  });

  describe('Adding Questions', () => {
    it('should add a valid open question and reset form', () => {
      component.newQText = 'What is 2+2?';
      component.newQType = 'open';
      component.addQuestion();

      expect(dataService.questions().length).toBe(1);
      expect(dataService.questions()[0].text).toBe('What is 2+2?');
      expect(dataService.questions()[0].type).toBe('open');
      expect(component.newQText).toBe(''); 
    });

    it('should add multiple choice question and parse options properly', () => {
      component.newQText = 'Colors?';
      component.newQType = 'multiple';
      component.newQOptions = 'Red, Blue , Green,'; 
      component.addQuestion();

      expect(dataService.questions()[0].options).toEqual(['Red', 'Blue', 'Green']);
    });
  });

  describe('Exam Assembly', () => {
    it('should toggle selection of questions', () => {
      const q: Question = { id: '1', text: 'Test', type: 'open' };
      
      component.toggleExamQuestion(q);
      expect(component.selectedQuestions.length).toBe(1);
      expect(component.isSelected(q)).toBe(true);

      component.toggleExamQuestion(q);
      expect(component.selectedQuestions.length).toBe(0);
      expect(component.isSelected(q)).toBe(false);
    });

    it('should select all and deselect all', () => {
      dataService.questions.set([
        { id: '1', text: 'Q1', type: 'open' },
        { id: '2', text: 'Q2', type: 'open' }
      ]);
      
      component.selectAll();
      expect(component.selectedQuestions.length).toBe(2);
      
      component.selectAll();
      expect(component.selectedQuestions.length).toBe(0);
    });
  });
});
