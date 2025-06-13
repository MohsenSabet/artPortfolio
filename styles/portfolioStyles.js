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
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translate(-50%, 20px);
    opacity: 0;
    pointer-events: none;
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    background: transparent;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    z-index: 5;
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }
  .back-to-top.visible {
    opacity: 1;
    transform: translate(-50%, 0);
    pointer-events: auto;
  }
  .back-to-top:hover {
    transform: translate(-50%, 0) scale(1.4);
  }
  .back-to-top img {
    width: 32px;
    height: 32px;
    transform: rotate(180deg);
    display: block;
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
`;

export default portfolioStyles;
