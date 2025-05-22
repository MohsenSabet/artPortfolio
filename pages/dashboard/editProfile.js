import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Container, Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function EditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [profileFile, setProfileFile] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedIn, setLinkedIn] = useState('');
  const [instagram, setInstagram] = useState('');
  const [mediums, setMediums] = useState([]);
  const [newMedium, setNewMedium] = useState('');
  const [userId, setUserId] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');
      setUserId(session.user.id);
      const userId = session.user.id;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        setError(error.message);
      } else {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setUsername(data.username || '');
        setPronouns(data.pronouns || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setBio(data.bio || '');
        setProfilePic(data.avatar_url || 'https://via.placeholder.com/200');
        setTwitter(data.twitter || '');
        setLinkedIn(data.linkedin || '');
        setInstagram(data.instagram || '');
        setMediums(data.mediums ? data.mediums.split(',') : []);
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    // Optionally upload profileFile to storage and get URL...
    const updates = {
      first_name: firstName,
      last_name: lastName,
      username,
      pronouns,
      email,
      phone,
      avatar_url: profilePic,
      bio,
      twitter,
      linkedin: linkedIn,
      instagram,
      mediums: mediums.join(',')
    };
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) {
      setError(error.message);
    } else {
      // redirect to profile to view changes
      router.push('/dashboard/profile');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Container className="mt-5">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Profile updated!</Alert>}
      <Card style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
          Edit Profile
          <Link href="/dashboard/profile" passHref>
            <Button variant="outline-secondary" size="sm">Cancel</Button>
          </Link>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="profilePic" className="mb-3 text-center">
              <Form.Label>Profile Picture</Form.Label>
              <div className="mb-2">
                <img src={profilePic} alt="Preview" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setProfileFile(file);
                    setProfilePic(URL.createObjectURL(file));
                  }
                }}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="firstName" className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName" className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="username" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="pronouns" className="mb-3">
                  <Form.Label>Pronouns</Form.Label>
                  <Form.Control type="text" value={pronouns} onChange={(e) => setPronouns(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="bio" className="mb-3">
              <Form.Label>Biography</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="socialLinks" className="mb-3">
              <Form.Label>Social Media Links</Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    placeholder="Twitter URL"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="LinkedIn URL"
                    value={linkedIn}
                    onChange={(e) => setLinkedIn(e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Instagram URL"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </Col>
              </Row>
            </Form.Group>

            <Form.Group controlId="mediums" className="mb-4">
              <Form.Label>Mediums (select or add custom)</Form.Label>
              <div className="mb-2">
                {mediums.map((m) => (
                  <Button
                    key={m}
                    variant={mediums.includes(m) ? 'primary' : 'outline-primary'}
                    size="sm"
                    className="me-2 mb-2"
                    onClick={() => toggleMedium(m)}
                  >
                    {m}
                  </Button>
                ))}
              </div>
              <Row>
                <Col>
                  <Form.Control
                    placeholder="Add new medium"
                    value={newMedium}
                    onChange={(e) => setNewMedium(e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button onClick={() => {
                    if (newMedium.trim()) {
                      setMediums([...mediums, newMedium.trim()]);
                      setNewMedium('');
                    }
                  }}>Add</Button>
                </Col>
              </Row>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="success" type="submit">Save Changes</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
