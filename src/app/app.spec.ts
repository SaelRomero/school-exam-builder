import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Manual Flow', () => {
    it('should add manual question and show toast', () => {
      component.newQText = 'Manual question?';
      component.newQType = 'open';
      component.addManualQuestion();

      expect(component.examQuestions.length).toBe(1);
      expect(component.examQuestions[0].text).toBe('Manual question?');
      expect(component.toastMessage).toContain('manualmente');
    });

    it('should remove question', () => {
      component.newQText = 'Q1';
      component.newQType = 'open';
      component.addManualQuestion();

      expect(component.examQuestions.length).toBe(1);
      const id = component.examQuestions[0].id;
      component.removeQuestion(id);
      expect(component.examQuestions.length).toBe(0);
    });
  });
});
