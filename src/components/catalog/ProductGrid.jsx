import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, onDetail, wide = false }) {
  return <div className={`grid grid-cols-1 gap-x-5 gap-y-8 min-[460px]:grid-cols-2 ${wide ? 'md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5' : 'xl:grid-cols-3 2xl:grid-cols-4'}`}>
    {products.map((product) => <ProductCard key={product.id} product={product} onDetail={onDetail} />)}
  </div>;
}
