import { ArrowRight } from "lucide-react";
import ProductModelPreview from "./ProductModelPreview.jsx";

export default function ProductCard({ item, index, onTryOn }) {
  return (
    <article className="product-card">
      <div className={"product-image product-image-" + item.name.toLowerCase()}>
        <span className="product-index">0{index + 1}</span>
        <ProductModelPreview item={item}/>
      </div>
      <div className="product-card-info product-card-info-centered">
        <span className="product-category">FRAME STUDIO</span>
        <h3>{item.name}</h3>
        <p>{item.subtitle}</p>
      </div>
      <div className="product-card-bottom product-card-bottom-centered">
        <span className="product-color-count">{item.colors?.length || 0} colors</span>
        <button className="tryon-button" onClick={onTryOn}>Try on <ArrowRight size={15}/></button>
      </div>
    </article>
  );
}
