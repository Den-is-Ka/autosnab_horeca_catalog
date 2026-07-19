"use client";

import { useCart } from "@/context/cart_context";
import productsData from "@/data/products.json";
import { type Product } from "@/types/product";

import {
  CatalogErrorState,
  CatalogLoadingState,
} from "./catalog_states";
import { ProductCard } from "./product_card";

type ProductAddedPayload = {
  product: Product;
  quantity: number;
  totalPrice: number;
};

type ProductCatalogProps = {
  products?: Product[];
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onProductAdded?: (payload: ProductAddedPayload) => void;
};

const defaultProducts = productsData as Product[];

export function ProductCatalog({
  products = defaultProducts,
  isLoading = false,
  errorMessage = null,
  onRetry,
  onProductAdded,
}: ProductCatalogProps) {
  const { addProduct } = useCart();

  if (isLoading) {
    return <CatalogLoadingState />;
  }

  if (errorMessage) {
    return (
      <CatalogErrorState
        message={errorMessage}
        onRetry={onRetry}
      />
    );
  }

  const handleAddProduct = (
    product: Product,
    quantity: number,
  ) => {
    addProduct(product.id, quantity);

    onProductAdded?.({
      product,
      quantity,
      totalPrice: product.price * quantity,
    });
  };

  if (products.length === 0) {
    return (
      <section
        className="
          mx-auto max-w-7xl px-4 py-16
          sm:px-6
          lg:px-8
        "
      >
        <div
          className="
            rounded-2xl border border-dashed border-slate-300
            bg-white px-6 py-16 text-center
          "
        >
          <h2 className="text-2xl font-bold text-slate-900">
            Товары не найдены
          </h2>

          <p className="mt-3 text-slate-600">
            В каталоге пока нет доступных товаров.
          </p>
        </div>
      </section>
    );
  }

  return (
    <main
      className="
        mx-auto w-full max-w-7xl px-4 py-10
        sm:px-6
        lg:px-8
      "
    >
      <div
        className="
          mb-8 flex flex-col gap-3
          sm:flex-row sm:items-end sm:justify-between
        "
      >
        <div>
          <p
            className="
              text-sm font-semibold uppercase tracking-[0.16em]
              text-emerald-700
            "
          >
            Каталог
          </p>

          <h2
            className="
              mt-2 text-2xl font-bold tracking-tight
              text-slate-950 sm:text-3xl
            "
          >
            Продукты для HoReCa
          </h2>

          <p className="mt-2 max-w-2xl text-slate-600">
            Выберите необходимое количество и добавьте товар
            в общий заказ.
          </p>
        </div>

        <p className="text-sm font-medium text-slate-500">
          Найдено товаров: {products.length}
        </p>
      </div>

      <div
        className="
          grid grid-cols-1 gap-6
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={handleAddProduct}
          />
        ))}
      </div>
    </main>
  );
}