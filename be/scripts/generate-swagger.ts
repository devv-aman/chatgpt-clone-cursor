import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Set environment variables for config validation
process.env['NODE_ENV'] = 'development';
process.env['PORT'] = '3000';
process.env['SUPABASE_URL'] = 'https://placeholder.supabase.co';
process.env['SUPABASE_PUBLISHABLE_KEY'] = 'sb_publishable_placeholder';
process.env['SUPABASE_SECRET_KEY'] = 'sb_secret_placeholder';
process.env['JWT_SECRET'] = 'placeholder-jwt-secret-32-chars-min';
process.env['LOG_LEVEL'] = 'fatal';
process.env['CORS_ORIGIN'] = 'http://localhost:5173';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateSwagger = async (): Promise<void> => {
  const { swaggerSpec } = await import('../src/config/swagger.js');
  
  const outputPath = path.join(__dirname, '..', 'swagger.json');
  
  fs.writeFileSync(
    outputPath,
    JSON.stringify(swaggerSpec, null, 2),
    'utf-8'
  );
  
  console.log(`Swagger JSON generated at: ${outputPath}`);
};

generateSwagger().catch(console.error);

