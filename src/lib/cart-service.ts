const API_BASE = "http://localhost:8000/api/v1";

export class ShopService {
  static async getCart(token: string) {
    const res = await fetch(`${API_BASE}/cart/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return res.json();
  }

  static async addToCart(token: string, productId: string, quantity: number = 1) {
    const res = await fetch(`${API_BASE}/cart/items`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    if (!res.ok) return null;
    return res.json();
  }

  static async removeFromCart(token: string, productId: string) {
    const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return res.json();
  }

  static async getWishlist(token: string) {
    const res = await fetch(`${API_BASE}/wishlist/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
  }

  static async toggleWishlist(token: string, productId: string) {
    const res = await fetch(`${API_BASE}/wishlist/toggle`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ product_id: productId })
    });
    if (!res.ok) return null;
    return res.json();
  }
}
