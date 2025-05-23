import React from 'react';
import { Carousel, Button } from 'react-bootstrap';
import Link from 'next/link';

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
    <div className="position-relative overflow-hidden" style={{ maxHeight: '80vh' }}>
      <Carousel fade controls={false} indicators interval={5000} className="h-100">
        {slides.map((slide, idx) => (
          <Carousel.Item key={idx} className="h-100">
            <div
              className="w-100 h-100 bg-dark"
              style={{
                backgroundImage: `url('${slide.img}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <Carousel.Caption className="bottom-0 mb-5">
              <h1 className="display-4 fw-bold">{slide.title}</h1>
              <p className="lead">{slide.subtitle}</p>
              <Link href={slide.cta.href} passHref>
                <Button variant={slide.cta.variant}>{slide.cta.text}</Button>
              </Link>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}
