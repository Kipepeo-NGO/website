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

const socialLinks = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/kipepeo_tanzania/?hl=en',
    icon: faInstagram,
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/kipepeo-tanzania/',
    icon: faLinkedin,
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/@kipepeo.tanzania',
    icon: faTiktok,
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-social">
          {socialLinks.map(({ name, href, icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
              className="footer-social-link"
            >
              <FontAwesomeIcon icon={icon} />
              <span>{name}</span>
            </a>
          ))}
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
