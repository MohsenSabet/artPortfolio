// pages/about.js
import React from 'react';
import styles from '../styles/About.module.css';
import TunnelBackground from '../components/TunnelBackground';
import StarField from '../components/StarField';
import { supabase } from '../lib/supabaseClient';
import { FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function About({ profile }) {
  // Guard: if no profile data, show fallback message
  if (!profile) {
    return <p style={{ position: 'relative', zIndex: 2 }}>Profile not found.</p>;
  }

  // Destructure profile data
  const { first_name, last_name, avatar_url, bio, mediums, twitter, linkedin, instagram, username, pronouns, email, phone,
          show_email, show_phone, show_twitter, show_linkedin, show_instagram } = profile;

  // These are the image filenames in your /public/images/about/ folder
  const numbers = [3, 4, 5, 6, 7, 8, 9, 10, 11];
  const images = numbers.map((n) => `${n}.PNG`);

  return (
    <>
      <div className={styles.aboutWrapper}>
        <TunnelBackground />
        <div className={styles.aboutContent}>
          <h1 className={styles.pageTitle}>
            {first_name} {last_name}{pronouns && <span className={styles.pronouns}> ({pronouns})</span>}
          </h1>
          <StarField />
          <div className={styles.profileInfo}>
            <div className={styles.profileImageContainer}>
              <img
                src={avatar_url}
                alt={`${first_name} ${last_name}`}
                className={styles.profileImage}
              />
              <div className={styles.iconLine}>
                {show_email    && email     && <a href={`mailto:${email}`}><FaEnvelope className={styles.icon} /></a>}
                {show_phone    && phone     && <a href={`tel:${phone}`}><FaPhone className={styles.icon} /></a>}
                {show_twitter  && twitter   && (
                  <a href={twitter} target="_blank" rel="noopener noreferrer">
                    <FaTwitter className={styles.icon} />
                  </a>
                )}
                {show_linkedin && linkedin  && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className={styles.icon} />
                  </a>
                )}
                {show_instagram && instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    <FaInstagram className={styles.icon} />
                  </a>
                )}
              </div>
            </div>
            <div className={styles.profileText}>
              {/* Bio */}
              <p className={styles.profileBio}>{bio}</p>
              {/* Mediums */}
              <p className={styles.profileMediums}><strong>Mediums:</strong> {mediums.split(',').join(', ')}</p>
            </div>
          </div>
          <div className={styles.imageStackContainer}>
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
    .select(
      `first_name,last_name,username,pronouns,email,phone,avatar_url,bio,mediums,twitter,linkedin,instagram,
       show_email,show_phone,show_twitter,show_linkedin,show_instagram`
    )
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
