import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportCSV, exportPDF } from '@/utils/exporters';

export default function PageHeader({ title, description, icon: Icon, actions, onExport, exportColumns = [], exportRows = [], exportName }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h1 className="font-playfair text-2xl font-bold text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onExport && exportRows?.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV({ filename: exportName || title, rows: exportRows, columns: exportColumns })}
            >
              <Download className="mr-2 h-3.5 w-3.5" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPDF({ filename: exportName || title, title, rows: exportRows, columns: exportColumns })}
            >
              <FileText className="mr-2 h-3.5 w-3.5" /> PDF
            </Button>
          </>
        )}
        {actions}
      </div>
    </div>
  );
}