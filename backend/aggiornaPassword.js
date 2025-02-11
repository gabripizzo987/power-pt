const bcrypt = require('bcrypt');
const { MongoClient, ObjectId } = require('mongodb');

// Connessione a MongoDB
const uri = "mongodb+srv://gabrielepizzo200:A6zkenIOg69q5jgl@power-pt.jijpm.mongodb.net/?retryWrites=true&w=majority&appName=power-pt";
const client = new MongoClient(uri);

let data = require('./data.json'); // Rileggi il file JSON

const aggiornaPasswordNelDB = async () => {
  try {
    // Connessione al database
    await client.connect();
    const database = client.db("power-pt");
    const palestraCollection = database.collection("palestra");

    // Cicla tutte le palestre e aggiorna la password
    for (let palestra of data.palestra) {
      if (!palestra.password.startsWith('$2b$')) { // Controlla se non è già criptata
        const salt = bcrypt.genSaltSync(10);
        palestra.password = bcrypt.hashSync(palestra.password, salt);
      }

      // Aggiorna la password criptata nel database
      const result = await palestraCollection.updateOne(
        { email: palestra.email }, // Usa l'email per trovare la palestra
        { $set: { password: palestra.password } } // Aggiorna la password
      );

      if (result.modifiedCount > 0) {
        console.log(`Password aggiornata per palestra con email: ${palestra.email}`);
      } else {
        console.log(`Nessun aggiornamento per palestra con email: ${palestra.email}`);
      }
    }

    console.log('Tutte le password sono state aggiornate nel database.');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento delle password nel DB:', error);
  } finally {
    // Chiudi la connessione al database
    await client.close();
  }
};

// Esegui lo script
aggiornaPasswordNelDB().catch((err) => console.error(err));