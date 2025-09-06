require('dotenv').config();
require('./db/config');         
const app = require('./server/server');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Servidor funcionando en puerto ${PORT}`));
