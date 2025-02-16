const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://gabrielepizzo200:A6zkenIOg69q5jgl@power-pt.jijpm.mongodb.net/?retryWrites=true&w=majority&appName=power-pt";
const client = new MongoClient(uri);

const aggiornaPasswordNelDB = async () => {
  try {
    await client.connect();
    const db = client.db("power-pt");

    // Collezioni che devono essere aggiornate
    const palestraCollection = db.collection("palestra");
    const utenteCollection = db.collection("utente"); 

    // Aggiorna le password per la collezione palestra
    const palestre = await palestraCollection.find().toArray();
    for (let palestra of palestre) {
      if (!palestra.password.startsWith('$2b$')) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(palestra.password, salt);
        await palestraCollection.updateOne({ _id: palestra._id }, { $set: { password: hashedPassword } });
        console.log(`Password criptata per palestra ${palestra.email}`);
      }
    }

    // Aggiorna le password per la collezione utente
    const utenti = await utenteCollection.find().toArray();
    for (let utente of utenti) {
      if (!utente.password.startsWith('$2b$')) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(utente.password, salt);
        await utenteCollection.updateOne({ _id: utente._id }, { $set: { password: hashedPassword } });
        console.log(`Password criptata per utente ${utente.email}`);
      }
    }

    console.log('Tutte le password sono state aggiornate nel database.');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento delle password nel DB:', error);
  } finally {
    await client.close();
  }
};

// Esegui lo script
aggiornaPasswordNelDB();
