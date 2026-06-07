const { computeScore } = require('../services/scoring.service');

const scoreController = async (req, res) => {
  try {
    console.log("holaaaaa");
    // req.body fue validado para este punto
    const input = req.body;
    const result = await computeScore(input);
    console.log(result);
    return res.json(result); // {score, breakdown}
  } catch (error) {
    console.error("Error en scoreController:", error);
    return res.status(500).json({ error: "Error interno al calcular scoring" });
  }
};


module.exports = {scoreController};
