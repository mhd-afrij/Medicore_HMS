const {
  getAllBloodTransfusions,
  createBloodTransfusion,
  getBloodIdByGroup
} = require("../services/bloodTransfusionService");

function generateTransfusionID() {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TR-${suffix}`;
}

async function listBloodTransfusions(req, res, next) {
  try {
    const transfusions = await getAllBloodTransfusions();
    res.json({ success: true, data: transfusions });
  } catch (error) {
    next(error);
  }
}

async function createNewBloodTransfusion(req, res, next) {
  try {
    const { patientId, bloodId, bloodGroup, unitsGiven, doctorName, transfusionDate } = req.body;

    if (!patientId || !unitsGiven) {
      return res.status(400).json({
        success: false,
        error: { message: "patientId and unitsGiven are required" }
      });
    }

    // Resolve BloodID: use explicit bloodId if provided, otherwise look up from BLOOD_BANK by blood group
    let resolvedBloodID = bloodId || null;
    if (!resolvedBloodID && bloodGroup) {
      resolvedBloodID = await getBloodIdByGroup(bloodGroup);
    }

    if (!resolvedBloodID) {
      return res.status(400).json({
        success: false,
        error: { message: `No blood bank entry found for blood group "${bloodGroup || 'unknown'}". Please add stock first.` }
      });
    }

    const payload = {
      TransfusionID: generateTransfusionID(),
      PatientID: patientId,
      BloodID: resolvedBloodID,
      TransfusionDate: transfusionDate || new Date().toISOString().split("T")[0],
      UnitsGiven: Number(unitsGiven),
      DoctorName: doctorName || null
    };

    const transfusion = await createBloodTransfusion(payload);
    if (!transfusion) {
      return res.status(500).json({
        success: false,
        error: { message: "Failed to create blood transfusion record" }
      });
    }

    res.status(201).json({ success: true, data: transfusion });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBloodTransfusions,
  createNewBloodTransfusion
};
