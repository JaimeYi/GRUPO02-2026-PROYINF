import "../css/navbar.css";
import Logo from "../media/svg/banking-online-web-bank-svgrepo-com.svg";
import { useAuth } from "./auth";
import { Link, useLocation } from "react-router-dom";
import { production } from "../utils/rutVerifier";

function Navbar() {
    const { user, logout, isLoading } = useAuth(); // Usar esta linea en cada vista que se requiera verificar si el usuario esta logeado o no
    const location = useLocation();
    const logoLink = (
        <Link to="/" className="logo">
            <img src={Logo} alt="Logo" className="logo" />
        </Link>
    );

    if (isLoading) {
        return null;
    }

    const openHistory = () => {
        // Dispatch a window event to open the modal from Simulator
        window.dispatchEvent(new Event("openHistoryModal"));
    };

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {logoLink}
                {!production && (
                    <span style={{ 
                        marginLeft: '15px', 
                        padding: '4px 10px', 
                        background: '#ff4444', 
                        color: 'white', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                    }}>
                        MODO DEBUG
                    </span>
                )}
            </div>
            <ul className="listButtons">
                {(user === null || user.userType === 'noCliente') ? ( // De esta manera se utiliza el condicional para mostrar cierta opcion dependiendo si el usuario esta logeado o no
                    <>
                        <li>
                            <a href="/login">Iniciar sesión</a>
                        </li>
                        <li>
                            <a href="/register">Registrarse</a>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <a href="/pay">Pagar cuotas</a>
                        </li>
                        {/* 👇 Only show this when on the simulator page */}
                        {location.pathname === "/simulator" && (
                            <li>
                                <button className="navbar-btn" onClick={openHistory}>
                                    Historial
                                </button>
                            </li>
                        )}
                        <li>
                            <button className="navbar-btn" onClick={logout}>Cerrar Sesión</button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
