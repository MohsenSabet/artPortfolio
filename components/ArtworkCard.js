import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import Link from 'next/link';

export default function ArtworkCard({ post }) {
  const { id, title, media, category, privacy, includeDate, date, includeTime, time, featured, author } = post;
  const dateDisplay = includeDate && date ? new Date(date).toLocaleDateString() : null;
  const timeDisplay = includeTime && time ? time : null;

  return (
    <Card className="h-100">
      <Link href={`/artworks/${id}`}>
        <Card.Img
          variant="top"
          src={media}
          alt={title}
          style={{ height: '180px', objectFit: 'cover' }}
        />
      </Link>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Card.Title className="fs-5 mb-0">{title}</Card.Title>
          {featured && <Badge bg="warning" text="dark">Featured</Badge>}
        </div>
        <div className="mb-2">
          <Badge bg="secondary" className="me-1">{category}</Badge>
          <Badge bg={privacy === 'Public' ? 'success' : privacy === 'Private' ? 'danger' : 'secondary'}>
            {privacy}
          </Badge>
        </div>
      </Card.Body>
      <Card.Footer className="bg-white border-0 d-flex align-items-center">
        <img
          src={author?.avatar || '/window.svg'}
          alt={author?.name}
          width={32}
          height={32}
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
      </Card.Footer>
    </Card>
  );
}