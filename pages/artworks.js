import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { posts } from '@/lib/userData';
import ArtworkCard from '@/components/ArtworkCard';

export default function Artworks() {
  return (
    <Container className="py-4">
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {posts.map((post) => (
          <Col key={post.id}>
            <ArtworkCard post={post} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}