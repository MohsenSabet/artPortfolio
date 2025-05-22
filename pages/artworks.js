import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ArtworkCard from '@/components/ArtworkCard';
import { supabase } from '@/lib/supabaseClient';

export async function getServerSideProps() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`*, profiles(first_name,last_name,avatar_url,username,pronouns)`)
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching posts:', error.message);
  return { props: { posts: posts || [] } };
}

export default function Artworks({ posts }) {
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