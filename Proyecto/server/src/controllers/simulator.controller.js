const { calculateCreditService, simulationHistoryService, getSuggestedLoanService } = require("../services/simulator.service.js");

const calculateCreditController = async (req, res) => {
    creditData = req.body;

    const simulatorVariables = await calculateCreditService(creditData);

    if (simulatorVariables === null) {
        res.status(500).json({ error: "Error en base de datos" });
    } else {
        res.status(200).json(simulatorVariables);
    }
};

const simulationHistoryController = async (req, res) => {
    const userType = req.user.userType;
    const userID = req.user.sessionId;

    const rows = await simulationHistoryService(userType, userID)

    if (rows == null){
        res.status(500).json({ error: "Error en base de datos" });
    } else {
        res.status(200).json(rows);
    }
};

const getSuggestedLoanController = async (req, res) => {
    const userType = req.user.userType;
    const userID = req.user.sessionId;

    const suggestedLoan = await getSuggestedLoanService(userType, userID);

    if (suggestedLoan === null) {
        res.status(500).json({ error: "Error al obtener préstamo sugerido" });
    } else {
        res.status(200).json(suggestedLoan);
    }
};

module.exports = { calculateCreditController, simulationHistoryController, getSuggestedLoanController };
