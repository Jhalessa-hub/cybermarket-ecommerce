import photos from '../data/catalogPhotos.json';

// Match both fields so edited/custom products never inherit a different model's photo.
export function getCatalogPhoto(product) {
  const photo = photos[product.id];
  return photo?.name === product.name ? photo : null;
}
