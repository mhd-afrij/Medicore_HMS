import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export function exportToPDF(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 20);

  // Subtitle with date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 28);

  // Table
  autoTable(doc, {
    startY: 35,
    head: [headers],
    body: rows,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [29, 78, 216], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { top: 35 },
  });

  doc.save(filename);
}

export function exportToExcel(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Style column widths
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.slice(0, 31));
  XLSX.writeFile(wb, filename);
}
