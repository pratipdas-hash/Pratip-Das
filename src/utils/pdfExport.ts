import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ResumeData, TemplateSettings } from '../types';
import { simulateAtsPlainText } from './atsScorer';

export async function exportResumeToPdf(
  elementId: string,
  fileName: string = 'Resume.pdf',
  settings: TemplateSettings
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Target resume element not found for PDF export.');
    return false;
  }

  try {
    // Generate high-resolution canvas capture
    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp 300 DPI equivalent
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
    });

    const isA4 = settings.paperSize === 'a4';
    // Dimensions in mm
    const pdfWidth = isA4 ? 210 : 215.9; // A4 vs Letter width
    const pdfHeight = isA4 ? 297 : 279.4; // A4 vs Letter height

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: isA4 ? 'a4' : 'letter',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;

    // Subsequent pages if resume spans multiple pages
    while (heightLeft > 5) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    // Fallback to browser print which works reliably on all systems
    window.print();
    return true;
  }
}

export function printResume(): void {
  window.print();
}

export function downloadPlainTextResume(resume: ResumeData): void {
  const text = simulateAtsPlainText(resume);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_ATS_Resume.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadJsonResume(resume: ResumeData, settings: TemplateSettings): void {
  const data = JSON.stringify({ resume, settings, exportedAt: new Date().toISOString() }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${resume.personalInfo.fullName.replace(/\s+/g, '_')}_Resume_Backup.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
