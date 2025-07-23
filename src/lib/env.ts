// Environment variable validation and configuration

interface RequiredEnvVars {
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  GITHUB_ID: string;
  GITHUB_SECRET: string;
  MONGODB_URI: string;
  GROQ_API_KEY: string;
  LINKUP_API_KEY?: string; // Optional for now
}

interface OptionalEnvVars {
  NODE_ENV?: string;
  VERCEL_URL?: string;
  DATABASE_URL?: string;
}

type EnvVars = RequiredEnvVars & OptionalEnvVars;

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

function validateEnvVar(name: keyof RequiredEnvVars, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new EnvironmentError(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function validateEnvironment(): EnvVars {
  try {
    return {
      // Required variables
      NEXTAUTH_SECRET: validateEnvVar('NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET),
      NEXTAUTH_URL: validateEnvVar('NEXTAUTH_URL', process.env.NEXTAUTH_URL),
      GITHUB_ID: validateEnvVar('GITHUB_ID', process.env.GITHUB_ID),
      GITHUB_SECRET: validateEnvVar('GITHUB_SECRET', process.env.GITHUB_SECRET),
      MONGODB_URI: validateEnvVar('MONGODB_URI', process.env.MONGODB_URI),
      GROQ_API_KEY: validateEnvVar('GROQ_API_KEY', process.env.GROQ_API_KEY),
      
      // Optional variables
      LINKUP_API_KEY: process.env.LINKUP_API_KEY,
      NODE_ENV: process.env.NODE_ENV || 'development',
      VERCEL_URL: process.env.VERCEL_URL,
      DATABASE_URL: process.env.DATABASE_URL,
    };
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    throw error;
  }
}

// Validate environment on module load
let env: EnvVars;

try {
  env = validateEnvironment();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('❌ Failed to validate environment variables');
  throw error;
}

export { env, EnvironmentError };
export default env;