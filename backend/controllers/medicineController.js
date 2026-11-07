const {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
} = require("../services/medicineService");
const { validateMedicine } = require("../validators/medicineValidator");

async function listMedicines(req, res, next) {
  try {
    const medicines = await getAllMedicines();
    res.json({ success: true, data: medicines });
  } catch (error) {
    next(error);
  }
}

async function getMedicine(req, res, next) {
  try {
    const medicine = await getMedicineById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, error: { message: "Medicine not found" } });
    }
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
}

async function createNewMedicine(req, res, next) {
  try {
    // normalize common alternative field names for backward compatibility
    const payload = { ...req.body };
    if ((payload.Name || payload.name) && !payload.MedicineName) payload.MedicineName = payload.Name || payload.name;
    if ((payload.Code || payload.code) && !payload.MedicineID) payload.MedicineID = payload.Code || payload.code;
    if ((payload.Price !== undefined || payload.price !== undefined) && payload.UnitPrice === undefined) {
      const p = payload.Price !== undefined ? payload.Price : payload.price;
      payload.UnitPrice = Number(p);
    }
    if ((payload.Unit || payload.unit) && !payload.Category) payload.Category = payload.Unit || payload.unit;
    if (typeof payload.StockQuantity === 'string') {
      payload.StockQuantity = Number(payload.StockQuantity);
    }

    const errors = validateMedicine(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }
    const medicine = await createMedicine(payload);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
}

async function updateExistingMedicine(req, res, next) {
  try {
    const payload = { ...req.body };
    if ((payload.Name || payload.name) && !payload.MedicineName) payload.MedicineName = payload.Name || payload.name;
    if ((payload.Code || payload.code) && !payload.MedicineID) payload.MedicineID = payload.Code || payload.code;
    if ((payload.Price !== undefined || payload.price !== undefined) && payload.UnitPrice === undefined) {
      const p = payload.Price !== undefined ? payload.Price : payload.price;
      payload.UnitPrice = Number(p);
    }
    if ((payload.Unit || payload.unit) && !payload.Category) payload.Category = payload.Unit || payload.unit;
    if (typeof payload.StockQuantity === 'string') {
      payload.StockQuantity = Number(payload.StockQuantity);
    }

    const errors = validateMedicine(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }
    const medicine = await updateMedicine(req.params.id, payload);
    if (!medicine) {
      return res.status(404).json({ success: false, error: { message: "Medicine not found" } });
    }
    res.json({ success: true, data: medicine });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingMedicine(req, res, next) {
  try {
    const medicine = await deleteMedicine(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, error: { message: "Medicine not found" } });
    }
    res.json({ success: true, data: { message: "Medicine deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMedicines,
  getMedicine,
  createNewMedicine,
  updateExistingMedicine,
  deleteExistingMedicine
};
