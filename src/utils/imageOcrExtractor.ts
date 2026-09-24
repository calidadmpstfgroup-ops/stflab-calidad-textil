import { ItemMuestraAccesorio, ItemMuestraTela } from '../types';
import { createWorker } from 'tesseract.js';
import { 
  interpretarDocumentoAccesorios, 
  interpretarDocumentoTelas, 
  ResultadoLecturaDocumento 
} from './documentReader';

/**
 * Pre-procesa una imagen en un Canvas HTML para aumentar nitidez, contraste y binarización
 * facilitando la lectura de OCR de capturas, fotos de documentos y tablas.
 */
export const preprocesarImagenParaOcr = (imageSource: string | File | Blob): Promise<string> => {
  return new Promise((resolve) => {
    // Si no estamos en entorno de navegador con Image / Canvas, devolver el source original
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
          return;
        }

        // Escalar si la resolución es baja para mejorar el reconocimiento de caracteres pequeños
        const scale = img.width < 1200 ? 2 : 1.2;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Binarización y ajuste de contraste
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Escala de grises por luminancia
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;

          // Aumento de contraste
          const highContrast = gray > 140 ? 255 : (gray < 80 ? 0 : gray);

          data[i] = highContrast;
          data[i + 1] = highContrast;
          data[i + 2] = highContrast;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Fallo preprocesamiento canvas, usando imagen original:', err);
        resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
      }
    };

    img.onerror = () => {
      resolve(typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource as Blob));
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
};

/**
 * Limpieza inteligente de texto OCR para tablas textiles:
 * - Corrige caracteres pegados
 * - Normaliza saltos de línea y tabulaciones
 */
export const limpiarTextoOcr = (rawText: string): string => {
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Normalizar barras y caracteres de división
    .replace(/[│┃┆┆]/g, '|')
    // Eliminar caracteres basura aislados
    .replace(/^[^a-zA-Z0-9:#\|\t\n]{1,2}$/gm, '')
    .trim();
};

/**
 * Función compatible con el código existente para parsear accesorios
 */
export const parsearTextoAccesorios = (texto: string): ItemMuestraAccesorio[] => {
  const resultado = interpretarDocumentoAccesorios(texto);
  return resultado.items;
};

/**
 * Función para parsear texto de telas
 */
export const parsearTextoTelas = (texto: string, proveedorPorDefecto = ''): ItemMuestraTela[] => {
  const resultado = interpretarDocumentoTelas(texto, proveedorPorDefecto);
  return resultado.items;
};

/**
 * Ejecuta OCR con Tesseract en español e inglés con preprocesamiento óptico para máxima precisión.
 */
export const extraerTextoDeImagenOCR = async (
  imageSource: string | File | Blob
): Promise<{ 
  textoCompleto: string; 
  itemsDetectados: ItemMuestraAccesorio[];
  telasDetectadas: ItemMuestraTela[];
  resultadoAccesorios: ResultadoLecturaDocumento<ItemMuestraAccesorio>;
  resultadoTelas: ResultadoLecturaDocumento<ItemMuestraTela>;
}> => {
  try {
    // 1. Pre-procesar imagen para alta nitidez
    const imagenOptimizada = await preprocesarImagenParaOcr(imageSource);

    // 2. Reconocimiento OCR multilingüe
    const worker = await createWorker('spa+eng');
    const ret = await worker.recognize(imagenOptimizada);
    await worker.terminate();

    const textoBruto = ret.data.text || '';
    const textoCompleto = limpiarTextoOcr(textoBruto);

    // 3. Interpretar inteligentemente tanto para Accesorios como para Telas
    const resultadoAccesorios = interpretarDocumentoAccesorios(textoCompleto);
    const resultadoTelas = interpretarDocumentoTelas(textoCompleto);

    return {
      textoCompleto,
      itemsDetectados: resultadoAccesorios.items,
      telasDetectadas: resultadoTelas.items,
      resultadoAccesorios,
      resultadoTelas
    };
  } catch (error) {
    console.error('Error procesando OCR:', error);
    const vacioAcc: ResultadoLecturaDocumento<ItemMuestraAccesorio> = {
      exito: false,
      tipoDocumentoDetectado: 'DESCONOCIDO',
      items: [],
      totalDetectados: 0,
      camposDetectados: [],
      advertencias: ['Error al procesar la imagen con OCR.']
    };
    const vacioTel: ResultadoLecturaDocumento<ItemMuestraTela> = {
      exito: false,
      tipoDocumentoDetectado: 'DESCONOCIDO',
      items: [],
      totalDetectados: 0,
      camposDetectados: [],
      advertencias: ['Error al procesar la imagen con OCR.']
    };

    return {
      textoCompleto: '',
      itemsDetectados: [],
      telasDetectadas: [],
      resultadoAccesorios: vacioAcc,
      resultadoTelas: vacioTel
    };
  }
};
