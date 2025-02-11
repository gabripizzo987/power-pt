import { useEffect, useState } from "react";
import { getPersonalTrainers } from "./api/api"; // Percorso relativo al file `api.js`

export default function PersonalTrainers() {
    const [trainers, setTrainers] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const data = await getPersonalTrainers();
            setTrainers(data);
        }
        fetchData();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Personal Trainers</h2>
            <table className="table-auto w-full border">
                <thead>
                    <tr>
                        <th className="border px-4 py-2">Nome</th>
                        <th className="border px-4 py-2">Cognome</th>
                        <th className="border px-4 py-2">Specializzazione</th>
                    </tr>
                </thead>
                <tbody>
                    {trainers.map((trainer) => (
                        <tr key={trainer._id}>
                            <td className="border px-4 py-2">{trainer.nome}</td>
                            <td className="border px-4 py-2">{trainer.cognome}</td>
                            <td className="border px-4 py-2">{trainer.specializzazione}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}