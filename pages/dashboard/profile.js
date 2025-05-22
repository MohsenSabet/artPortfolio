import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Image, Row, Col, Badge } from 'react-bootstrap';
import { FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AdminProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      const userId = session.user.id;
      // Ensure profile row exists (insert with email if missing)
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, email: session.user.email }, { onConflict: 'id' })
        .select('*')
        .single();
      if (!error) setProfile(data);
      setLoading(false);
    };
    loadProfile();
  }, [router]);

  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>No profile found.</p>;
  const mediumsList = profile.mediums ? profile.mediums.split(',') : [];

  return (
    <Container className="mt-5">
      <Row className="justify-content-center g-4 align-items-stretch">
        <Col md={4}>
          <Card className="text-center h-100" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Card.Body>
              <Image src={profile.avatar_url} roundedCircle fluid style={{ width: '150px', height: '150px', objectFit: 'cover' }} className="mb-3" />
              <Card.Title style={{ fontSize: '1.5rem' }}>{profile.first_name} {profile.last_name}</Card.Title>
              <div className="mb-1 text-muted">@{profile.username}</div>
              <div className="mb-2 text-muted"><small>{profile.pronouns}</small></div>
              <Badge bg="secondary" className="mb-2">{profile.role}</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Card.Body>
              <Row className="justify-content-center mb-3 gx-2">
                <Col xs="auto">
                  <Button variant="outline-secondary" size="sm" href={`mailto:${profile.email}`}><FaEnvelope /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-secondary" size="sm" href={`tel:${profile.phone}`}><FaPhone /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-primary" size="sm" href={profile.twitter} target="_blank"><FaTwitter /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-info" size="sm" href={profile.linkedin} target="_blank"><FaLinkedin /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-danger" size="sm" href={profile.instagram} target="_blank"><FaInstagram /></Button>
                </Col>
              </Row>
              <hr />
              <div className="mb-4">
                <h5>Biography</h5>
                <Card.Text>{profile.bio}</Card.Text>
              </div>
              <div>
                <h5>Mediums</h5>
                <div>
                  {mediumsList.map((m) => (
                    <Badge key={m} bg="light" text="dark" className="me-2 mb-1">{m}</Badge>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
