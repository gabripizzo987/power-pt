import { useState } from 'react';

const PtRegistration = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: '',
    specializzazione: '',
    esperienza: '',
    descrizione: '',
    document: null, // Aggiunto campo per il documento PDF
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Validazione email
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Gestore del cambio valori nel form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      document: e.target.files[0], // Aggiungi il file selezionato
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!validateEmail(formData.email)) {
      setErrorMessage('Email non valida');
      setLoading(false);
      return;
    }

    if (!formData.document) {
      setErrorMessage('Devi caricare un documento PDF.');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('nome', formData.nome);
    formDataToSend.append('cognome', formData.cognome);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('specializzazione', formData.specializzazione);
    formDataToSend.append('esperienza', formData.esperienza);
    formDataToSend.append('descrizione', formData.descrizione);
    formDataToSend.append('document', formData.document); // Carica il documento

    try {
      const response = await fetch('http://localhost:3000/register-trainer', {
        method: 'POST',
        body: formDataToSend, // Passa formData direttamente
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante la registrazione');
      }

      const result = await response.json();
      alert(result.message);
      setFormData({
        nome: '',
        cognome: '',
        email: '',
        password: '',
        specializzazione: '',
        esperienza: '',
        descrizione: '',
        document: null, // Resetta il campo del documento
      });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '100px auto 50px', padding: '20px', border: '1px solid #ccc', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Registrazione Personal Trainer</h2>
      {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="nome" value={formData.nome} onChange={handleChange} placeholder="Nome" required style={inputStyle} />
        <input type="text" name="cognome" value={formData.cognome} onChange={handleChange} placeholder="Cognome" required style={inputStyle} />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={inputStyle} aria-label="Email Personal Trainer" />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required style={inputStyle} />
        <input type="text" name="specializzazione" value={formData.specializzazione} onChange={handleChange} placeholder="Specializzazione" required style={inputStyle} />
        <input type="number" name="esperienza" value={formData.esperienza} onChange={handleChange} placeholder="Esperienza (anni)" required min="0" style={inputStyle} />
        <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} placeholder="Descrizione personale" rows="4" required style={textAreaStyle} />
        
        <p style={{ fontSize: '14px', color: '#555', marginBottom: '10px' }}>
          Carica il tuo curriculum o il documento che attesti la tua esperienza (formato PDF).
        </p>
        <input type="file" name="document" onChange={handleFileChange} accept="application/pdf" required />
        
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Registrazione...' : 'Registrati'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = {
  padding: '10px',
  fontSize: '16px',
  border: '1px solid #ccc',
  borderRadius: '5px',
};

const textAreaStyle = {
  ...inputStyle,
  resize: 'none',
};

const buttonStyle = {
  padding: '10px',
  fontSize: '18px',
  backgroundColor: '#28a745',
  color: '#fff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};

export default PtRegistration;
