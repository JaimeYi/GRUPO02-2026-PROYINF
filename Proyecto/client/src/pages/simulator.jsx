import Navbar from "../components/Navbar";
import { useAuth } from "../components/auth";
import { useState, useEffect, useCallback } from "react";
import { isInvalidRUT } from "../utils/rutVerifier";
import "../css/cardData.css";
import GlassPanel from "../components/GlassPanel";
import BottomBar from "../components/BottomBar";
import { Link } from "react-router-dom";
import HistoryModal from "../components/HistoryModal";
import { formatMoney } from "../utils/formatMoney";

function SuggestionModal({ onAccept, onManual, suggestedData }) {
    const isHistory = suggestedData.source === "historial";
    
    return (
        <div className="background-register-guest" style={{ 
            zIndex: 1001, 
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
        }}>
            <div className="card-register-guest" style={{ 
                maxWidth: "500px",
                background: "white",
                padding: "2.5rem",
                borderRadius: "15px",
                textAlign: "center",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}>
                <h3 className="titleCard-guest" style={{ color: "#242424", marginBottom: "1.5rem", fontSize: "1.8rem" }}>
                    {isHistory ? "¡Retoma tu simulación!" : "¡Tenemos una sugerencia para ti!"}
                </h3>
                <p style={{ color: "#444", marginBottom: "2rem", fontSize: "1.1rem", lineHeight: "1.6" }}>
                    {isHistory 
                        ? "Basado en tu última actividad, puedes continuar con:" 
                        : "Basado en tu historial financiero, te recomendamos un préstamo de:"}
                    <br />
                    <span style={{ fontSize: "1.8rem", color: "#38ABE4", fontWeight: "bold", display: "block", margin: "10px 0" }}>
                        {formatMoney(suggestedData.monto)}
                    </span>
                    en <span style={{ fontWeight: "bold", color: "#242424" }}>{suggestedData.plazo} cuotas</span>
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                    <button onClick={onAccept} className="navbar-btn" style={{ flex: "1", minWidth: "200px" }}>
                        {isHistory ? "Retomar simulación" : "Usar monto sugerido"}
                    </button>
                    <button onClick={onManual} className="navbar-btn" style={{ 
                        flex: "1", 
                        minWidth: "200px",
                        background: "white",
                        backgroundImage: "none",
                        color: "#444",
                        border: "2px solid #ccc"
                    }}>
                        {isHistory ? "Nueva simulación" : "Configurar manualmente"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CardData({ onClose }) {
    const [formData, setFormData] = useState({
        rut: "",
        correo: "",
        telefono: "",
    });

    const { setUser } = useAuth();

    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData.rut);

        // --- Verificar Rut ---
        if (await isInvalidRUT(formData.rut)) {
            setError("El rut ingresado es inválido");
            return;
        }

        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/userManagement/guest-session",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Ocurrió un error desconocido."
                );
            }

            setUser(result.user);
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="background-register-guest">
            <div className="card-register-guest">
                <h3 className="titleCard-guest">
                    Ingresa tus datos personales
                </h3>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="labelCard-guest" htmlFor="rut">
                            Rut:
                        </label>
                        <input
                            className="inputCard-guest"
                            type="text"
                            id="rut"
                            name="rut"
                            value={formData.rut}
                            onChange={handleChange}
                            maxLength={10}
                            placeholder="12345678-K"
                            required
                        />
                    </div>
                    <div>
                        <label className="labelCard-guest" htmlFor="correo">
                            Correo Electrónico:
                        </label>
                        <input
                            className="inputCard-guest"
                            type="email"
                            id="correo"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="labelCard-guest" htmlFor="telefono">
                            Número de teléfono:
                        </label>
                        <input
                            className="inputCard-guest"
                            type="text"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    <button type="submit">Continuar</button>
                </form>
                <button onClick={onClose}>Cerrar</button>
            </div>
        </div>
    );
}

