const jwt = require("jsonwebtoken");
const {
    registerService,
    loginService,
} = require("../services/userManagement.service");

// Función para estandarizar el RUT: elimina puntos y formatea siempre como XXXXXXXX-X
const formatRut = (rut) => {
    if (!rut) return rut;
    const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (clean.length < 2) return clean;
    return clean.slice(0, -1) + '-' + clean.slice(-1);
};

const guestSessionController = async (req, res) => {
    try {
        const { v4: uuidv4 } = await import("uuid");
        const guestSessionId = uuidv4();
        let { rut, correo, telefono } = req.body;
        
        rut = formatRut(rut);

        const payload = {
            sessionId: guestSessionId,
            userType: "noCliente",
            rut,
            correo,
            telefono,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.cookie("guest_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 1000,
        });

        res.status(200).json({ user: payload });
    } catch (err) {
        res.status(500).json({
            error: "Ocurrio un error al crear la sesion de invitado",
        });
    }
};

const registerController = async (req, res) => {
    try {
        const userData = req.body;
        
        if (userData.rut) {
            userData.rut = formatRut(userData.rut);
        }

        const returnRegister = await registerService(userData);

        if (returnRegister === 4090) {
            return res.status(409).json({
                error: "Este RUT ya se ha registrado anteriormente.",
            });
        } else if (returnRegister === 4091) {
            return res.status(409).json({
                error: "Este correo electrónico ya se ha registrado anteriormente.",
            });
        } else if (returnRegister === 201) {
            return res.status(201).json({
                message: "Usuario registrado satisfactoriamente",
            });
        } else if (returnRegister === 500) {
            return res.status(500).json({ error: "Ocurrio un error interno." });
        }
    } catch (error) {
        console.error("Error en registerController:", error);
        return res.status(500).json({ error: "Ocurrio un error interno en el servidor." });
    }
};

const loginController = async (req, res) => {
    try {
        let { rut, contrasena } = req.body;
        
        rut = formatRut(rut);

        const cliente = await loginService(rut, contrasena);

        if (cliente === 401) {
            return res.status(401).json({
                error: "Credenciales incorrectas.",
            });
        } else if (cliente === 500) {
            return res.status(500).json({
                error: "Ocurrio un error inesperado.",
            });
        } else {
            const payload = {
                sessionId: cliente.rut,
                rut: cliente.rut,
                mail: cliente.correo,
                name: cliente.nombre,
                lastName: cliente.apellido,
                userType: "cliente",
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });

            res.cookie("guest_session", "", {
                httpOnly: true,
                expires: new Date(0),
            });

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Solo enviar por HTTPS en producción
                maxAge: 3600000,
            });

            return res.status(200).json({
                message: "Login exitoso",
                name: cliente.nombre,
                user: payload,
            });
        }
    } catch (error) {
        console.error("Error en loginController:", error);
        return res.status(500).json({ error: "Ocurrio un error interno en el servidor." });
    }
};

const logoutController = (res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        res.cookie("guest_session", "", {
            httpOnly: true,
            expires: new Date(0),
        });
        return res.status(200).json({
            message: "Sesión cerrada correctamente.",
        });
    } catch (error) {
        console.error("Error en logoutController:", error);
        return res.status(500).json({ error: "Error al cerrar sesión." });
    }
};

const verifyController = (req, res) => {
    const clientToken = req.cookies.token;

    if (clientToken) {
        try {
            const decoded = jwt.verify(clientToken, process.env.JWT_SECRET);
            return res.status(200).json({ ...decoded, userType: "cliente" });
        } catch (err) {
            console.error(
                "Token de cliente inválido (se buscará token de invitado):",
                err.message
            );
        }
    }

    const guestToken = req.cookies.guest_session;

    if (guestToken) {
        try {
            const decoded = jwt.verify(guestToken, process.env.JWT_SECRET);
            return res.status(200).json({ ...decoded, userType: "noCliente" });
        } catch (err) {
            console.error("Token de invitado inválido:", err.message);
            return res
                .status(403)
                .json({ error: "Token de invitado no válido." });
        }
    }

    return res.status(401).json({ error: "No autorizado." });
};

module.exports = {
    guestSessionController,
    registerController,
    loginController,
    verifyController,
    logoutController
};
