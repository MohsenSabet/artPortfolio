import styles from '../styles/About.module.css';
import StarField from '../components/StarField';
import TunnelBackground from '../components/TunnelBackground';

export default function About() {
  const numbers = [2,3,4,5,6,7,8,9,10,11];
  // only include the base image layers
  const images = numbers.map(n => `${n}.PNG`);
  return (
    <>
      <TunnelBackground/>
      <p>About</p>
      <StarField />
      <div className={styles.imageStackContainer}>
        {images.map((filename, idx) => (
          <img
            key={idx}
            src={`/images/about/${filename}`}
            className={`
              ${styles.stackImage}
              ${filename === '9.PNG' ? styles.heartbeat : ''}
              ${filename === '5.PNG' ? styles.heartbeat5 : ''}
            `}
            alt=""
          />
        ))}
      </div>
    </>
  );
}