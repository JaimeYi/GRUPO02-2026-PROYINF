const {
    calculateCreditController,
    simulationHistoryController,
    getSuggestedLoanController,
} = require("../controllers/simulator.controller.js");
const { verifyToken } = require("../middleware/verifyToken.js");
const { Router } = require("express");
const pool = require("../../db.js"); //r
const router = Router();

// needed fields in request: plazoCredito(int), seguroDeCesantia(0,1), seguroDeDegravamen(0,1), montoSimulacion(int), userType(noCliente, cliente), userID
router.post("/api/simulator/calculateCredit", async (req, res) => {
    calculateCreditController(req, res);
});

// needed fields in request: userType(noCliente, cliente), userID
router.get(
    "/api/simulator/simulationHistory",
    verifyToken,
    async (req, res) => {
        simulationHistoryController(req, res);
    }
);

router.get(
    "/api/simulator/suggestedLoan",
    verifyToken,
    async (req, res) => {
        getSuggestedLoanController(req, res);
    }
);

module.exports = router;
