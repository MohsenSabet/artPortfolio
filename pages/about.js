// pages/about.js
import React from 'react';
import styles from '../styles/About.module.css';
import TunnelBackground from '../components/TunnelBackground';
import StarField from '../components/StarField';
import { supabase } from '../lib/supabaseClient';
import { FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';

export default function About({ profile }) {
  // Guard: if no profile data, show fallback message
  if (!profile) {
    return <p style={{ position: 'relative', zIndex: 2 }}>Profile not found.</p>;
  }

  // Destructure profile data
  const { first_name, last_name, avatar_url, bio, mediums, twitter, linkedin, instagram } = profile;

  // These are the image filenames in your /public/images/about/ folder
  const numbers = [3, 4, 5, 6, 7, 8, 9, 10, 11];
  const images = numbers.map((n) => `${n}.PNG`);

  return (
    <>
      <div className={styles.aboutWrapper}>
        <TunnelBackground />
        <div className={styles.aboutContent}>
          <h1 className={styles.pageTitle}>About</h1>
          <StarField />
          <div className={styles.profileInfo}>
            <img
              src={avatar_url}
              alt={`${first_name} ${last_name}`}
              className={styles.profileImage}
            />
            <div className={styles.profileText}>
              <h2 className={styles.profileName}>{`${first_name} ${last_name}`}</h2>
              <p className={styles.profileBio}>{bio}</p>
              <p className={styles.profileMediums}><strong>Mediums:</strong> {mediums}</p>
              <div className={styles.socials}>
                {twitter && (
                  <a href={twitter} target="_blank" rel="noopener noreferrer">
                    <FaTwitter className={styles.socialIcon} />
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className={styles.socialIcon} />
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    <FaInstagram className={styles.socialIcon} />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className={styles.imageStackContainer}>
            {/* 4a) Blinking stars (if still desired) */}
            <div className={styles.blinkingStars}>
              <div className={styles.star} style={{ top: '20%', left: '30%' }} />
              <div className={styles.star} style={{ top: '50%', left: '60%' }} />
              <div className={styles.star} style={{ top: '75%', left: '40%' }} />
            </div>

            {/* 4b) Stack every image at bottom‐right.
                  Layers 3, 5, 6, 9, and 11 get animation classes. */}
            {images.map((filename) => {
              let animClass = '';
              if (filename === '3.PNG')  animClass = styles.heartbeat3;
              if (filename === '5.PNG')  animClass = styles.heartbeat5;
              if (filename === '6.PNG')  animClass = styles.heartbeat6;
              if (filename === '9.PNG')  animClass = styles.flight9;    // NEW for hummingbird
              if (filename === '11.PNG') animClass = styles.heartbeat11;

              return (
                <img
                  key={filename}
                  src={`/images/about/${filename}`}
                  className={`${styles.stackImage} ${animClass}`}
                  alt=""
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// Fetch profile data at build time
export async function getStaticProps() {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('first_name,last_name,bio,avatar_url,mediums,twitter,linkedin,instagram')
    .limit(1)
    .single();

  // Handle fetch errors gracefully
  if (error) {
    console.error('Failed to fetch profile:', error);
    return { props: { profile: null }, revalidate: 10 };
  }

  return {
    props: { profile },
    revalidate: 10,
  };
}
