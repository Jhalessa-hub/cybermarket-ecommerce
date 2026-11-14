import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import ProductImage from '../../../src/components/catalog/ProductImage.jsx';
import photos from '../../../src/data/catalogPhotos.json';
import { getCatalogPhoto } from '../../../src/utils/catalogPhotos.js';
import { createSeedData } from '../../../src/services/storage/seedData.js';

afterEach(cleanup);
const products = createSeedData().Products;

it('incluye archivos locales íntegros y procedencia para los 80 modelos', () => {
  expect(Object.keys(photos)).toHaveLength(80);
  for (const product of products) {
    const photo = getCatalogPhoto(product);
    expect(photo?.name).toBe(product.name);
    expect(photo.sourcePage).toMatch(/^https:\/\//);
    expect(photo.sourceImage).toMatch(/^https:\/\//);
    expect(photo.src).toMatch(/^\/images\/catalog\/products\/[\w-]+\.(png|jpg|webp)$/);
    const bytes = readFileSync(`public${photo.src}`);
    expect(bytes.length).toBe(photo.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(photo.sha256);
  }
});

it('muestra fotos con image null sin modificar los registros persistidos', () => {
  const product = Object.freeze({ ...products[0], image: null });
  render(<ProductImage product={product} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe(photos[product.id].src);
  expect(product.image).toBeNull();
});

it('conserva la prioridad de las imágenes personalizadas', () => {
  render(<ProductImage product={{ ...products[0], image: '/images/custom.png' }} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe('/images/custom.png');
});

it('no asigna fotos a productos renombrados o con otro ID', () => {
  expect(getCatalogPhoto({ ...products[0], id: 'custom' })).toBeNull();
  const product = { ...products[0], name: 'Mi equipo personalizado' };
  expect(getCatalogPhoto(product)).toBeNull();
  render(<ProductImage product={product} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe('/images/catalog/computers.svg');
});

it('usa fallback si falla una foto local y recupera la foto al cambiar producto', () => {
  const view = render(<ProductImage product={products[0]} />);
  fireEvent.error(screen.getByRole('img'));
  expect(screen.getByText('Imagen referencial')).toBeTruthy();
  view.rerender(<ProductImage product={products[1]} />);
  expect(screen.getByRole('img').getAttribute('src')).toBe(photos[products[1].id].src);
});

it('identifica la variante MSI de las GPU NVIDIA', () => {
  for (const product of products.filter((p) => p.brand === 'NVIDIA')) {
    expect(getCatalogPhoto(product).variant).toMatch(/VENTUS/);
  }
});
