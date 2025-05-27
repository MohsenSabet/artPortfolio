import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Link from 'next/link';
import ArtworkCard from '@/components/ArtworkCard';
import { supabase } from '@/lib/supabaseClient';

export async function getServerSideProps({ query }) {
  const medium = query.medium;
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*, profiles(first_name,last_name,avatar_url,username,pronouns)')
    .eq('category', medium)
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching posts for medium', medium, error.message);
  return { props: { posts: posts || [], medium } };
}

export default function ArtworksByMedium({ posts, medium }) {
  return (
    <Container className="py-4">
      <Link href="/artworks" passHref>
        <Button variant="link" className="mb-3">← Back to Mediums</Button>
      </Link>
      <h1 className="mb-4">Artworks: {medium}</h1>
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
