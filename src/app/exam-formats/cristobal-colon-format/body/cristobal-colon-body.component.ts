import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models';

@Component({
  selector: 'app-cristobal-colon-body',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="font-family: 'Times New Roman', Times, serif;">
      @for (q of questions; track q.id; let i = $index) {
        <div class="question-block" style="display: block; margin-bottom: 18px; break-inside: avoid; page-break-inside: avoid; width: 100%; box-sizing: border-box; line-height: 1.5;">
          
          <div style="font-size: 15px; margin: 0 0 10px 0; text-align: left; word-wrap: break-word; word-break: break-word; white-space: pre-wrap;">
            <strong>{{i + 1}}.</strong> {{q.text}}
          </div>
          
          @if (q.type === 'multiple' && q.options) {
            <div style="margin-top: 5px; margin-left: 20px; font-size: 14px; display: flex; flex-direction: column; gap: 4px;">
              @for (opt of q.options; track opt; let j = $index) {
                <div style="display: flex; align-items: flex-start; gap: 8px;">
                  <span style="font-weight: bold; width: 20px; flex-shrink: 0;">{{ ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'][j] || '○' }}</span>
                  <span style="line-height: 1.5;">{{opt}}</span>
                </div>
              }
            </div>
          }
          
          @if (q.type === 'open') {
            <div style="margin-top: 15px; width: 70%;">
              <div style="border-bottom: 1px dotted #000; height: 25px; margin-bottom: 5px; width: 100%;"></div>
              <div style="border-bottom: 1px dotted #000; height: 25px; margin-bottom: 5px; width: 100%;"></div>
            </div>
          }
          
          @if (showAnswersInPdf && q.answer) {
            <div style="margin-top: 10px; color: #166534; font-size: 13px; font-weight: bold; background-color: #f0fdf4; padding: 5px 10px; border: 1px solid #bbf7d0; border-radius: 4px;">
              Answer: {{q.answer}}
            </div>
          }
        </div>
      }
    </div>
  `
})
export class CristobalColonBodyComponent {
  @Input() questions: Question[] = [];
  @Input() showAnswersInPdf = false;
}
