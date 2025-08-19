import React from "react";

const ProductCard = ({ product, onRemove }) => {
  return (
    <div className="border rounded-lg p-3 shadow-sm flex gap-3 items-start mb-3">
      {/* Ảnh sản phẩm */}
      <img
        src={product.mainImage}
        alt={product.name}
        className="w-20 h-20 object-contain rounded"
      />

      {/* Thông tin */}
      <div className="flex-1">
        <h2 className="text-sm font-semibold line-clamp-2">{product.name}</h2>
        {product.price && (
          <p className="text-green-600 font-bold mt-1">{product.price}</p>
        )}

        {/* Link Amazon */}
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 text-xs underline"
        >
          Xem trên Amazon
        </a>
      </div>

      {/* Nút Xoá */}
      <button
        onClick={onRemove}
        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
      >
        ❌
      </button>
    </div>
  );
};

export default ProductCard;
