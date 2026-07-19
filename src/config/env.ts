import dotenv from 'dotenv';

dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

export const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};
