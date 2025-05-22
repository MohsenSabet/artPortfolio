import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert } from 'react-bootstrap';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ManagePost() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPosts() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      const userId = session.user.id;
      const { data, error } = await supabase
        .from('posts')
        .select('id,title,created_at')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setPosts(data);
    }
    loadPosts();
  }, [router]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) setError(error.message);
    else setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <Container className="mt-5">
      <h2>Manage Posts</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>
              <td>
                <Button size="sm" variant="outline-primary" onClick={() => router.push(`/dashboard/editPost?id=${p.id}`)}>Edit</Button>{' '}
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}