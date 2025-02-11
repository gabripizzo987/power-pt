import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const GestioneSchede = () => {
  const { id } = useParams(); // id del trainer
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [users, setUsers] = useState([]);
  const [newWorkout, setNewWorkout] = useState({
    descrizione: "",
    id_utente: "",
    esercizi: [],
  });
  const [editingWorkout, setEditingWorkout] = useState(null); // Stato per la scheda in modifica
  const [errorMessage, setErrorMessage] = useState(""); // Per visualizzare eventuali errori

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token non trovato. Effettua il login.");
          return;
        }

        // Carica le schede esistenti del trainer specifico
        const workoutsResponse = await axios.get(`http://localhost:3000/schede/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWorkouts(workoutsResponse.data);

        // Carica gli esercizi
        const exercisesResponse = await axios.get("http://localhost:3000/esercizi", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExercises(exercisesResponse.data);

        // Carica gli utenti iscritti al trainer
        const usersResponse = await axios.get(`http://localhost:3000/api/trainer/${id}/utenti`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(usersResponse.data);  // Otteniamo gli utenti associati al trainer
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        if (error.response) {
          console.error("Errore di risposta dal server:", error.response.data);
          console.error("Status:", error.response.status);
        } else {
          console.error("Errore nella richiesta:", error.message);
        }
      }
    };

    fetchData();
  }, [id]);

  const handleCreateWorkout = async () => {
    try {
      if (!newWorkout.descrizione || !newWorkout.id_utente || newWorkout.esercizi.length === 0) {
        setErrorMessage("Per favore, completa tutti i campi.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trovato. Effettua il login.");
        return;
      }

      // Creiamo una nuova scheda con gli esercizi
      const response = await axios.post("http://localhost:3000/crea-scheda", {
        trainer_id: id,
        id_utente: newWorkout.id_utente,
        descrizione: newWorkout.descrizione,
        esercizi: newWorkout.esercizi, // Includiamo gli esercizi
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Se la creazione va a buon fine, aggiorniamo la lista delle schede
      setWorkouts([...workouts, response.data]);
      setNewWorkout({ descrizione: "", id_utente: "", esercizi: [] });
      setErrorMessage("");  // Rimuoviamo eventuali messaggi di errore

      console.log("Scheda creata:", response.data);
    } catch (error) {
      console.error("Errore nella creazione della scheda:", error);
      setErrorMessage("Si è verificato un errore nella creazione della scheda.");
    }
  };

  const handleAddExercise = () => {
    setNewWorkout({
      ...newWorkout,
      esercizi: [
        ...newWorkout.esercizi,
        { nome: "", descrizione: "", serie: "", ripetizioni: "", video: "" }
      ]
    });
  };

  const handleRemoveExercise = (index) => {
    const updatedExercises = [...newWorkout.esercizi];
    updatedExercises.splice(index, 1);
    setNewWorkout({ ...newWorkout, esercizi: updatedExercises });
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...newWorkout.esercizi];
    updatedExercises[index][field] = value;
    setNewWorkout({ ...newWorkout, esercizi: updatedExercises });
  };

  const handleUserSelect = (event) => {
    setNewWorkout({ ...newWorkout, id_utente: event.target.value });
  };

  const handleRemoveWorkout = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trovato. Effettua il login.");
        return;
      }

      // Rimuoviamo la scheda dal database
      await axios.delete(`http://localhost:3000/schede/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Rimuoviamo la scheda anche dalla lista nel frontend
      setWorkouts(workouts.filter(workout => workout._id !== id));

      console.log("Scheda rimossa:", id);
    } catch (error) {
      console.error("Errore nella rimozione della scheda:", error);
      setErrorMessage("Si è verificato un errore nella rimozione della scheda.");
    }
  };

  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout);
    setNewWorkout({
      descrizione: workout.descrizione,
      id_utente: workout.id_utente,
      esercizi: workout.esercizi,
    });
  };

  const handleUpdateWorkout = async () => {
    try {
      if (!newWorkout.descrizione || !newWorkout.id_utente || newWorkout.esercizi.length === 0) {
        setErrorMessage("Per favore, completa tutti i campi.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token non trovato. Effettua il login.");
        return;
      }

      // Aggiorniamo la scheda con gli esercizi
      const response = await axios.put(`http://localhost:3000/aggiorna-scheda/${editingWorkout._id}`, {
        trainer_id: id,
        id_utente: newWorkout.id_utente,
        descrizione: newWorkout.descrizione,
        esercizi: newWorkout.esercizi, // Includiamo gli esercizi
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Se l'aggiornamento va a buon fine, aggiorniamo la lista delle schede
      const updatedWorkouts = workouts.map(workout =>
        workout._id === editingWorkout._id ? { ...workout, ...newWorkout } : workout
      );
      setWorkouts(updatedWorkouts);
      setEditingWorkout(null);
      setNewWorkout({ descrizione: "", id_utente: "", esercizi: [] });
      setErrorMessage("");  // Rimuoviamo eventuali messaggi di errore

      console.log("Scheda aggiornata:", response.data);
    } catch (error) {
      console.error("Errore nell'aggiornamento della scheda:", error);
      setErrorMessage("Si è verificato un errore nell'aggiornamento della scheda.");
    }
  };

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold">Gestione Schede di Allenamento</h1>

      {errorMessage && <div className="bg-red-500 text-white p-2 my-4">{errorMessage}</div>}

      <h2 className="text-xl font-bold mt-6">Schede Esistenti</h2>
      {workouts.length === 0 ? (
        <p>Nessuna scheda disponibile.</p>
      ) : (
        <ul className="mt-4">
          {workouts.map((workout) => (
            <li key={workout._id} className="border p-2 mb-2">
              <div className="flex justify-between">
                <div>{workout.descrizione}</div>
                <div>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 mr-2"
                    onClick={() => handleEditWorkout(workout)}
                  >
                    Modifica
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2"
                    onClick={() => handleRemoveWorkout(workout._id)}
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-xl font-bold mt-6">{editingWorkout ? "Modifica Scheda" : "Crea Nuova Scheda"}</h2>

      <input
        type="text"
        className="border p-2 w-full"
        placeholder="Descrizione"
        value={newWorkout.descrizione}
        onChange={(e) => setNewWorkout({ ...newWorkout, descrizione: e.target.value })}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Aggiungi Esercizi</h3>
        <table className="table-auto w-full mt-4 border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Esercizio</th>
              <th className="border p-2">Descrizione</th>
              <th className="border p-2">Serie</th>
              <th className="border p-2">Ripetizioni</th>
              <th className="border p-2">Video (URL)</th>
              <th className="border p-2">Azione</th>
            </tr>
          </thead>
          <tbody>
            {newWorkout.esercizi.map((exercise, index) => (
              <tr key={index}>
                <td className="border p-2">
                  <input
                    type="text"
                    className="w-full"
                    placeholder="Nome esercizio"
                    value={exercise.nome}
                    onChange={(e) => handleExerciseChange(index, "nome", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    className="w-full"
                    placeholder="Descrizione esercizio"
                    value={exercise.descrizione}
                    onChange={(e) => handleExerciseChange(index, "descrizione", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    className="w-full"
                    placeholder="Serie"
                    value={exercise.serie}
                    onChange={(e) => handleExerciseChange(index, "serie", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    className="w-full"
                    placeholder="Ripetizioni"
                    value={exercise.ripetizioni}
                    onChange={(e) => handleExerciseChange(index, "ripetizioni", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    className="w-full"
                    placeholder="URL Video"
                    value={exercise.video}
                    onChange={(e) => handleExerciseChange(index, "video", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <button
                    className="bg-red-500 text-white px-4 py-2"
                    onClick={() => handleRemoveExercise(index)}
                  >
                    Rimuovi
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          className="bg-green-500 text-white px-4 py-2 mt-4"
          onClick={handleAddExercise}
        >
          Aggiungi Esercizio
        </button>
      </div>

      <h3 className="mt-6">Seleziona Utente</h3>
      <select
        className="border p-2 w-full"
        value={newWorkout.id_utente}
        onChange={handleUserSelect}
      >
        <option value="">Seleziona un utente</option>
        {users.map((user) => (
          <option key={user._id} value={user._id}>
            {user.nome} {user.cognome}
          </option>
        ))}
      </select>

      <div className="mt-6">
        <button
          className="bg-blue-500 text-white px-4 py-2"
          onClick={editingWorkout ? handleUpdateWorkout : handleCreateWorkout}
        >
          {editingWorkout ? "Aggiorna Scheda" : "Crea Scheda"}
        </button>
        {editingWorkout && (
          <button
            className="bg-gray-500 text-white px-4 py-2 ml-2"
            onClick={() => {
              setEditingWorkout(null);
              setNewWorkout({ descrizione: "", id_utente: "", esercizi: [] });
            }}
          >
            Annulla Modifica
          </button>
        )}
      </div>
    </div>
  );
};

export default GestioneSchede;