import MainNav from './MainNav';
import Footer from './Footer';
import { Container } from 'react-bootstrap';

export default function Layout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <MainNav />
      <Container className="flex-grow-1 mt-4">
        {children}
      </Container>
      <Footer />
    </div>
  );
}