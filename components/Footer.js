import React from 'react';
import { Container } from 'react-bootstrap';

export default function Footer() {
  return (
    <footer className="bg-light text-dark border-top border-secondary">
      <Container className="text-center py-3">
        &copy; {new Date().getFullYear()} Art Portfolio. All rights reserved.
      </Container>
    </footer>
  );
}
