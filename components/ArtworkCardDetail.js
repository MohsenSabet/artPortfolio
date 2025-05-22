import React from 'react';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function ArtworkCardDetail({ post }) {
  const {
    title,
    media_url,
    category,
    privacy,
    include_date,
    date,
    include_time,
    time,
    featured,
    profiles: author,
    description
  } = post;
  const dateDisplay = include_date && date ? new Date(date).toLocaleDateString() : null;
  const timeDisplay = include_time && time ? time : null;
  const isVideo = media_url && /\.(mp4|webm|ogg|mov)$/i.test(media_url);

  return (
    <Container className="py-4">
      <Button variant="link" className="mb-3 p-0" as={Link} href="/artworks">
        &larr; Back to Artworks
      </Button>
      <Row>
        <Col md={8}>
          {isVideo ? (
            <video
              controls
              src={media_url}
              className="img-fluid rounded mb-3"
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
            />
          ) : (
            <img
              src={media_url}
              alt={title}
              className="img-fluid rounded mb-3"
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              onError={(e) => { e.currentTarget.src = '/file.svg'; }}
            />
          )}
        </Col>
        <Col md={4}>
          <div className="d-flex align-items-center mb-3">
            <img
              src={author?.avatar_url || '/window.svg'}
              alt={`${author?.first_name || ''} ${author?.last_name || ''}`}
              width={48}
              height={48}
              className="rounded-circle me-2"
            />
            <div>
              <div className="fw-bold">{author?.username || `${author?.first_name || ''} ${author?.last_name || ''}`}</div>
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