import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export async function getServerSideProps() {
  // Fetch all categories and dedupe
  const { data, error } = await supabase
    .from('posts')
    .select('category')
    .order('category', { ascending: true });
  if (error) console.error('Error fetching categories:', error.message);
  const categories = Array.from(new Set((data || []).map((p) => p.category)));
  return { props: { categories } };
}

// Dashboard listing mediums
export default function Artworks({ categories }) {
  return (
    <Container className="py-4">
      <h1>Select a Medium</h1>
      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {categories.map((category) => (
          <Col key={category}>
            <Link href={`/artworks/show?medium=${encodeURIComponent(category)}`} passHref>
              <Card className="h-100 clickable-card">
                <Card.Body className="d-flex align-items-center justify-content-center">
                  <Card.Title>{category}</Card.Title>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}