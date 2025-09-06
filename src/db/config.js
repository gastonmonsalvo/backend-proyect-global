const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE = process.env.DATABASE_URI;
const DB_NAME = process.env.DB_NAME;

(async () => {
  try {
    await mongoose.connect(DATABASE , {dbName: DB_NAME});
    console.log("Base de datos conectada");
    console.log(`Conectado a ${DATABASE} (db: ${DB_NAME})`);
  } catch (error) {
    console.log(error);
  }
})();
