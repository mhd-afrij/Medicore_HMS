const {
  getAllPharmacies,
  getPharmacyById,
  createPharmacy,
  updatePharmacy,
  deletePharmacy
} = require("../services/pharmacyService");
const { validatePharmacy } = require("../validators/pharmacyValidator");

async function listPharmacies(req, res, next) {
  try {
    const pharmacies = await getAllPharmacies();
    res.json({ success: true, data: pharmacies });
  } catch (error) {
    next(error);
  }
}

async function getPharmacy(req, res, next) {
  try {
    const pharmacy = await getPharmacyById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, error: { message: "Pharmacy not found" } });
    }
    res.json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
}

async function createNewPharmacy(req, res, next) {
  try {
    const errors = validatePharmacy(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const pharmacy = await createPharmacy(req.body);
    res.status(201).json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
}

async function updateExistingPharmacy(req, res, next) {
  try {
    const errors = validatePharmacy(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const pharmacy = await updatePharmacy(req.params.id, req.body);
    if (!pharmacy) {
      return res.status(404).json({ success: false, error: { message: "Pharmacy not found" } });
    }
    res.json({ success: true, data: pharmacy });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingPharmacy(req, res, next) {
  try {
    const pharmacy = await deletePharmacy(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ success: false, error: { message: "Pharmacy not found" } });
    }
    res.json({ success: true, data: { message: "Pharmacy deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPharmacies,
  getPharmacy,
  createNewPharmacy,
  updateExistingPharmacy,
  deleteExistingPharmacy
};
