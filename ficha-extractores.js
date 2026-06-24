/**
 * Extracción de texto desde imágenes (OCR) y PDFs para la ficha de cliente.
 * Requiere pdf.js y tesseract.js cargados en index.html.
 */
(function () {
  const PDFJS_BASE = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';

  function setupPdfJs() {
    const lib = window.pdfjsLib;
    if (!lib) return false;
    if (!lib.GlobalWorkerOptions.workerSrc) {
      lib.GlobalWorkerOptions.workerSrc = PDFJS_BASE + 'pdf.worker.min.js';
    }
    return true;
  }

  async function renderPaginaPdfACanvas(page, scale = 2) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    return canvas;
  }

  async function ocrCanvas(canvas, onProgress) {
    const Tesseract = window.Tesseract;
    if (!Tesseract) return '';
    const { data: { text } } = await Tesseract.recognize(canvas, 'spa+eng', {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round((m.progress || 0) * 100));
        }
      }
    });
    return (text || '').trim();
  }

  async function extraerTextoPDF(file, onProgress) {
    if (!setupPdfJs()) return { texto: '', metodo: 'sin-pdfjs' };
    const data = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data }).promise;
    let texto = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      texto += content.items.map(item => item.str).join(' ') + '\n';
    }
    texto = texto.trim();
    if (texto.length > 40) return { texto, metodo: 'pdf-texto' };

    const Tesseract = window.Tesseract;
    if (!Tesseract) return { texto, metodo: texto ? 'pdf-texto' : 'pdf-vacio' };

    if (onProgress) onProgress(0, 'pdf-ocr');
    let ocr = '';
    const maxPages = Math.min(pdf.numPages, 4);
    for (let i = 1; i <= maxPages; i++) {
      if (onProgress) onProgress(Math.round((i - 1) / maxPages * 100), 'pdf-ocr', i, maxPages);
      const page = await pdf.getPage(i);
      const canvas = await renderPaginaPdfACanvas(page);
      const parte = await ocrCanvas(canvas, pct => {
        if (onProgress) {
          const base = ((i - 1) / maxPages) * 100;
          onProgress(Math.round(base + (pct / maxPages)), 'pdf-ocr', i, maxPages);
        }
      });
      if (parte) ocr += parte + '\n\n';
    }
    return { texto: ocr.trim(), metodo: ocr.trim() ? 'pdf-ocr' : 'pdf-vacio' };
  }

  async function extraerTextoImagen(file, onProgress) {
    const Tesseract = window.Tesseract;
    if (!Tesseract) return { texto: '', metodo: 'sin-tesseract' };
    const { data: { text } } = await Tesseract.recognize(file, 'spa+eng', {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(Math.round((m.progress || 0) * 100), 'ocr');
        }
      }
    });
    return { texto: (text || '').trim(), metodo: 'ocr' };
  }

  window.fichaExtraerTexto = async function (file, categoria, onProgress) {
    try {
      if (categoria === 'pdf') return await extraerTextoPDF(file, onProgress);
      if (categoria === 'imagen') return await extraerTextoImagen(file, onProgress);
      return { texto: '', metodo: 'no-aplica' };
    } catch (err) {
      console.warn('Extracción fallida:', err);
      return { texto: '', metodo: 'error', error: err?.message || String(err) };
    }
  };
})();
