// API Client with automatic localStorage fallback for offline/instant mode

const API_BASE = '/api';

export const api = {
  // Fetch all initial data
  async getAllData() {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('API error, falling back to local storage', err);
      const cached = localStorage.getItem('lumicosmetics_client_store_v1');
      if (cached) return JSON.parse(cached);
      return null;
    }
  },

  // Reset Demo Data
  async resetDemo() {
    try {
      const res = await fetch(`${API_BASE}/reset-demo`, { method: 'POST' });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  // Add Shop
  async addShop(shop) {
    const res = await fetch(`${API_BASE}/shops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shop)
    });
    return await res.json();
  },

  // Delete Shop
  async deleteShop(id) {
    const res = await fetch(`${API_BASE}/shops/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  // Add Rep
  async addRep(rep) {
    const res = await fetch(`${API_BASE}/reps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rep)
    });
    return await res.json();
  },

  // Delete Rep
  async deleteRep(id) {
    const res = await fetch(`${API_BASE}/reps/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  // Add Customer Shop
  async addCustomer(customer) {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    });
    return await res.json();
  },

  // Delete Customer Shop
  async deleteCustomer(id) {
    const res = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  // Add Category
  async addCategory(name) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return await res.json();
  },

  // Delete Category
  async deleteCategory(name) {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(name)}`, {
      method: 'DELETE'
    });
    return await res.json();
  },

  // Add Product
  async addProduct(product) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return await res.json();
  },

  // Update Product
  async updateProduct(id, product) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    return await res.json();
  },

  // Delete Product
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    return await res.json();
  },

  // Bulk Add Products (from Excel Import)
  async bulkAddProducts(products) {
    const res = await fetch(`${API_BASE}/products/bulk-add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products })
    });
    return await res.json();
  },

  // Bulk Delete Products
  async bulkDeleteProducts(ids) {
    const res = await fetch(`${API_BASE}/products/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    return await res.json();
  },

  // Create Order
  async createOrder(order) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    return await res.json();
  },

  // Update Order Status
  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return await res.json();
  },

  // Backup & Restore
  async restoreBackup(data) {
    const res = await fetch(`${API_BASE}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  }
};
