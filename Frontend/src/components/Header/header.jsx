import { useEffect, useRef, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BiMenu } from 'react-icons/bi';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../../assets/images/logo.png';
import { authContext } from '../../context/AuthContext';

const navLinks = [
  { path: '/home', display: 'Home' },
  { path: '/doctors', display: 'Find a Doctor' },
  { path: '/services', display: 'Services' },
  { path: '/contact', display: 'Contact' },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const { user, role, token } = useContext(authContext);

  useEffect(() => {
    const handleScroll = () => {
      if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        headerRef.current?.classList.add('sticky_header');
      } else {
        headerRef.current?.classList.remove('sticky_header');
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    menuRef.current?.classList.toggle('show_menu');
  };

  const handleNavClick = () => {
    // Solo cerrar el menú si el ancho de la ventana es menor a 768px (mobile)
    if (window.innerWidth < 768) {
      toggleMenu();
    }
  };

  const userDashboardLink =
    role?.toLowerCase() === 'doctor'
      ? '/doctors/profile/me'
      : role?.toLowerCase() === 'paciente'
      ? '/users/profile/me'
      : '/login';

      console.log("user:", user);
      console.log("role:", role);
      console.log("userDashboardLink:", userDashboardLink);
          

  return (
    <header className="header flex items-center" ref={headerRef}>
      <div className="container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div>
            <img src={logo} alt="logo" className="w-32" />
          </div>

          {/* Menu */}
          <div className="navigation" ref={menuRef}>
            <ul className="menu flex items-center gap-[2.7rem]">
              {navLinks.map((link, index) => (
                <li key={index} onClick={handleNavClick}>
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'text-primaryColor text-[16px] font-semibold'
                        : 'text-textColor text-[16px] font-medium hover:text-primaryColor'
                    }
                  >
                    {link.display}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side - Login / User */}
          <div className="flex items-center gap-4">
            {token && user ? (
              <Link
                to={userDashboardLink}
                className="flex items-center gap-2 px-3 py-1.5 bg-primaryColor text-white rounded-full hover:bg-blue-600 transition-all duration-200"
              >
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full"
                  />
                ) : (
                  <FaUserCircle className="w-6 h-6 text-white" />
                )}
                <span className="font-medium text-sm hidden sm:inline">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </Link>
            ) : (
              <Link to="/login">
                <button className="bg-primaryColor py-1.5 px-4 text-white font-medium text-sm rounded-full hover:bg-blue-600 transition-all duration-200">
                  Login
                </button>
              </Link>
            )}

            {/* Mobile Menu Icon */}
            <span className="md:hidden" onClick={toggleMenu}>
              <BiMenu className="w-6 h-6 cursor-pointer text-primaryColor" />
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
