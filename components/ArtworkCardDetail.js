import React from 'react';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function ArtworkCardDetail({ post }) {
  const { title, media, category, privacy, includeDate, date, includeTime, time, featured, author, description } = post;
  const dateDisplay = includeDate && date ? new Date(date).toLocaleDateString() : null;
  const timeDisplay = includeTime && time ? time : null;

  return (
    <Container className="py-4">
      <Button variant="link" className="mb-3 p-0" as={Link} href="/artworks">
        &larr; Back to Artworks
      </Button>
      <Row>
        <Col md={8}>
          <img
            src={media}
            alt={title}
            className="img-fluid rounded mb-3"
            style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
          />
        </Col>
        <Col md={4}>
          <div className="d-flex align-items-center mb-3">
            <img
              src={author?.avatar || '/window.svg'}
              alt={author?.name}
              width={48}
              height={48}
              className="rounded-circle me-2"
            />
            <div>
              <div className="fw-bold">{author?.name}</div>
              {(dateDisplay || timeDisplay) && (
                <div className="text-muted small">
                  {dateDisplay} {timeDisplay}
                </div>
              )}
            </div>
          </div>
          <h2 className="mb-3">{title}</h2>
          {featured && <Badge bg="warning" text="dark" className="mb-2">Featured</Badge>}
          <div className="mb-3">
            <Badge bg="secondary" className="me-1">{category}</Badge>
            <Badge bg={privacy === 'Public' ? 'success' : privacy === 'Private' ? 'danger' : 'secondary'}>
              {privacy}
            </Badge>
          </div>
          <div className="mt-4" dangerouslySetInnerHTML={{ __html: description }} />
        </Col>
      </Row>
    </Container>
  );
}