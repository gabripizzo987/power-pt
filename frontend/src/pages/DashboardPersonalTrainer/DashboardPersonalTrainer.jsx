import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHome, FaUsers, FaDumbbell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";

const DashboardPersonalTrainer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      console.error("Errore: Nessun ID trovato per il trainer");
      return;
    }

    const fetchOverview = async () => {
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

        const usersResponse = await axios.get(`http://localhost:3000/api/trainer/${id}/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data.sort((a, b) => a.cognome.localeCompare(b.cognome)));
        setLoading(false);
      } catch (error) {
        console.error("Errore nel caricamento della panoramica:", error);
        setLoading(false);
      }
    };

    fetchOverview();
  }, [id]);

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token non trovato. Effettua il login.");
        return;
      }

      const { data } = await axios.get(`http://localhost:3000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(data);
    } catch (error) {
      console.error("Errore nel recupero dei dettagli dell'utente:", error);
      setError("Errore nel recupero dei dettagli dell'utente.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("personalTrainer");
    navigate("/login-trainer");
  };

  return (
    <div className="flex pt-20">
      <div className="bg-gray-800 text-white w-64 min-h-screen shadow-lg">
        <div className="p-6 text-center font-bold text-2xl">Trainer Dashboard</div>
        <ul>
          <li className="p-4 hover:bg-gray-700 transition-colors flex items-center space-x-3">
            <FaHome className="text-xl" />
            <Link to={`/dashboard-personal-trainer/${id}`} className="hover:text-blue-400">Home</Link>
          </li>
          <li className="p-4 hover:bg-gray-700 transition-colors flex items-center space-x-3">
            <FaUsers className="text-xl" />
            <a href={`#`} className="hover:text-blue-400">Utenti iscritti</a>
          </li>
          <li className="p-4 hover:bg-gray-700 transition-colors flex items-center space-x-3">
            <FaDumbbell className="text-xl" />
            <Link to={`/dashboard-personal-trainer/${id}/manage-workouts`} className="hover:text-blue-400">Gestione Schede</Link>
          </li>
          <li className="p-4 hover:bg-gray-700 transition-colors flex items-center space-x-3">
            <FaUserCircle className="text-xl" />
            <Link to={`/dashboard-personal-trainer/${id}/edit-profile`} className="hover:text-blue-400">Modifica Profilo</Link>
          </li>
          <li className="p-4 hover:bg-gray-700 transition-colors flex items-center space-x-3">
            <FaSignOutAlt className="text-xl" />
            <button onClick={handleLogout} className="hover:text-blue-400">Logout</button>
          </li>
        </ul>
      </div>

      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Benvenuto nella tua Dashboard</h1>
        {loading ? (
          <div>Loading...</div>
        ) : profile ? (
          <div className="text-center mt-4">
            {profile.profilePicture && (
              <img
                src={`http://localhost:3000/${profile.profilePicture}`}
                alt="Foto Profilo"
                className="w-32 h-32 rounded-full mx-auto"
              />
            )}
            <p className="text-gray-700 mt-4">
              Benvenuto, {profile.nome} {profile.cognome}! Qui puoi gestire i tuoi utenti e le loro schede di allenamento.
            </p>
          </div>
        ) : (
          <div>Errore nel caricamento del profilo.</div>
        )}

        <h2 className="text-xl font-bold mt-8">Utenti Iscritti</h2>
        <div className="mt-6">
          {users.length === 0 ? (
            <div>No users found.</div>
          ) : (
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border-b py-2 px-4 w-1/4">Nome</th>
                  <th className="border-b py-2 px-4 w-1/4">Cognome</th>
                  <th className="border-b py-2 px-4 w-1/4">Email</th>
                  <th className="border-b py-2 px-4 w-1/4">Dettagli</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b hover:bg-gray-100">
                    <td className="py-2 px-4 w-1/4">{user.nome}</td>
                    <td className="py-2 px-4 w-1/4">{user.cognome}</td>
                    <td className="py-2 px-4 w-1/4">{user.email}</td>
                    <td className="py-2 px-4 w-1/4">
                      <button
                         onClick={() => fetchUserDetails(user._id)}
                         className="text-blue-500 hover:text-blue-700"
                       >
                         Visualizza
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
     
         {selectedUser && (
           <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
             <h2 className="text-xl font-bold">Dettagli Utente</h2>
             <p><strong>Nome:</strong> {selectedUser.nome}</p>
             <p><strong>Cognome:</strong> {selectedUser.cognome}</p>
             <p><strong>Email:</strong> {selectedUser.email}</p>
             <p><strong>Obiettivo:</strong> {selectedUser.obiettivo}</p>
             <p><strong>Altezza:</strong> {selectedUser.altezza} cm</p>
             <p><strong>Peso:</strong> {selectedUser.peso} kg</p>
             {/* Aggiungi altri campi necessari */}
           </div>
         )}
       </div>
     </div>
       );
     };
     
     export default DashboardPersonalTrainer;