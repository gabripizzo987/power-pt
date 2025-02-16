import React, { useEffect, useState } from "react";

const PersonalTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/trainers")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Errore: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
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

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Caricamento in corso...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 mt-20">
      <h2 className="text-2xl font-bold mb-6 text-center">Ecco i nostri Personal Trainer</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <div
              key={trainer._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-1"
            >
              {/* Mostra l'immagine solo se esiste */}
              {trainer.profilePicture && (
                <img
                  src={`http://localhost:3000/${trainer.profilePicture.replace("\\", "/")}`}
                  alt={`${trainer.nome} ${trainer.cognome}`}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-bold text-center">{trainer.nome} {trainer.cognome}</h3>
              <p className="text-gray-600 text-center mt-2">{trainer.specializzazione}</p>
              <p className="text-gray-500 text-sm mt-2">{trainer.descrizione}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">Non ci sono trainer disponibili al momento.</p>
        )}
      </div>
    </div>
  );
};

export default PersonalTrainers;
