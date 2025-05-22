import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch all posts with associated author profile
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles(first_name,last_name,avatar_url,username,pronouns)`)  // join profiles
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // Create a new post
    const post = req.body;
    const { data, error } = await supabase
      .from('posts')
      .insert([{ ...post }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
