// components/MainNav.js
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import Link from 'next/link';

export default function MainNav() {
  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/">Art Portfolio</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">Home</Nav.Link>
            <Nav.Link as={Link} href="/about">About</Nav.Link>
            <Nav.Link as={Link} href="/artworks">Artworks</Nav.Link>
            <Nav.Link as={Link} href="/portfolio">Portfolio</Nav.Link>
            <NavDropdown title="Dashboard" id="dashboard-nav-dropdown">
              <NavDropdown.Item as={Link} href="/dashboard">Overview</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/dashboard/profile">Admin Profile</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/dashboard/editProfile">Edit Profile</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/dashboard/addPost">Add Post</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/dashboard/editPost">Edit Post</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/dashboard/managePost">Manage Posts</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}