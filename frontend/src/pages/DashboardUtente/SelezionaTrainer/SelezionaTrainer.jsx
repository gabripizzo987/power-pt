import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SelezionaTrainer = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");  // Aggiunta per il messaggio di successo
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/trainers")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Errore: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        // Filtra i trainer per escludere quelli eliminati
        const trainersAttivi = data.filter(trainer => !trainer.isDeleted);
        setTrainers(trainersAttivi);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Errore nel recuperare i trainer:", error);
        setError("Errore nel recuperare i trainer. Riprova più tardi.");
        setLoading(false);
      });
  }, []);

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const confirmSelection = (trainerId) => {
    if (!trainerId) {
      console.error("Trainer ID non valido");
      return;
    }

    const utenteData = JSON.parse(localStorage.getItem("utente"));

    if (!utenteData) {
      console.error("Utente non trovato");
      return;
    }

    fetch("http://localhost:3000/api/utente/associa-trainer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: utenteData.id, trainerId }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Errore nella richiesta: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        setSuccessMessage("Trainer selezionato con successo!");
        setTimeout(() => {
          navigate(`/dashboard-utente/${utenteData.id}`);
        }, 1500); // Attendere un attimo prima di navigare
      })
      .catch((error) => {
        console.error("Errore nel salvataggio del trainer", error);
        setError("Errore nel salvataggio del trainer. Riprova.");
      });
  };

  if (loading) {
    return <div className="p-6">Caricamento in corso...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">Seleziona il tuo Personal Trainer</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div
              key={trainer._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
            >
              <img
                src={trainer.profilePicture ? `http://localhost:3000/${trainer.profilePicture.replace("\\", "/")}` : "https://via.placeholder.com/150"}
                alt={trainer.nome}
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-center">
                {trainer.nome} {trainer.cognome}
              </h3>
              <p className="text-gray-600 text-center mt-2">{trainer.specializzazione}</p>
              <p className="text-gray-500 text-sm mt-2">{trainer.descrizione}</p>
              <button
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                onClick={() => handleSelectTrainer(trainer)} // Seleziona solo quando clicchi su "Seleziona"
              >
                Seleziona
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Non ci sono trainer disponibili al momento.</p>
        )}
      </div>
      {selectedTrainer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-xl font-bold mb-4">Conferma la selezione</h3>
            <p className="text-gray-600">
              Vuoi selezionare {selectedTrainer.nome} {selectedTrainer.cognome} come tuo trainer?
            </p>
            <button
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              onClick={() => confirmSelection(selectedTrainer._id)} // Conferma la selezione solo quando premi il bottone
            >
              Conferma
            </button>
            <button
              className="mt-2 block text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedTrainer(null)} // Annulla la selezione
            >
              Annulla
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="text-green-500 text-center mt-6">{successMessage}</div>
      )}
    </div>
  );
};

export default SelezionaTrainer;
