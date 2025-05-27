import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import Layout from '@/components/layout';
import { ThemeProvider } from '@/context/ThemeContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}
