import Navbar from "../components/Navbar";
import GlassPanel from "../components/GlassPanel";
import { useState } from "react";

const PaymentButton = () => {
    const [formData, setFormData] = useState({
            monto: 1
        });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError("");

        const orderData = {
            amount: formData.monto, // monto para probar
            buyOrder: "orden_" + Math.floor(Math.random() * 1000000),
            sessionId: "sesion_" + Date.now()
        };

        try {
            const response = await fetch("http://localhost:5000/api/webpay/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const errResult = await response.json();
                throw new Error(errResult.error || "Ocurrió un error al iniciar el pago.");
            }

            const data = await response.json();
            return autoSubmitForm(data.url, data.token);

        } catch (error) {
            console.error("Error iniciando pago", error);
            setError(error.message || "Error de comunicación con el servidor de pagos.");
        }
    };

    // Función auxiliar para crear y enviar el formulario "al vuelo"
    const autoSubmitForm = (url, token) => {
        const form = document.createElement("form");
        form.action = url;
        form.method = "POST";
    
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "token_ws";
        input.value = token;
    
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit(); // Esto redirige al usuario a Transbank
    };

    return (
        <>
        <Navbar />
        <div style={{ textAlign: "center", height: "48.3rem", paddingTop: "15rem"}}>
                <GlassPanel>
                    <h3>Paga aqui tus cuotas</h3>
                    <form onSubmit={handlePayment} className="card-form">
                        <label htmlFor="direccion">Monto a abonar</label>
                                <input
                                    type="number"
                                    id="monto"
                                    name="monto"
                                    value={formData.monto}
                                    onChange={handleChange}
                                    min={1}
                                    required
                                />

                    <button type="submit" className="hero-btn">
                        Pagar con Webpay
                    </button>
                    {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
                    </form>
                </GlassPanel>
            </div>
        </>
    );
};

export default PaymentButton;