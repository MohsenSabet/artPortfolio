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
        .select('id,title,created_at,media_url,privacy,featured,category')
        .eq('author_id', userId)
        .order('category', { ascending: true })
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
    // delete image file from storage
    const postToDelete = posts.find(p => p.id === id);
    if (postToDelete?.media_url && postToDelete.media_url.includes('/posts/')) {
      const oldPath = postToDelete.media_url.split('/posts/')[1];
      const { error: deleteError } = await supabase.storage.from('posts').remove([oldPath]);
      if (deleteError) {
        setError(deleteError.message);
        return;
      }
    }
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) setError(error.message);
    else setPosts(posts.filter((p) => p.id !== id));
  };

  // add handlers for quick toggles
  const handleToggleFeatured = async (id, currentFeatured) => {
    const { error } = await supabase
      .from('posts')
      .update({ featured: !currentFeatured })
      .eq('id', id);
    if (error) setError(error.message);
    else setPosts(posts.map(p => p.id === id ? { ...p, featured: !currentFeatured } : p));
  };

  const handleTogglePrivacy = async (id, currentPrivacy) => {
    const newPrivacy = currentPrivacy === 'Public' ? 'Private' : 'Public';
    const { error } = await supabase
      .from('posts')
      .update({ privacy: newPrivacy })
      .eq('id', id);
    if (error) setError(error.message);
    else setPosts(posts.map(p => p.id === id ? { ...p, privacy: newPrivacy } : p));
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
            <th>Category</th>
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
              <td>{p.category}</td>
              <td>{new Date(p.created_at).toLocaleDateString()}</td>
              <td>
                {/* quick action buttons */}
                <Button size="sm" variant={p.featured ? 'outline-info' : 'info'} onClick={() => handleToggleFeatured(p.id, p.featured)}>
                  {p.featured ? 'Unfeature' : 'Feature'}
                </Button>{' '}
                <Button size="sm" variant={p.privacy === 'Public' ? 'outline-warning' : 'outline-success'} onClick={() => handleTogglePrivacy(p.id, p.privacy)}>
                  {p.privacy === 'Public' ? 'Make Private' : 'Make Public'}
                </Button>{' '}
                {/* existing Edit/Delete buttons */}
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