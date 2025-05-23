import Hero from "@/components/Hero";
import { Container, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function Home() {
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
    </>
  )
}