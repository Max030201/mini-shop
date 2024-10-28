import React, { useState, useEffect } from "react";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "react-hot-toast";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import FilterPanel from "./components/Filters/FilterPanel";
import ProductList from "./components/Catalog/ProductList";
import CartView from "./components/Cart/CartView";
import ProductModal from "./components/Product/ProductModal";
import { getProducts } from "./api/productsApi";

function App() {
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    categories: [],
    gender: '',
    inStock: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await getProducts({ limit: 1000 });
        setAllProducts(response.products);
      } catch (error) {
        console.error('Error fetching all products for categories:', error);
      }
    };
    fetchAllProducts();
  }, []);

  const handleCartOpen = () => {
    setShowCart(true);
  };

  const handleCartClose = () => {
    setShowCart(false);
  };

  const handleContinueShopping = () => {
    setShowCart(false);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleProductModalClose = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Header 
          onCartOpen={handleCartOpen} 
          onContinueShopping={handleContinueShopping}
          showCart={showCart}
        />

        <main className="flex-1 flex min-h-0">
          {showCart ? (
            <div className="w-full">
              <CartView 
                onClose={handleCartClose}
                onContinueShopping={handleContinueShopping}
              />
            </div>
          ) : (
            <>
              <div className="hidden lg:block flex-shrink-0 bg-white border-right-1 border-gray-200">
                <FilterPanel 
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  products={allProducts}
                />
              </div>

              <div className="lg:hidden fixed top-20 left-4 z-40">
                <FilterPanel 
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  products={allProducts}
                />
              </div>

              <div className="flex-1 lg:ml-0 min-h-0">
                <ProductList 
                  filters={filters}
                  onProductClick={handleProductClick}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
              </div>
            </>
          )}
        </main>

        <Footer />

        <ProductModal
          product={selectedProduct}
          visible={showProductModal}
          onHide={handleProductModalClose}
        />
      </div>
    </CartProvider>
  );
}

export default App; 