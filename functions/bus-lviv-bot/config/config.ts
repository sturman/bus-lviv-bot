const getEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
};

export const apiUrl = getEnvVar('API_URL');
export const token = getEnvVar('BOT_TOKEN');
