import React from 'react';
import bgImg from '../../../assets/home/pexels.jpg';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div 
      className='relative h-screen w-full bg-cover bg-center' 
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Overlay scuro */}
      <div className='min-h-screen flex justify-between items-center text-white bg-black bg-opacity-60 p-11 pt-32'>
        <div className='space-y-4'>
          <p className='md:text-[40px] text-3xl'>Noi offriamo</p>
          <h1 className='md:text-[55px] text-5xl font-bold'>
            Allenamenti personalizzati da remoto
          </h1>
          <p className='text-lg'>
            Offriamo alle palestre uno strumento per gestire personal trainer e schede di allenamento online, migliorando il servizio per i loro iscritti.
          </p>

          {/* Sezione di registrazione */}
          <div className='space-y-8'>
            {/* Registrazione palestra */}
            <div className='space-y-4'>
              <p className='text-lg'>
                Sei il proprietario di una palestra? Registrati per gestire personal trainer e utenti con facilità!
              </p>
              <Link to="/registrazione-palestra">
                <button className='px-7 py-3 rounded-lg hover:text-secondary hover:bg-white bg-secondary font-bold uppercase'>
                  Registrati ora
                </button>
              </Link>
            </div>

            {/* Registrazione personal trainer */}
            <div className='space-y-4'>
              <p className='text-lg'>
                Sei un personal trainer e vuoi registrarti per la prima volta in questa palestra?
              </p>
              <Link to="/registrazione-personal-trainer">
                <button className='px-7 py-3 rounded-lg hover:text-secondary hover:bg-white bg-secondary font-bold uppercase'>
                  Registrati ora
                </button>
              </Link>
            </div>

            {/* Registrazione utente */}
            <div className='space-y-4'>
              <p className='text-lg'>
                Hai voglia di allenarti ovunque ti trovi con programmi personalizzati? Questo è il posto giusto!
              </p>
              <Link to="/registrazione-utente">
                <button className='px-7 py-3 rounded-lg hover:text-secondary hover:bg-white bg-secondary font-bold uppercase'>
                  Registrati ora
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Sezione login */}
        <div className='space-y-4 text-right'>
          <h2 className='text-2xl font-bold'>Se sei già registrato, accedi qui:</h2>
          <div className='flex flex-col gap-6'>
            <Link to="/login-palestra">
              <button className='px-7 py-3 rounded-lg bg-secondary hover:bg-white hover:text-secondary font-bold uppercase'>
                Login palestra
              </button>
            </Link>
            <Link to="/login-trainer">
              <button className='px-7 py-3 rounded-lg bg-secondary hover:bg-white hover:text-secondary font-bold uppercase'>
                Login personal trainer
              </button>
            </Link>
            <Link to="/login-utente">
              <button className='px-7 py-3 rounded-lg bg-secondary hover:bg-white hover:text-secondary font-bold uppercase'>
                Login utente
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
