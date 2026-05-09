# Diseño de Casos de Prueba - POST /api/simulator/calculateCredit

## Información General
- **Endpoint:** `POST /api/simulator/calculateCredit`
- **Descripción:** Calcula un crédito de consumo con seguros y genera un registro en el historial
- **Framework:** Python unittest
- **HU Asociada:** HU-002 (Simular crédito de consumo)
- **Desarrollador:** [Tu nombre]
- **Fecha:** 2026-05-09

---

## CASO DE PRUEBA 1: Cálculo Exitoso con Datos Válidos (Clase de Equivalencia Normal)

### Información del Caso

| Aspecto | Descripción |
|--------|------------|
| **ID del Caso** | TC-001 |
| **Nombre** | Calcular crédito con parámetros válidos y completos |
| **Tipo** | Prueba Positiva / Happy Path |
| **Contexto** | Usuario invitado (noCliente) solicita simulación de crédito |
| **Precondiciones** | Servidor corriendo en puerto 5000, Base de datos accesible |

### Tabla de Entrada/Salida Esperada

| Campo | Valor Ingresado | Clase de Equivalencia | Justificación |
|-------|-----------------|----------------------|---------------|
| `plazoCredito` | 12 | Valor Normal | Rango típico: 6-60 meses |
| `seguroDeCesantia` | 1 | Valor Válido (booleano) | Representa "activado" |
| `seguroDeDegravamen` | 1 | Valor Válido (booleano) | Representa "activado" |
| `montoSimulacion` | 500000 | Valor Normal | Monto típico de crédito |
| `userType` | "noCliente" | Valor Válido | Usuario sin cuenta registrada |
| `userID` | UUID válido | Identificador Válido | UUID de sesión invitado |

### Salida Esperada

```json
{
  "cuotaMensual": 44500,
  "ctc": 534000,
  "tasaInteres": 2.19,
  "cae": 29.85,
  "costoSeguros": 6000
}
```

**Estado HTTP esperado:** `200 OK`

### Validaciones Implementadas
- ✓ Response status code = 200
- ✓ Respuesta contiene campo "cuotaMensual" (número > 0)
- ✓ Respuesta contiene campo "ctc" (número > 0)
- ✓ Respuesta contiene campo "tasaInteres" (número > 0)
- ✓ Respuesta contiene campo "cae" (número > 0)
- ✓ costoSeguros = 6000 (2 seguros × 3000 cada uno)
- ✓ ctc ≈ cuotaMensual × plazoCredito
- ✓ Simulación se registra en base de datos

---

## CASO DE PRUEBA 2: Rechazo con Datos Incompletos (Clase de Equivalencia Inválida)

### Información del Caso

| Aspecto | Descripción |
|--------|------------|
| **ID del Caso** | TC-002 |
| **Nombre** | Rechazar solicitud con campo obligatorio faltante |
| **Tipo** | Prueba Negativa / Error Handling |
| **Contexto** | Usuario intenta simular crédito sin proporcionar monto |
| **Precondiciones** | Servidor running, aplicación valida campos obligatorios |

### Tabla de Entrada/Salida Esperada

| Campo | Valor Ingresado | Clase de Equivalencia | Justificación |
|-------|-----------------|----------------------|---------------|
| `plazoCredito` | 24 | Valor Válido | Presente |
| `seguroDeCesantia` | 0 | Valor Válido | Presente |
| `seguroDeDegravamen` | 0 | Valor Válido | Presente |
| `montoSimulacion` | **OMITIDO** | Valor Faltante (Frontera) | Campo obligatorio - FRONTERA |
| `userType` | "noCliente" | Valor Válido | Presente |
| `userID` | UUID válido | Identificador Válido | Presente |

### Salida Esperada

```json
{
  "error": "Error en base de datos" 
}
```

**Estado HTTP esperado:** `500 Internal Server Error` (o `400 Bad Request`)

### Validaciones Implementadas
- ✓ Response status code = 500 ó 400 (indica error)
- ✓ Respuesta contiene campo "error"
- ✓ Respuesta NO contiene "cuotaMensual", "ctc", "tasaInteres", "cae"
- ✓ No se registra simulación en base de datos
- ✓ La solicitud es rechazada correctamente

---

## Relación con Historias de Usuario

### HU-002: Simular Crédito de Consumo
**Descripción:** Como usuario invitado, deseo calcular un crédito de consumo ingresando montos, plazos y opciones de seguros.

**Escenarios cubiertos:**
- **Escenario 1 (TC-001):** Usuario ingresa datos válidos → sistema calcula crédito → muestra resultado
- **Escenario 2 (TC-002):** Usuario omite campo → sistema rechaza → muestra error
