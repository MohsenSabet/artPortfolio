import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import Link from 'next/link';
import styles from './ArtworkCard.module.css';

// Utility to format date consistently across server and client
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function ArtworkCard({ post }) {
  const {
    id,
    title,
    media_url,
    category,
    privacy,
    include_date,
    date,
    include_time,
    time,
    featured,
    profiles: author
  } = post;
  const dateDisplay = include_date && date ? formatDate(date) : null;
  const timeDisplay = include_time && time ? time : null;
  // Determine if media is a video
  const isVideo = media_url && /\.(mp4|webm|ogg|mov)$/i.test(media_url);

  return (
    <Card className={`${styles.artworkCard} h-100`}>
      <Link href={`/artworks/${id}`}>
        <div className={styles.mediaContainer}>
          {isVideo ? (
            <video controls src={media_url} />
          ) : (
            <img
              src={media_url}
              alt={title}
              onError={(e) => { e.currentTarget.src = '/file.svg'; }}
            />
          )}
        </div>
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
          src={author?.avatar_url || '/window.svg'}
          alt={`${author?.first_name || ''} ${author?.last_name || ''}`}
          width={32}
          height={32}
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
      </Card.Footer>
    </Card>
  );
}