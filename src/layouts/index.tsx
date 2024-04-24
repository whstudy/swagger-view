import { Link, Outlet, useLocation } from 'umi';
import styles from './index.less';
import logo from '/src/assets/logo-white.svg';

export default function Layout() {
  const location = useLocation();
  const shouldShowHeader = location.pathname !== '/swagger-ui';
  return (
    <div className={styles.navs}>
      {shouldShowHeader&&<div className={styles.header}><img src={logo}/></div>}
      {/* <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li>
          <a href="https://github.com/umijs/umi">Github</a>
        </li>
      </ul> */}
      <Outlet />
      {shouldShowHeader&&<div className={styles.footer}>
        © 版权所有：2021-2024 联想凌拓
      </div>}
    </div>
  );
}
