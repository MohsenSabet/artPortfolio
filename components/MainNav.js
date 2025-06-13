// components/MainNav.js
import { Navbar, Nav, Container } from 'react-bootstrap';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import styles from './MainNav.module.css';

export default function MainNav() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => listener.subscription.unsubscribe();
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <Navbar collapseOnSelect
      className={`${styles.neonNav} ${router.pathname === '/' ? styles.transparent : ''}`}
      expand="lg"
      variant="dark"  
    >
      <Container>
        <Navbar.Brand as={Link} href="/">Art Portfolio</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">Home</Nav.Link>
            <Nav.Link as={Link} href="/about">About</Nav.Link>
            <Nav.Link as={Link} href="/artworks">Artworks</Nav.Link>
            {/* Portfolio visible to all users */}
            <Nav.Link as={Link} href="/portfolio">Portfolio</Nav.Link>
            {/* Dashboard only for authenticated users */}
            {session && <Nav.Link as={Link} href="/dashboard">Dashboard</Nav.Link>}
          </Nav>
          <Nav className="ms-auto">
            {session ? (
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            ) : (
              <Nav.Link as={Link} href="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}