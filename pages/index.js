import Hero from "@/components/Hero";
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { FaUpload, FaPalette, FaShareAlt } from 'react-icons/fa';

export default function Home() {
  const [featuredArts, setFeaturedArts] = useState([]);
  const [loadingArts, setLoadingArts] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, media_url')
        .eq('featured', true)
        .eq('privacy', 'Public')
        .limit(4);
      if (!error) setFeaturedArts(data || []);
      setLoadingArts(false);
    }
    fetchFeatured();
  }, []);

  return (
    <>
      <Hero />
      <Container className="py-5 text-center">
        <h2 className="mb-3">Welcome to Your Artistic Journey</h2>
        <p className="lead mb-4">
          Discover, create, and showcase your art with our vibrant community.
        </p>
        <Link href="/artworks" passHref>
          <Button variant="primary" size="lg">Explore Artworks</Button>
        </Link>
      </Container>
      {/* Featured Artworks Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">Featured Artworks</h2>
          {loadingArts ? (
            <div className="text-center"><Spinner animation="border" /></div>
          ) : (
            <Row className="g-4">
              {featuredArts.map(art => (
                <Col key={art.id} md={3} sm={6} className="d-flex">
                  <Card className="flex-fill shadow-sm">
                    <Card.Img
                      variant="top"
                      src={art.media_url}
                      alt={art.title}
                      style={{ objectFit: 'cover', height: '200px' }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="fs-6">{art.title}</Card.Title>
                      <div className="mt-auto">
                        <Link href={`/artworks/${art.id}`} passHref>
                          <Button variant="outline-primary" size="sm" className="w-100">View</Button>
                        </Link>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          <div className="text-center mt-4">
            <Link href="/artworks" passHref>
              <Button variant="secondary">See All Artworks</Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Newsletter Signup Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#343a40' }}>
        <Container className="text-center">
          <h2 className="mb-3">Stay Updated</h2>
          <p className="mb-4">Subscribe to our newsletter for the latest art news and featured creators.</p>
          <InputGroup className="justify-content-center" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <Form.Control type="email" placeholder="Enter your email" />
            <Button variant="primary">Subscribe</Button>
          </InputGroup>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <Container>
          <h2 className="text-center mb-4">How It Works</h2>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0 text-center p-4">
                <motion.div whileHover={{ scale: 1.1 }} className="mb-3">
                  <FaUpload size={48} className="text-primary" />
                </motion.div>
                <Card.Title>Upload Your Art</Card.Title>
                <Card.Text>Share your creations by uploading images or videos in seconds.</Card.Text>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0 text-center p-4">
                <motion.div whileHover={{ scale: 1.1 }} className="mb-3">
                  <FaPalette size={48} className="text-success" />
                </motion.div>
                <Card.Title>Customize Your Profile</Card.Title>
                <Card.Text>Create a profile that reflects your style and portfolio.</Card.Text>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 shadow-sm border-0 text-center p-4">
                <motion.div whileHover={{ scale: 1.1 }} className="mb-3">
                  <FaShareAlt size={48} className="text-warning" />
                </motion.div>
                <Card.Title>Inspire the Community</Card.Title>
                <Card.Text>Engage with art lovers by sharing your work and receiving feedback.</Card.Text>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  )
}