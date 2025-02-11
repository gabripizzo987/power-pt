import React, { useState } from 'react';
import axios from 'axios';

const GymRegistration = () => {
  const [formData, setFormData] = useState({
    nome: '',
    indirizzo: '',
    tipo: '',
    email: '',
    telefono: '',
    descrizione: '',
    password: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/registerPalestra', formData);
      setSuccessMessage('Palestra registrata con successo!');
      setErrorMessage('');

      setFormData({
        nome: '',
        indirizzo: '',
        tipo: '',
        email: '',
        telefono: '',
        descrizione: '',
        password: '',
      });
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      if (error.response) {
        console.log('Errore risposta:', error.response);
        console.log('Errore dati:', error.response.data);
        setErrorMessage(error.response?.data?.message || 'Errore durante la registrazione. Riprova.');
      } else if (error.request) {
        console.log('Errore richiesta:', error.request);
        setErrorMessage('Impossibile connettersi al server.');
      } else {
        console.log('Errore generico:', error.message);
        setErrorMessage('Errore di connessione. Riprova.');
      }
      setSuccessMessage('');
    }
  };

  const formStyle = {
    background: 'linear-gradient(to right, #4CAF50, #8BC34A)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    margin: '0 auto',
    color: '#fff',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '1em',
    backgroundColor: '#f9f9f9',
    color: '#000',
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ffffff',
    color: '#4CAF50',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1.2em',
    cursor: 'pointer',
  };

  return (
    <div style={{ marginTop: '100px' }}> {/* Aggiunto marginTop per abbassare la componente */}
      <h1 style={{ textAlign: 'center', color: '#fff', fontSize: '2em' }}>Registrazione Palestra</h1>
      {successMessage && <p style={{ color: 'green', textAlign: 'center' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Nome Palestra:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Indirizzo:</label>
          <input
            type="text"
            name="indirizzo"
            value={formData.indirizzo}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Tipo:</label>
          <input
            type="text"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Telefono:</label>
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Descrizione:</label>
          <textarea
            name="descrizione"
            value={formData.descrizione}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontSize: '1.1em' }}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <button type="submit" style={buttonStyle}>
          Registrati
        </button>
      </form>
    </div>
  );
};

export default GymRegistration;