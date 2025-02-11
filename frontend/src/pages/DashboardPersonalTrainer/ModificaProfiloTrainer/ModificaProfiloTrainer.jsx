import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ModificaProfiloTrainer = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [specializzazione, setSpecializzazione] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [palestra_id, setPalestraId] = useState("");
  const [palestra, setPalestra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!id) {
      console.error("Errore: Nessun ID trovato per il trainer");
      return;
    }

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token non trovato. Effettua il login.");
          return;
        }

        const { data } = await axios.get(`http://localhost:3000/api/trainer/overview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(data);
        setNome(data.nome);
        setCognome(data.cognome);
        setSpecializzazione(data.specializzazione);
        setProfilePicture(data.profilePicture);
        setPalestraId(data.palestra_id);

        if (data.palestra_id) {
          const palestraResponse = await axios.get(`http://localhost:3000/api/palestra/${data.palestra_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPalestra(palestraResponse.data);
        } else {
          setErrorMessage("Palestra ID non definito.");
        }
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento del profilo:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trovato. Effettua il login.");
        return;
      }

      const formData = new FormData();
      formData.append("nome", nome);
      formData.append("cognome", cognome);
      formData.append("specializzazione", specializzazione);
      formData.append("palestra_id", palestra_id);
      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const response = await axios.put(`http://localhost:3000/api/trainer/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
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
      <h1 className="text-2xl font-bold">Modifica Profilo</h1>
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
            <label className="block text-gray-700">Cognome</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Specializzazione</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={specializzazione}
              onChange={(e) => setSpecializzazione(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Palestra</label>
            {palestra ? (
              <div>
                <p>{palestra.nome}</p>
                <p>{palestra.indirizzo}</p>
              </div>
            ) : (
              <div>Errore nel caricamento della palestra.</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Foto Profilo</label>
            <input
              type="file"
              className="border p-2 w-full"
              onChange={handleProfilePictureChange}
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

export default ModificaProfiloTrainer;