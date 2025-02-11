import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SuccessoPagamento = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Qui potresti fare una chiamata API per aggiornare il pagamento nel database
      console.log("Pagamento completato. Session ID:", sessionId);
      axios.post("http://localhost:3000/api/aggiornaPagamento", { sessionId })
        .then(() => console.log("Pagamento registrato con successo"))
        .catch((error) => console.error("Errore aggiornamento pagamento:", error));
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Pagamento avvenuto con successo!</h2>
      <p className="text-lg mb-6">Grazie per il tuo acquisto. Ora puoi tornare alla home o accedere al tuo account.</p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/')} 
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          Torna alla Home
        </button>
        <button 
          onClick={() => navigate('/login-utente')} 
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Accedi al tuo account
        </button>
      </div>
    </div>
  );
};

export default SuccessoPagamento;