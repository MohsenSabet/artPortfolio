import MainNav from './MainNav';
import Footer from './Footer';
import { Container } from 'react-bootstrap';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();
  return (
    <div className="d-flex flex-column min-vh-100">
      <MainNav />
      <Container className="flex-grow-1 mt-4">
        {children}
      </Container>
      {router.pathname !== '/' && <Footer />}
    </div>
  );
}