import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert, ButtonGroup } from 'react-bootstrap';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function ManagePost() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function loadPosts() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      const userId = session.user.id;
      const { data, error } = await supabase
        .from('posts')
        .select('id,title,created_at,media_url,privacy,featured')
        .eq('author_id', userId)
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setPosts(data);
    }
    loadPosts();
  }, [router]);

  // determine which posts to display based on filter
  const displayedPosts = (() => {
    switch (filter) {
      case 'public': return posts.filter(p => p.privacy === 'Public');
      case 'private': return posts.filter(p => p.privacy === 'Private');
      case 'featured': return posts.filter(p => p.featured);
      default: return posts;
    }
  })();

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) setError(error.message);
    else setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      <div className="mb-3">
        <ButtonGroup>
          <Button variant={filter === 'all' ? 'primary' : 'outline-primary'} onClick={() => setFilter('all')}>Total ({posts.length})</Button>
          <Button variant={filter === 'public' ? 'success' : 'outline-success'} onClick={() => setFilter('public')}>Public ({posts.filter(p => p.privacy === 'Public').length})</Button>
          <Button variant={filter === 'private' ? 'warning' : 'outline-warning'} onClick={() => setFilter('private')}>Private ({posts.filter(p => p.privacy === 'Private').length})</Button>
          <Button variant={filter === 'featured' ? 'info' : 'outline-info'} onClick={() => setFilter('featured')}>Featured ({posts.filter(p => p.featured).length})</Button>
        </ButtonGroup>
      </div>
      <Table striped hover>
        <thead>
          <tr>
            <th>Thumbnail</th>
            <th>Title</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedPosts.map((p) => (
            <tr key={p.id}>
              <td>
                <img
                  src={p.media_url}
                  alt={p.title}
                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                />
              </td>
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