import { processHierarchies } from '../services/hierarchyService.js';
import { supabase } from '../config/supabaseClient.js';

export const handleBfhlPost = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: 'Invalid input. Expected JSON with a "data" array.' });
    }

    const result = processHierarchies(data);
    
    // Default fallback values
    let USER_ID = 'unknown_user';
    let EMAIL_ID = 'unknown@example.com';
    let COLLEGE_ROLL_NUMBER = 'UNKNOWN';

    // Fetch dynamic identity from Supabase using verified token uid
    if (req.user && req.user.uid) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', req.user.uid)
        .single();
        
      if (!error && userData) {
        // Format user_id as lowercase name with spaces replaced by underscores, plus a random suffix or just the name
        USER_ID = (userData.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        EMAIL_ID = userData.email || req.user.email;
        COLLEGE_ROLL_NUMBER = userData.roll_number || 'NOT_PROVIDED';
      } else {
        // Fallback to token if DB fetch fails
        USER_ID = (req.user.name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
        EMAIL_ID = req.user.email;
      }
    }

    const responseData = {
      user_id: USER_ID,
      email_id: EMAIL_ID,
      college_roll_number: COLLEGE_ROLL_NUMBER,
      ...result,
    };

    if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== '') {
      supabase
        .from('requests_log')
        .insert([{ input_data: req.body, response_data: responseData }])
        .then(({ error }) => {
          if (error) console.error('Supabase log error:', error.message);
        });
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Controller Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const handleBfhlHistory = async (_req, res) => {
  try {
    if (!process.env.SUPABASE_URL || process.env.SUPABASE_URL === '') {
      return res.status(200).json({ history: [] });
    }

    const { data, error } = await supabase
      .from('requests_log')
      .select('id, input_data, created_at')
      .order('created_at', { ascending: false })
      .limit(15);

    if (error) {
      console.error('Supabase history error:', error.message);
      return res.status(200).json({ history: [] });
    }

    return res.status(200).json({ history: data || [] });
  } catch (error) {
    console.error('History Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
