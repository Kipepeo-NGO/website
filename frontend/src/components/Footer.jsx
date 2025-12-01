import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin, faTiktok } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

const navLinks = [
  { name: 'Inicio', path: '/' },
  { name: 'Viaja', path: '/viaja' },
  { name: 'Colabora', path: '/colabora' },
  { name: 'Proyectos', path: '/proyectos' },
  { name: 'Acerca de', path: '/acerca-de' },
  { name: 'Contacto', path: '/contacto' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-social">
          <a
            href="https://www.instagram.com/kipepeo_tanzania/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <FontAwesomeIcon icon={faInstagram} />
          </a>
          <a
            href="https://www.linkedin.com/company/kipepeo-tanzania/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FontAwesomeIcon icon={faLinkedin} />
          </a>
          <a
            href="https://www.tiktok.com/@kipepeo.tanzania"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok"
          >
            <FontAwesomeIcon icon={faTiktok} />
          </a>
        </div>
        <div className="footer-section footer-nav">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} className="footer-link">{link.name}</Link>
          ))}
        </div>
        <div className="footer-section footer-mission">
          <p>Empowering Communities, Transforming Lives. <span className="footer-tagline">Kipepeo</span></p>
        </div>
      </div>
    </footer>
  );
} 
