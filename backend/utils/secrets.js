import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import logger from './logger.js';

/**
 * In a professional 10/10 production environment, 
 * you wouldn't keep secrets in a .env file on the server.
 * You would fetch them from AWS Secrets Manager.
 */

export const getSecret = async (secretName) => {
  // If we are in local development, return from process.env
  if (process.env.NODE_ENV !== 'production') {
    return process.env[secretName];
  }

  // If we are in production, fetch from AWS Secrets Manager
  const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || 'ap-south-1'
  });

  try {
    const command = new GetSecretValueCommand({ SecretId: secretName });
    const data = await client.send(command);
    
    if ('SecretString' in data) {
      return JSON.parse(data.SecretString);
    }
    return data.SecretBinary;
  } catch (err) {
    logger.error(`Error fetching secret ${secretName} from AWS: ${err.message}`);
    return process.env[secretName]; // Fallback to env
  }
};
