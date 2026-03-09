import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Manual Flow', () => {
    it('should add manual question and show toast', () => {
      component.newQText = 'Manual question?';
      component.newQType = 'open';
      component.addManualQuestion();

      expect(component.examQuestions().length).toBe(1);
      expect(component.examQuestions()[0].text).toBe('Manual question?');
      expect(component.toastMessage).toContain('manualmente');
    });
  });

  describe('AI Generation', () => {
    it('should not generate if topic is empty', () => {
      component.aiTopic = '   ';
      component.generateAIQuestions();
      expect(component.isGenerating).toBe(false);
    });

    it('should parse valid AI JSON response and add questions', () => {
      component.aiTopic = 'Matemáticas';
      component.aiQuantity = 2;
      component.generateAIQuestions();
      
      expect(component.isGenerating).toBe(true);

      const req = httpMock.expectOne('/api/ollama/api/generate');
      expect(req.request.method).toBe('POST');
      
      // Simulate successful AI JSON response
      const mockResponse = {
        response: `[
          { "text": "Q1", "type": "open", "options": [] },
          { "text": "Q2", "type": "multiple", "options": ["A", "B"] }
        ]`
      };
      
      req.flush(mockResponse);

      expect(component.isGenerating).toBe(false);
      expect(component.examQuestions().length).toBe(2);
      expect(component.examQuestions()[0].text).toBe('Q1');
      expect(component.examQuestions()[1].text).toBe('Q2');
      expect(component.toastMessage).toContain('generaron 2');
    });

    it('should strip markdown and parse AI response', () => {
      component.aiTopic = 'Física';
      component.generateAIQuestions();
      
      const req = httpMock.expectOne('/api/ollama/api/generate');
      
      // Simulate response wrapped in markdown block
      const mockResponse = {
        response: "Here are the questions:\n[\n{ \"text\": \"Gravity?\", \"type\": \"open\" }\n]\nEnjoy!"
      };
      
      req.flush(mockResponse);

      expect(component.isGenerating).toBe(false);
      expect(component.examQuestions().length).toBe(1);
      expect(component.examQuestions()[0].text).toBe('Gravity?');
    });

    it('should handle network error gracefully', () => {
      component.aiTopic = 'Química';
      component.generateAIQuestions();
      
      const req = httpMock.expectOne('/api/ollama/api/generate');
      req.error(new ProgressEvent('Network error'));

      expect(component.isGenerating).toBe(false);
      expect(component.aiError).toContain('Falló la conexión');
    });

    it('should handle invalid JSON gracefully', () => {
      component.aiTopic = 'Historia';
      component.generateAIQuestions();
      
      const req = httpMock.expectOne('/api/ollama/api/generate');
      req.flush({ response: 'Lo siento, no puedo procesar esto' });

      expect(component.isGenerating).toBe(false);
      expect(component.aiError).toContain('Error interpretando');
    });
  });
});
