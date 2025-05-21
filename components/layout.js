import MainNav from './MainNav';
import { Container } from 'react-bootstrap';

export default function Layout({ children }) {
  return (
    <>
      <MainNav />
      <Container className="mt-4">
        {children}
      </Container>
    </>
  );
}