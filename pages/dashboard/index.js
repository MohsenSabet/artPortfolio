import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, Button, Spinner, Alert, ProgressBar, ListGroup, Pagination } from 'react-bootstrap';
import { FaPlus, FaUserEdit, FaTasks, FaClipboardList, FaGlobe, FaLock, FaStar, FaImage, FaCalendarAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import styles from '@/styles/Dashboard.module.css';

export default function DashboardHome() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
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
  // Pagination calculations
  const totalPages = Math.ceil(displayedPosts.length / pageSize);
  const paginatedPosts = displayedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  // Profile completeness calculation
  const totalFields = 4;
  const filledFields = ['first_name', 'last_name', 'avatar_url', 'bio'].reduce((acc, field) => profile[field] ? acc + 1 : acc, 0);
  const completeness = Math.round((filledFields / totalFields) * 100);
  // Recent posts (last 3)
  const recentPosts = posts.slice(0, 3);

  // delete a post
  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) return setError(error.message);
    setPosts(posts.filter(p => p.id !== id));
  };
  // reset page when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return (
    <Container className="py-4">
      {/* Summary widgets */}
      <Row className="mb-4">
        <Col md={3} sm={6} className="mb-3">
          <Card
            className={`${styles.glassCard} h-100 ${filter === 'all' ? styles.gradientAll : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title><FaClipboardList className="me-2" />Total Posts</Card.Title>
              <h2 className="fw-bold text-center">{totalPosts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card
            className={`${styles.glassCard} h-100 ${filter === 'public' ? styles.gradientPublic : ''}`}
            onClick={() => handleFilterChange('public')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title><FaGlobe className="me-2" />Public Posts</Card.Title>
              <h2 className="fw-bold text-center">{publicPosts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card
            className={`${styles.glassCard} h-100 ${filter === 'private' ? styles.gradientPrivate : ''}`}
            onClick={() => handleFilterChange('private')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title><FaLock className="me-2" />Private Posts</Card.Title>
              <h2 className="fw-bold text-center">{privatePosts}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6} className="mb-3">
          <Card
            className={`${styles.glassCard} h-100 ${filter === 'featured' ? styles.gradientFeatured : ''}`}
            onClick={() => handleFilterChange('featured')}
          >
            <Card.Body className="d-flex flex-column justify-content-center">
              <Card.Title><FaStar className="me-2" />Featured Posts</Card.Title>
              <h2 className="fw-bold text-center">{featuredPosts}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional widgets */}
      <Row className="mb-5 g-4">
        <Col md={4}>
          <Card className={`${styles.glassWidget} h-100`}>
            <Card.Body>
              <Card.Title>Profile Completeness</Card.Title>
              <ProgressBar now={completeness} label={`${completeness}%`} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className={`${styles.glassWidget} h-100`}>
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
          <Card className={`${styles.glassWidget} h-100`}>
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
              <Link href="/dashboard/editProfile" passHref>
                <Button variant="primary" className="w-100">Edit Profile</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Card className={`${styles.glassWidget}`}>  
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Your Posts</h5>
              <Link href="/dashboard/addPost" passHref>
                <Button variant="success">+ Add New Post</Button>
              </Link>
            </Card.Header>
            <Card.Body className="p-4" style={{ background: 'transparent' }}>
              {displayedPosts.length === 0 ? (
                <p className="text-center text-muted">No posts found for this filter.</p>
              ) : (
                <>
                  <table className={styles.dashboardTable}>
                    <thead>
                      <tr>
                        <th><FaImage className="me-1" />Thumbnail</th>
                        <th><FaEdit className="me-1" />Title</th>
                        <th><FaCalendarAlt className="me-1" />Date</th>
                        <th><FaTasks className="me-1" />Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPosts.map(post => (
                        <tr key={post.id}>
                          <td><img src={post.media_url} alt={post.title} style={{ width: '60px', height: '60px', objectFit: 'cover' }} /></td>
                          <td>{post.title}</td>
                          <td>{new Date(post.created_at).toLocaleDateString()}</td>
                          <td className="actions-cell">
                            <Link href={`/dashboard/editPost?id=${post.id}`} passHref>
                              <Button size="sm" variant="outline-primary" className="me-2"><FaEdit /></Button>
                            </Link>
                            <Link href={`/artworks/${post.id}`} passHref>
                              <Button size="sm" variant="outline-secondary" className="me-2"><FaEye /></Button>
                            </Link>
                            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(post.id)}><FaTrash /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* pagination controls */}
                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-3">
                      <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                      {[...Array(totalPages)].map((_, idx) => (
                        <Pagination.Item key={idx + 1} active={currentPage === idx + 1} onClick={() => setCurrentPage(idx + 1)}>
                          {idx + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                    </Pagination>
                  )}
                 </>
               )}
             </Card.Body>
           </Card>
         </Col>
      </Row>
    </Container>
  );
}