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
          <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} className="mb-4">
            <Card.Header as="h5">Contact Info</Card.Header>
            <Card.Body>
              <ListGroup variant="flush" className="mb-3">
                <ListGroup.Item><FaEnvelope className="me-2" />{user.email}</ListGroup.Item>
                <ListGroup.Item><FaPhone className="me-2" />{user.phone}</ListGroup.Item>
                <ListGroup.Item><strong>Member Since:</strong> {user.joined}</ListGroup.Item>
              </ListGroup>
              <Row className="mb-3">
                <Col className="text-center">
                  <Button variant="outline-primary" size="sm" href={user.social.twitter} target="_blank"><FaTwitter /></Button>
                </Col>
                <Col className="text-center">
                  <Button variant="outline-info" size="sm" href={user.social.linkedIn} target="_blank"><FaLinkedin /></Button>
                </Col>
                <Col className="text-center">
                  <Button variant="outline-danger" size="sm" href={user.social.instagram} target="_blank"><FaInstagram /></Button>
                </Col>
              </Row>
              {/* Edit Profile button removed for now */}
            </Card.Body>
          </Card>
          <Card style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
            <Card.Header as="h5">Biography</Card.Header>
            <Card.Body>
              <Card.Text>{user.bio}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
