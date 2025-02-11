import React, { useEffect, useState } from "react";
import axios from "axios";

const ModificaProfiloPalestra = () => {
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState("");
  const [indirizzo, setIndirizzo] = useState("");
  const [partitaIva, setPartitaIva] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const palestraId = localStorage.getItem("palestraId");

      console.log("Token:", token); // Log per verificare il token
      console.log("Palestra ID:", palestraId); // Log per verificare l'ID della palestra

      if (!token) {
        console.error("Token non trovato. Effettua il login.");
        setErrorMessage("Token non trovato. Effettua il login.");
        setLoading(false);
        return;
      }

      if (!palestraId) {
        console.error("ID palestra non trovato.");
        setErrorMessage("ID palestra non trovato.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`http://localhost:3000/palestra/${palestraId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(data);
        setNome(data.nome);
        setIndirizzo(data.indirizzo);
        setPartitaIva(data.partitaIva);
        setEmail(data.email);
        setTelefono(data.telefono);
        setDescrizione(data.descrizione);
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento del profilo:", error);
        setErrorMessage("Errore nel caricamento del profilo.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const palestraId = localStorage.getItem("palestraId");

      if (!token) {
        console.error("Token non trovato. Effettua il login.");
        setErrorMessage("Token non trovato. Effettua il login.");
        return;
      }

      if (!palestraId) {
        console.error("ID palestra non trovato.");
        setErrorMessage("ID palestra non trovato.");
        return;
      }

      const formData = {
        nome,
        indirizzo,
        partitaIva,
        email,
        telefono,
        descrizione
      };

      const response = await axios.put(`http://localhost:3000/api/palestra/${palestraId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProfile(response.data);
      setErrorMessage("");
      setSuccessMessage("Profilo aggiornato con successo!");
      console.log("Profilo aggiornato:", response.data);
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
      setErrorMessage("Si è verificato un errore nell'aggiornamento del profilo.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold">Modifica Profilo Palestra</h1>
      {loading ? (
        <div>Loading...</div>
      ) : profile ? (
        <div className="mt-6">
          {errorMessage && <div className="bg-red-500 text-white p-2 my-4">{errorMessage}</div>}
          {successMessage && <div className="bg-green-500 text-white p-2 my-4">{successMessage}</div>}
          <div className="mb-4">
            <label className="block text-gray-700">Nome</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Indirizzo</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={indirizzo}
              onChange={(e) => setIndirizzo(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Partita IVA</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={partitaIva}
              onChange={(e) => setPartitaIva(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              className="border p-2 w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Telefono</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Descrizione</label>
            <textarea
              className="border p-2 w-full"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-500 text-white px-4 py-2"
            onClick={handleUpdateProfile}
          >
            Aggiorna Profilo
          </button>
        </div>
      ) : (
        <div>Errore nel caricamento del profilo.</div>
      )}
    </div>
  );
};

export default ModificaProfiloPalestra;