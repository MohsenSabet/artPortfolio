import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import detailStyles from '@/styles/ArtworkDetail.module.css';

export async function getServerSideProps({ params }) {
  // Fetch single post along with author profile details
  const { data: post, error } = await supabase
    .from('posts')
    .select(`*, created_at, profiles(first_name,last_name,avatar_url,username,pronouns)`)
    .eq('id', params.id)
    .single();
  if (error) {
    console.error('Error fetching post:', error.message);
    return { notFound: true };
  }
  // Fetch prev and next posts by created_at
  const { data: prev } = await supabase
    .from('posts')
    .select('id')
    .lt('created_at', post.created_at)
    .eq('privacy', 'Public')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  const { data: next } = await supabase
    .from('posts')
    .select('id')
    .gt('created_at', post.created_at)
    .eq('privacy', 'Public')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  return { props: { post, prev, next } };
}

export default function ArtworkDetailPage({ post, prev, next }) {
  const router = useRouter();
  const { medium } = router.query;
  return (
    <>
      {/* Back to category listing */}
      <div className={detailStyles.backContainer}>
        <Link
          href={`/artworks/show?medium=${medium || 'All'}`}
          className={detailStyles.backButton}
        >
          <FaArrowLeft size={24} />
        </Link>
      </div>
      {/* Artwork Detail with Prev/Next Arrows */}
      <div className={detailStyles.detailContainer}>
        {prev?.id && (
          <Link href={`/artworks/${prev.id}`} className={`${detailStyles.navArrow} ${detailStyles.left}`}>
            <FaArrowLeft size={32} />
          </Link>
        )}
        <ArtworkCardDetail post={post} />
        {next?.id && (
          <Link href={`/artworks/${next.id}`} className={`${detailStyles.navArrow} ${detailStyles.right}`}>
            <FaArrowRight size={32} />
          </Link>
        )}
      </div>
    </>
  );
}
