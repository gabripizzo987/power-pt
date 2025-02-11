import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DashboardPalestra = () => {
  const [personalTrainers, setPersonalTrainers] = useState([]);
  const [removedTrainers, setRemovedTrainers] = useState([]);
  const [users, setUsers] = useState([]);
  const [palestra, setPalestra] = useState(null);
  const [proprietarioInfo] = useState({
    nome: "Nome Proprietario",
    ruolo: "Admin",
  });
  const [message, setMessage] = useState("");
  const [palestraNome] = useState("Nome Palestra"); // Nome della palestra

  // Funzione di logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload(); // Ricarica la pagina dopo il logout
  };

  // Funzione per recuperare i dati
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Token non trovato. Effettua il login.");
        return;
      }

      const [trainersResponse, usersResponse, iscrizioniResponse] = await Promise.all([
        axios.get("http://localhost:3000/api/personal-trainers", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:3000/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get("http://localhost:3000/api/iscrizioni", {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      console.log("Personal Trainers:", trainersResponse.data);
      console.log("Users:", usersResponse.data);
      console.log("Iscrizioni:", iscrizioniResponse.data);

      const usersWithSubscriptions = usersResponse.data.map(user => {
        const iscrizione = iscrizioniResponse.data.find(iscrizione => iscrizione.utenteId === user._id);
        return { ...user, iscrizione };
      });

      setPersonalTrainers(trainersResponse.data);
      setUsers(usersWithSubscriptions);
    } catch (error) {
      console.error("Errore nel recupero dei dati:", error);
      setMessage("Errore nel caricamento dei dati.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchPalestraData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Token non trovato. Effettua il login.");
        return;
      }

      const response = await axios.get("http://localhost:3000/api/palestra", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setPalestra(response.data); // Memorizza i dati della palestra
      }
    } catch (error) {
      console.error("Errore nel recupero della palestra:", error);
      setMessage("Errore nel caricamento dei dati della palestra.");
    }
  };
  useEffect(() => {
    fetchPalestraData();
  }, []);

  // Funzione per scorrere alla sezione desiderata
  const handleScroll = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Approva un personal trainer
  const handleApproveTrainer = async (trainerId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Token non trovato. Effettua il login.");
        return;
      }

     // Chiamata per approvare il trainer
     const response = await axios.post(
      `http://localhost:3000/api/approve-trainer/${trainerId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data); // Log della risposta

    if (response.status === 200) {
      // Aggiorna lo stato dei personal trainers
      setPersonalTrainers(prev => prev.filter(trainer => trainer._id !== trainerId));
      const approvedTrainer = personalTrainers.find(trainer => trainer._id === trainerId);
      setPersonalTrainers(prev => [...prev, { ...approvedTrainer, approved: true }]);
      setMessage("Trainer approvato con successo!");
    } else {
      setMessage(response.data.message);
    }
  } catch (error) {
    if (error.response) {
      // Il server ha risposto con uno stato diverso da 2xx
      console.error("Errore nella risposta del server:", error.response.data);
      setMessage(error.response.data.message || "Errore nell'approvazione.");
    } else if (error.request) {
      // La richiesta è stata fatta ma non è stata ricevuta alcuna risposta
      console.error("Nessuna risposta ricevuta:", error.request);
      setMessage("Nessuna risposta dal server.");
    } else {
      // Qualcosa è andato storto nella configurazione della richiesta
      console.error("Errore nella configurazione della richiesta:", error.message);
      setMessage("Errore nella configurazione della richiesta.");
    }
  }
};

// Rimuove un personal trainer
const handleRemoveTrainer = async (trainerId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Token non trovato. Effettua il login.");
      return;
    }

    // Chiamata API per rimuovere il trainer
    const response = await axios.delete(
      `http://localhost:3000/api/remove-trainer/${trainerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response); // Log della risposta del backend

    if (response.status === 200) {
      // Se la rimozione è riuscita, aggiorna la lista dei trainer rimossi
      const removedTrainer = personalTrainers.find(t => t._id === trainerId); // Trova il trainer rimosso
      setMessage("Trainer rimosso con successo!");
      setPersonalTrainers(prev => prev.filter(t => t._id !== trainerId)); // Rimuove dalla lista locale

      // Aggiungi il trainer rimosso alla lista dei trainer rimossi
      setRemovedTrainers(prev => [...prev, removedTrainer]);

      // Ricarica i dati della lista dei personal trainer
      fetchData(); // Assicurati che la lista dei trainer sia aggiornata
    } else {
      setMessage(response.data.message || "Errore nella rimozione.");
    }
  } catch (error) {
    if (error.response) {
      // Il server ha risposto con uno stato diverso da 2xx
      console.error("Errore nella risposta del server:", error.response.data);
      setMessage(error.response.data.message || "Errore nella rimozione.");
    } else if (error.request) {
      // La richiesta è stata fatta ma non è stata ricevuta alcuna risposta
      console.error("Nessuna risposta ricevuta:", error.request);
      setMessage("Nessuna risposta dal server.");
    } else {
      // Qualcosa è andato storto nella configurazione della richiesta
      console.error("Errore nella configurazione della richiesta:", error.message);
      setMessage("Errore nella configurazione della richiesta.");
    }
  }
};

return (
  <div className="flex h-full bg-gray-100">
    {/* Sidebar */}
    <aside className="w-64 bg-white shadow-lg p-4 flex flex-col justify-between h-full fixed top-24 left-0 z-30">
      <div>
        <nav>
          <ul className="space-y-4">
            <li className="text-blue-600 font-medium hover:text-blue-800 cursor-pointer">
              <Link to="/dashboard-palestra">Dashboard</Link>
            </li>
            <li className="text-gray-600 hover:text-blue-600 cursor-pointer">
              <Link to="/modifica-profilo-palestra">Modifica Profilo</Link>
            </li>
            <li className="text-gray-600 hover:text-blue-600 cursor-pointer" onClick={() => handleScroll("trainers-section")}>Personal Trainer</li>
            <li className="text-gray-600 hover:text-blue-600 cursor-pointer" onClick={() => handleScroll("users-section")}>Utenti Iscritti</li>
          </ul>
        </nav>
      </div>

      <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 font-bold">
        Logout
      </button>
    </aside>

    <main className="flex-1 ml-64 p-6 overflow-y-auto">
      <header className="mb-6 bg-white shadow-md rounded-lg p-4">
        <h1 className="text-2xl font-bold">Dashboard Palestra</h1>
      </header>

      {/* Messaggio */}
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 border border-green-300 rounded-lg">
          {message}
        </div>
      )}

      {/* Messaggio di Benvenuto */}
      <div className="mb-6 p-4 bg-white shadow-md rounded-lg">
        <p className="text-lg">Benvenuto alla {palestra ? palestra.nome : "Palestra"}!</p>
      </div>

      {/* Sezione Richieste Personal Trainer */}
      <section id="trainers-section" className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Richieste Personal Trainer</h2>
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-4">Nome</th>
              <th className="p-4">Specializzazione</th>
              <th className="p-4">Esperienza</th>
              <th className="p-4">Curriculum</th>
              <th className="p-4">Stato</th>
              <th className="p-4">Azione</th>
            </tr>
          </thead>
          <tbody>
            {personalTrainers.filter(trainer => !trainer.approved && !trainer.isDeleted).length > 0 ? (
              personalTrainers.filter(trainer => !trainer.approved && !trainer.isDeleted).map((trainer) => (
                <tr key={trainer._id} className="border-b">
                  <td className="p-4">{trainer.nome} {trainer.cognome}</td>
                  <td className="p-4">{trainer.specializzazione}</td>
                  <td className="p-4">{trainer.esperienza} anni</td>
                  <td className="p-4">
                    {trainer.documentUrl ? (
                      <a href={`http://localhost:3000${trainer.documentUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">Visualizza Curriculum</a>
                    ) : (
                      <span className="text-gray-500">Nessun documento</span>
                    )}
                  </td>
                  <td className="p-4">
                    {trainer.approvato ? (
                      <span className="text-green-600">Approvato</span>
                    ) : (
                      <span className="text-yellow-600">In attesa</span>
                    )}
                  </td>
                  <td className="p-4">
                    {!trainer.approvato && (
                      <button onClick={() => handleApproveTrainer(trainer._id)} className="bg-green-500 text-white py-1 px-3 rounded">Approva</button>
                    )}
                    <button onClick={() => handleRemoveTrainer(trainer._id)} className="bg-red-500 text-white py-1 px-3 rounded ml-2">Rimuovi</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">Nessun personal trainer trovato</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Sezione Personal Trainer Approvati */}
      <section id="approved-trainers-section" className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Personal Trainer Approvati</h2>
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-4">Nome</th>
              <th className="p-4">Specializzazione</th>
              <th className="p-4">Esperienza</th>
            </tr>
          </thead>
          <tbody>
          {personalTrainers.filter(trainer => trainer.approved && !trainer.isDeleted).length > 0 ? (
                personalTrainers.filter(trainer => trainer.approved && !trainer.isDeleted).map((trainer) => (
                  <tr key={trainer._id} className="border-b">
                    <td className="p-4">{trainer.nome} {trainer.cognome}</td>
                    <td className="p-4">{trainer.specializzazione}</td>
                    <td className="p-4">{trainer.esperienza} anni</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500">Nessun trainer approvato</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Sezione Personal Trainer Rimossi */}
        <section id="removed-trainers-section" className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Personal Trainer Rimossi</h2>
          <ul className="bg-white p-4 shadow-md rounded-lg">
            {removedTrainers.length > 0 ? (
              removedTrainers.map((trainer) => (
                <li key={trainer._id} className="p-2 border-b">
                  {trainer.nome} {trainer.cognome}
                </li>
              ))
            ) : (
              <p className="text-gray-500">Nessun personal trainer rimosso</p>
            )}
          </ul>
        </section>

        {/* Sezione Utenti */}
        <section id="users-section" className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Utenti Iscritti</h2>
          <div>
            {users.length > 0 ? (
              <ul className="space-y-4">
                {users.map((user) => (
                  <li key={user._id} className="p-4 bg-white shadow-md rounded-lg">
                    <strong>{user.nome} {user.cognome}</strong> - {user.email} - Abbonamento: {user.iscrizione ? user.iscrizione.tipoAbbonamento : "Nessun abbonamento"} - Inizio: {new Date(user.dataRegistrazione).toLocaleDateString()} - Fine: {user.iscrizione ? new Date(user.iscrizione.dataScadenza).toLocaleDateString() : "N/A"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nessun utente trovato</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPalestra;