import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginUtente = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Stato per l'errore
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Invio dei dati di login");

    try {
      const response = await axios.post("http://localhost:3000/api/login-utente", {
        email,
        password,
      });

      console.log("Risposta dal backend:", response.data);

      if (response.data.token && response.data.utente) {
        // Salvataggio dei dati nel localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("utente", JSON.stringify(response.data.utente));
        console.log("Dati salvati:", response.data.utente);

        // Verifica se l'utente ha già selezionato un personal trainer
        if (response.data.utente.trainer_id) {
          // Se ha già un trainer, reindirizza alla dashboard dell'utente
          navigate(`/dashboard-utente/${response.data.utente.id}`);
        } else {
          // Se non ha selezionato un trainer, reindirizza alla pagina di selezione trainer
          navigate("/seleziona-trainer");
        }
      } else {
        setError("Credenziali non valide o dati mancanti!");
      }
    } catch (error) {
      console.error("Errore durante il login:", error);
      setError(error.response?.data?.message || "Errore durante il login. Riprova.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login Utente</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Mostra l'errore se presente */}
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-700 font-bold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginUtente;
