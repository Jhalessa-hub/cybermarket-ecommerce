import { DomainError } from './validation.js';

// Se procesa en el navegador; nunca se envía la foto a un servidor.
export async function prepareAvatar(file) {
  if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
    throw new DomainError('PHOTO', 'Selecciona una foto JPG, PNG o WebP de hasta 2 MB.');
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new DomainError('PHOTO', 'No se pudo abrir esa imagen. Elige otra foto.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 160;
    const context = canvas.getContext('2d');
    if (!context) throw new DomainError('PHOTO', 'Este navegador no permite preparar la foto.');
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 160, 160);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally { URL.revokeObjectURL(url); }
}
