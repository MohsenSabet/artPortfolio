import React from 'react';
import { Container, Card, ListGroup, Button, Image, Row, Col, Badge } from 'react-bootstrap';
import { FaTwitter, FaLinkedin, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';

export default function AdminProfile() {
  // Static admin data
  const user = {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator',
    phone: '123-456-7890',
    joined: 'January 1, 2020',
    profilePic: 'https://via.placeholder.com/200',
    social: {
      twitter: 'https://twitter.com/admin',
      linkedIn: 'https://linkedin.com/in/admin',
      instagram: 'https://instagram.com/admin',
    },
    bio: 'Passionate admin with a love for art and design. Enjoys curating beautiful portfolios and engaging with the community.'
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center g-4 align-items-stretch">
        <Col md={4}>
          <Card className="text-center h-100" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Card.Body>
              <Image src={user.profilePic} roundedCircle fluid style={{ width: '150px', height: '150px', objectFit: 'cover' }} className="mb-3" />
              <Card.Title style={{ fontSize: '1.5rem' }}>{user.name}</Card.Title>
              <Badge bg="secondary" className="mb-2">{user.role}</Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="h-100" style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Card.Body>
              <Row className="justify-content-center mb-3 gx-2">
                <Col xs="auto">
                  <Button variant="outline-secondary" size="sm" href={`mailto:${user.email}`}><FaEnvelope /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-secondary" size="sm" href={`tel:${user.phone}`}><FaPhone /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-primary" size="sm" href={user.social.twitter} target="_blank"><FaTwitter /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-info" size="sm" href={user.social.linkedIn} target="_blank"><FaLinkedin /></Button>
                </Col>
                <Col xs="auto">
                  <Button variant="outline-danger" size="sm" href={user.social.instagram} target="_blank"><FaInstagram /></Button>
                </Col>
              </Row>
              <hr />
              <div className="mb-4">
                <h5>Biography</h5>
                <Card.Text>{user.bio}</Card.Text>
              </div>
              <div>
                <h5>Mediums</h5>
                <div>
                  <Badge bg="light" text="dark" className="me-2">Painting</Badge>
                  <Badge bg="light" text="dark" className="me-2">Digital</Badge>
                  <Badge bg="light" text="dark" className="me-2">Sculpture</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
