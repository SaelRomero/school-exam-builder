const fs = require('fs');

let html = fs.readFileSync('app.html', 'utf8');

const newButtons = `<div class="flex items-center gap-3">
        <button (click)="exportWord()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          Exportar Word
        </button>
        <button (click)="exportPdf(true)" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Exportar Clave
        </button>
        <button (click)="exportPdf(false)" class="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          Exportar PDF
        </button>
      </div>`;

html = html.replace(/<div class="flex items-center gap-3">[\s\S]*?<\/div>/, newButtons);
fs.writeFileSync('app.html', html);

let ts = fs.readFileSync('app.ts', 'utf8');

if (!ts.includes('import { Document')) {
    ts = ts.replace("import { Question } from './models';", "import { Question } from './models';\nimport { Document, Packer, Paragraph, TextRun, HeadingLevel, NumberFormat, LevelFormat, AlignmentType } from 'docx';");
}

if (!ts.includes('exportWord()')) {
    const wordMethod = `
  async exportWord() {
    this.showToast('Generando archivo Word...');
    
    const children: any[] = [];
    
    children.push(new Paragraph({
      text: this.examTitle || 'Examen Sin Título',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }));

    if (this.examInstructions) {
      children.push(new Paragraph({
        text: this.examInstructions,
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 }
      }));
    }

    this.examQuestions().forEach((q, index) => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: \`\${index + 1}. \`, bold: true }),
          new TextRun({ text: q.text })
        ],
        spacing: { before: 400, after: 200 }
      }));

      if (q.type === 'multiple' && q.options) {
        const letters = ['A)', 'B)', 'C)', 'D)', 'E)', 'F)'];
        q.options.forEach((opt, optIdx) => {
          children.push(new Paragraph({
            text: \`   \${letters[optIdx] || '○'} \${opt}\`,
            spacing: { before: 100, after: 100 }
          }));
        });
      } else {
        // Lineas para pregunta abierta
        for (let i = 0; i < 3; i++) {
          children.push(new Paragraph({
            text: "___________________________________________________________________________",
            spacing: { before: 200, after: 200 }
          }));
        }
      }
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`\${this.examTitle || 'Examen'}.docx\`;
    a.click();
    window.URL.revokeObjectURL(url);
    this.showToast('Descarga completada');
  }

  exportPdf(withAnswers: boolean) {`;

    ts = ts.replace('exportPdf(withAnswers: boolean) {', wordMethod);
    fs.writeFileSync('app.ts', ts);
}

