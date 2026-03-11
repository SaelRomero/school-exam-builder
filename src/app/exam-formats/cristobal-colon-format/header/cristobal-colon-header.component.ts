import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cristobal-colon-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="font-family: 'Times New Roman', Times, serif;">
      
      <!-- Top Row: Logos and Title (25% - 50% - 25%) -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        
        <!-- Left Logo (25%) -->
        <div style="width: 25%; display: flex; justify-content: flex-start; align-items: center;">
          <div style="width: 140px; height: 80px; flex-shrink: 0; display: flex; align-items: center; justify-content: flex-start;">
            @if (logoLeftUrl) {
              <img [src]="logoLeftUrl" alt="Logo Colegio" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            } @else {
              <div style="width: 100%; height: 100%; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; background-color: #f9fafb;">
                <span style="font-size: 10px; color: #999; text-align: center;">LOGO<br>COLEGIO</span>
              </div>
            }
          </div>
        </div>

        <!-- Center Headers (50%) -->
        <div style="width: 50%; text-align: center;">
          <h1 style="font-size: 22px; font-weight: bold; letter-spacing: 0.5px; margin: 0 0 5px 0;">COLEGIO CRISTOBAL COLÓN</h1>
          <h2 style="font-size: 12px; font-style: italic; font-weight: normal; margin: 0 0 10px 0;">"Jesús, Confiamos en ti"</h2>
          <div style="font-size: 14px; margin-bottom: 5px;">{{examPeriod || '1st partial exam'}}</div>
          <div style="font-size: 14px;">{{examGradeOrSemester || '1st semester'}}</div>
        </div>

        <!-- Right Logo (25%) -->
        <div style="width: 25%; display: flex; justify-content: flex-end; align-items: center;">
          <div style="width: 140px; height: 80px; flex-shrink: 0; display: flex; align-items: center; justify-content: flex-end;">
            @if (logoRightUrl) {
              <img [src]="logoRightUrl" alt="Logo Prepa" style="max-width: 100%; max-height: 100%; object-fit: contain;">
            } @else {
              <div style="width: 100%; height: 100%; border: 1px dashed #ccc; display: flex; align-items: center; justify-content: center; background-color: #f9fafb;">
                <span style="font-size: 10px; color: #999; text-align: center;">LOGO<br>PREPA</span>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Student Info Row -->
      <div style="font-size: 14px; line-height: 1.5; margin-top: 12px; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div style="flex-grow: 1;">
            <span style="font-weight: bold;">Teacher:</span> {{teacherName || 'Fátima Malváez'}}
          </div>
          <div style="display: flex; gap: 5px; width: 200px;">
            <span style="font-weight: bold;">Date:</span>
            <div style="border-bottom: 1px solid #000; flex-grow: 1;"></div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; gap: 30px;">
          <div style="display: flex; gap: 5px; flex-grow: 1;">
            <span style="font-weight: bold; white-space: nowrap;">Last name:</span>
            <div style="border-bottom: 1px solid #000; flex-grow: 1;"></div>
          </div>
          <div style="display: flex; gap: 5px; flex-grow: 1;">
            <span style="font-weight: bold; white-space: nowrap;">Name:</span>
            <div style="border-bottom: 1px solid #000; flex-grow: 1;"></div>
          </div>
        </div>
      </div>
      
      <!-- Instructions Box -->
      @if (examInstructions) {
        <div style="margin-top: 15px; margin-bottom: 15px; border: 1px solid #999; padding: 10px 12px; background-color: #fafafa; font-style: italic; font-size: 13px;">
          <span style="font-weight: bold;">Instructions:</span> {{examInstructions}}
        </div>
      }

      <!-- Double Separator -->
      <div style="margin-bottom: 20px;">
        <hr style="border: 0; border-top: 1px solid #000; margin: 0 0 2px 0;">
        <hr style="border: 0; border-top: 1px solid #000; margin: 0;">
      </div>

    </div>
  `
})
export class CristobalColonHeaderComponent {
  @Input() examTitle = ''; 
  @Input() examInstructions = '';
  @Input() teacherName = '';
  @Input() examPeriod = '';
  @Input() examGradeOrSemester = '';

  logoLeftUrl: string = 'logo-prepa-gabriela.jpg'; 
  logoRightUrl: string = 'logo-cobach.jpg'; 
}
