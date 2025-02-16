const { MongoClient } = require("mongodb");
const fs = require("fs");

// URI del database
const uri = "mongodb+srv://gabrielepizzo200:A6zkenIOg69q5jgl@power-pt.jijpm.mongodb.net/power-pt?retryWrites=true&w=majority";

// Funzione per connettersi al database
const connectToDatabase = async () => {
  try {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log("Connesso a MongoDB");
    return client;
  } catch (err) {
    console.error("Errore di connessione a MongoDB:", err.message);
    process.exit(1);
  }
};

// Funzione per recuperare i dati da una collezione
const fetchData = async (client, collectionName) => {
  try {
    const collection = client.db().collection(collectionName);
    const data = await collection.find().toArray();
    console.log(`Dati recuperati dalla collezione ${collectionName}: ${data.length} elementi trovati.`);
    return data;
  } catch (err) {
    console.error(`Errore durante il recupero dei dati da ${collectionName}:`, err.message);
    return [];
  }
};

// Funzione per esportare i dati in un file JSON
const exportData = async () => {
  const client = await connectToDatabase(); // Connetti al database

  try {
    // Recupera i dati da ciascuna collezione
    const palestra = await fetchData(client, "palestra");
    const personalTrainer = await fetchData(client, "personal_trainer");
    const utente = await fetchData(client, "utente");
    const schedaAllenamento = await fetchData(client, "scheda_allenamento");
    const iscrizione = await fetchData(client, "iscrizione");

    // Prepara i dati per l'esportazione
    const allData = {
      palestra,
      personalTrainer,
      utente,
      schedaAllenamento,
      iscrizione,
    };

    // Scrive i dati in un file JSON
    fs.writeFileSync("data.json", JSON.stringify(allData, null, 2));
    console.log("File data.json creato con successo!");
  } catch (error) {
    console.error("Errore durante l'esportazione dei dati:", error.message);
  } finally {
    client.close(); // Chiudi la connessione al database
  }
};

// Funzione principale
const run = async () => {
  await exportData(); // Esporta i dati
};

// Esegui lo script
run();
