import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaDumbbell, FaUser, FaSignOutAlt, FaEdit, FaChalkboardTeacher } from "react-icons/fa";

const DashboardUtente = () => {
  const [utente, setUtente] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [trainer, setTrainer] = useState(null);
  const [schede, setSchede] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const utenteData = JSON.parse(localStorage.getItem("utente"));
    if (!utenteData || utenteData.id !== id) {
      navigate("/login-utente");
    } else {
      setUtente(utenteData);
      if (utenteData.trainer_id) {
        fetchTrainer(utenteData.trainer_id);
        fetchSchede(utenteData.trainer_id);
      }
    }
  }, [id, navigate]);

  const fetchTrainer = async (trainerId) => {
    try {
      const response = await fetch(`/api/trainers/${trainerId}`);
      const data = await response.json();
      setTrainer(data);
    } catch (error) {
      console.error("Errore nel recuperare il trainer", error);
    }
  };

  const fetchSchede = async (trainerId) => {
    try {
      const response = await fetch(`/api/schede/${trainerId}`);
      const data = await response.json();
      setSchede(data);
    } catch (error) {
      console.error("Errore nel recuperare le schede", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("utente");
    navigate("/login-utente");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-4 flex items-center cursor-pointer hover:text-gray-300" onClick={() => setActiveTab("profile")}>
              <FaUser className="mr-2" /> Profilo
            </li>
            <li className="mb-4 flex items-center cursor-pointer hover:text-gray-300" onClick={() => setActiveTab("edit-profile")}>
              <FaEdit className="mr-2" /> Modifica Profilo
            </li>
            <li className="mb-4 flex items-center cursor-pointer hover:text-gray-300" onClick={() => setActiveTab("trainer")}>
              <FaChalkboardTeacher className="mr-2" /> Trainer
            </li>
            <li className="mb-4 flex items-center cursor-pointer hover:text-gray-300" onClick={() => setActiveTab("schede")}>
              <FaDumbbell className="mr-2" /> Schede Allenamento
            </li>
            <li className="flex items-center cursor-pointer text-red-500 hover:text-red-300" onClick={handleLogout}>
              <FaSignOutAlt className="mr-2" /> Logout
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 ml-64 mt-12"> {/* Aggiunto ml-64 per margine laterale e mt-12 per margine top */}
        {activeTab === "profile" && utente && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Profilo Utente</h2>
            <p><strong>Nome:</strong> {utente.nome}</p>
            <p><strong>Email:</strong> {utente.email}</p>
            {trainer && (
              <p><strong>Trainer Selezionato:</strong> {trainer.nome} {trainer.cognome}</p>
            )}
          </div>
        )}

        {activeTab === "edit-profile" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Modifica Profilo</h2>
            <p>Qui puoi modificare i tuoi dati.</p>
          </div>
        )}

        {activeTab === "trainer" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Scelta del Personal Trainer</h2>
            <p>Seleziona il tuo trainer preferito dalla lista.</p>
            {/* Aggiungi la sezione per selezionare un trainer */}
          </div>
        )}

        {activeTab === "schede" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Schede Allenamento</h2>
            {schede.length > 0 ? (
              <ul>
                {schede.map((scheda) => (
                  <li key={scheda._id}>
                    <h3>{scheda.descrizione}</h3>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Non hai schede di allenamento assegnate.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardUtente;
