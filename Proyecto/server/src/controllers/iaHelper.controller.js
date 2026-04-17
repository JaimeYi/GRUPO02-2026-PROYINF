const {iaCall} = require("../services/iaHelper.service")
const {promptDoc} = require("../config/iaHelper.config")

getSalaryPDF = (async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Falta el archivo PDF." });
    }

    let aiCallResult = await iaCall(req, promptDoc);

    if (aiCallResult === -1){
        return res.status(500).json({error: "Error al analizar PDF."});
    }

    try {
        // En caso de que Gemini devuelva backticks de markdown (ej: ```json ... ```), los limpiamos
        const cleanedResult = aiCallResult.replace(/```json/g, "").replace(/```/g, "").trim();
        aiCallResult = JSON.parse(cleanedResult);
        
        // Retornamos el JSON extraído directamente al cliente
        return res.json(aiCallResult);
    } catch (e) {
        console.error("Error parseando JSON de Gemini:", e);
        return res.status(500).json({error: "Error al interpretar la respuesta del PDF."});
    }
})

module.exports = {getSalaryPDF};