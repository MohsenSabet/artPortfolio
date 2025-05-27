import React from 'react';
import { useRouter } from 'next/router';
import { Container } from 'react-bootstrap';

export default function Footer() {
  const router = useRouter();
  const isHome = router.pathname === '/';
  return (
    <footer className={`${isHome ? 'bg-transparent' : 'bg-light'} text-dark border-top border-secondary`}>
      <Container className="text-center py-3">
        &copy; {new Date().getFullYear()} Art Portfolio. All rights reserved.
      </Container>
    </footer>
  );
}
