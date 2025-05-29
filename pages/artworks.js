import React from 'react';
import { Container } from 'react-bootstrap';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from '@/styles/Artworks.module.css';
import { supabase } from '@/lib/supabaseClient';

// client-only tunnel shader background
const WarpBackground = dynamic(
  () => import('@/components/WarpBackground'),
  { ssr: false }
);

export async function getServerSideProps() {
  // Fetch all categories and dedupe
  const { data, error } = await supabase
    .from('posts')
    .select('category')
    .eq('privacy', 'Public')
    .order('category', { ascending: true });
  if (error) console.error('Error fetching categories:', error.message);
  const categories = Array.from(new Set((data || []).map((p) => p.category)));
  return { props: { categories } };
}

// Dashboard listing mediums
export default function Artworks({ categories }) {
  return (
    <>
      {/* Full-screen tunnel background */}
      <WarpBackground/>
      <Container fluid>
        <div className={styles.categoryGrid}>
          {categories.map((category) => (
            <Link key={category} href={`/artworks/show?medium=${encodeURIComponent(category)}`} passHref>
              <div className={styles.cardCategory}>
                <h3 className={styles.cardCategoryTitle}>{category}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </>
  );
}