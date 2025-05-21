import React, { useState } from 'react';
import Link from 'next/link';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function EditProfile() {
  // initial static data
  const initial = {
    firstName: 'Admin',
    lastName: 'User',
    username: 'adminuser',
    email: 'admin@example.com',
    phone: '123-456-7890',
    bio: 'Passionate admin with a love for art and design.',
    profilePic: 'https://via.placeholder.com/200',
    social: {
      twitter: 'https://twitter.com/admin',
      linkedIn: 'https://linkedin.com/in/admin',
      instagram: 'https://instagram.com/admin',
    },
    mediums: ['Painting', 'Digital', 'Sculpture'],
    pronouns: 'they/them',
  };

  const [profilePic, setProfilePic] = useState(initial.profilePic);
  const [profileFile, setProfileFile] = useState(null);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [username, setUsername] = useState(initial.username);
  const [pronouns, setPronouns] = useState(initial.pronouns);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [bio, setBio] = useState(initial.bio);
  const [twitter, setTwitter] = useState(initial.social.twitter);
  const [linkedIn, setLinkedIn] = useState(initial.social.linkedIn);
  const [instagram, setInstagram] = useState(initial.social.instagram);
  const [mediums, setMediums] = useState(initial.mediums);
  const [newMedium, setNewMedium] = useState('');

  // toggle medium selection
  const toggleMedium = (item) => {
    setMediums((prev) =>
      prev.includes(item) ? prev.filter((m) => m !== item) : [...prev, item]
    );
  };

  return (
    <Container className="mt-5">
      <Card style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Header as="h4" className="d-flex justify-content-between align-items-center">
          Edit Profile
          <Link href="/dashboard/profile" passHref>
            <Button variant="outline-secondary" size="sm">Cancel</Button>
          </Link>
        </Card.Header>
        <Card.Body>
          <Form>
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
              <Button variant="success">Save Changes</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
