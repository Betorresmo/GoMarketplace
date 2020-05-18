import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarketplace:Cart');

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const duplicatedProductIndex = products.findIndex(
        item => item.id === product.id,
      );

      if (duplicatedProductIndex !== -1) {
        const newProducts = products;
        newProducts[duplicatedProductIndex].quantity += 1;

        setProducts([...newProducts]);
      } else {
        const newProduct = product;
        newProduct.quantity = 1;

        setProducts(currentProducts => [...currentProducts, newProduct]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementedItemIndex = products.findIndex(
        product => product.id === id,
      );

      const newProducts = products;
      newProducts[incrementedItemIndex].quantity += 1;

      setProducts([...newProducts]);

      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementedItemIndex = products.findIndex(
        product => product.id === id,
      );

      const newProducts = products;
      newProducts[decrementedItemIndex].quantity -= 1;

      if (newProducts[decrementedItemIndex].quantity < 1) {
        newProducts.splice(decrementedItemIndex, 1);
      }

      setProducts([...newProducts]);

      await AsyncStorage.setItem(
        '@GoMarketplace:Cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
