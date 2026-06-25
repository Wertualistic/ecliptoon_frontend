"use client";

import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Next.js workaround: we need to manually specify the worker source for pdfjs.
// Since pdfjs-dist v4+, the worker is an ES module (.mjs)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfReaderProps {
  url: string;
}

export default function PdfReader({ url }: PdfReaderProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setLoading(true);
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfRef(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("PDF yuklanishida xatolik yuz berdi.");
        setLoading(false);
      }
    };

    loadPdf();
  }, [url]);

  if (error) {
    return <div className="text-red-500 text-center py-10 font-medium">{error}</div>;
  }

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 bg-slate-900 border border-white/10 rounded-2xl">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-violet-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">PDF hujjat yuklanmoqda (bu biroz vaqt olishi mumkin)...</p>
      </div>
    );
  }

  return (
    <div className="webtoon-container flex flex-col gap-0 w-full max-w-full overflow-hidden bg-slate-950 rounded-lg">
      {numPages && Array.from(new Array(numPages), (el, index) => (
        <PdfPage key={`page_${index + 1}`} pageNumber={index + 1} pdf={pdfRef} />
      ))}
    </div>
  );
}

const PdfPage = ({ pageNumber, pdf }: { pageNumber: number, pdf: pdfjsLib.PDFDocumentProxy | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null;
    
    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;
      
      try {
        setRendering(true);
        const page = await pdf.getPage(pageNumber);
        
        // Calculate dynamic scale to match the window width (useful for webtoon style)
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
        
        // Make the canvas double the resolution for sharp text, but css will scale it down
        const scale = (screenWidth / unscaledViewport.width) * 1.5;
        const finalScale = Math.min(scale, 3.0); 
        
        const viewport = page.getViewport({ scale: finalScale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext: any = {
          canvasContext: context,
          viewport: viewport,
        };
        
        renderTask = page.render(renderContext);
        await renderTask.promise;
        setRendering(false);
      } catch (err) {
        if ((err as any)?.name !== "RenderingCancelledException") {
           console.error(`Error rendering page ${pageNumber}:`, err);
        }
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber]);

  return (
    <div className="relative w-full border-b border-white/5 bg-slate-900 min-h-[60vh] flex items-center justify-center">
      {rendering && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
           <div className="w-8 h-8 border-4 border-slate-800 border-t-violet-500 rounded-full animate-spin"></div>
        </div>
      )}
      <canvas ref={canvasRef} className={`w-full h-auto block m-0 p-0 transition-opacity duration-500 ${rendering ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
};
