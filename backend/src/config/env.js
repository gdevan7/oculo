// Reads and checks environment variables in one place so the rest of the code never touches process.env.
export function readConfig(env = process.env) {
  const port = Number(env.PORT || 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a whole number between 1 and 65535");
  }
  return {
    port,
    databaseUrl: env.DATABASE_URL || null, // unset: the API keeps the catalog in memory
    frontendOrigin: env.FRONTEND_ORIGIN || "http://localhost:5173",
    adminApiKey: env.ADMIN_API_KEY || null, // unset: catalog write endpoints are disabled
  };
}
