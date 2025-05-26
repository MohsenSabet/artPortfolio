import Hero from "@/components/Hero";
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Badge, Image } from 'react-bootstrap';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { FaUpload, FaPalette, FaShareAlt } from 'react-icons/fa';
import dynamic from 'next/dynamic';

// client-only 3D background
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), { ssr: false });

export default function Home() {
  const [featuredArts, setFeaturedArts] = useState([]);
  const [loadingArts, setLoadingArts] = useState(true);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, media_url, created_at')
        .eq('privacy', 'Public')
        .order('created_at', { ascending: false })
        .limit(4);
      if (!error) setFeaturedArts(data || []);
      setLoadingArts(false);
    }
    fetchLatest();
  }, []);

  // fetch profile info
  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, bio, mediums')
        .single();
      if (!error) setProfile(data);
      setLoadingProfile(false);
    }
    fetchProfile();
  }, []);

  return (
    <>
      {/* full-screen 3D background */}
      <ThreeBackground />
      <Hero />
      <Container className="py-5 text-center" style={{ position: 'relative', zIndex: 1 }}>
        {loadingProfile ? (
          <Spinner animation="border" />
        ) : profile ? (
          <>
            <h2 className="mb-3">{profile.first_name} {profile.last_name}</h2>
            <Image src={profile.avatar_url} roundedCircle style={{ width: '150px', height: '150px', objectFit: 'cover' }} className="mb-3" />
            <p className="lead mb-3">{profile.bio}</p>
            <div>
              {profile.mediums && profile.mediums.split(',').map(medium => (
                <Badge key={medium} bg="secondary" className="me-2 mb-1">{medium}</Badge>
              ))}
            </div>
          </>
        ) : (
          <p>No profile data.</p>
        )}
      </Container>
      {/* Latest Works Section */}
      <section className="py-5 bg-light">
        <Container>
          <h2 className="text-center mb-4">Latest Works</h2>
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
    </>
  )
}