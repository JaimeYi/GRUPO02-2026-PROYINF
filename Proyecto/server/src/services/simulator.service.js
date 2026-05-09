const pool = require("../../db.js");
const { rate } = require("financial");
const defaultConfig = require("../config/simulator.config.js");

const calculateCreditService = async (creditData) => {
    // --- Definicion de variables ---
    const gastosExtras = defaultConfig.gastosExtras;
    const costoPorSeguro = defaultConfig.costoPorSeguro;
    let tasaInteres = defaultConfig.tasaInteres;
    const numeroDePeriodos = creditData.plazoCredito;

    const costoSeguros =
        (creditData.seguroDeCesantia + creditData.seguroDeDegravamen) *
        costoPorSeguro;

    const principalTotalFinanciado =
        creditData.montoSimulacion + gastosExtras + costoSeguros;

    const cuotaMensual = Math.round(
        (principalTotalFinanciado *
            tasaInteres *
            (1 + tasaInteres) ** numeroDePeriodos) /
            ((1 + tasaInteres) ** numeroDePeriodos - 1)
    );

    const ctc = cuotaMensual * numeroDePeriodos;

    const tasaMensualReal = rate(
        numeroDePeriodos,
        -1 * cuotaMensual,
        creditData.montoSimulacion,
        0,
        0,
        0.01
    );
    let cae = (1 + tasaMensualReal) ** 12 - 1;
    try {
        if (creditData.userType === "noCliente") {
            const result = await pool.query(
                "INSERT INTO historialSimulacion (montoSimulado, plazoCredito, seguroDeDegravamen, seguroDeCesantia, CTC, cuotaMensual, tasaInteres, CAE, costosSeguros, guestID) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
                [
                    creditData.montoSimulacion,
                    numeroDePeriodos,
                    creditData.seguroDeDegravamen,
                    creditData.seguroDeCesantia,
                    ctc,
                    cuotaMensual,
                    tasaInteres,
                    cae,
                    costoSeguros,
                    creditData.userID,
                ]
            );
        } else if (creditData.userType === "cliente") {
            const result = await pool.query(
                "INSERT INTO historialSimulacion (montoSimulado, plazoCredito, seguroDeDegravamen, seguroDeCesantia, CTC, cuotaMensual, tasaInteres, CAE, costosSeguros, rutUsuario) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
                [
                    creditData.montoSimulacion,
                    numeroDePeriodos,
                    creditData.seguroDeDegravamen,
                    creditData.seguroDeCesantia,
                    ctc,
                    cuotaMensual,
                    tasaInteres,
                    cae,
                    costoSeguros,
                    creditData.userID,
                ]
            );
        }
    } catch (err) {
        console.log(err);
        return null;
    }

    console.log("Simulacion almacenada correctamente");

    tasaInteres = tasaInteres * 100;
    cae = cae.toFixed(defaultConfig.cifrasDecimalesPermitidas) * 100;

    return {
        cuotaMensual,
        ctc,
        tasaInteres,
        cae,
        costoSeguros,
    };
};

const simulationHistoryService = async (userType, userID) => {
    try {
        if (userType === "noCliente") {
            const result = await pool.query(
                "SELECT * FROM historialsimulacion WHERE guestID = $1 ORDER BY idsimulacion DESC LIMIT 10",
                [userID]
            );
            return result.rows
        } else if (userType === "cliente") {
            const result = await pool.query(
                "SELECT * FROM historialsimulacion WHERE rutUsuario = $1  ORDER BY idsimulacion DESC LIMIT 10",
                [userID]
            );
            return result.rows;
        }
    } catch (err) {
        console.log(err);
        return null
    }
};

const getSuggestedLoanService = async (userType, userID) => {
    try {
        if (userType === "cliente") {
            // Primero buscamos en campañas pre-aprobadas
            const campaniaResult = await pool.query(
                "SELECT montoPreAprobado as monto, plazoCredito as plazo, seguroDeDegravamen, seguroDeCesantia FROM campania WHERE rutUsuario = $1 LIMIT 1",
                [userID]
            );

            if (campaniaResult.rows.length > 0) {
                return { ...campaniaResult.rows[0], source: "campania" };
            }
        }

        // Si no hay campaña o es invitado, buscamos en su última simulación
        const query = userType === "cliente" 
            ? "SELECT montoSimulado as monto, plazoCredito as plazo, seguroDeDegravamen, seguroDeCesantia FROM historialsimulacion WHERE rutUsuario = $1 ORDER BY idsimulacion DESC LIMIT 1"
            : "SELECT montoSimulado as monto, plazoCredito as plazo, seguroDeDegravamen, seguroDeCesantia FROM historialsimulacion WHERE guestID = $1 ORDER BY idsimulacion DESC LIMIT 1";
        
        const historyResult = await pool.query(query, [userID]);

        if (historyResult.rows.length > 0) {
            return { ...historyResult.rows[0], source: "historial" };
        }

        // Valores por defecto si no hay nada
        return {
            monto: 1000000,
            plazo: 12,
            seguroDeDegravamen: true,
            seguroDeCesantia: true,
            source: "default"
        };
    } catch (err) {
        console.error("Error in getSuggestedLoanService:", err);
        return null;
    }
};

module.exports = { calculateCreditService, simulationHistoryService, getSuggestedLoanService };
