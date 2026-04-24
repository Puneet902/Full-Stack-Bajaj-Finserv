import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder_key';

// Initialize Supabase client
// Note: Replace the placeholder URL and Key in .env to use the actual database
export const supabase = createClient(supabaseUrl, supabaseKey);
