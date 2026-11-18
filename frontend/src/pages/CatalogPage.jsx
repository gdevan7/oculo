import ProductCard from "../features/catalog/ProductCard.jsx";

export default function CatalogPage({ catalog, onTryOn }) {
  return (
    <section className="catalog-section catalog-only" id="collection">
      <div className="catalog-section-heading"><div><span className="eyebrow">THE FRAME COLLECTION</span><h2>Find your signature frame.</h2><p>Pick a frame, choose your color, and try it on in real time.</p></div></div>
      <div className="product-grid">
        {catalog.map((item, index) => (
          <ProductCard key={item.model_url || item.name} item={item} index={index} onTryOn={() => onTryOn(item)}/>
        ))}
      </div>
    </section>
  );
}
