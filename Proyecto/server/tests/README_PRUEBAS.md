# README - PRUEBAS UNITARIAS

## POST /api/simulator/calculateCredit

### Descripción
Pruebas unitarias para el endpoint de cálculo de crédito de consumo.

**HU Asociada:** HU-002 (Simular crédito de consumo)
**Framework:** Python unittest
**Casos de Prueba:** 2 (TC-001, TC-002)

---

## Casos de Prueba

### TC-001: Calcular Crédito - Datos Válidos ✅
- **Clase de Equivalencia:** Valores normales
- **Entrada:** plazoCredito=12, montoSimulacion=500000, ambos seguros=1
- **Salida Esperada:** Status 200 + JSON con campos de cálculo
- **Validaciones:** Status, campos presentes, valores positivos, costoSeguros=6000

### TC-002: Rechazar - Campo Faltante ❌
- **Clase de Equivalencia:** Valor faltante (frontera)
- **Entrada:** Sin montoSimulacion (campo obligatorio)
- **Salida Esperada:** Status 500/400 + mensaje de error
- **Validaciones:** Error detectado, rechaza petición

---

## Cómo Ejecutar

### 1. Asegúrate que el servidor esté corriendo
```bash
# En carpeta server:
npm run dev
# O con Docker:
docker-compose up
```

### 2. Ejecuta las pruebas
```bash
# Desde la carpeta tests:
python -m unittest test_calculate_credit.TestCalculateCredit -v

# O con más detalle:
python test_calculate_credit.py
```

### 3. Captura el resultado
```bash
# Guardar en archivo:
python -m unittest test_calculate_credit.TestCalculateCredit -v > resultados.txt

# O tomar screenshot de la terminal
```

---

## Resultado Esperado

### Si Todo Funciona ✅
```
test_tc001_calcular_credito_datos_validos ... ok
test_tc002_rechazar_dato_incompleto ... ok

Ran 2 tests in X.XXXs
OK
```

### Si Hay Defectos ❌
Las pruebas mostrarán exactamente qué falló:
- Status code incorrecto
- Campo faltante
- Validación no funciona
- etc.

---

## Estructura de Archivos

```
Proyecto/
├── tests/
│   ├── test_calculate_credit.py          ← Código de pruebas
│   ├── DISENO_CASOS_PRUEBA.md            ← Diseño detallado
│   └── README_PRUEBAS.md                 ← Este archivo
```
