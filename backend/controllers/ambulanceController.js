const { getAllAmbulances, updateAmbulanceStatus, createAmbulance, getNextAmbulanceId } = require("../services/ambulanceService");
const { getAllAmbulanceLogs, createAmbulanceLog } = require("../services/ambulanceLogService");

async function listAmbulances(req, res, next) {
  try {
    const ambulances = await getAllAmbulances();
    res.json({ success: true, data: ambulances });
  } catch (error) {
    next(error);
  }
}

async function listAmbulanceLogs(req, res, next) {
  try {
    const logs = await getAllAmbulanceLogs();
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
}

async function createNewAmbulanceLog(req, res, next) {
  try {
    const { vehicle, type, patient, pickup, dropoff } = req.body;

    if (!vehicle || !type || !pickup) {
      return res.status(400).json({ success: false, error: { message: "vehicle, type and pickup are required" } });
    }

    const payload = {
      LogID: `AL-${String(Date.now()).slice(-7)}`,
      AmbulanceID: vehicle,
      PatientID: patient || null,
      LogDateTime: new Date(),
      DispatchType: type,
      PickupLocation: pickup,
      DropoffLocation: dropoff || null,
      Destination: dropoff || pickup,
      Remarks: null
    };

    const log = await createAmbulanceLog(payload);
    if (!log) {
      return res.status(500).json({ success: false, error: { message: "Failed to create ambulance dispatch log" } });
    }

    const updatedAmbulance = await updateAmbulanceStatus(vehicle, "On Call");

    res.status(201).json({ success: true, data: { log, ambulance: updatedAmbulance } });
  } catch (error) {
    next(error);
  }
}

async function updateAmbulanceStatusHandler(req, res, next) {
  try {
    const { status } = req.body;
    const ambulance = await updateAmbulanceStatus(req.params.ambulanceId, status);
    if (!ambulance) {
      return res.status(404).json({ success: false, error: { message: "Ambulance not found" } });
    }
    res.json({ success: true, data: ambulance });
  } catch (error) {
    next(error);
  }
}

async function createNewAmbulance(req, res, next) {
  try {
    const { vehicleNumber, driverName, status } = req.body;

    if (!vehicleNumber || !driverName) {
      return res.status(400).json({ success: false, error: { message: "vehicleNumber and driverName are required" } });
    }

    const ambId = await getNextAmbulanceId();

    const ambulance = await createAmbulance({
      AmbulanceID: ambId,
      VehicleNumber: vehicleNumber,
      DriverName: driverName,
      Status: status || 'Available'
    });

    if (!ambulance) {
      return res.status(500).json({ success: false, error: { message: "Failed to create ambulance" } });
    }

    res.status(201).json({ success: true, data: ambulance });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAmbulances,
  listAmbulanceLogs,
  createNewAmbulanceLog,
  updateAmbulanceStatusHandler,
  createNewAmbulance
};
