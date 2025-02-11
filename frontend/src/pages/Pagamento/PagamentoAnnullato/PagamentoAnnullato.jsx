import { Link } from "react-router-dom";

const PagamentoAnnullato = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h2 className="text-3xl font-bold text-red-600 mb-4">Pagamento Annullato</h2>
      <p className="text-gray-700 mb-6">Il pagamento non è andato a buon fine. Puoi riprovare o tornare alla home.</p>
      
      <div className="space-x-4">
        <Link to="/abbonamenti" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-700">
          Riprova il pagamento
        </Link>
        <Link to="/" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-700">
          Torna alla Home
        </Link>
      </div>
    </div>
  );
};

export default PagamentoAnnullato;
