import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../css/home.css";
import { isInvalidRUT } from "../utils/rutVerifier";

function Register() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        rut: "",
        nombre: "",
        correo: "",
        telefono: "",
        contrasena: "",
        ingresoLiquido: "",
        direccion: ""
    });

    const [liquidacion, setLiquidacion] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("False");
    const [pdfUploaded, setPdfUploaded] = useState(false);
    
    // Estado para saber qué campos fueron extraídos y por tanto deben ser de solo lectura
    const [readOnlyFields, setReadOnlyFields] = useState({
        rut: false,
        nombre: false,
        ingresoLiquido: false,
        direccion: false,
        telefono: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLiquidacion(file);
        setLoading("True");
        setError("");

        try {
            const dataToSend = new FormData();
            dataToSend.append('pdfFile', file);
            
            const response = await fetch("http://localhost:5000/api/pdfParser", {
                method: "POST",
                body: dataToSend
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Ocurrió un error al analizar el PDF.");
            }

            console.log("Datos extraídos del PDF:", result);

            // Rellenar formData con los datos extraídos si existen.
            setFormData(prev => ({
                ...prev,
                rut: result.rut || prev.rut,
                nombre: result.nombre || prev.nombre,
                ingresoLiquido: (result.sueldo && result.sueldo !== -1) ? result.sueldo : prev.ingresoLiquido,
                direccion: result.direccion || prev.direccion,
                telefono: result.telefono || prev.telefono
            }));

            // Marcar como solo lectura los campos que la IA encontró exitosamente
            setReadOnlyFields({
                rut: !!result.rut,
                nombre: !!result.nombre,
                ingresoLiquido: !!(result.sueldo && result.sueldo !== -1),
                direccion: !!result.direccion,
                telefono: !!result.telefono
            });

            setPdfUploaded(true);
            setLoading("False");

        } catch (error) {
            setLoading("False");
            setError(error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.contrasena !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        
        if (await isInvalidRUT(formData.rut)){
            setError("El rut ingresado es inválido");
            return;
        }

        setLoading("True");

        try {
            const registerData = {
                ...formData,
                ingresoLiquido: parseInt(formData.ingresoLiquido, 10)
            };

            const response = await fetch(
                "http://localhost:5000/api/userManagement/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(registerData),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error || "Ocurrió un error desconocido."
                );
            }

            console.log("Respuesta del servidor:", result);
            alert(`¡Registro exitoso ${formData.nombre}! Serás redirigido.`);
            navigate("/login");
            setLoading("False");
        } catch (error) {
            setLoading("False");
            setError(error.message);
        }
    };

    return (
        <div>
            <Navbar />
            <main className="home-page">
                <div className="hero-card">
                    {loading === "True" ? (
                        <>
                            <h1>{pdfUploaded ? "Registrando usuario..." : "Extrayendo datos de la liquidación..."}</h1>
                        </>
                    ) : (
                        <>
                            <h2>Registrarse</h2>
                            <p>Sube tu liquidación de sueldo primero para autocompletar tus datos de forma segura.</p>
                            
                            <div style={{ marginBottom: "20px", padding: "15px", border: "1px dashed #ccc", borderRadius: "8px" }}>
                                <label htmlFor="pdfFile" style={{ display: "block", marginBottom: "10px", fontWeight: "bold" }}>1. Sube tu liquidación de sueldo (PDF)</label>
                                <input
                                    type="file"
                                    id="pdfFile"
                                    name="liquidacionDeSueldo"
                                    accept="application/pdf"
                                    onChange={handleFileUpload}
                                    ref={fileInputRef}
                                />
                            </div>

                            {pdfUploaded && (
                                <form onSubmit={handleSubmit} className="card-form">
                                    <p style={{ color: "green", fontSize: "14px", marginBottom: "15px" }}>
                                        Datos extraídos correctamente. Por favor completa los campos restantes.
                                    </p>

                                    <label htmlFor="rut">Rut {readOnlyFields.rut && "(Extraído)"}</label>
                                    <input
                                        type="text"
                                        id="rut"
                                        name="rut"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        maxLength={10}
                                        placeholder="12345678-K"
                                        readOnly={readOnlyFields.rut}
                                        style={{ backgroundColor: readOnlyFields.rut ? "#e9ecef" : "white" }}
                                        required
                                    />

                                    <label htmlFor="nombre">Nombre completo {readOnlyFields.nombre && "(Extraído)"}</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Juan Ignacio Pérez Rodriguez"
                                        readOnly={readOnlyFields.nombre}
                                        style={{ backgroundColor: readOnlyFields.nombre ? "#e9ecef" : "white" }}
                                        required
                                    />

                                    <label htmlFor="ingresoLiquido">Ingreso Líquido {readOnlyFields.ingresoLiquido && "(Extraído)"}</label>
                                    <input
                                        type="number"
                                        id="ingresoLiquido"
                                        name="ingresoLiquido"
                                        value={formData.ingresoLiquido}
                                        onChange={handleChange}
                                        placeholder="1000000"
                                        readOnly={readOnlyFields.ingresoLiquido}
                                        style={{ backgroundColor: readOnlyFields.ingresoLiquido ? "#e9ecef" : "white" }}
                                        required
                                    />

                                    <label htmlFor="direccion">Dirección {readOnlyFields.direccion && "(Extraída)"}</label>
                                    <input
                                        type="text"
                                        id="direccion"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        placeholder="Av. Vicuña Mackenna 3939"
                                        readOnly={readOnlyFields.direccion}
                                        style={{ backgroundColor: readOnlyFields.direccion ? "#e9ecef" : "white" }}
                                        required
                                    />

                                    <label htmlFor="telefono">Teléfono {readOnlyFields.telefono && "(Extraído)"}</label>
                                    <input
                                        type="text"
                                        id="telefono"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        placeholder="+56912345678"
                                        readOnly={readOnlyFields.telefono}
                                        style={{ backgroundColor: readOnlyFields.telefono ? "#e9ecef" : "white" }}
                                        required
                                    />

                                    <label htmlFor="correo">Correo electrónico</label>
                                    <input
                                        type="email"
                                        id="correo"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleChange}
                                        placeholder="someone@example.com"
                                        required
                                    />

                                    <label htmlFor="contrasena">Contraseña</label>
                                    <input
                                        type="password"
                                        id="contrasena"
                                        name="contrasena"
                                        value={formData.contrasena}
                                        onChange={handleChange}
                                        placeholder="********"
                                        required
                                    />

                                    <label htmlFor="confirmarContrasena">Repetir contraseña</label>
                                    <input
                                        type="password"
                                        id="confirmarContrasena"
                                        name="confirmarContrasena"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="********"
                                        required
                                    />

                                    {error && <p style={{ color: "red" }}>{error}</p>}

                                    <button type="submit" className="hero-btn">Registrarse</button>
                                </form>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Register;
