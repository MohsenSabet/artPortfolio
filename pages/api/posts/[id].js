import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select(`*, profiles(first_name,last_name,avatar_url,username,pronouns)`)  // join profiles
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const updates = req.body;
    const { data, error } = await supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET','PUT','DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
