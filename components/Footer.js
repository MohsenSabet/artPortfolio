import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { Container, Dropdown } from 'react-bootstrap';
import { ThemeContext } from '@/context/ThemeContext';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';

export default function Footer() {
  const router = useRouter();
  const isHome = router.pathname === '/';
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <footer className={`${isHome ? 'bg-transparent' : 'bg-light'} text-dark border-top border-secondary`}>
      <Container className="d-flex justify-content-between align-items-center py-3">
        <div>&copy; {new Date().getFullYear()} Art Portfolio. All rights reserved.</div>
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-secondary" size="sm">
            {theme === 'light' ? <FaSun /> : theme === 'dark' ? <FaMoon /> : <FaDesktop />}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item active={theme === 'light'} onClick={() => setTheme('light')}>Light</Dropdown.Item>
            <Dropdown.Item active={theme === 'dark'} onClick={() => setTheme('dark')}>Dark</Dropdown.Item>
            <Dropdown.Item active={theme === 'system'} onClick={() => setTheme('system')}>System</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Container>
    </footer>
  );
}
