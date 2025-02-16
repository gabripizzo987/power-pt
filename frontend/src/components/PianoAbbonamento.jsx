import React from "react";
import { FaCheckCircle, FaUserTie, FaDumbbell, FaCreditCard } from "react-icons/fa";

const PianoAbbonamento = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 to-blue-600 text-white p-6 mt-32">
      <h1 className="text-4xl font-bold mb-6 text-center">Scegli il tuo piano di allenamento</h1>
      <p className="text-lg text-center max-w-3xl mb-12">
        Allenati con il supporto di un <strong>Personal Trainer</strong> che caricherà le tue schede in base ai tuoi obiettivi. 
        Scegli il piano che fa per te!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Piano Mensile */}
        <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
          <h2 className="text-2xl font-bold flex items-center justify-center">
            <FaCheckCircle className="text-blue-500 mr-2" /> Piano Mensile
          </h2>
          <p className="text-gray-700 mt-4 text-center">
            Ideale per chi vuole iniziare senza vincoli a lungo termine.
          </p>
          <p className="text-4xl font-bold text-blue-600 text-center my-4">€30/mese</p>
          <ul className="text-gray-600 space-y-2">
            <li className="flex items-center">
              <FaUserTie className="text-blue-500 mr-2" /> Assegnazione di un Personal Trainer
            </li>
            <li className="flex items-center">
              <FaDumbbell className="text-blue-500 mr-2" /> Schede personalizzate in base ai tuoi obiettivi
            </li>
            <li className="flex items-center">
              <FaCheckCircle className="text-blue-500 mr-2" /> Video tutorial per ogni esercizio
            </li>
          </ul>
        </div>

        {/* Piano Annuale */}
        <div className="bg-yellow-500 text-gray-900 p-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300">
          <h2 className="text-2xl font-bold flex items-center justify-center">
            <FaCheckCircle className="text-white mr-2" /> Piano Annuale
          </h2>
          <p className="text-gray-900 mt-4 text-center">
            Per chi è determinato a raggiungere i propri obiettivi nel lungo termine.
          </p>
          <p className="text-4xl font-bold text-gray-800 text-center my-4">€330/anno</p>
          <ul className="text-gray-900 space-y-2">
            <li className="flex items-center">
              <FaUserTie className="text-white mr-2" /> Personal Trainer dedicato per tutto l'anno
            </li>
            <li className="flex items-center">
              <FaDumbbell className="text-white mr-2" /> Aggiornamento delle schede in base ai tuoi progressi
            </li>
            <li className="flex items-center">
              <FaCheckCircle className="text-white mr-2" /> Risparmio di 30€ rispetto al piano mensile
            </li>
          </ul>
        </div>
      </div>

      <p className="text-sm text-gray-200 mt-12">
        Con il nostro servizio, il tuo personal trainer caricherà la tua scheda in base ai tuoi progressi e obiettivi! 💪🔥
      </p>

      {/* Aggiunta della nota sul pagamento con evidenza */}
      <div className="bg-red-500 text-white py-4 px-6 mt-8 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold flex items-center justify-center">
          <FaCreditCard className="mr-2" /> <span>Pagamento durante la registrazione</span>
        </h3>
        <p className="text-center mt-2">
          <strong>Il pagamento per il piano scelto avverrà durante la fase di registrazione.</strong> 
          Scegli il tuo piano e completa il pagamento in fase di iscrizione.
        </p>
      </div>
    </div>
  );
};

export default PianoAbbonamento;
