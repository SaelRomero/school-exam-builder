import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CristobalColonHeaderComponent } from './header/cristobal-colon-header.component';
import { CristobalColonBodyComponent } from './body/cristobal-colon-body.component';
import { Question } from '../../models';

@Component({
  selector: 'app-cristobal-colon-format',
  standalone: true,
  imports: [CommonModule, CristobalColonHeaderComponent, CristobalColonBodyComponent],
  template: `
    <div style="width: 100%; max-width: 800px; box-sizing: border-box; padding: 0; background: white; color: black; font-family: 'Times New Roman', Times, serif;">
      <app-cristobal-colon-header 
        [examTitle]="examTitle" 
        [examInstructions]="examInstructions"
        [teacherName]="teacherName"
        [examPeriod]="examPeriod"
        [examGradeOrSemester]="examGradeOrSemester">
      </app-cristobal-colon-header>
      <app-cristobal-colon-body [questions]="questions" [showAnswersInPdf]="showAnswersInPdf"></app-cristobal-colon-body>
    </div>
  `
})
export class CristobalColonFormatComponent {
  @Input() examTitle = '';
  @Input() examInstructions = '';
  @Input() teacherName = '';
  @Input() examPeriod = '';
  @Input() examGradeOrSemester = '';
  @Input() questions: Question[] = [];
  @Input() showAnswersInPdf = false;
}