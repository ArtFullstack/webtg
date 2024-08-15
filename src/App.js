import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductModal from "./components/ProductModal/ProductModal";
import { useTelegram } from "./hooks/useTelegram";
import ProductList from "./components/ProductList/ProductList";
import useCart from "./useCart";
import Search from "./components/Search/Search";
import "./App.css";
import CartModal from "./components/CartModal/CartModal";
import { getTotalPrice } from "./utils";
import CategoryButtons from "./components/CategoryButtons/CategoryButtons";
function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // Состояние для категорий
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { tg } = useTelegram();
  const { addedItems, onAdd, onRemove } = useCart(tg, () =>
    setIsCartModalOpen(true)
  );

  const fetchProducts = () => {
    axios
      .get("/api/products")
      .then((response) => {
        setProducts(response.data);
      })
      .catch((error) => {
        console.error("Ошибка при получении товаров:", error);
      });
  };

  const fetchCategories = () => {
    axios
      .get("http://217.18.62.19:3000/api/categories")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Ошибка при получении категорий:", error);
      });
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Загружаем категории
    const intervalId = setInterval(fetchProducts, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(false);
  };

  const closeCartModal = () => {
    setIsCartModalOpen(false);
  };

  const handleCategorySelect = (categoryName) => {
    // Фильтруем продукты по выбранной категории
    const filteredProducts = products.filter(
      (product) => product.category === categoryName
    );
    setProducts(filteredProducts);
  };

  return (
    <div className="App">
      <h1>Магазин товаров</h1>
      <CategoryButtons
        categories={categories}
        onSelect={handleCategorySelect}
      />{" "}
      {/* Используем компонент для категорий */}
      <Search searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <ProductList
        products={products}
        addedItems={addedItems}
        onAdd={onAdd}
        onRemove={onRemove}
        openModal={openProductModal}
      />
      {isProductModalOpen && (
        <ProductModal product={selectedProduct} onClose={closeProductModal} />
      )}
      {isCartModalOpen && (
        <CartModal
          items={addedItems}
          total={getTotalPrice(addedItems)}
          onClose={closeCartModal}
        />
      )}
    </div>
  );
}

export default App;
