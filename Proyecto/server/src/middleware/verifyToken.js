const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const clientToken = req.cookies.token;

    // 1. Verifica si hay token de cliente logueado
    if (clientToken) {
        try {
            const decoded = jwt.verify(clientToken, process.env.JWT_SECRET);
            req.user = { ...decoded, userType: "cliente" };
            return next();
        } catch (err) {
            console.error(
                "Token de cliente inválido (se buscará token de invitado):",
                err.message
            );
        }
    }

    const guestToken = req.cookies.guest_session;

    // 2. Verifica si hay token de sesión de invitado (no logueado)
    if (guestToken) {
        try {
            const decoded = jwt.verify(guestToken, process.env.JWT_SECRET);
            req.user = { ...decoded, userType: "noCliente" };
            return next();
        } catch (err) {
            console.error("Token de invitado inválido:", err.message);
            return res
                .status(403)
                .json({ error: "Token de invitado no válido." });
        }
    }
    // para que no quede colgado
    return res.status(401).json({ error: "Acceso denegado. No se proporcionó ningún token de autenticación." });
};

module.exports = { verifyToken };