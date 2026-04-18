## Funcionamiento del proyecto
Por el Stack de tecnologías definido para este proyecto su ejecución se separa en dos servicios. Uno de estos servicios será el `Frontend` el cual se realiza con el **Framework React**, mientras que el otro servicio será el `Backend` el cual se realiza con el **Framework Express**. Como se puede notar, para ambos servicios se utilizan Frameworks de `JavaScript` por lo que para poder ejecutar este proyecto será necesario contar de antemano con el runtime environment **Node.js**.

Dentro de la carpeta `client` se encuentra todo lo relacionado con **React**, mientras que en la carpeta `server` se encuentra todo lo relacionado con **Express**. Para obtener mayor detalle sobre como levantar cada uno de estos servicios, ingresar en la carpeta que corresponda.

# IMPORTANTE (LEER ANTES DE PROBAR LA APLICACIÓN)
Dado que se está en una fase de testing, se trabajara con un User fijo (es posible crear otros, pero esto es más que todo para facilitar el testeo). Para crear este User fijo se adjuntó un documento PDF en la raíz del proyecto nombrado `clientePruebas.pdf` el cual contiene una liquidación de sueldo de un cliente de prueba falso.

**Nuevo flujo de registro automatizado con IA:**
1. Al registrarte, el primer paso que se te pedirá será subir el archivo `clientePruebas.pdf`.
2. El sistema utilizará Inteligencia Artificial (Gemini) para leer el documento y autocompletará de forma inteligente y segura el RUT, Nombre, Sueldo Líquido, Dirección y Teléfono en el formulario.
3. Solo deberás rellenar manualmente los campos restantes que la IA no encuentre (como el Correo electrónico y las Contraseñas).

### Archivo .env
Antes de poner en ejecución el proyecto, se deberá crear un archivo `.env` en la carpeta `server/` con las siguientes variables:
- `JWT_SECRET="<JWT_SECRET>"`
- `GEMINI_API_KEY="<GEMINI_API_KEY>"`

Para la variable `JWT_SECRET` se puede ocupar cualquier string, aunque preferiblemente se recomienda utilizar el comando `openssl rand -base64 32` para generar uno. Para la variable `GEMINI_API_KEY` se deberá obtener una API KEY en el sitio https://aistudio.google.com para que funcione la IA Gemini en el proceso de registro, en caso contrario no sera posible registrarse.
Los pasos a seguir para obtener la API KEY son los siguientes:
- Acceder al sitio
- Acceder a `Get API Key` abajo a la izquierda
- Crear un nuevo proyecto (puede ser cualquier nombre y motivo)
- Copiar la API KEY generada y colocarla en `server/.env` en el comentario  `# GEMINI_API_KEY = "<API_KEY>"` (borrando el '#')
- Una vez hecho esto, se puede ejecutar el proyecto de parte del server, es decir, ejecutar por terminal `docker compose up` o sus variantes.