import React from 'react';
import { Carousel, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// dynamically import ThreeBackground to disable SSR
const ThreeBackground = dynamic(() => import('./ThreeBackground'), { ssr: false });

export default function Hero() {
  const slides = [
    {
      img: '/vercel.svg',
      title: 'Welcome to Art Portfolio',
      subtitle: 'Discover stunning creations from talented artists',
      cta: { text: 'Explore Artworks', href: '/artworks', variant: 'light' }
    },
    {
      img: '/globe.svg',
      title: 'Express Yourself',
      subtitle: 'Share your own art and inspire the world',
      cta: { text: 'Add Your Artwork', href: '/dashboard/addPost', variant: 'light' }
    },
    {
      img: '/next.svg',
      title: 'Grow Your Portfolio',
      subtitle: 'Showcase your art and build your presence',
      cta: { text: 'View Portfolio', href: '/portfolio', variant: 'light' }
    }
  ];

  return (
    <div className="position-relative" style={{ height: '100vh' }}>
      <ThreeBackground />
      <Carousel fade controls indicators interval={5000} className="h-100" style={{ position: 'relative', zIndex: 2 }}>
        {slides.map((slide, idx) => (
          <Carousel.Item key={idx} className="h-100 position-relative">
            {/* Background image */}
            <div
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `url('${slide.img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1
              }}
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 70%)',
              zIndex: 2
            }} />
            <Carousel.Caption className="d-flex flex-column align-items-center justify-content-center h-100" style={{ zIndex: 3 }}>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="display-4 fw-bold">
                {slide.title}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="lead">
                {slide.subtitle}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Link href={slide.cta.href} passHref>
                  <Button variant={slide.cta.variant}>{slide.cta.text}</Button>
                </Link>
              </motion.div>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}
