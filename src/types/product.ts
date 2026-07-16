export type ProductUnit = "кг" | "шт.";

export type Product = {
  id: number;
  name: string;
  supplier: string;
  unit: ProductUnit;
  price: number;
  image: string;
};
