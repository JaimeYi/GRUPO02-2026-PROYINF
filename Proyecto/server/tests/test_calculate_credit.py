import unittest
import requests
import json
import uuid
from unittest.mock import patch

class TestCalculateCredit(unittest.TestCase):
    """
    Pruebas unitarias para el endpoint POST /api/simulator/calculateCredit
    HU Asociada: HU-001 (Simular crédito de consumo)
    
    Casos de prueba:
    - TC-003: Cálculo exitoso con datos válidos
    - TC-004: Rechazo por datos incompletos (Validación de campos)
    """
    
    @classmethod
    def setUpClass(cls):

        cls.port = 5000
        cls.base_url = f"http://localhost:{cls.port}/api"
        cls.calculate_url = f"{cls.base_url}/simulator/calculateCredit"
        
        # Crear sesión HTTP
        cls.session = requests.Session()
        
        # Generar UUID para usuario guest (simulando sesión de invitado)
        cls.guest_user_id = str(uuid.uuid4())
        
        print("\n" + "="*70)
        print("PRUEBAS UNITARIAS: POST /api/simulator/calculateCredit")
        print("="*70)
        print(f"URL de prueba: {cls.calculate_url}")
        print(f"Usuario invitado (ID): {cls.guest_user_id}")
        print("="*70 + "\n")

    def test_tc003_calcular_credito_datos_validos(self):
        """
        TC-003: Cálculo exitoso con parámetros válidos y completos
        
        ENTRADA:
        - plazoCredito: 12 (valor normal)
        - seguroDeCesantia: 1 (activado)
        - seguroDeDegravamen: 1 (activado)
        - montoSimulacion: 500000 (monto típico)
        - userType: "noCliente" (usuario invitado)
        - userID: UUID válido
        
        SALIDA ESPERADA:
        - Status Code: 200
        - Campos presentes: cuotaMensual, ctc, tasaInteres, cae, costoSeguros
        - costoSeguros: 6000 (2 seguros × 3000)
        
        CLASE DE EQUIVALENCIA: Valores normales, todos los campos obligatorios
        """
        
        payload = {
            "plazoCredito": 12,
            "seguroDeCesantia": 1,
            "seguroDeDegravamen": 1,
            "montoSimulacion": 500000,
            "userType": "noCliente",
            "userID": self.guest_user_id
        }
        
        print("\n>>> TC-003: Calcular crédito con datos válidos")
        print(f"Payload enviado:\n{json.dumps(payload, indent=2)}\n")
        
        # Realizar petición POST
        response = self.session.post(self.calculate_url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Respuesta:\n{json.dumps(response.json(), indent=2)}\n")
        
        # Validaciones
        self.assertEqual(
            response.status_code, 200,
            f"Se esperaba status 200, se recibió {response.status_code}"
        )
        
        data = response.json()
        
        # Validar que no es error
        self.assertNotIn(
            "error", data,
            f"La respuesta contiene un error: {data.get('error')}"
        )
        
        # Validar campos obligatorios en la respuesta
        required_fields = ["cuotaMensual", "ctc", "tasaInteres", "cae", "costoSeguros"]
        for field in required_fields:
            self.assertIn(
                field, data,
                f"Campo requerido '{field}' no presente en la respuesta"
            )
        
        # Validar que los valores son números positivos
        self.assertGreater(
            data["cuotaMensual"], 0,
            "cuotaMensual debe ser mayor a 0"
        )
        
        self.assertGreater(
            data["ctc"], 0,
            "ctc debe ser mayor a 0"
        )
        
        self.assertGreater(
            data["cae"], 0,
            "cae debe ser mayor a 0"
        )
        
        # Validar cálculo de costoSeguros (2 seguros × 3000 = 6000)
        self.assertEqual(
            data["costoSeguros"], 6000,
            f"costoSeguros debe ser 6000 (2 seguros × 3000), se obtuvo {data['costoSeguros']}"
        )
        
        # Validar que ctc es mayor o igual a cuotaMensual * plazo
        expected_min_ctc = data["cuotaMensual"] * payload["plazoCredito"]
        self.assertGreaterEqual(
            data["ctc"], expected_min_ctc * 0.99,  # con tolerancia del 1%
            f"ctc debe ser aproximadamente cuotaMensual × plazo"
        )
        
        print("    TC-003 PASÓ: Cálculo de crédito exitoso con datos válidos\n")

    def _soft_assert(self, condition, message, errors):
        if not condition:
            errors.append(message)

    def test_tc004_rechazar_dato_incompleto(self):
        """
        TC-004: Rechazo por campo obligatorio faltante
        
        ENTRADA:
        - plazoCredito: 24 (presente)
        - seguroDeCesantia: 0 (presente)
        - seguroDeDegravamen: 0 (presente)
        - montoSimulacion: OMITIDO (faltante - campo obligatorio)
        - userType: "noCliente" (presente)
        - userID: UUID válido (presente)
        
        SALIDA ESPERADA:
        - Status Code: 500 o 400 (error del servidor)
        - Respuesta contiene mensaje de error
        
        CLASE DE EQUIVALENCIA: Valor faltante (frontera)
        TIPO DE PRUEBA: Negativa - Validación de errores
        """
        
        # Payload SIN el campo montoSimulacion
        payload = {
            "plazoCredito": 24,
            "seguroDeCesantia": 0,
            "seguroDeDegravamen": 0,
            # FALTA: "montoSimulacion"
            "userType": "noCliente",
            "userID": self.guest_user_id
        }
        
        print("\n>>> TC-004: Rechazar petición sin campo obligatorio (montoSimulacion)")
        print(f"Payload enviado:\n{json.dumps(payload, indent=2)}\n")
        
        # Realizar petición POST
        response = self.session.post(self.calculate_url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        try:
            response_data = response.json()
        except ValueError as exc:
            response_data = None
            print(f"Respuesta no es JSON: {exc}")

        if response_data is not None:
            print(f"Respuesta:\n{json.dumps(response_data, indent=2)}\n")
        
        # Validar que la petición fue rechazada
        # Puede ser 400 (Bad Request) o 500 (Internal Server Error)
        errors = []
        self._soft_assert(
            response.status_code in [400, 500],
            f"Se esperaba error (400 ó 500), se recibió {response.status_code}",
            errors
        )

        data = response_data if response_data is not None else {}
        
        # Validar que la respuesta contiene un error
        self._soft_assert(
            "error" in data,
            "La respuesta debe contener un campo 'error' para indicar el fallo",
            errors
        )
        
        # El error NO debe contener los campos de éxito
        error_fields = ["cuotaMensual", "ctc", "tasaInteres", "cae"]
        for field in error_fields:
            self._soft_assert(
                field not in data,
                f"Con error, no debe haber campo '{field}' en la respuesta",
                errors
            )

        if errors:
            self.fail("\n".join(errors))
        
        print("    TC-004 PASÓ: Petición rechazada correctamente por datos incompletos\n")

    @classmethod
    def tearDownClass(cls):
        """
        Limpieza después de todas las pruebas.
        Se ejecuta UNA SOLA VEZ después de todos los tests.
        """
        cls.session.close()
        
        print("="*70)
        print("RESUMEN DE EJECUCIÓN")
        print("="*70)
        print("Sesión cerrada")
        print("Todos los recursos liberados")
        print("="*70 + "\n")


if __name__ == '__main__':
    # Ejecutar con verbosidad
    unittest.main(verbosity=2)
