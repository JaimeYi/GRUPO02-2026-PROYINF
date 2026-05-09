const { calculateCreditService, simulationHistoryService, getSuggestedLoanService } = require("../services/simulator.service.js");

const calculateCreditController = async (req, res) => {
    try {
        const creditData = req.body;

        const simulatorVariables = await calculateCreditService(creditData);

        if (simulatorVariables === null) {
            return res.status(500).json({ error: "Error en base de datos" });
        } 
        
        return res.status(200).json(simulatorVariables);

    } catch (error) {
        console.error("Error crítico en calculateCreditController:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

const simulationHistoryController = async (req, res) => {
    try {
        const userType = req.user.userType;
        const userID = req.user.sessionId;

        const rows = await simulationHistoryService(userType, userID)

        if (rows == null){
            return res.status(500).json({ error: "Error en base de datos" });
        } 
        
        return res.status(200).json(rows);

    } catch (error) {
        console.error("Error crítico en simulationHistoryController:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

const getSuggestedLoanController = async (req, res) => {
    try {
        const userType = req.user.userType;
        const userID = req.user.sessionId;

        const suggestedLoan = await getSuggestedLoanService(userType, userID);

        if (suggestedLoan === null) {
            return res.status(500).json({ error: "Error al obtener préstamo sugerido" });
        } 
        
        return res.status(200).json(suggestedLoan);

    } catch (error) {
        console.error("Error crítico en getSuggestedLoanController:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { calculateCreditController, simulationHistoryController, getSuggestedLoanController };