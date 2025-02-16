import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaDumbbell, FaUser, FaSignOutAlt, FaEdit, FaChalkboardTeacher, FaTrash } from "react-icons/fa";
import axios from "axios";

const DashboardUtente = () => {
  const [utente, setUtente] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [trainer, setTrainer] = useState(null);
  const [schede, setSchede] = useState([]);
  const [iscrizione, setIscrizione] = useState(null); // Aggiunto per gestire l'iscrizione
  const [palestra, setPalestra] = useState(null); // Aggiunto per gestire le informazioni della palestra
  const [error, setError] = useState(null);
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [obiettivo, setObiettivo] = useState("");
  const [altezza, setAltezza] = useState("");
  const [peso, setPeso] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token non trovato. Effettua il login.");
          return;
        }

        const userResponse = await axios.get(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const userData = userResponse.data;
        setUtente(userData);
        setNome(userData.nome || "");
        setCognome(userData.cognome || "");
        setEmail(userData.email || "");
        setPassword(userData.password || "");
        setObiettivo(userData.obiettivo || "");
        setAltezza(userData.altezza || "");
        setPeso(userData.peso || "");

        if (userData.trainer_id) {
          fetchTrainer(userData.trainer_id);
          fetchSchede(userData._id);
        }
        fetchIscrizione(userData._id);

        // Recupera le informazioni della palestra
        if (userData.palestra_id) {
          console.log("Palestra ID:", userData.palestra_id); // Log ID della palestra
          const palestraResponse = await axios.get(`http://localhost:3000/api/palestra/${userData.palestra_id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Palestra Response:", palestraResponse.data); // Log dati della palestra
          setPalestra(palestraResponse.data);
        }
      } catch (error) {
        console.error("Errore nel recupero dei dati:", error);
        setError("Errore nel caricamento dei dati.");
      }
    };

    fetchData();
  }, [id, navigate]);

  const fetchTrainer = async (trainerId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/trainers/${trainerId}`);
      if (response.ok) {
        const data = await response.json();
        setTrainer(data);
      } else {
        const errorText = await response.text();
        console.error("Errore nel recuperare il trainer: ", errorText);
        setError("Errore nel recuperare i dettagli del trainer.");
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  const fetchSchede = async (idUtente) => {
    try {
      console.log("ID Utente:", idUtente); // Verifica l'ID dell'utente
      const response = await fetch(`http://localhost:3000/api/schede-utente/${idUtente}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Schede recuperate:", data); // Verifica che i dati siano corretti
        setSchede(data);
      } else {
        const errorText = await response.text();
        console.error("Errore nel recuperare le schede: ", errorText);
        setError("Errore nel recuperare le schede di allenamento.");
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  const fetchIscrizione = async (idUtente) => {
    try {
      const response = await fetch(`http://localhost:3000/api/iscrizioni/${idUtente}`);
      if (response.ok) {
        const data = await response.json();
        setIscrizione(data);
      } else {
        const errorText = await response.text();
        console.error("Errore nel recuperare l'iscrizione: ", errorText);
        setError("Errore nel recuperare i dettagli dell'iscrizione.");
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("utente");
    navigate("/login-utente");
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/update-user/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, cognome, email, password, obiettivo, altezza, peso }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUtente(updatedUser);
        localStorage.setItem("utente", JSON.stringify(updatedUser));
        setError(null);
        alert("Profilo aggiornato con successo!");
      } else {
        const errorText = await response.text();
        console.error("Errore nell'aggiornamento del profilo: ", errorText);
        setError("Errore nell'aggiornamento del profilo.");
      }
    } catch (error) {
      console.error(error.message);
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token non trovato. Effettua il login.");
          return;
        }

        const response = await axios.delete(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          alert("Account eliminato con successo.");
          localStorage.removeItem("utente");
          navigate("/login-utente");
        } else {
          setError("Errore nell'eliminazione dell'account.");
        }
      } catch (error) {
        console.error("Errore nell'eliminazione dell'account:", error);
        setError("Errore nell'eliminazione dell'account.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white p-5 mt-24">
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
<li className="flex items-center cursor-pointer text-red-500 hover:text-red-300" onClick={handleDeleteAccount}>
<FaTrash className="mr-2" /> Elimina Account
</li>
</ul>
</nav>
</aside>

{/* Main Content */}
<main className="flex-1 p-6 ml-64 mt-12 overflow-y-auto">
{error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

{/* Profilo */}
{activeTab === "profile" && utente && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-2xl font-bold">Profilo Utente</h2>
    <p><strong>Nome:</strong> {nome}</p>
    <p><strong>Cognome:</strong> {cognome}</p>
    <p><strong>Email:</strong> {email}</p>
    <p><strong>Obiettivo:</strong> {obiettivo}</p>
    <p><strong>Altezza:</strong> {altezza} cm</p>
    <p><strong>Peso:</strong> {peso} kg</p>
    {trainer && (
      <p><strong>Trainer Selezionato:</strong> {trainer.nome} {trainer.cognome}</p>
    )}
    {iscrizione && (
      <div>
        <p><strong>Tipo Abbonamento:</strong> {iscrizione.tipoAbbonamento}</p>
        <p><strong>Data Inizio:</strong> {new Date(iscrizione.dataInizio).toLocaleDateString()}</p>
        <p><strong>Data Scadenza:</strong> {new Date(iscrizione.dataScadenza).toLocaleDateString()}</p>
        <p><strong>Stato:</strong> {iscrizione.stato}</p>
      </div>
    )}
    {palestra && (
      <div className="mt-4">
        <h3 className="text-lg font-bold">Informazioni Palestra</h3>
        <p><strong>Nome:</strong> {palestra.nome}</p>
        <p><strong>Indirizzo:</strong> {palestra.indirizzo}</p>
        <p><strong>Telefono:</strong> {palestra.telefono}</p>
      </div>
    )}
  </div>
)}

{/* Modifica Profilo */}
{activeTab === "edit-profile" && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4">Modifica Profilo</h2>
    <form onSubmit={handleProfileUpdate}>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome">
          Nome
        </label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cognome">
          Cognome
        </label>
        <input
          type="text"
          id="cognome"
          value={cognome}
          onChange={(e) => setCognome(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="obiettivo">
          Obiettivo
        </label>
        <input
          type="text"
          id="obiettivo"
          value={obiettivo}
          onChange={(e) => setObiettivo(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="altezza">
          Altezza (cm)
        </label>
        <input
          type="number"
          id="altezza"
          value={altezza}
          onChange={(e) => setAltezza(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="peso">
          Peso (kg)
        </label>
        <input
          type="number"
          id="peso"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Aggiorna Profilo
        </button>
      </div>
    </form>
  </div>
)}

{/* Trainer */}
{activeTab === "trainer" && trainer && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold mb-4">Il tuo Personal Trainer</h2>
    <div className="flex items-center space-x-4">
      {/* Foto Profilo */}
      {trainer.fotoProfilo && (
        <img
          src={trainer.fotoProfilo}
          alt="Foto Trainer"
          className="w-24 h-24 rounded-full border-4 border-blue-500"
        />
      )}
      <div>
        <p><strong>Nome:</strong> {trainer.nome} {trainer.cognome}</p>
        <p><strong>Email:</strong> {trainer.email}</p>
        <p><strong>Specializzazione:</strong> {trainer.specializzazione}</p>
        <p><strong>Esperienza:</strong> {trainer.esperienza} anni</p>
        <p><strong>Descrizione:</strong> {trainer.descrizione}</p>
      </div>
    </div>
  </div>
)}

{/* Schede Allenamento */}
{activeTab === "schede" && (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-bold">Schede Allenamento</h2>
    {schede.length > 0 ? (
      <div className="space-y-6">
        {schede.map((scheda) => (
          <div key={scheda._id} className="border border-gray-300 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">{scheda.descrizione}</h3>
            <p className="text-gray-500">Creata il: {new Date(scheda.dataCreazione).toLocaleDateString()}</p>

            {/* Esercizi */}
            <div className="space-y-4 mt-4">
              {scheda.esercizi.map((esercizio, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50">
                  <h4 className="text-md font-bold">{esercizio.nome}</h4>
                  <p className="text-sm text-gray-700 mb-2">{esercizio.descrizione}</p>
                  <p className="text-sm text-gray-500 mb-2">Serie: {esercizio.serie} | Ripetizioni: {esercizio.ripetizioni}</p>
                  {/* Video Link */}
                  {esercizio.video && (
                    <div className="mt-2">
                      <a
                        href={esercizio.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-300 inline-block"
                      >
                        Guarda il video
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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