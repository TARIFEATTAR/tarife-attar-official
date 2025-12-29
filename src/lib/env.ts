/**
 * Environment Variable Validation
 * 
 * This ensures all required environment variables are present at build time
 * and provides typed access throughout the application.
 */

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value || "";
}

export const env = {
  // Sanity Configuration
  sanity: {
    projectId: getEnvVar("NEXT_PUBLIC_SANITY_PROJECT_ID"),
    dataset: getEnvVar("NEXT_PUBLIC_SANITY_DATASET"),
    apiVersion: getEnvVar("NEXT_PUBLIC_SANITY_API_VERSION", false) || "2024-01-01",
  },
  
  // Application
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;

// Type for the env object
export type Env = typeof env;
