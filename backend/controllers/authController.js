import { supabase } from '../config/supabaseClient.js';

export const handleLogin = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware (from Firebase Admin)
    const { uid, email, name, picture } = req.user;
    
    // Fallback to request body if name/photo not fully present in token
    const userName = req.body.name || name || '';
    const userPhoto = picture || req.body.photo || '';
    const rollNumber = req.body.roll_number || '';

    // Check if user exists in Supabase
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', uid)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "Row not found" - ignore it, else throw
      throw selectError;
    }

    let userToReturn = existingUser;

    if (!existingUser) {
      // Insert new user
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          { uid, email, name: userName, photo: userPhoto, roll_number: rollNumber }
        ])
        .select()
        .single();

      if (insertError) throw insertError;
      userToReturn = newUser;
    } else if (rollNumber && existingUser.roll_number !== rollNumber) {
      // Update roll number if provided and different
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ roll_number: rollNumber })
        .eq('uid', uid)
        .select()
        .single();
        
      if (updateError) throw updateError;
      userToReturn = updatedUser;
    }

    return res.status(200).json({
      success: true,
      user: {
        uid: userToReturn.uid,
        email: userToReturn.email,
        name: userToReturn.name,
        photo: userToReturn.photo,
        roll_number: userToReturn.roll_number
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};
