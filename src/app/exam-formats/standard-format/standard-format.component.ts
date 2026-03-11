import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandardHeaderComponent } from './header/standard-header.component';
import { StandardBodyComponent } from './body/standard-body.component';
import { Question } from '../../models';

@Component({
  selector: 'app-standard-format',
  standalone: true,
  imports: [CommonModule, StandardHeaderComponent, StandardBodyComponent],
  template: `
    <div style="width: 100%; max-width: 800px; box-sizing: border-box; padding: 15px 20px; background: white; color: black; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <app-standard-header [examTitle]="examTitle" [examInstructions]="examInstructions"></app-standard-header>
      <app-standard-body [questions]="questions" [showAnswersInPdf]="showAnswersInPdf"></app-standard-body>
    </div>
  `
})
export class StandardFormatComponent {
  @Input() examTitle = '';
  @Input() examInstructions = '';
  @Input() questions: Question[] = [];
  @Input() showAnswersInPdf = false;
}
