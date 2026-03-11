import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models';

@Component({
  selector: 'app-standard-body',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      @for (q of questions; track q.id; let i = $index) {
        <div class="question-block" style="display: block; margin-bottom: 25px; break-inside: avoid; page-break-inside: avoid; width: 100%; box-sizing: border-box;">
          <p style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; line-height: 1.4; text-align: left; word-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
            {{i + 1}}. {{q.text}}
          </p>
          
          @if (q.type === 'open') {
            <div style="margin-top: 15px; width: 100%;">
              <div style="border-bottom: 1px solid #4b5563; height: 30px; margin-bottom: 5px; width: 100%;"></div>
              <div style="border-bottom: 1px solid #4b5563; height: 30px; margin-bottom: 5px; width: 100%;"></div>
              <div style="border-bottom: 1px solid #4b5563; height: 30px; width: 100%;"></div>
            </div>
          }
          @if (showAnswersInPdf && q.answer) {
            <div style="margin-top: 10px; color: #166534; font-size: 14px; font-weight: bold; background-color: #f0fdf4; padding: 5px 10px; border: 1px solid #bbf7d0; border-radius: 4px;">
              Respuesta: {{q.answer}}
            </div>
          }
          
          @if (q.type === 'multiple' && q.options) {
            <div style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px; padding-left: 10px;">
              @for (opt of q.options; track opt; let j = $index) {
                <div style="display: flex; align-items: flex-start; gap: 12px; word-wrap: break-word;">
                  <div style="width: 16px; height: 16px; border: 2px solid #000; border-radius: 50%; flex-shrink: 0; margin-top: 2px;"></div>
                  <span style="font-size: 14px; font-weight: bold; width: 22px; flex-shrink: 0;">{{ ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'][j] || '○' }}</span>
                  <span style="font-size: 14px; line-height: 1.4; word-wrap: break-word; word-break: break-word; flex-grow: 1;">{{opt}}</span>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class StandardBodyComponent {
  @Input() questions: Question[] = [];
  @Input() showAnswersInPdf = false;
}
