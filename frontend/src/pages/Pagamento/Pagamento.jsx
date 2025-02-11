import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Pagamento = () => {
  const [abbonamento, setAbbonamento] = useState('mensile');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null); // Stato per l'userId

  useEffect(() => {
    // Recupera l'userId dal localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId); // Imposta l'userId nello stato
    } else {
      alert('Errore: userId non trovato');
    }
  }, []); // Esegui solo una volta quando il componente è montato

  const handleAbbonamentoChange = (event) => {
    setAbbonamento(event.target.value);
  };

  const handlePagamento = async () => {
    if (!userId) {
      alert("User ID non trovato");
      return;
    }

    setLoading(true);

    try {
      console.log('Inizio pagamento per userId:', userId, 'con abbonamento:', abbonamento);
      const { data } = await axios.post('http://localhost:3000/api/creaCheckoutSession', { 
        userId,
        tipoAbbonamento: abbonamento
      });

      console.log('Sessione di pagamento creata:', data.sessionId);
      const stripe = window.Stripe('pk_test_51QMdXtAYGtXYhm6Hd6EpGPerA0X1PSP7IY7aqdrxxZ6InUEI6j5r4vFFSBwLz5HfDXT0kvq6Byso4Bl8NMeED6Dk002aXANu8W'); 
      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      console.error('Errore durante il pagamento:', error);
      alert('Errore durante il pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-20">
      <h2 className="text-2xl font-bold mb-4">Seleziona il piano di abbonamento</h2>
      
      <div className="mb-6">
        <label className="inline-flex items-center mr-4">
          <input
            type="radio"
            value="mensile"
            checked={abbonamento === 'mensile'}
            onChange={handleAbbonamentoChange}
            className="form-radio"
          />
          <span className="ml-2">Abbonamento Mensile (30€)</span>
        </label>
        <br />
        <label className="inline-flex items-center">
          <input
            type="radio"
            value="annuale"
            checked={abbonamento === 'annuale'}
            onChange={handleAbbonamentoChange}
            className="form-radio"
          />
          <span className="ml-2">Abbonamento Annuale (330€)</span>
        </label>
      </div>

      <button 
        onClick={handlePagamento} 
        disabled={loading || !userId} // Disabilita il bottone se l'userId non è presente
        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Caricamento...' : 'Procedi con il pagamento'}
      </button>
    </div>
  );
};

export default Pagamento;
