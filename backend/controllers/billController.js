const billService = require("../services/billService");

async function getAllBills(req, res) {
  try {
    const bills = await billService.getAllBills();

    res.json({
      success: true,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}

async function createBill(req, res) {
  try {
    const bill = await billService.createBill(req.body);

    res.status(201).json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}

async function updateBillStatus(req, res) {
  try {
    const bill = await billService.updateBillStatus(
      req.params.id,
      req.body.PaymentStatus
    );

    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    });
  }
}

module.exports = {
  getAllBills,
  createBill,
  updateBillStatus
};