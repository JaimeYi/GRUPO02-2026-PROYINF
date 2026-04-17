const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const {fileToGenerativePart} = require("../utils/pdfToBase64")

const ai = new GoogleGenAI({});

iaCall = (async (req, prompt) => {
    try {
        const pdfPart = fileToGenerativePart(req.file.path, "application/pdf");
        fs.unlinkSync(req.file.path);

        const parts = [
            {text: prompt},
            pdfPart,
        ];

        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [pdfPart],
        config: {
            systemInstruction: prompt,
            responseMimeType: "application/json",
            }
        });
        const text = response.text;

        return text;
    } catch (error){
        console.log("Error procesando con Gemini 2.5: ", error);
        return -1;
    }
});

module.exports = {iaCall};