import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial clean data structure
const getInitialData = () => ({
  shops: [],
  reps: [],
  customers: [],
  categories: [
    'Skincare',
    'Lipstick & Lip Care',
    'Foundation & Concealer',
    'Eye Makeup',
    'Perfume & Fragrance',
    'Hair Serums & Oils'
  ],
  products: [],
  orders: []
});

// Helper to read db
async function readDb() {
  await fs.ensureDir(DATA_DIR);
  if (!await fs.pathExists(DB_FILE)) {
    const initData = getInitialData();
    await fs.writeJson(DB_FILE, initData, { spaces: 2 });
    return initData;
  }
  return await fs.readJson(DB_FILE);
}

// Helper to write db
async function writeDb(data) {
  await fs.ensureDir(DATA_DIR);
  await fs.writeJson(DB_FILE, data, { spaces: 2 });
}

// Routes
app.get('/api/data', async (req, res) => {
  try {
    const db = await readDb();
    res.json(db);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Demo Data
app.post('/api/reset-demo', async (req, res) => {
  try {
    const fresh = getInitialData();
    await writeDb(fresh);
    res.json({ success: true, message: 'Demo data loaded successfully', data: fresh });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Shop
app.post('/api/shops', async (req, res) => {
  try {
    const { name, id, image } = req.body;
    if (!name) return res.status(400).json({ error: 'Shop name is required' });
    const db = await readDb();
    const newShop = {
      id: id || 'SHOP-' + Date.now().toString().slice(-4),
      name,
      image: image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
      createdAt: new Date().toISOString()
    };
    db.shops.unshift(newShop);
    await writeDb(db);
    res.json(newShop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Shop
app.delete('/api/shops/:id', async (req, res) => {
  try {
    const db = await readDb();
    const shopId = req.params.id;
    db.shops = db.shops.filter(s => s.id !== shopId);
    if (Array.isArray(db.products)) db.products = db.products.filter(p => p.shopId !== shopId);
    if (Array.isArray(db.reps)) db.reps = db.reps.filter(r => r.shopId !== shopId);
    if (Array.isArray(db.customers)) db.customers = db.customers.filter(c => c.shopId !== shopId);
    if (Array.isArray(db.orders)) db.orders = db.orders.filter(o => o.mainShopId !== shopId);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Shop
app.put('/api/shops/:id', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.shops.findIndex(s => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Shop not found' });
    db.shops[idx] = {
      ...db.shops[idx],
      ...req.body,
      id: req.params.id // lock id
    };
    await writeDb(db);
    res.json(db.shops[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Rep
app.post('/api/reps', async (req, res) => {
  try {
    const { name, id, image, phone, shopId } = req.body;
    if (!name) return res.status(400).json({ error: 'Rep name is required' });
    const db = await readDb();
    const newRep = {
      id: id || 'REP-' + Date.now().toString().slice(-4),
      name,
      image: image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
      phone: phone || '',
      shopId: shopId || '',
      createdAt: new Date().toISOString()
    };
    db.reps.unshift(newRep);
    await writeDb(db);
    res.json(newRep);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Rep
app.delete('/api/reps/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.reps = db.reps.filter(r => r.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Rep
app.put('/api/reps/:id', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.reps.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Rep not found' });
    db.reps[idx] = {
      ...db.reps[idx],
      ...req.body,
      id: req.params.id // lock id
    };
    await writeDb(db);
    res.json(db.reps[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Customer Shop
app.post('/api/customers', async (req, res) => {
  try {
    const { name, address, id, image, ownerName, phone, shopId } = req.body;
    if (!name) return res.status(400).json({ error: 'Customer shop name is required' });
    const db = await readDb();
    const newCust = {
      id: id || 'CUST-' + Date.now().toString().slice(-4),
      name,
      address: address || '',
      ownerName: ownerName || '',
      image: image || '',
      phone: phone || '',
      shopId: shopId || '',
      createdAt: new Date().toISOString()
    };
    db.customers.unshift(newCust);
    await writeDb(db);
    res.json(newCust);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Customer Shop
app.delete('/api/customers/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.customers = db.customers.filter(c => c.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Customer Shop
app.put('/api/customers/:id', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.customers.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Customer shop not found' });
    db.customers[idx] = {
      ...db.customers[idx],
      ...req.body,
      id: req.params.id // lock id
    };
    await writeDb(db);
    res.json(db.customers[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Category
app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const db = await readDb();
    if (!db.categories.includes(name)) {
      db.categories.push(name);
      await writeDb(db);
    }
    res.json({ categories: db.categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Category
app.delete('/api/categories/:name', async (req, res) => {
  try {
    const db = await readDb();
    db.categories = db.categories.filter(c => c !== decodeURIComponent(req.params.name));
    await writeDb(db);
    res.json({ categories: db.categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, costPrice, salePrice, stock, lowStockThreshold, batchId, image, expiryDate, shopId } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });
    const db = await readDb();
    const newProduct = {
      id: 'PRD-' + Date.now().toString().slice(-5),
      name,
      brand: brand || 'General',
      shopId: shopId || '',
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
      discount: 0,
      stock: Number(stock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 10,
      batchId: batchId || 'BATCH-' + Date.now().toString().slice(-4),
      image: image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
      expiryDate: expiryDate || '',
      createdAt: new Date().toISOString()
    };
    db.products.unshift(newProduct);
    await writeDb(db);
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.products.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    
    db.products[idx] = {
      ...db.products[idx],
      ...req.body,
      costPrice: Number(req.body.costPrice ?? db.products[idx].costPrice),
      salePrice: Number(req.body.salePrice ?? db.products[idx].salePrice),
      stock: Number(req.body.stock ?? db.products[idx].stock),
      lowStockThreshold: Number(req.body.lowStockThreshold ?? db.products[idx].lowStockThreshold),
      discount: Number(req.body.discount ?? db.products[idx].discount ?? 0)
    };
    await writeDb(db);
    res.json(db.products[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const db = await readDb();
    db.products = db.products.filter(p => p.id !== req.params.id);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Add Products (from Excel Import)
app.post('/api/products/bulk-add', async (req, res) => {
  try {
    const { products: rawProducts } = req.body;
    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return res.status(400).json({ error: 'products must be a non-empty array' });
    }

    const db = await readDb();
    if (!Array.isArray(db.categories)) db.categories = [];
    if (!Array.isArray(db.products)) db.products = [];

    const addedProducts = [];
    const timestamp = Date.now();

    rawProducts.forEach((p, idx) => {
      const name = String(p.name || '').trim();
      if (!name) return; // skip empty

      const brand = String(p.brand || 'General').trim();
      // Auto-register new category if not already in categories
      if (brand && !db.categories.includes(brand)) {
        db.categories.push(brand);
      }

      const newProduct = {
        id: p.id || `PRD-${timestamp.toString().slice(-4)}-${idx + 1}`,
        name,
        brand,
        shopId: p.shopId || '',
        costPrice: Number(p.costPrice) || 0,
        salePrice: Number(p.salePrice) || 0,
        discount: Number(p.discount) || 0,
        stock: Number(p.stock) || 0,
        lowStockThreshold: Number(p.lowStockThreshold) || 10,
        batchId: String(p.batchId || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`),
        image: p.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=60',
        expiryDate: p.expiryDate || '',
        createdAt: new Date().toISOString()
      };

      addedProducts.push(newProduct);
      db.products.unshift(newProduct);
    });

    await writeDb(db);

    res.json({
      success: true,
      count: addedProducts.length,
      products: db.products,
      categories: db.categories,
      added: addedProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Delete Products
app.post('/api/products/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be array' });
    const db = await readDb();
    db.products = db.products.filter(p => !ids.includes(p.id));
    await writeDb(db);
    res.json({ success: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Order (Deducts stock automatically)
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const db = await readDb();

    const orderId = orderData.id || `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newOrder = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'Processing',
      orderDate: new Date().toISOString()
    };

    // Deduct stock from products
    if (Array.isArray(newOrder.items)) {
      newOrder.items.forEach(item => {
        const prod = db.products.find(p => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - (Number(item.quantity) || 0));
        }
      });
    }

    db.orders.unshift(newOrder);
    await writeDb(db);
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Order Status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const db = await readDb();
    const order = db.orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    order.status = status;
    await writeDb(db);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backup & Restore
app.get('/api/backup', async (req, res) => {
  try {
    const db = await readDb();
    res.setHeader('Content-disposition', `attachment; filename=lumicosmetics_backup_${Date.now()}.json`);
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(db, null, 2));
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restore', async (req, res) => {
  try {
    const restoreData = req.body;
    if (!restoreData || !restoreData.shops || !restoreData.products) {
      return res.status(400).json({ error: 'Invalid backup format' });
    }
    await writeDb(restoreData);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`LumiCosmetics Server running at http://localhost:${PORT}`);
});
