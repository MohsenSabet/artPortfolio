// pages/about.js
import React from 'react';
import styles from '../styles/About.module.css';
import TunnelBackground from '../components/TunnelBackground';
import StarField from '../components/StarField';

export default function About() {
  // These are the image filenames in your /public/images/about/ folder
  const numbers = [3, 4, 5, 6, 7, 8, 9, 10, 11];
  const images = numbers.map((n) => `${n}.PNG`);

  return (
    <>
      {/* 1) Render your tunnel‐shader background */}
      <TunnelBackground />

      {/* 2) A simple heading, placed in front of the background */}
      <p style={{ position: 'relative', zIndex: 2 }}>About</p>

      {/* 3) (Optional) StarField if you have one; remove if unused */}
      <StarField />

      {/* 4) The fixed‐corner container that holds stacked images + blinking stars */}
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
    </>
  );
}
