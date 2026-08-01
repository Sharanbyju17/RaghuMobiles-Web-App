import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { ShopService } from "@/lib/cart-service";

type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
};

type ShopContextType = {
  cartCount: number;
  cartItems: CartItem[];
  wishlistProductIds: string[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshShopData: () => Promise<void>;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const token = session?.token;
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);

  const refreshShopData = async () => {
    if (user && token) {
      const cart = await ShopService.getCart(token);
      if (cart) setCartItems(cart.items || []);

      const wishlist = await ShopService.getWishlist(token);
      setWishlistProductIds(wishlist.map((w: any) => w.product_id));
    } else {
      // For guest, load from localStorage
      const localCart = JSON.parse(localStorage.getItem("recell_cart") || "[]");
      setCartItems(localCart);
      
      const localWishlist = JSON.parse(localStorage.getItem("recell_wishlist") || "[]");
      setWishlistProductIds(localWishlist);
    }
  };

  useEffect(() => {
    refreshShopData();
  }, [user, token]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (user && token) {
      const cart = await ShopService.addToCart(token, productId, quantity);
      if (cart) setCartItems(cart.items || []);
    } else {
      // Guest
      const localCart = [...cartItems];
      const existing = localCart.find(i => i.product_id === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        localCart.push({ id: Math.random().toString(), cart_id: "local", product_id: productId, quantity });
      }
      setCartItems(localCart);
      localStorage.setItem("recell_cart", JSON.stringify(localCart));
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user && token) {
      const cart = await ShopService.removeFromCart(token, productId);
      if (cart) setCartItems(cart.items || []);
    } else {
      // Guest
      const localCart = cartItems.filter(i => i.product_id !== productId);
      setCartItems(localCart);
      localStorage.setItem("recell_cart", JSON.stringify(localCart));
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (user && token) {
      const res = await ShopService.toggleWishlist(token, productId);
      if (res) {
        if (res.status === "added") setWishlistProductIds([...wishlistProductIds, productId]);
        else setWishlistProductIds(wishlistProductIds.filter(id => id !== productId));
      }
    } else {
      // Guest
      let localWishlist = [...wishlistProductIds];
      if (localWishlist.includes(productId)) {
        localWishlist = localWishlist.filter(id => id !== productId);
      } else {
        localWishlist.push(productId);
      }
      setWishlistProductIds(localWishlist);
      localStorage.setItem("recell_wishlist", JSON.stringify(localWishlist));
    }
  };

  const isInWishlist = (productId: string) => wishlistProductIds.includes(productId);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <ShopContext.Provider value={{ cartCount, cartItems, wishlistProductIds, addToCart, removeFromCart, toggleWishlist, isInWishlist, refreshShopData }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
