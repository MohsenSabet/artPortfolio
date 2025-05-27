import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Container, Row, Col, Card, Button, Table, Spinner, Alert, ProgressBar, ListGroup } from 'react-bootstrap';
import { FaPlus, FaUserEdit, FaTasks } from 'react-icons/fa';

export default function DashboardHome() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return setError('Please login to view your dashboard.');
      setSession(session);
      Promise.all([fetchProfile(session.user.id), fetchPosts(session.user.id)])
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    });
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, first_name, last_name')
      .eq('id', userId)
      .single();
    if (error) throw error;
    setProfile(data);
  }

  async function fetchPosts(userId) {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, created_at, media_url, privacy, featured')  // include media_url for thumbnails
      .eq('author_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setPosts(data);
  }

  if (loading) return (
    <Container className="py-5 text-center">
      <Spinner animation="border" />
    </Container>
  );

  if (error) return (
    <Container className="py-5">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  // Compute summary counts
  const totalPosts = posts.length;
  const publicPosts = posts.filter(p => p.privacy === 'Public').length;
  const privatePosts = posts.filter(p => p.privacy === 'Private').length;
  const featuredPosts = posts.filter(p => p.featured).length;
  // Filtered posts based on selection
  const displayedPosts = (() => {
    switch (filter) {
      case 'public': return posts.filter(p => p.privacy === 'Public');
      case 'private': return posts.filter(p => p.privacy === 'Private');
      case 'featured': return posts.filter(p => p.featured);
      default: return posts;
    }
  })();
  // Profile completeness calculation
  const totalFields = 4;
  const filledFields = ['first_name', 'last_name', 'avatar_url', 'bio'].reduce((acc, field) => profile[field] ? acc + 1 : acc, 0);
  const completeness = Math.round((filledFields / totalFields) * 100);
  // Recent posts (last 3)
  const recentPosts = posts.slice(0, 3);

  return (
    <Container className="py-4">
      {/* Summary widgets */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card
            bg={filter === 'all' ? 'primary' : 'light'}
            text={filter === 'all' ? 'white' : 'dark'}
            className="h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter('all')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title>Total Posts</Card.Title>
              <h2 className="fw-bold text-center">{totalPosts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card
            bg={filter === 'public' ? 'success' : 'light'}
            text={filter === 'public' ? 'white' : 'dark'}
            className="h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter('public')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title>Public Posts</Card.Title>
              <h2 className="fw-bold text-center">{publicPosts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card
            bg={filter === 'private' ? 'warning' : 'light'}
            text={filter === 'private' ? 'dark' : 'dark'}
            className="h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter('private')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title>Private Posts</Card.Title>
              <h2 className="fw-bold text-center">{privatePosts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card
            bg={filter === 'featured' ? 'info' : 'light'}
            text={filter === 'featured' ? 'white' : 'dark'}
            className="h-100"
            style={{ cursor: 'pointer' }}
            onClick={() => setFilter('featured')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title>Featured Posts</Card.Title>
              <h2 className="fw-bold text-center">{featuredPosts}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional widgets */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Profile Completeness</Card.Title>
              <ProgressBar now={completeness} label={`${completeness}%`} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Recent Posts</Card.Title>
              <ListGroup variant="flush">
                {recentPosts.length > 0 ? recentPosts.map(post => (
                  <ListGroup.Item key={post.id}>
                    <Link href={`/dashboard/editPost?id=${post.id}`}>{post.title}</Link>
                  </ListGroup.Item>
                )) : (
                  <ListGroup.Item className="text-muted">No recent posts</ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body className="d-flex flex-column">
              <Card.Title>Quick Actions</Card.Title>
              <Button as={Link} href="/dashboard/addPost" variant="success" className="mb-2"><FaPlus className="me-1"/>Add Post</Button>
              <Button as={Link} href="/dashboard/editProfile" variant="primary" className="mb-2"><FaUserEdit className="me-1"/>Edit Profile</Button>
              <Button as={Link} href="/dashboard/managePost" variant="warning"><FaTasks className="me-1"/>Manage Posts</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={3}>
          <Card>
            <Card.Img
              variant="top"
              src={profile?.avatar_url || '/window.svg'}
              alt={profile?.username}
            />
            <Card.Body>
              <Card.Title>@{profile?.username}</Card.Title>
              <Card.Text>{profile?.first_name} {profile?.last_name}</Card.Text>
              <Link href="/dashboard/profile" passHref>
                <Button variant="primary" className="w-100">Edit Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Posts</h5>
              <Link href="/dashboard/addPost" passHref>
                <Button variant="success">+ Add New Post</Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-0">  
              
               {displayedPosts.length === 0 ? (
                <p className="p-4 text-center text-muted">No posts found for this filter.</p>
               ) : (
                 <Table hover responsive className="mb-0">
                   <thead>
                     <tr>
                       <th>Thumbnail</th>
                       <th>Title</th>
                       <th>Date Created</th>
                       <th>Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                    {displayedPosts.map((post) => (
                       <tr key={post.id}>
                         <td>
                           <img
                             src={post.media_url}
                             alt={post.title}
                             style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                           />
                         </td>
                         <td>{post.title}</td>
                         <td>{new Date(post.created_at).toLocaleDateString()}</td>
                         <td>
                          <Link href={`/dashboard/editPost?id=${post.id}`} passHref>
                            <Button size="sm" variant="outline-primary" className="me-2">Edit</Button>
                          </Link>
                          <Link href={`/artworks/${post.id}`} passHref>
                            <Button size="sm" variant="outline-secondary">View</Button>
                          </Link>
                        </td>
                       </tr>
                     ))}
                   </tbody>
                 </Table>
               )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}