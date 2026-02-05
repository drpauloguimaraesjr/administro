import { Router } from 'express';
import {
  ProductService,
  BatchService,
  MovementService,
  AlertService,
  InventoryService,
  ConsumptionService,
} from '../services/inventory.service.js';

const router = Router();

// Get user ID from request (simplified - in production use proper auth middleware)
const getUserId = (req: any): string => req.user?.id || req.headers['x-user-id'] || 'system';

// ====================================
// DASHBOARD / SUMMARY
// ====================================

// GET /api/inventory/summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await InventoryService.getSummary();
    res.json(summary);
  } catch (error: any) {
    console.error('Error getting inventory summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/list
router.get('/list', async (req, res) => {
  try {
    const list = await InventoryService.getStockList();
    res.json(list);
  } catch (error: any) {
    console.error('Error getting stock list:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// PRODUCTS
// ====================================

// GET /api/inventory/products
router.get('/products', async (req, res) => {
  try {
    const products = await ProductService.getAll();
    res.json(products);
  } catch (error: any) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/products/search?q=...
router.get('/products/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const products = await ProductService.search(query);
    res.json(products);
  } catch (error: any) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/products/:id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/products
router.post('/products', async (req, res) => {
  try {
    const userId = getUserId(req);
    const product = await ProductService.create(req.body, userId);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/inventory/products/:id
router.put('/products/:id', async (req, res) => {
  try {
    const product = await ProductService.update(req.params.id, req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/inventory/products/:id
router.delete('/products/:id', async (req, res) => {
  try {
    const deleted = await ProductService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// BATCHES
// ====================================

// GET /api/inventory/batches
router.get('/batches', async (req, res) => {
  try {
    const productId = req.query.productId as string;
    const batches = productId 
      ? await BatchService.getByProduct(productId)
      : await BatchService.getAll();
    res.json(batches);
  } catch (error: any) {
    console.error('Error getting batches:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/batches/:id
router.get('/batches/:id', async (req, res) => {
  try {
    const batch = await BatchService.getById(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.json(batch);
  } catch (error: any) {
    console.error('Error getting batch:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/batches
router.post('/batches', async (req, res) => {
  try {
    const userId = getUserId(req);
    const batch = await BatchService.create(req.body, userId);
    res.status(201).json(batch);
  } catch (error: any) {
    console.error('Error creating batch:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/batches/fifo/:productId
router.get('/batches/fifo/:productId', async (req, res) => {
  try {
    const quantity = parseInt(req.query.quantity as string) || 1;
    const batch = await BatchService.getFirstToExpire(req.params.productId, quantity);
    if (!batch) {
      return res.status(404).json({ error: 'No available batch found' });
    }
    res.json(batch);
  } catch (error: any) {
    console.error('Error getting FIFO batch:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// MOVEMENTS
// ====================================

// GET /api/inventory/movements
router.get('/movements', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const productId = req.query.productId as string;
    const batchId = req.query.batchId as string;

    let movements;
    if (batchId) {
      movements = await MovementService.getByBatch(batchId);
    } else if (productId) {
      movements = await MovementService.getByProduct(productId, limit);
    } else {
      movements = await MovementService.getAll(limit);
    }

    res.json(movements);
  } catch (error: any) {
    console.error('Error getting movements:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/movements
router.post('/movements', async (req, res) => {
  try {
    const userId = getUserId(req);
    const movement = await MovementService.create(req.body, userId);
    res.status(201).json(movement);
  } catch (error: any) {
    console.error('Error creating movement:', error);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/inventory/movements/prescription
// Convenience endpoint for creating movements from prescriptions
router.post('/movements/prescription', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId, quantity, patientId, patientName, prescriptionId } = req.body;

    if (!productId || !quantity || !patientId || !prescriptionId) {
      return res.status(400).json({ 
        error: 'Missing required fields: productId, quantity, patientId, prescriptionId' 
      });
    }

    const movement = await MovementService.createFromPrescription(
      productId,
      quantity,
      patientId,
      patientName || 'Paciente',
      prescriptionId,
      userId
    );

    if (!movement) {
      return res.status(404).json({ 
        error: 'No available batch for this product',
        suggestion: 'Check stock availability or add a new batch'
      });
    }

    res.status(201).json(movement);
  } catch (error: any) {
    console.error('Error creating prescription movement:', error);
    res.status(400).json({ error: error.message });
  }
});

// ====================================
// ALERTS
// ====================================

// GET /api/inventory/alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await AlertService.getActive();
    res.json(alerts);
  } catch (error: any) {
    console.error('Error getting alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/alerts/:id/acknowledge
router.post('/alerts/:id/acknowledge', async (req, res) => {
  try {
    const userId = getUserId(req);
    await AlertService.acknowledge(req.params.id, userId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/alerts/:id/resolve
router.post('/alerts/:id/resolve', async (req, res) => {
  try {
    await AlertService.resolve(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/inventory/alerts/check
// Manually trigger alert check (also runs on scheduler)
router.post('/alerts/check', async (req, res) => {
  try {
    const count = await AlertService.checkAndGenerateAlerts();
    res.json({ success: true, alertsGenerated: count });
  } catch (error: any) {
    console.error('Error checking alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// CONSUMPTION ANALYTICS
// ====================================

// GET /api/inventory/consumption/summary
router.get('/consumption/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const summary = await ConsumptionService.getConsumptionSummary(days);
    res.json(summary);
  } catch (error: any) {
    console.error('Error getting consumption summary:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/consumption/all
router.get('/consumption/all', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const consumption = await ConsumptionService.getAllProductsConsumption(days);
    res.json(consumption);
  } catch (error: any) {
    console.error('Error getting all consumption:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/inventory/consumption/:productId
router.get('/consumption/:productId', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const consumption = await ConsumptionService.getProductConsumption(req.params.productId, days);
    res.json(consumption);
  } catch (error: any) {
    console.error('Error getting product consumption:', error);
    res.status(500).json({ error: error.message });
  }
});

// ====================================
// MATCH (for prescription integration)
// ====================================

// GET /api/inventory/match?name=...
// Try to find a product by name or alias
router.get('/match', async (req, res) => {
  try {
    const name = req.query.name as string;
    if (!name) {
      return res.status(400).json({ error: 'Query parameter "name" is required' });
    }

    const product = await ProductService.findByNameOrAlias(name);
    if (!product) {
      return res.json({ found: false, product: null });
    }

    // Get available stock
    const batch = await BatchService.getFirstToExpire(product.id);
    
    res.json({
      found: true,
      product,
      hasStock: !!batch,
      availableQuantity: batch?.availableQuantity || 0,
      suggestedBatch: batch ? {
        id: batch.id,
        batchNumber: batch.batchNumber,
        expirationDate: batch.expirationDate,
        availableQuantity: batch.availableQuantity,
      } : null,
    });
  } catch (error: any) {
    console.error('Error matching product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
