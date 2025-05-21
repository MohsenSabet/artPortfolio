import React from 'react';
import { posts } from '@/lib/userData';
import ArtworkCardDetail from '@/components/ArtworkCardDetail';

export async function getStaticPaths() {
  const paths = posts.map((post) => ({ params: { id: post.id } }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const post = posts.find((p) => p.id === params.id);
  return { props: { post } };
}

export default function ArtworkDetailPage({ post }) {
  return <ArtworkCardDetail post={post} />;
}
