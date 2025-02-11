import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPalestra = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Stato per l'errore
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Invio dei dati di login");
  
    try {
      const response = await axios.post("http://localhost:3000/login-palestra", {
        email,
        password,
      });
  
      // Aggiungi un log per vedere la risposta
      console.log("Risposta dal backend:", response);

      if (response.data.success) {
        // Resetta l'errore se il login ha successo
        setError(""); 
        
        // Salva il token e l'ID della palestra nel localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("palestraId", response.data.palestraId); // Salva l'ID della palestra
        console.log("Token salvato:", response.data.token);  // Log per verificare che il token sia salvato correttamente
        console.log("ID Palestra salvato:", response.data.palestraId); // Log per verificare che l'ID sia salvato correttamente
        
        // Naviga alla dashboard della palestra
        navigate("/dashboard-palestra");
      } else {
        // Se le credenziali non sono corrette, mostra l'errore
        setError(response.data.message || "Credenziali non valide!");
      }
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Errore durante il login. Riprova.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login Palestra</h2>
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

export default LoginPalestra;