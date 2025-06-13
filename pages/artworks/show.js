import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Container, Row, Col, Button } from 'react-bootstrap';
import Link from 'next/link';
import ArtworkCard from '@/components/ArtworkCard';
import { supabase } from '@/lib/supabaseClient';
import { FaArrowLeft } from 'react-icons/fa';
import styles from '@/styles/Show.module.css';

// client-only sunset shader background
const SunsetBackground = dynamic(
  () => import('@/components/SunsetBackground'),
  { ssr: false }
);

export async function getServerSideProps({ query }) {
  const medium = query.medium || 'All';
  // Build base query for public posts
  let postsQuery = supabase
    .from('posts')
    .select('*, profiles(first_name,last_name,avatar_url,username,pronouns)')
    .eq('privacy', 'Public')
    .order('created_at', { ascending: false });
  // Apply category filter only if a specific medium is selected
  if (medium !== 'All') {
    postsQuery = postsQuery.eq('category', medium);
  }
  const { data: posts, error } = await postsQuery;
  if (error) console.error('Error fetching posts for medium', medium, error.message);
  return { props: { posts: posts || [], medium } };
}

export default function ArtworksByMedium({ posts, medium }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // state to control fade transition for featured artwork
  const [fadeIn, setFadeIn] = useState(true);
  const ribbonRef = useRef(null);
  const scrollAmount = 300;
  const scrollLeft = () => ribbonRef.current?.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  const scrollRight = () => ribbonRef.current?.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  // trigger fade-out then fade-in on index change
  useEffect(() => {
    setFadeIn(false);
    const timeout = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timeout);
  }, [selectedIndex]);
  return (
    <>
      <SunsetBackground />
      <Container className="py-4">
        {/* Back to categories button */}
        <div className={styles.backContainer}>
          <Link href="/artworks" className={styles.backButton}>
            <FaArrowLeft className={styles.backIcon} />
            <span>Back to ArtWorks</span>
          </Link>
        </div>
        <h1 className={`mb-4 ${styles.title}`}>{medium}</h1>
        {/* Main featured artwork or fallback */}
        <Row className="justify-content-center mb-0">
          <Col md={4} className="text-center">
            {/* scale down featured artwork to avoid vertical scroll */}
            <div style={{ display: 'inline-block', transform: 'scale(1)', transformOrigin: 'top center', opacity: fadeIn ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}>
              {posts && posts.length > 0 && posts[selectedIndex] ? (
                <ArtworkCard post={posts[selectedIndex]} fadeIn={fadeIn} medium={medium} />
              ) : (
                <p className="text-center text-muted">No artwork available.</p>
              )}
            </div>
          </Col>
        </Row>
        {/* Ribbon with arrows and centered thumbnails */}
        <Row className="justify-content-center mt-3">
          <Col xs={12}>
            <div style={{ position: 'relative' }}>
             {posts.length > 10 && (
               <button onClick={scrollLeft} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>
                 {'‹'}
               </button>
             )}
             <div ref={ribbonRef} style={{ display: 'flex', overflowX: 'auto', overflowY: 'hidden', padding: '0rem 2rem', justifyContent: 'center' }}>
               {posts.map((post, idx) => (
                 <div
                   key={post.id}
                   onMouseEnter={() => setSelectedIndex(idx)}
                   style={{
                     cursor: 'pointer',
                     marginRight: '1rem',
                     flex: '0 0 auto',
                     transition: 'transform 0.5s ease-in-out',
                     transform: idx === selectedIndex ? 'scale(1.2)' : 'scale(1)'
                   }}
                 >
                   <img
                     src={post.media_url}
                     alt={post.title}
                     width={100}
                     height={100}
                     style={{ objectFit: 'cover' }}
                     onError={(e) => { e.currentTarget.src = '/file.svg'; }}
                   />
                 </div>
               ))}
             </div>
             {posts.length > 10 && (
               <button onClick={scrollRight} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}>
                 {'›'}
               </button>
             )}
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
