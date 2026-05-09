/**
* Se verifica si el rut proporcionado es valido o invalido.
* @param {string} rut - RUT que se busca analizar (el formato debe ser XXXXXXXX-X o XXXXXXX-X).
* @returns {Boolean} true si el rut es invalido, false si el rut es valido
* 
* @example
* const validRUT = isInvalidRUT("11111111-1");
* console.log(validRUT); // Output: true
*/

// Configuración global: true para modo producción (con validación), false para modo debug (sin validación)
const production = false;

const isInvalidRUT = (rut) => {
    // Si no estamos en producción, el RUT siempre se considera válido
    if (!production){
        return false;
    }

    const dv = rut.slice(-1);
    const body = rut.slice(0, -2);

    try {
        let aux = 2;
        let sum = 0;
        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * aux;

            if (aux === 7) {
                aux = 2;
            } else {
                aux++;
            }
        }

        aux = sum % 11;
        aux = 11 - aux;

        switch (aux) {
            case 10:
                aux = "K";
                break;
            case 11:
                aux = "0";
                break;
            default:
                aux = aux.toString();
        }

        if (aux !== dv) {
            throw Error("dv no coincide");
        }

        return false;
    } catch (err) {
        console.log(err);
        return true;
    }
};

module.exports = { isInvalidRUT, production };