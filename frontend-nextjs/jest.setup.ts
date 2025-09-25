import { config } from "dotenv";

// Fuerza a leer el archivo .env.development cuando corres test
config({ path: ".env.development" });
