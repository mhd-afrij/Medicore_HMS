const {
  getAllBloodBanks,
  createBloodBank
} = require("../services/bloodBankService");
const { validateBloodBank } = require("../validators/bloodBankValidator");

function generateShortBloodID() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BB-${suffix}`;
}

async function listBloodBanks(req, res, next) {
  try {
    const bloodBanks = await getAllBloodBanks();
    res.json({ success: true, data: bloodBanks });
  } catch (error) {
    next(error);
  }
}

async function createNewBloodBank(req, res, next) {
  try {
    const payload = { ...req.body };
    payload.BloodID = payload.BloodID || payload.bloodID || payload.id || payload.BloodId;
    if (!payload.BloodID || typeof payload.BloodID !== 'string' || payload.BloodID.length > 9) {
      payload.BloodID = generateShortBloodID();
    }
    payload.BloodID = String(payload.BloodID).trim().slice(0, 9);
    payload.BloodGroup = payload.BloodGroup || payload.bloodGroup || payload.group || payload.Blood;
    payload.AvailableUnits = payload.AvailableUnits ?? payload.availableUnits ?? payload.units;
    payload.DonorName = payload.DonorName || payload.donorName || payload.donor || payload.Donor || payload.DonorID || payload.donorId;
    payload.CollectionDate = payload.CollectionDate || payload.collectionDate;
    payload.ExpiryDate = payload.ExpiryDate || payload.expiryDate;

    if (typeof payload.AvailableUnits === "string") {
      payload.AvailableUnits = Number(payload.AvailableUnits);
    }

    const errors = validateBloodBank(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const bloodBankEntry = await createBloodBank(payload);
    res.status(201).json({ success: true, data: bloodBankEntry });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBloodBanks,
  createNewBloodBank
};
