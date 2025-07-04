import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PDFViewerProps {
  pdfUrl?: string;
  fileName?: string;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ 
  pdfUrl, 
  fileName = "Course Material",
  className 
}) => {
  const { toast } = useToast();
  const [zoom, setZoom] = useState(100);

  const handleDownload = () => {
    if (!pdfUrl || pdfUrl === '#' || !pdfUrl.trim()) {
      toast({
        title: "Download Demo",
        description: "This is a demo - connect to Supabase for real file downloads!",
      });
      return;
    }
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${fileName}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `${fileName}.pdf is being downloaded`,
    });
  };

  const zoomIn = () => {
    setZoom(prev => Math.min(200, prev + 25));
  };

  const zoomOut = () => {
    setZoom(prev => Math.max(50, prev - 25));
  };

  if (!pdfUrl || pdfUrl === '#' || !pdfUrl.trim()) {
    return (
      <div className={`glass-effect glow-border rounded-lg ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-geo-highlight" />
              Course Materials
            </h3>
            <Badge variant="outline">PDF</Badge>
          </div>
          
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No PDF Available</h4>
            <p className="text-muted-foreground">
              Course materials will be displayed here when available
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-effect glow-border rounded-lg ${className}`}>
      {/* PDF Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-geo-highlight" />
            {fileName}
          </h3>
          <Badge variant="outline">PDF</Badge>
        </div>
        
        {/* PDF Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm font-medium min-w-[60px] text-center">
              {zoom}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={handleDownload}
            className="bg-gradient-to-r from-geo-highlight to-geo-accent hover:from-geo-highlight/90 hover:to-geo-accent/90 text-black"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="p-4">
        <div className="bg-white rounded border" style={{ height: '600px' }}>
          <iframe
            src={`${pdfUrl}#zoom=${zoom}`}
            className="w-full h-full rounded"
            title={fileName}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;