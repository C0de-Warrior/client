import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import FeedbackCount from '../pages/FeedbackCount';

function Navbar() {
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link className={styles.navLink} to="/">Index</Link>
        </li>
        <li className={styles.navItem}>
          <Link className={styles.navLink} to="/feedback">
            Feedback <FeedbackCount />
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
