import React from 'react';
import { supabase } from '@/lib/supabaseClient';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';

export async function getServerSideProps({ params }) {
  // Fetch single post with author profile
  const { data: post, error } = await supabase
    .from('posts')
    .select(`*, profiles(first_name,last_name,avatar_url,username,pronouns)`)
    .eq('id', params.id)
    .single();
  if (error) {
    console.error('Error fetching post:', error.message);
    return { notFound: true };
  }
  return { props: { post } };
}

export default function ArtworkDetailPage({ post }) {
  return <ArtworkCardDetail post={post} />;
}
