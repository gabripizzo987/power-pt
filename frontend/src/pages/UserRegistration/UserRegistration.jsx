import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Importiamo useNavigate per il reindirizzamento

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    obiettivo: '',
    altezza: '',
    peso: '',
  });
  const navigate = useNavigate(); // Crea il navigatore

  // Funzione per gestire il cambiamento degli input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/register-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || 'Registrazione completata con successo!');
        
        // Dopo la registrazione, ottieni l'userId dalla risposta
        const userId = result.userId;

        // Salviamo l'userId nel localStorage
        localStorage.setItem('userId', userId);

        // Una volta registrato, naviga alla pagina di pagamento senza passare l'userId nell'URL
        navigate('/pagamento');  // Reindirizza alla pagina di pagamento
      } else {
        alert('Errore: ' + result.message);
      }
    } catch (error) {
      console.error('Errore nella richiesta:', error);
      alert('Si è verificato un errore durante la registrazione.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Registrazione Utente</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Cognome:</label>
          <input
            type="text"
            name="cognome"
            value={formData.cognome}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Obiettivo:</label>
          <input
            type="text"
            name="obiettivo"
            value={formData.obiettivo}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Altezza (cm):</label>
          <input
            type="number"
            name="altezza"
            value={formData.altezza}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <div>
          <label className="block">Peso (kg):</label>
          <input
            type="number"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            required
            className="border p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Registrati
        </button>
      </form>
    </div>
  );
};

export default UserRegistration;
