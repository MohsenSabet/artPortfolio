import css from 'styled-jsx/css';

// Extracted global styles for the Portfolio page
const portfolioStyles = css.global`
  html,
  body {
    margin: 0;
    padding: 0;
    background: transparent;
    overflow-x: hidden;
  }

  /* fixed wrapper at mid-left */
  .category-label-wrapper {
    width: 0;
    height: 0;
    position: fixed;
    left: 40px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 5;
  }

  /* rotated text inside wrapper */
  .category-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    transform-origin: center center;
    font-family: "Playfair Display", serif;
    font-size: 1.4rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.25em;
    white-space: nowrap;
    text-align: center;
    color: #fff;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
    opacity: 0;
  }

  /* vertical flow — one full-viewport slide per section */
  .slides-wrapper {
    width: 100%;
  }

  .post-slide {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
  }
  .post-slide:nth-child(odd) {
    flex-direction: row-reverse;
  }

  .slide-text {
    width: 45%;
  }
  .slide-text h2 {
    font-family: "Playfair Display", serif;
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 1rem;
    color: #fff;
  }
  .slide-desc {
    font-family: "Source Sans Pro", sans-serif;
    font-weight: 400;
    font-size: 1.2rem;
    line-height: 1.6;
    color: #eee;
  }
  .back-to-top {
    position: static !important;
    bottom: auto !important;
    left: auto !important;
    transform: none !important;
    margin: 2rem auto 4rem;
    display: block;
    opacity: 1 !important;
    pointer-events: auto;
    background: transparent !important;
    border: none !important;
  }
  .back-to-top img {
    transform: rotate(180deg) !important;
  }

  /* vertical ribbon on right */
  .vertical-ribbon-wrapper {
    opacity: 0;
    position: fixed;
    top: 50%;
    right: 40px;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 6;
    max-height: 80vh;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .vertical-ribbon {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0;
  }
  .vertical-ribbon-wrapper::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  .vertical-ribbon img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    margin-bottom: 0.5rem;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  }
  .vertical-ribbon img:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  }

  /* intro slide styling */
  .intro-slide {
    background: transparent;
  }
  /* intro content typography */
  .intro-content {
    position: relative;
    text-align: center;
    max-width: 600px;
    margin: 0 auto 2rem;
    color: #fff;
    padding: 1rem;
    opacity: 0;
    animation: fadeInUp 1s ease-out 0.5s forwards;
  }
  .intro-content h1 {
    font-family: "Playfair Display", serif;
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .intro-content p {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 1.5rem;
    font-weight: 400;
    margin: 0;
  }
  .slide-indicator {
    position: absolute;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: "Playfair Display", serif;
    font-size: 3.5rem;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    pointer-events: none;
    animation: bounce 1.5s ease-in-out infinite;
  }
  .slide-indicator img {
    width: 32px;
    height: 32px;
    display: block;
    margin: 0.5rem auto 0;
  }

  @keyframes bounce {
    0%, 100% { transform: translate(-50%, -50%); opacity: 0.8; }
    50% { transform: translate(-50%, -60%); opacity: 1; }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* artwork image styling */
  .slide-image {
    max-width: 60%;
    max-height: 90%;
    object-fit: cover;
    flex-shrink: 0;
    transition: transform 0.3s, filter 0.3s;
  }
  .slide-image:hover {
    transform: scale(1.05);
    filter: brightness(1.1) drop-shadow(0 0 8px rgba(255,255,255,0.5));
  }

  /* modal overlay for full-screen image */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.9);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
    cursor: default;
    overscroll-behavior: contain;
  }
  .modal-controls {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 10px;
    z-index: 10001;
  }
  .modal-btn {
    background: rgba(255,255,255,0.15);
    border: none;
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    transition: background 0.3s, transform 0.2s;
  }
  .modal-btn:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.1);
  }
  .modal-content {
    max-width: 90%;
    max-height: 90%;
    width: auto;
    height: auto;
    object-fit: contain;
    transition: transform 0.3s;
  }

  /* close button styling in modal */
  .modal-close-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(255,255,255,0.15);
    border: none;
    color: #fff;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10002;
    transition: background 0.3s, transform 0.2s;
  }
  .modal-close-btn:hover {
    background: rgba(255,255,255,0.3);
    transform: scale(1.1);
  }

  /* artist info section styling */
  .artist-info {
    margin: 3rem auto;
    padding: 2rem;
    max-width: 600px;
    text-align: center;
    color: #fff;
  }
  .artist-info img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    margin-bottom: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
  .artist-info h2 {
    font-family: "Playfair Display", serif;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  .artist-info h3 {
    font-family: "Playfair Display", serif;
    font-size: 1.75rem;
    margin: 0.25rem 0 1rem;
  }
  .artist-info p {
    font-family: "Source Sans Pro", sans-serif;
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  .artist-socials {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .artist-socials a {
    color: #fff;
    text-decoration: underline;
    font-weight: 600;
  }
  .about-link {
    display: inline-block;
    margin-top: 0.5rem;
    color: #fff;
    text-decoration: none;
    font-weight: 700;
    border-bottom: 2px solid transparent;
    transition: border-color 0.3s;
  }
  .about-link:hover {
    border-color: #fff;
  }

  @media (max-width: 768px) {
    /* responsive mobile adjustments */
    .post-slide {
      flex-direction: column !important;
      align-items: flex-start;
      padding: 1rem;
      height: auto;
      min-height: 100vh;
    }
    .slide-image {
      max-width: 100%;
      max-height: 40vh;
      width: 100%;
      object-fit: contain;
      margin-bottom: 1rem;
    }
    .slide-text {
      width: 100%;
    }
    .slide-text h2 {
      font-size: 2rem;
    }
    .vertical-ribbon-wrapper,
    .category-label-wrapper {
      display: none;
    }
    .slide-indicator {
      font-size: 2rem;
    }
  }
`;

export default portfolioStyles;
