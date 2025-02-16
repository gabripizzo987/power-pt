import React from "react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import NavBar from '../components/headers/NavBar';

const MainLayout = () => {
  const currentYear = new Date().getFullYear();

  return (
    <main className="dark:bg-black overflow-hidden flex flex-col min-h-screen">
        <NavBar />
        <Outlet />
        <footer className="text-center py-4 bg-gray-800 text-white mt-auto">
          <p>Power-pt © {currentYear} - Tutti i diritti riservati</p>
          <div className="mt-2">
            <Link to="/terms" className="text-blue-400 hover:underline mx-2">
              Termini e Condizioni
            </Link>
            <span>|</span>
            <Link to="/privacy" className="text-blue-400 hover:underline mx-2">
              Privacy Policy
            </Link>
          </div>
        </footer>
    </main>
  );
};

export default MainLayout;