function Simulator() {
    const { user, isLoading } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const [error, setError] = useState("");
    const [historySimulation, setHistorySimulation] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showSuggestionModal, setShowSuggestionModal] = useState(false);
    const [suggestedData, setSuggestedData] = useState(null);
    const [hasShownInSession, setHasShownInSession] = useState(
        sessionStorage.getItem("suggestionShown") === "true"
    );
    const [creditData, setCreditData] = useState({
        cuotaMensual: "",
        ctc: "",
        tasaInteres: "",
        cae: "",
        costoSeguros: "",
    });

    const [formData, setFormData] = useState({
        montoSimulacion: 100000,
        plazoCredito: 0,
        seguroDeDegravamen: true,
        seguroDeCesantia: true,
        userType: "",
        userID: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue;
        if (type === "checkbox") {
            finalValue = checked;
        } else if (type === "number" || type === "range") {
            finalValue = value === "" ? "" : parseInt(value, 10);
        } else {
            finalValue = value;
        }

        setFormData((prevState) => ({
            ...prevState,
            [name]: finalValue,
        }));
    };

    const getSimulationHistory = useCallback(async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/simulator/simulationHistory",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const result = await response.json();
            console.log(result);

            if (!response.ok) {
                throw new Error(result.error || "Ocurrió un error al obtener el historial de simulaciones.");
            }

            setHistorySimulation(result);
        } catch (error) {
            console.error("Error fetching simulation history:", error);
            setError(error.message || "Error al cargar el historial.");
        }
    }, []);

    const getSuggestedLoan = useCallback(async (isManualTrigger = false) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/simulator/suggestedLoan",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (response.ok) {
                setSuggestedData(result);
                // Solo mostrar automáticamente si no se ha mostrado en la sesión o si es gatillado por el botón
                if (!hasShownInSession || isManualTrigger) {
                    setShowSuggestionModal(true);
                    if (!isManualTrigger) {
                        sessionStorage.setItem("suggestionShown", "true");
                        setHasShownInSession(true);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching suggested loan:", error);
        }
    }, [hasShownInSession]);

    const handleOpenSuggestion = () => {
        getSuggestedLoan(true);
    };

    const handleAcceptSuggestion = () => {
        if (suggestedData) {
            setFormData((prevState) => ({
                ...prevState,
                montoSimulacion: suggestedData.monto,
                plazoCredito: suggestedData.plazo,
                seguroDeDegravamen: suggestedData.seguroDeDegravamen,
                seguroDeCesantia: suggestedData.seguroDeCesantia,
            }));
        }
        setShowSuggestionModal(false);
    };

    const handleManualEntry = () => {
        setShowSuggestionModal(false);
    };

    const calculateCredit = async (data) => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/simulator/calculateCredit",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                    credentials: "include",
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Ocurrió un error desconocido."
                );
            }

            setCreditData({
                cuotaMensual: result.cuotaMensual,
                ctc: result.ctc,
                tasaInteres: result.tasaInteres,
                cae: result.cae,
                costoSeguros: result.costoSeguros,
            });

            localStorage.setItem(
                "lastSimulation",
                JSON.stringify({
                    cuotaEstimada: result.cuotaMensual,     // scoring
                    montoSimulacion: data.montoSimulacion,
                    plazoCredito: data.plazoCredito,
                    fecha: new Date().toISOString(),
                })
            );

            getSimulationHistory();
        } catch (error) {
            console.log(error);
            setError("Datos inválidos.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.plazoCredito < 1) {
            setError("Seleccione cantidad de cuotas");
            return;
        }

        const preparedData = {
            ...formData,
            userType: user.userType,
            userID: user.userType === "noCliente" ? user.sessionId : user.rut,
        };

        await calculateCredit(preparedData);
    };

    const handleRestore = async (item) => {
        const restoredData = {
            montoSimulacion: item.montosimulado,
            plazoCredito: item.plazocredito,
            seguroDeDegravamen: item.segurodedegravamen,
            seguroDeCesantia: item.segurodecesantia,
            userID: user.userType === "noCliente" ? user.sessionId : user.rut,
            userType: user.userType,
        };

        setFormData(restoredData);
        setShowHistory(false);

        await calculateCredit(restoredData);
    };

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    useEffect(() => {
        if (user) {
            getSimulationHistory();
            getSuggestedLoan();
        }
    }, [user, getSimulationHistory, getSuggestedLoan]);

    useEffect(() => {
        const openHandler = () => setShowHistory(true);
        window.addEventListener("openHistoryModal", openHandler);
        return () =>
            window.removeEventListener("openHistoryModal", openHandler);
    }, []);

    if (isLoading) {
        return null;
    }

    return (
        <>
            <Navbar />

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "calc(100vh - 100px)",
                    padding: "60px 0",
                    textAlign: "center",
                }}
            >
                <GlassPanel>
                    {user ? (
                        <>
                            <form onSubmit={handleSubmit}>
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "0.5rem",
                                            fontWeight: 600,
                                            color: "white",
                                        }}
                                    >
                                        Monto a simular:
                                    </label>
                                    <input
                                        type="text"
                                        name="montoSimulacion"
                                        value={formatMoney(
                                            formData.montoSimulacion
                                        )}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(
                                                /\D/g,
                                                ""
                                            ); // Remove non-digits
                                            const num =
                                                raw === ""
                                                    ? 100000
                                                    : Math.min(
                                                          parseInt(raw, 10),
                                                          99999999
                                                      );
                                            handleChange({
                                                target: {
                                                    name: "montoSimulacion",
                                                    value: num,
                                                },
                                            });
                                        }}
                                        min={100000}
                                        max={99999999}
                                        className="monto-input"
                                        required
                                        placeholder="$100.000"
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            textAlign: "center",
                                            marginBottom: "0.5rem",
                                            fontWeight: 600,
                                            color: "white",
                                        }}
                                    >
                                        Cantidad de cuotas:{" "}
                                        <strong className="cuotas-display">
                                            {formData.plazoCredito}
                                        </strong>
                                    </label>
                                    <input
                                        type="range"
                                        name="plazoCredito"
                                        value={formData.plazoCredito}
                                        onChange={handleChange}
                                        min={1}
                                        max={64}
                                        step={1}
                                        className="custom-range"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "0.75rem",
                                            fontWeight: 600,
                                            color: "white",
                                        }}
                                    >
                                        Seleccionar seguros que desee agregar:
                                    </label>
                                    <div className="checkbox-group">
                                        <label className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                name="seguroDeDegravamen"
                                                checked={
                                                    formData.seguroDeDegravamen
                                                }
                                                onChange={handleChange}
                                            />
                                            Seguro de Degravamen
                                        </label>
                                        <label className="checkbox-item">
                                            <input
                                                type="checkbox"
                                                name="seguroDeCesantia"
                                                checked={
                                                    formData.seguroDeCesantia
                                                }
                                                onChange={handleChange}
                                            />
                                            Seguro de Cesantía
                                        </label>
                                    </div>
                                </div>

                                <input
                                    type="hidden"
                                    name="userID"
                                    value={
                                        user.userType === "noCliente"
                                            ? user.sessionId
                                            : user.rut
                                    }
                                />

                                <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
                                    {hasShownInSession && (
                                        <button
                                            type="button"
                                            onClick={handleOpenSuggestion}
                                            className="navbar-btn"
                                            style={{ 
                                                background: "rgba(255, 255, 255, 0.1)", 
                                                border: "1px solid white",
                                                color: "white",
                                                fontSize: "0.9rem",
                                                padding: "10px 20px"
                                            }}
                                        >
                                            Ver sugerencia personalizada
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        className="navbar-btn"
                                    >
                                        Simular
                                    </button>
                                </div>
                            </form>

                            {error && !creditData.cuotaMensual && (
                                <p style={{ color: "red" }}>{error}</p>
                            )}

                            <hr
                                style={{
                                    borderColor: "rgba(255,255,255,0.3)",
                                    margin: "2rem 0",
                                }}
                            />

                            {/* RESULTS */}
                            {creditData.cuotaMensual && (
                                <div className="simulation-results">
                                    <div className="result-item">
                                        <div className="result-icon">1</div>
                                        <span className="result-label">
                                            Cuota mensual:
                                        </span>
                                        <span className="result-value">
                                            {formatMoney(
                                                creditData.cuotaMensual
                                            )}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <div className="result-icon">2</div>
                                        <span className="result-label">
                                            Costo Total (CTC):
                                        </span>
                                        <span className="result-value">
                                            {formatMoney(creditData.ctc)}
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <div className="result-icon">3</div>
                                        <span className="result-label">
                                            Tasa de interés:
                                        </span>
                                        <span className="result-value">
                                            {creditData.tasaInteres}%
                                        </span>
                                    </div>

                                    <div className="result-item">
                                        <div className="result-icon">4</div>
                                        <span className="result-label">
                                            CAE:
                                        </span>
                                        <span className="result-value">
                                            {parseFloat(creditData.cae).toFixed(
                                                2
                                            )}
                                            %
                                        </span>
                                    </div>

                                    {creditData.costoSeguros > 0 && (
                                        <div className="result-item">
                                            <div className="result-icon">5</div>
                                            <span className="result-label">
                                                Total seguros:
                                            </span>
                                            <span className="result-value">
                                                {formatMoney(
                                                    creditData.costoSeguros
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BUTTONS – NOW VISIBLE & CENTERED */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: "1.5rem",
                                    marginTop: "2rem",
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    type="button"
                                    className="navbar-btn navbar-btn-green"
                                    onClick={() =>
                                        alert("Simulación enviada al correo!")
                                    }
                                >
                                    Enviar simulación a email
                                </button>

                                <Link
                                  to="/creditApplication"
                                  state={{ cuotaEstimada: creditData.cuotaMensual }}
                                  className="navbar-btn"
                                >
                                    Solicitar crédito simulado
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3
                                style={{
                                    marginBottom: "1.5rem",
                                    color: "white",
                                }}
                            >
                                Antes de comenzar
                            </h3>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <Link
                                    to="/login"
                                    className="navbar-btn"
                                    style={{
                                        width: "220px",
                                        textAlign: "center",
                                    }}
                                >
                                    Soy cliente
                                </Link>

                                <button
                                    onClick={toggleVisibility}
                                    className="navbar-btn"
                                    style={{ width: "220px" }}
                                >
                                    No soy cliente
                                </button>
                            </div>

                            {isVisible && (
                                <CardData onClose={toggleVisibility} />
                            )}
                        </>
                    )}
                </GlassPanel>
            </div>

            {showHistory && (
                <HistoryModal
                    history={historySimulation}
                    onClose={() => setShowHistory(false)}
                    onRestore={handleRestore}
                />
            )}

            {showSuggestionModal && suggestedData && (
                <SuggestionModal
                    suggestedData={suggestedData}
                    onAccept={handleAcceptSuggestion}
                    onManual={handleManualEntry}
                />
            )}

            <BottomBar />
        </>
    );
}

export default Simulator;
