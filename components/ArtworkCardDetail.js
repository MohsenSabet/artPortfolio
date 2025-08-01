import React from 'react';
import { Badge, Button } from 'react-bootstrap';
import Link from 'next/link';
import styles from './ArtworkCardDetail.module.css';

export default function ArtworkCardDetail({ post }) {
  // Extract author profile (Supabase returns related rows as an array)
  const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles || {};
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
    description
  } = post;
  const dateDisplay = include_date && date
    ? (() => {
        const dt = new Date(date);
        return `${dt.getMonth() + 1}/${dt.getDate()}/${dt.getFullYear()}`;
      })()
    : null;
  const timeDisplay = include_time && time ? time : null;
  const isVideo = media_url && /\.(mp4|webm|ogg|mov)$/i.test(media_url);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.detailCard}>
        <div className={styles.media}>
          {isVideo ? (
            <video
              controls
              controlsList="nodownload"
              onContextMenu={e => e.preventDefault()}
              src={media_url}
            />
          ) : (
            <img
              src={media_url}
              alt={title}
              draggable="false"
              onDragStart={e => e.preventDefault()}
              onContextMenu={e => e.preventDefault()}
              onError={(e) => { e.currentTarget.src = '/file.svg'; }}
            />
          )}
        </div>
        <div className={styles.info}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.badgeGroup}>
            {featured && <Badge bg="warning" text="dark">Featured</Badge>}
            <Badge bg="secondary" className="me-1">{category}</Badge>
            <Badge bg={privacy === 'Public' ? 'success' : privacy === 'Private' ? 'danger' : 'secondary'}>
              {privacy}
            </Badge>
          </div>
          <div className={styles.authorSection}>
            <img
              src={author.avatar_url || '/window.svg'}
              alt={`${author?.first_name || ''} ${author?.last_name || ''}`}
              className={styles.avatarLarge}
            />
            <div>
              <div className="fw-bold">{author.username || `${author.first_name || ''} ${author.last_name || ''}`}</div>
              {(dateDisplay || timeDisplay) && (
                <div className="text-muted small">{dateDisplay} {timeDisplay}</div>
              )}
            </div>
          </div>
          <div className={styles.description} dangerouslySetInnerHTML={{ __html: description }} />
        </div>
      </div>
    </div>
  );
}