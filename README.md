
# 📚 Proyecto Integrador – Biblioteca con API Externa

Sistema de gestión de libros con Node.js, Express y MongoDB.  
Permite registrar libros, gestionar préstamos y devoluciones, y consultar información de Google Books mediante una API externa.

---

## 🚀 Tecnologías utilizadas
- **Node.js** + **Express** – servidor backend.
- **MongoDB Atlas** – base de datos en la nube.
- **Mongoose** – modelado de datos.
- **Express Validator** – validaciones robustas.
- **Axios** – consumo de API externa (Google Books).
- **Postman** – pruebas de endpoints.

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd <carpeta-del-proyecto>
```

### 2. Instalar dependencias
```bash
npm install express mongoose axios dotenv express-validator 
npm install -D nodemon
```

### 3. Configurar variables de entorno
Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>/<dbname>?retryWrites=true&w=majority
DB_NAME=
GOOGLE_BOOKS_API= 
```
### 3bis . Set de Carga para MONGO

    books.seed.json



### 4. Levantar el servidor
```bash
npm run dev
```

Servidor corriendo en:  
[http://localhost:XXXX](http://localhost:XXXX)

---

## 🗂 Estructura de carpetas

```
src/
│
├── app.js
│
├── controllers/
│   └── books.controllers.js
│
├── db/
│   └── config.js
│
├── models/
│   ├── book.model.js
│   └── loan.model.js
│
├── routers/
│   └── books.routes.js
│
├── server/
│   └── server.js
│
├── services/
│   ├── books.services.js
│   └── googleBooks.services.js
│
├── utils/
│   ├── checkLoanRules.js
│   ├── handleValidation.js
│   ├── isbnConvertions.js
│   ├── logger.js
│   ├── requireJson.js
│   └── respond.js
│
└── validators/
    ├── book.validators.js
    └── googleBookSearch.validator.js

```

## 📖 Endpoints principales

### Libros (MongoId y ISBN)
| Método    | Endpoint                 | Descripción                       |
|-----------|--------------------------|-----------------------------------|
| **GET**   | `/api/books`             | Listar todos los libros           |
| **GET**   | `/api/books/:id`         | Obtener libro por **MongoId**     |
| **GET**   | `/api/books/isbn/:isbn`  | Obtener libro por **ISBN**        |
| **POST**  | `/api/books`             | Crear nuevo libro                 |
| **PUT**   | `/api/books/:id`         | Actualizar libro por **MongoId**  |
| **PUT**   | `/api/books/isbn/:isbn`  | Actualizar libro por **ISBN**     |
| **DELETE**| `/api/books/:id`         | Eliminar libro por **MongoId**    |
| **DELETE**| `/api/books/isbn/:isbn`  | Eliminar libro por **ISBN**       |


> **Nota:**  
> - Se sugiere revisar el archivo isbn.txt**


### Préstamos y devoluciones
| Método  | Endpoint                      | Descripción                         |
|---------|-------------------------------|-------------------------------------|
| **POST**| `/api/books/:id/loan`         | Prestar libro por **MongoId**       |
| **POST**| `/api/books/:id/return`       | Devolver libro por **MongoId**      |
| **POST**| `/api/books/isbn/:isbn/loan`  | Prestar libro por **ISBN**          |
| **POST**| `/api/books/isbn/:isbn/return`| Devolver libro por **ISBN**         |

---

### Búsqueda en Google Books (API externa)
  
Búsqueda Unificada de Libros

Este proyecto implementa una API REST para la gestión de una base de datos de libros, integrada con **Google Books**.  
El endpoint `/api/books/search` permite realizar búsquedas inteligentes, combinando resultados externos con datos locales y aplicando filtros flexibles.

## 🌟 Funcionalidades principales

- **Búsqueda flexible**:
  - Por palabras clave (`q`)
  - Por ISBN-10 o ISBN-13 (`isbn`), con o sin guiones
  - `q` puede contener un ISBN mezclado y será detectado automáticamente

- **Cruce con la BD local**:
  - Marca en los resultados de Google cuáles libros ya existen en tu BD.
  - Incluye el `_id` local si está presente.

- **Filtros avanzados**:
  - `onlyLocal=1`: solo muestra libros que existen en tu BD.
  - `onlyMissing=1`: solo muestra libros que **no** existen en tu BD.
  - `includeLocal=1`: agrega una sección `localMatches` con coincidencias **solo locales** (por ISBN exacto o búsqueda en el título).

- **Paginación simple**:
  - `maxResults`: define la cantidad máxima de resultados desde Google.

---

## 🛠️ Endpoint principal

### `GET /api/books/search`

Endpoint unificado para buscar libros, consultar Google Books y cruzar con tu base local.

### Parámetros query soportados

| Parámetro      | Tipo    | Requerido | Descripción                                                                                      |
|----------------|---------|-----------|--------------------------------------------------------------------------------------------------|
| `q`            | String  | Opcional  | Palabras clave para buscar (o texto que contenga un ISBN).                                       |
| `isbn`         | String  | Opcional  | ISBN-10 o ISBN-13 directo. Si se envía, tiene prioridad sobre `q`.                               |
| `maxResults`   | Number  | Opcional  | Límite de resultados desde Google Books (por defecto `15`).                                      |
| `onlyLocal`    | Boolean | Opcional  | Si es `1`, solo muestra libros que existen en tu BD.                                             |
| `onlyMissing`  | Boolean | Opcional  | Si es `1`, solo muestra libros que **no** existen en tu BD.                                      |
| `includeLocal` | Boolean | Opcional  | Si es `1`, incluye una sección `localMatches` con resultados locales por ISBN y búsqueda parcial.|

> **Nota:**  
> - `onlyLocal` y `onlyMissing` son **mutuamente excluyentes**.
> - Si ambos se envían, tiene prioridad `onlyLocal`.

---

## 📥 Ejemplos de uso

### 1. Búsqueda por palabras clave
Busca 25 libros (default) en Google Books relacionados con "clean architecture".

```bash
GET /api/books/search?q=clean+architecture

---

### 🧪 Ejemplos de prueba en Postman

### 
Crear libro
```
POST /api/books
Content-Type: application/json

```json
  
{
  //Campos minimos
  "title": "Clean Code",      
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "year": 2008,
  "condition": "new"
}
```

**Respuesta 201**
```json
{
  "_id": "664b3f77d95efc2c7a3ad5e5",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "year": 2008,
  "condition": "new",
  "isLoaned": false,
  "loanHistory": []
}
```

---

### Prestar libro por ISBN
```
POST /api/books/isbn/9780132350884/loan
Content-Type: application/json
```
```json
{
  //Campos minimos
  "borrowerName": "name",
}
```

**Respuesta 200**
```json
{
  "_id": "664b3f77d95efc2c7a3ad5e5",
  "title": "Clean Code",
  "isLoaned": true,
  "currentLoan": {
    "borrowerName": "name",
    "loanDate": "2025-09-10T00:00:00.000Z"
  }
}
```

---

### Devolver libro por ISBN
```
POST /api/books/isbn/9780132350884/return
```

**Respuesta 200**
```json
{
  "_id": "664b3f77d95efc2c7a3ad5e5",
  "isLoaned": false,
  "loanHistory": [
    {
      "borrowerName": "Gaston",
      "loanDate": "2025-09-10T00:00:00.000Z",
      "returnDate": "2025-09-11T00:00:00.000Z"
    }
  ]
}
```

---

## 🧾 Validaciones

**Errores de validación** devuelven este formato:
```json
{
  "statusCode": 400,
  "message": "Errores de validación",
  "errors": [
    {
      "campo": "isbn",
      "valor": "",
      "error": "El ISBN debe tener al menos 10 caracteres"
    }
  ]
}
```

> Validaciones implementadas con **express-validator** en `book.validators.js`.

---

## 🧹 Prácticas aplicadas
- Arquitectura limpia separando **controllers**, **services**, **routers**, **validators** y **utils**.
- `respond.js` para respuestas uniformes.
- Los **services no dependen de Express**, retornan objetos planos (`{ statusCode, data|message }`).
- Rutas ordenadas: `/search` y `/isbn/:isbn` antes que `/:id`.
- Mensajes de error siempre en JSON (nunca HTML).

---

## 👥 Autor
**Gaston Monsalvo**  
Proyecto Integrador - Global Academy - 2025
