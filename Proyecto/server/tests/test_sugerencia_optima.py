import unittest
import requests

class TestSuggestedLoan(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """Preparación de sesión y variables"""
        cls.port = 5000
        cls.base_url = f"http://localhost:{cls.port}/api"
        
        # 1. RUTA según userManagement.routes.js
        cls.login_url = f"{cls.base_url}/userManagement/login" 
        
        # Ruta del simulador según simulator.routes.js
        cls.suggest_url = f"{cls.base_url}/simulator/suggestedLoan" 
        
        cls.session = requests.Session()
        
        print("Intentando inicio de sesión...")
        
        # 2. según userManagement.controllers.js
        payload_login = {
            "rut": "18.999.000-5",
            "contrasena": "asdasd"
        }
        
        response = cls.session.post(cls.login_url, json=payload_login)
        
        if response.status_code == 200:
            print("Autenticación exitosa. Sesión preparada.\n")
        else:
            print(f"Alerta: No se pudo autenticar (Código {response.status_code}).")
            print(f"Mensaje del servidor: {response.text}\n")

    def test_obtener_sugerencia_con_auth_automatica(self):
        """Test 1: Verifica retorno de la sugerencia usando la sesión activa."""

        response = self.session.get(self.suggest_url)

        self.assertEqual(response.status_code, 200, "El servidor rechazó la sesión")
        
        data = response.json()
        data = response.json()
        print("\n\n--- DATOS DE LA SUGERENCIA ---")
        print(data)
        print("------------------------------\n")
        self.assertIsNotNone(data, "La respuesta de sugerencia llegó vacía")

    def test_rechazo_sin_sesion(self):
        """Test 2: Verificar petición sin sesión activa (esperado: 401)."""
        response = requests.get(self.suggest_url)

        self.assertIn(response.status_code, [401, 403], "El sistema permitió acceso sin token")

    @classmethod
    def tearDownClass(cls):
        cls.session.close()
        print("\nPruebas finalizadas y sesión cerrada.")

if __name__ == '__main__':
    unittest.main()