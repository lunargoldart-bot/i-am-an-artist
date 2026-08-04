import { jsPDF } from 'jspdf';

const toCell = (value) => {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const escapeCsv = (value) => {
  const text = toCell(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
};

export const exportCSV = ({ filename = 'export', rows = [], columns = [] }) => {
  const header = columns.map((col) => (typeof col === 'string' ? col : col.label));
  const lines = [header.map(escapeCsv).join(',')];
  rows.forEach((row) => {
    const line = columns.map((col) => {
      const key = typeof col === 'string' ? col : col.key;
      const value = typeof key === 'function' ? key(row) : row[key];
      return escapeCsv(value);
    });
    lines.push(line.join(','));
  });
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPDF = ({ filename = 'export', title = 'Export', subtitle = '', rows = [], columns = [] }) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 40, 44);

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(subtitle, 40, 62);
  }
  doc.setTextColor(0);

  const header = columns.map((col) => (typeof col === 'string' ? col : col.label));
  const widths = header.map(() => Math.max(40, Math.floor((pageWidth - 80) / Math.max(header.length, 1))));

  const headerY = 84;
  const rowHeight = 22;
  doc.setFillColor(240, 240, 245);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  header.forEach((label, i) => {
    const x = 40 + widths.slice(0, i).reduce((a, b) => a + b, 0);
    doc.rect(x, headerY, widths[i], rowHeight, 'F');
    doc.text(String(label).slice(0, 30), x + 6, headerY + 15);
  });

  doc.setFont('helvetica', 'normal');
  let y = headerY + rowHeight;
  rows.forEach((row) => {
    if (y > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(8);
    columns.forEach((col, i) => {
      const key = typeof col === 'string' ? col : col.key;
      const value = typeof key === 'function' ? key(row) : row[key];
      const x = 40 + widths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(String(toCell(value)).slice(0, 34), x + 6, y + 12);
    });
    y += rowHeight;
  });

  doc.save(`${filename}.pdf`);
};

export const downloadJSON = ({ filename = 'export', data = [] }) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};