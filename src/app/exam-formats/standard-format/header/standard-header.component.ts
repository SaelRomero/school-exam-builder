import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-standard-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="margin-bottom: 20px;">
      <h1 style="text-align: center; font-size: 22px; font-weight: bold; margin: 0 0 20px 0; text-transform: uppercase;">{{examTitle || 'Examen de Evaluación'}}</h1>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
        <div style="display: flex; gap: 10px; flex-grow: 1;">
          <span style="font-weight: bold; white-space: nowrap;">Nombre del alumno:</span>
          <div style="border-bottom: 1px solid #000; flex-grow: 1; margin-right: 30px;"></div>
        </div>
        <div style="display: flex; gap: 10px; width: 180px; flex-shrink: 0;">
          <span style="font-weight: bold;">Fecha:</span>
          <div style="border-bottom: 1px solid #000; flex-grow: 1;"></div>
        </div>
      </div>

      @if (examInstructions) {
        <div style="background-color: #ffffff; border: 2px solid #000000; border-radius: 6px; padding: 12px 15px; font-size: 13px; color: #000000; line-height: 1.5; word-wrap: break-word; word-break: break-word; white-space: pre-wrap; margin-bottom: 5px;">
          <span style="font-weight: bold; text-transform: uppercase; display: block; margin-bottom: 4px;">Instrucciones Generales:</span>
          {{examInstructions}}
        </div>
      }
    </div>
  `
})
export class StandardHeaderComponent {
  @Input() examTitle = '';
  @Input() examInstructions = '';
}
