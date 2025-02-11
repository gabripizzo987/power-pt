import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { FaBars } from 'react-icons/fa';
import { motion } from 'framer-motion';

const navLinks = [
  { name: 'Home', route: '/' },
  { name: 'Personal trainers', route: '/personaltrainer' },
  { name: 'Piani di abbonamento', route: '/piano-abbonamenti' },
];

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHome, setIsHome] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Modalità tema

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    setIsHome(location.pathname === '/');
  }, [location]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode); // Cambia la classe del body
  };

  // Calcolo dinamico del colore e dello sfondo
  const navBg = isDarkMode ? 'bg-black' : isHome ? 'bg-[#15151580]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-black';

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${navBg} fixed top-0 w-full z-10 backdrop-blur-sm`}
    >
      <div className="lg:w-[95%] mx-auto sm:px-6 lg:px-6">
        <div className="px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex-shrink-0 cursor-pointer pl-7 md:p-0 flex items-center"
          >
            <div>
              <h1 className={`text-2xl inline-flex gap-3 items-center font-bold ${textColor}`}>
                Power-pt
                <img src="/power-pt.png" alt="" className="w-12 h-12" />
              </h1>
              <p className={`font-bold text-[13px] tracking-[6px] ${textColor}`}>
                Allena il tuo corpo, ovunque ti trovi
              </p>
            </div>
          </div>

          {/* Mobile menu icons */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <FaBars className="h-6 w-6 hover:text-primary" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <ul className="ml-10 flex items-center space-x-4 pr-4">
              {navLinks.map((link) => (
                <li key={link.route}>
                  <NavLink
                    to={link.route}
                    className={({ isActive }) =>
                      `font-bold ${
                        isActive ? 'text-secondary' : textColor
                      } hover:text-secondary duration-300`
                    }
                  >
                    {link.name}
                  </NavLink>
                </li>
              ))}

              {/* Dark Mode Toggle */}
              <li>
                <ThemeProvider theme={createTheme()}>
                  <div className="flex flex-col justify-center items-center">
                    <Switch
                      checked={isDarkMode}
                      onChange={handleThemeToggle}
                    />
                    <h1 className="text-[8px]">Light/Dark</h1>
                  </div>
                </ThemeProvider>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
