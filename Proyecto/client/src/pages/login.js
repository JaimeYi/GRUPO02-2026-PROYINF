import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth";
import Navbar from "../components/Navbar";
import "../css/home.css";

function Login() {
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        rut: "",
        contrasena: "",
    });
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

        try {
            const response = await fetch(
                "http://localhost:5000/api/userManagement/login",
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
            sessionStorage.removeItem("suggestionShown");

            alert(`Inicio de sesión exitoso! Serás redirigido.`);
            navigate("/");
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div>
            <Navbar />

            <main className="home-page">
                <div className="hero-card">
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <h2>Iniciar sesión</h2>
                    <p>Accede a tu cuenta para ver y simular productos de crédito.</p>
                    <form onSubmit={handleSubmit} className="card-form">
                        <label htmlFor="rut">Rut</label>
                        <input
                            type="text"
                            id="rut"
                            name="rut"
                            value={formData.rut}
                            onChange={handleChange}
                            required
                        />

                        <label htmlFor="contrasena">Contraseña</label>
                        <input
                            type="password"
                            id="contrasena"
                            name="contrasena"
                            value={formData.contrasena}
                            onChange={handleChange}
                            required
                        />

                        <button type="submit" className="hero-btn">Iniciar Sesión</button>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default Login;
