const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const stripe = require('stripe')('sk_test_51QMdXtAYGtXYhm6HYeSLAzYMFxZwIe0Z1z0ZZ4t0SZSy9uf1htPNEPL36pGCRH1wFJHZtHURii7CatsDcAo9EdIF00rszHBDOh');


// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Connessione a MongoDB
const uri = "mongodb+srv://gabrielepizzo200:A6zkenIOg69q5jgl@power-pt.jijpm.mongodb.net/?retryWrites=true&w=majority&appName=power-pt";
const client = new MongoClient(uri);

async function run() {
    try {
        const database = client.db("power-pt");
        const palestraCollection = database.collection("palestra");
        const personalTrainerCollection = database.collection("personal_trainer");
        const utenteCollection = database.collection("utente");
        const schedaAllenamentoCollection = database.collection("scheda_allenamento");
        const esercizioCollection = database.collection("esercizio");
        const iscrizioneCollection = database.collection("iscrizione");

        // Connessione al database
        await client.connect();

        // Middleware di verifica JWT
        const verifyJWT = (req, res, next) => {
          const authorization = req.headers.authorization;
          if (!authorization) {
            return res.status(401).send({ error: true, message: 'Unauthorized access' });
          }
        
          const token = authorization.split(' ')[1];
          console.log("Secret usata per jwt.verify:", process.env.ASSESS_SECRET);
        
          jwt.verify(token, process.env.ASSESS_SECRET, (err, decoded) => {
            if (err) {
              console.error("Errore nella verifica del token:", err);
              return res.status(403).send({ error: true, message: 'Forbidden user or token expired' });
            }
            console.log('Decoded token:', decoded);
            req.decoded = decoded;
            next();
          });
        };

        // Configurazione di multer per il caricamento dei file
        const storage = multer.diskStorage({
        destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Dove verranno salvati i file
        },
        filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Aggiungi un timestamp al nome del file
        },
        });
        const upload = multer({ storage });
        
        const updateAllTrainersWithPalestraId = async () => {
          const palestraId = "67585b2e273efb169919c87b"; // Sostituisci con l'ID della palestra
        
          try {
            const result = await personalTrainerCollection.updateMany(
              { palestra_id: { $exists: false } },
              { $set: { palestra_id: palestraId } }
            );
        
            console.log('Tutti i personal trainer sono stati aggiornati con il campo palestra_id', result);
          } catch (err) {
            console.error('Errore nell\'aggiornamento dei personal trainer:', err);
          }
        };
        
        // Esegui questa funzione una volta per aggiornare tutti i documenti
        updateAllTrainersWithPalestraId();

        //prendere i caricamenti per il curriculum
        app.get("/uploads/:filename", (req, res) => {
          const filePath = path.resolve(__dirname, "uploads", req.params.filename);
          res.sendFile(filePath);
      });

        // Login e generazione del token
        app.post('/api/set-token', (req, res) => {
            const { email } = req.body;  // Assicurati di passare solo le informazioni necessarie
            const user = { email };  // Solo l'email
            const token = jwt.sign(user, process.env.ASSESS_SECRET, { expiresIn: '24h' });
            res.send({ token });
        });
        // Ottenere i dettagli della palestra tramite id
        app.get("/palestra/:id", async (req, res) => {
          try {
            const palestraId = req.params.id;
            const palestra = await palestraCollection.findOne({ _id: new ObjectId(palestraId) });
        
            if (!palestra) {
              return res.status(404).send({ error: true, message: "Palestra non trovata" });
            }
        
            res.status(200).send(palestra);
          } catch (error) {
            console.error("Errore nel recupero dei dati palestra:", error);
            res.status(500).send({ error: true, message: "Errore interno del server" });
          }
        });
        // Aggiornare i dettagli della palestra tramite id
        app.put("/api/palestra/:id", async (req, res) => {
          try {
            const palestraId = req.params.id;
            if (!ObjectId.isValid(palestraId)) {
              return res.status(400).json({ message: "ID palestra non valido" });
            }
        
            const updateData = req.body;
            const result = await palestraCollection.updateOne(
              { _id: new ObjectId(palestraId) },
              { $set: updateData }
            );
        
            if (result.modifiedCount === 0) return res.status(404).json({ message: "Palestra non trovata" });
            res.json({ message: "Palestra aggiornata con successo" });
          } catch (error) {
            res.status(500).json({ message: "Errore nell'aggiornamento", error });
          }
        });
        app.get('/check-email', async (req, res) => {
          const { email } = req.query;
          const emailExists = await db.collection("palestra").findOne({ email });
        
          if (emailExists) {
            return res.status(400).json({ message: "Email già in uso" });
          }
        
          res.status(200).json({ message: "Email disponibile" });
        });
        // Ottenere i dettagli della palestra
        app.get("/api/palestra", async (req, res) => {
          try {
            await client.connect();
            const db = client.db('power-pt');
            const palestra = await db.collection("palestra").findOne({});
        
            if (!palestra) {
              return res.status(404).json({ message: "Palestra non trovata" });
            }
        
            res.json(palestra);
          } catch (error) {
            console.error("Errore nel recupero della palestra:", error);
            res.status(500).json({ message: "Errore nel server" });
          } 
        });
        // Rotte per gli utenti
        // Endpoint per la registrazione dell'utente
        app.post('/register-user', async (req, res) => {
          try {
            const { nome, cognome, email, password, obiettivo, altezza, peso } = req.body;
        
            // Controllo campi richiesti
            if (!nome || !cognome || !email || !password || !altezza || !peso) {
              return res.status(400).json({ message: 'Tutti i campi sono obbligatori!' });
            }
        
            // Hash della password
            const hashedPassword = await bcrypt.hash(password, 10);
        
            const nuovoUtente = {
              nome,
              cognome,
              email,
              password: hashedPassword,
              obiettivo,
              altezza: parseFloat(altezza),
              peso: parseFloat(peso),
              dataRegistrazione: new Date()
            };
        
            await client.connect();
            const db = client.db('power-pt'); // Usa il nome del tuo database
            const utenteCollection = db.collection('utente'); // Modifica con il nome della tua collezione
        
            const result = await utenteCollection.insertOne(nuovoUtente);
            
            // Ottieni l'ID dell'utente appena creato
            const userId = result.insertedId;
        
            res.status(201).json({
              message: 'Utente registrato con successo!',
              userId: userId.toString() // Restituisci l'ID dell'utente come stringa
            });
          } catch (error) {
            console.error('Errore nel server:', error);
            res.status(500).json({ message: 'Errore del server.' });
          }
        });
        // Ottenere tutti gli utenti registrati
        app.get('/users', verifyJWT, async (req, res) => {
          try {
            await client.connect();
            const db = client.db('power-pt'); // Usa il nome del tuo database
            const utenteCollection = db.collection('utente'); // Modifica con il nome della tua collezione
        
            const users = await utenteCollection.find({}).toArray();
            res.send(users);
          } catch (error) {
            console.error("Errore nel recupero degli utenti:", error);
            res.status(500).json({ message: "Errore nel recupero degli utenti" });
          }
        });
        // Funzione per ottenere tutti gli utenti registrati (con endpoint diverso)
        app.get('/api/users', async (req, res) => {
          try {
              const db = client.db('power-pt');
              const utenteCollection = db.collection('utente');
              
              const users = await utenteCollection.find({}).toArray();
              res.json(users);
          } catch (error) {
              console.error("Errore nel recupero degli utenti:", error);
              res.status(500).json({ message: "Errore nel recupero degli utenti" });
          }
        });
        // Endpoint per il login utente
        app.post("/api/login-utente", async (req, res) => {
          const { email, password } = req.body;
        
          try {
            await client.connect();
            const db = client.db('power-pt'); // Usa il nome del tuo database
            const utenteCollection = db.collection('utente'); // Modifica con il nome della tua collezione
        
            // Cerca l'utente nella collezione "utente"
            const utente = await utenteCollection.findOne({ email: email });
            if (!utente) {
              return res.status(401).json({ message: "Email o password errati" });
            }
        
            // Verifica la password (assumendo che sia salvata in forma hashed)
            const isMatch = await bcrypt.compare(password, utente.password);
            if (!isMatch) {
              return res.status(401).json({ message: "Email o password errati" });
            }
        
            // Crea un JWT per l'utente
            const token = jwt.sign(
              { id: utente._id, email: utente.email },
              process.env.ASSESS_SECRET || "74661a893411a9ec30d039db27d8ca86cea0cd4717ed4fc96f07885f5ad1e644b56951cd7c7ffdd90f5b9218f15de7499e7d9cc37a5f33a5c5a8ca9fc5846fa0",
              { expiresIn: "1h" }
            );
        
            // Restituisci il token e le informazioni dell'utente (incluso trainer_id, se presente)
            res.status(200).json({
              message: "Login effettuato con successo",
              token,
              utente: {
                id: utente._id,
                nome: utente.nome,
                email: utente.email,
                trainer_id: utente.trainer_id || null
              }
            });
          } catch (error) {
            console.error("Errore durante il login:", error);
            res.status(500).json({ message: "Errore durante il login" });
          }
        });
        // Aggiornamento dei dati dell'utente
        app.put('/update-user/:id', verifyJWT, async (req, res) => {
          const id = req.params.id;
          const updatedUser = req.body;
        
          try {
            await client.connect();
            const db = client.db('power-pt'); // Usa il nome del tuo database
            const utenteCollection = db.collection('utente'); // Modifica con il nome della tua collezione
        
            const result = await utenteCollection.updateOne(
              { _id: new ObjectId(id) },
              { $set: updatedUser }
            );
        
            res.send(result);
          } catch (error) {
            console.error("Errore nell'aggiornamento dell'utente:", error);
            res.status(500).json({ message: "Errore nell'aggiornamento dell'utente" });
          } 
        });

        // Rotta di registrazione del Personal Trainer
        app.post('/register-trainer', upload.single('document'), async (req, res) => {
          const { nome, cognome, email, password, specializzazione, esperienza, descrizione } = req.body;
        
          if (!nome || !cognome || !email || !password || !specializzazione || !esperienza || !descrizione || !req.file) {
            return res.status(400).json({ error: true, message: 'Tutti i campi sono obbligatori, inclusa la laurea/curriculum' });
          }
        
          try {
            await client.connect();
            const db = client.db('power-pt'); // Usa il nome del tuo database
            const personalTrainerCollection = db.collection('personal_trainer'); // Modifica con il nome della tua collezione
        
            const existingTrainer = await personalTrainerCollection.findOne({ email });
            if (existingTrainer) {
              return res.status(400).json({ error: true, message: 'Email già registrata' });
            }
        
            const hashedPassword = await bcrypt.hash(password, 10);
            const newTrainer = {
              nome,
              cognome,
              email,
              password: hashedPassword,
              specializzazione,
              esperienza,
              descrizione,
              documentUrl: `/uploads/${req.file.filename}`, // URL del file caricato
              approved: false,  // Profilo non ancora approvato
            };
        
            await personalTrainerCollection.insertOne(newTrainer);
            res.status(201).json({ success: true, message: 'Personal trainer registrato con successo' });
          } catch (error) {
            console.error("Errore nel salvataggio del trainer:", error);
            res.status(500).json({ error: true, message: 'Errore interno del server' });
          }
        });
        

        // Rotta per la registrazione della Palestra
        app.post('/registerPalestra', async (req, res) => {
          const { nome, email, password } = req.body;
        
          try {
            await client.connect();
            const db = client.db('power-pt'); // Usa il nome del tuo database
            const palestraCollection = db.collection('palestra'); // Modifica con il nome della tua collezione
        
            // Controlla se esiste già una palestra nel database
            const existingPalestra = await palestraCollection.findOne({});
            if (existingPalestra) {
              return res.status(400).send({ error: true, message: 'Esiste già una palestra registrata' });
            }
        
            // Cripta la password
            const hashedPassword = await bcrypt.hash(password, 10);
        
            // Crea la nuova palestra
            const newPalestra = { nome, email, password: hashedPassword, role: 'admin' };  // Aggiungi ruolo admin
            const result = await palestraCollection.insertOne(newPalestra);
        
            // Genera un token JWT
            const token = jwt.sign({ email: newPalestra.email }, process.env.ASSESS_SECRET, { expiresIn: '24h' });
        
            // Restituisci la risposta
            res.status(201).send({ message: 'Palestra registrata con successo', token });
          } catch (error) {
            console.error("Errore durante la registrazione:", error);
            res.status(500).send({ error: true, message: 'Errore durante la registrazione' });
          }
        });

        // Login per la Palestra
        app.post("/login-palestra", async (req, res) => {
          const { email, password } = req.body;
        
          try {
            await client.connect();
            const db = client.db('power-pt');
            const palestraCollection = db.collection('palestra');
        
            const palestra = await palestraCollection.findOne({ email });
        
            if (!palestra) {
              return res.status(400).json({ message: "Email non trovata!" });
            }
        
            const passwordMatch = await bcrypt.compare(password, palestra.password);
        
            if (!passwordMatch) {
              return res.status(400).json({ message: "Password errata!" });
            }
        
            const token = jwt.sign({ id: palestra._id }, process.env.ASSESS_SECRET, { expiresIn: '1h' });
        
            return res.json({
              success: true,
              token,
              palestraId: palestra._id // Aggiungi l'ID della palestra nella risposta
            });
          } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Errore interno del server." });
          }
        });

      // Endpoint per ottenere i personal trainer
      app.get("/api/personal-trainers", async (req, res) => {
        try {
          if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
          }
      
          const db = client.db("power-pt"); // Usa il nome corretto del database
          const personalTrainerCollection = db.collection("personal_trainer"); // Nome corretto della collezione
      
          const trainers = await personalTrainerCollection.find().toArray();
      
          if (!trainers) {
            return res.status(404).json({ message: "Nessun personal trainer trovato" });
          }
      
          console.log("Trainers found:", trainers);
          res.status(200).json(trainers);
        } catch (error) {
          console.error("Errore durante il recupero dei personal trainer:", error);
          res.status(500).json({ message: "Errore durante il recupero dei personal trainer" });
        }
      });

      //Endpoint per login personal trainer
      app.post('/api/login-trainer', async (req, res) => {
        const { email, password } = req.body;
      
        try {
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const personalTrainerCollection = db.collection('personal_trainer'); // Modifica con il nome della tua collezione
      
          // Recupera il personal trainer dal database
          const personalTrainer = await personalTrainerCollection.findOne({ email });
      
          if (!personalTrainer) {
            return res.status(401).json({ message: 'Email o password errati' });
          }
      
          // Verifica la password
          const isMatch = await bcrypt.compare(password, personalTrainer.password);
      
          if (!isMatch) {
            return res.status(401).json({ message: 'Email o password errati' });
          }
      
          // Crea un JWT per il personal trainer
          const token = jwt.sign(
            { id: personalTrainer._id, email: personalTrainer.email },
            process.env.ASSESS_SECRET,
            { expiresIn: '1h' }
          );
      
          // Restituisci il token e le informazioni del personal trainer
          res.status(200).json({
            message: 'Login effettuato con successo',
            token,
            personalTrainer: {
              id: personalTrainer._id,
              name: personalTrainer.nome,
              email: personalTrainer.email
            }
          });
        } catch (error) {
          console.error("Errore durante il login:", error);
          res.status(500).json({ message: "Errore durante il login" });
        }
      });

      // Personal trainer in attesa di approvazione o rimozione da parte di proprietario palestra
      app.get('/pending-trainers', verifyJWT, async (req, res) => {
        try {
          await client.connect();
          const trainers = await personalTrainerCollection.find({ approved: false }).toArray();
          res.json(trainers);
        } catch (error) {
          console.error('Errore nel recupero dei personal trainer:', error);
          res.status(500).json({ error: true, message: 'Errore nel recupero dei personal trainer' });
        }
      });
      // Rotta per ottenere tutti i personal trainer approvati
      app.get('/api/approved-trainers', verifyJWT, async (req, res) => {
        try {
          await client.connect();
          const trainers = await db.collection('personal_trainer').find({ approved: true }).toArray();
          res.json(trainers);
        } catch (error) {
          console.error('Errore nel recupero dei trainer approvati:', error);
          res.status(500).json({ message: 'Errore nel recupero dei trainer approvati' });
        }
      });
      
      // Rotta per approvare un personal trainer
      app.post('/api/approve-trainer/:id', async (req, res) => {
        try {
          const { id } = req.params;
          const objectId = new ObjectId(id);  // Usa ObjectId per il confronto
      
          // Trova il trainer
          const trainer = await personalTrainerCollection.findOne({ _id: objectId });
      
          if (!trainer) {
            return res.status(404).send('Trainer non trovato');
          }
      
          // Esegui l'approvazione
          const result = await personalTrainerCollection.updateOne(
            { _id: objectId },  // Usa objectId invece di id
            { $set: { approved: true } }
          );
      
          // Verifica se l'aggiornamento è avvenuto
          if (result.modifiedCount === 1) {
            return res.status(200).send({ message: 'Trainer approvato con successo' });
          } else {
            return res.status(400).send({ message: 'Nessun cambiamento effettuato' });
          }
      
        } catch (error) {
          console.error('Errore durante l\'approvazione del trainer:', error);
          res.status(500).send('Errore interno del server');
        }
      });
      // Rimuove un personal trainer (logico)
      app.delete('/api/remove-trainer/:trainerId', verifyJWT, async (req, res) => {
  const { trainerId } = req.params;
  console.log("Trainer ID:", trainerId); // Log dell'ID del trainer
  try {
    const trainer = await personalTrainerCollection.updateOne(
      { _id: new ObjectId(trainerId) },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    if (trainer.modifiedCount === 0) {
      console.log("Trainer non trovato"); // Log se il trainer non viene trovato
      return res.status(404).json({ message: 'Trainer non trovato' });
    }

    console.log("Trainer rimosso con successo (logico)"); // Log se il trainer viene rimosso
    res.json({ message: 'Personal trainer rimosso con successo' });
  } catch (error) {
    console.error('Errore nel processare la richiesta:', error); // Log dell'errore
    res.status(500).json({ message: 'Errore nel processare la richiesta' });
  }
      });
      //endpoint per gestire la rimozione dei personal trainer.
      app.delete("/api/remove-trainer/:id", verifyJWT, async (req, res) => {
        try {
            if (req.userRole !== "admin") {
                return res.status(403).json({ message: "Non autorizzato" });
            }
    
            const trainerId = req.params.id.trim();  // Rimuove spazi vuoti
if (!ObjectId.isValid(trainerId)) {
    return res.status(400).json({ message: "ID non valido" });
}
    
            console.log("🔴 Tentativo di eliminazione trainer con ID:", trainerId);
    
            // Elimina il trainer
            const result = await trainerCollection.findOneAndDelete({ _id: new ObjectId(trainerId) });
    
            console.log("🟢 Risultato della rimozione:", result);
    
            // Verifica se il trainer è ancora nel database
            const checkTrainer = await trainerCollection.findOne({ _id: new ObjectId(trainerId) });
    
            if (checkTrainer) {
                console.log("⚠️ Il trainer è ancora nel database:", checkTrainer);
            } else {
                console.log("✅ Trainer eliminato con successo!");
            }
    
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "Trainer non trovato" });
            }
    
            res.status(200).json({ message: "Trainer eliminato definitivamente" });
        } catch (error) {
            console.error("❌ Errore nella rimozione del trainer:", error);
            res.status(500).json({ message: "Errore interno del server" });
        }
    });
      // Ottieni i trainer rimossi (con isDeleted = true)
      app.get('/api/deleted-trainers', verifyJWT, async (req, res) => {
  try {
    const deletedTrainers = await personalTrainerCollection.find({ isDeleted: true }).toArray();

    res.json(deletedTrainers);
  } catch (error) {
    console.error('Errore nel processare la richiesta:', error); // Log dell'errore
    res.status(500).json({ message: 'Errore nel processare la richiesta' });
  }
      });

      // Aggiungi la foto del profilo del personal trainer
      app.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    const profilePicUrl = `/uploads/${file.filename}`; // URL per accedere al file

    // Aggiorna la foto del profilo nel database
    await personalTrainerCollection.updateOne(
      { _id: ObjectId(req.body.trainer_id) }, // Usa l'ID del trainer per identificarlo
      { $set: { profilePicUrl } }
    );

    res.status(200).json({ profilePicUrl });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel caricamento della foto' });
  }
      });

      //ottenere id trainer url
      app.get('/api/trainer/overview/:id', async (req, res) => {
        const { id } = req.params;
      
        try {
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const personalTrainerCollection = db.collection('personal_trainer'); // Modifica con il nome della tua collezione
      
          const personalTrainer = await personalTrainerCollection.findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } } // Escludi il campo password
          );
      
          if (!personalTrainer) {
            return res.status(404).json({ message: 'Personal trainer non trovato' });
          }
      
          res.json(personalTrainer);
        } catch (error) {
          console.error('Errore nel recupero del profilo:', error);
          res.status(500).json({ message: 'Errore nel recupero del profilo' });
        } finally {
          await client.close();
        }
      });
      
      //endpoint per aggiornare personal trainer, dal suo profilo (personal trainer)
      app.put('/api/trainer/:id', upload.single('profilePicture'), async (req, res) => {
        const { id } = req.params;
        const { nome, cognome, specializzazione, palestra_id } = req.body;
        const profilePicture = req.file;
      
        try {
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const personalTrainerCollection = db.collection('personal_trainer'); // Modifica con il nome della tua collezione
      
          const updateData = {
            nome,
            cognome,
            specializzazione,
            palestra_id,
          };
      
          if (profilePicture) {
            updateData.profilePicture = profilePicture.path;
          }
      
          console.log("Trainer ID:", id); // Log dell'ID del trainer
          console.log("Update Data:", updateData); // Log dei dati di aggiornamento
      
          const result = await personalTrainerCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
          );
      
          if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Trainer non trovato' });
          }
      
          res.status(200).json({ message: 'Profilo aggiornato con successo' });
        } catch (err) {
          console.error("Errore nell'aggiornamento del profilo:", err);
          res.status(500).json({ error: 'Si è verificato un errore nell\'aggiornamento del profilo' });
        } finally {
          await client.close();
        }
      });
      // Endpoint per creare una sessione di pagamento con Stripe
      app.post('/api/creaCheckoutSession', async (req, res) => {
        const { userId, tipoAbbonamento } = req.body;
      
        // Controllo parametri
        if (!userId) {
            return res.status(400).json({ error: "L'ID dell'utente è obbligatorio" });
        }
        if (!tipoAbbonamento || (tipoAbbonamento !== 'mensile' && tipoAbbonamento !== 'annuale')) {
            return res.status(400).json({ error: "Tipo di abbonamento non valido" });
        }
    
        const importo = tipoAbbonamento === 'mensile' ? 30 : 330;
    
        // Log per verificare i dati ricevuti
        console.log(`UserId: ${userId}, Tipo Abbonamento: ${tipoAbbonamento}, Importo: ${importo}`);
      
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: tipoAbbonamento === 'mensile' ? 'Abbonamento Mensile' : 'Abbonamento Annuale',
                        },
                        unit_amount: importo * 100, // Stripe accetta l'importo in centesimi
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `http://localhost:5173/cancellato`,
                metadata: { userId, tipoAbbonamento }
            });
          
            res.json({ sessionId: session.id });
        } catch (error) {
            console.error('Errore nella creazione della sessione di pagamento:', error);
            res.status(500).send('Errore nel processo di pagamento');
        }
    });
    
      // Endpoint per inserire l'iscrizione creata con successo nel database con tutti i dati
      app.post('/api/stripeWebhook', express.raw({ type: 'application/json' }), async (req, res) => {
        const sig = req.headers['stripe-signature'];
      
        let event;
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, 'TUO_SECRET_WEBHOOK');
        } catch (err) {
          console.error('Errore nella verifica del webhook:', err);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const userId = session.metadata.userId;
          const tipoAbbonamento = session.metadata.tipoAbbonamento;
          const importo = session.amount_total / 100;
          const palestraId = '67585b2e273efb169919c87b';
      
          try {
            const nuovaIscrizione = {
              utenteId: userId,
              dataInizio: new Date(),
              dataScadenza: tipoAbbonamento === 'mensile' ? 
                  new Date(new Date().setMonth(new Date().getMonth() + 1)) : 
                  new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              tipoAbbonamento,
              stato: 'attiva',
              pagamenti: [{
                pagamentoStripeId: session.payment_intent,
                importo,
                statoPagamento: 'completato',
                dataPagamento: new Date(),
                metodoPagamento: session.payment_method_types[0],
                transazioneId: session.id
              }],
              palestra_id: palestraId
            };
      
            await iscrizioneCollection.insertOne(nuovaIscrizione);
            console.log('Iscrizione registrata con successo:', nuovaIscrizione);
          } catch (err) {
            console.error('Errore nel salvataggio su MongoDB:', err);
            return res.status(500).send('Errore nel salvataggio');
          }
        }
      
        res.json({ received: true });
      });
  
    app.get('/api/iscrizioni', async (req, res) => {
      try {
          const iscrizioni = await iscrizioneCollection.find({}).toArray();
          res.json(iscrizioni);
      } catch (error) {
          console.error('Errore nel recupero delle iscrizioni:', error);
          res.status(500).send('Errore nel recupero delle iscrizioni');
      }
  });
      // server.js (o controller specifico per i trainer)
      app.get('/api/trainers', async (req, res) => {
        try {
          const trainers = await personalTrainerCollection.find({ approved: true }).toArray(); // Recupera solo i trainer approvati
          res.status(200).json(trainers);
        } catch (error) {
          console.error("Errore nel recupero dei trainer:", error); // Log dell'errore
          res.status(500).json({ message: 'Errore nel recupero dei trainer', error: error.message });
        }
      });
      

      app.put('/api/utente/:id', async (req, res) => {
        const { id } = req.params;
        const { trainer_id } = req.body; // ID del trainer selezionato
  
        if (!trainer_id) {
          return res.status(400).json({ message: 'Trainer ID non fornito' });
        }
  
        try {
          // Verifica se il trainer esiste
          const trainer = await personalTrainerCollection.findOne({ _id: new ObjectId(trainer_id) });
          if (!trainer) {
            return res.status(404).json({ message: 'Trainer non trovato' });
          }
  
          // Cerca l'utente per _id e aggiorna il campo trainer_id
          const result = await utenteCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { trainer_id: trainer_id } }
          );
  
          if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Utente non trovato' });
          }
  
          res.status(200).json({ message: 'Trainer assegnato correttamente all\'utente' });
        } catch (error) {
          console.error('Errore durante l\'aggiornamento dell\'utente:', error);
          res.status(500).json({ message: 'Errore nell\'aggiornare l\'utente' });
        }
      });
  
      // Endpoint per aggiornare il trainer dell'utente
      app.post('/api/utente/associa-trainer', (req, res) => {
  const { userId, trainerId } = req.body;
  
  // Trova l'utente e aggiorna il trainer_id
  Utente.updateOne({ _id: userId }, { trainer_id: trainerId })
    .then(() => res.status(200).json({ message: 'Trainer assegnato correttamente!' }))
    .catch(err => res.status(500).json({ error: err.message }));
      });

      // Aggiungi la route per ottenere gli utenti di un personal trainer
      app.get('/api/trainer/:id/users', async (req, res) => {
        console.log('ID del trainer ricevuto:', req.params.id); // Log dell'ID ricevuto
        try {
          const trainerId = req.params.id;
      
          // Controllo se l'ID del trainer è valido
          if (!ObjectId.isValid(trainerId)) {
            return res.status(400).json({ message: 'ID del trainer non valido' });
          }
      
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const utenteCollection = db.collection('utente');
          console.log('Eseguendo la query con trainer_id:', trainerId); // Log della query
      
          // Troviamo gli utenti associati a questo personal trainer
          const users = await utenteCollection.find({ trainer_id: trainerId }).toArray();
      
          // Se non ci sono utenti
          if (users.length === 0) {
            console.log('Nessun utente trovato con trainer_id:', trainerId); // Log se non ci sono utenti
            return res.status(404).json({ message: 'Nessun utente trovato per questo personal trainer' });
          }
      
          console.log('Utenti trovati:', users); // Log degli utenti trovati
      
          // Modifica dell'array di utenti per includere nome, cognome ed email
          const updatedUsers = users.map(user => ({
            _id: user._id,
            nome: user.nome,      // nome
            cognome: user.cognome, // cognome
            email: user.email,     // email
          }));
      
          return res.status(200).json(updatedUsers); // Rispondi con gli utenti aggiornati
        } catch (error) {
          console.error('Errore interno del server:', error);
          return res.status(500).json({ message: 'Errore interno del server', error: error.message });
        } finally {
          await client.close();
        }
      });
              //tutte le rotte per la gestione schede
      // Funzione per creare una nuova scheda di allenamento
      app.post("/crea-scheda", async (req, res) => {
        try {
          const { trainer_id, id_utente, descrizione, esercizi } = req.body;
          console.log("Dati ricevuti:", req.body); // Log dei dati ricevuti
      
          // Verifica se i dati sono sufficienti
          if (!trainer_id || !id_utente || !descrizione || !esercizi || esercizi.length === 0) {
            return res.status(400).json({ message: "Dati insufficienti." });
          }
      
          // Crea un oggetto esercizi nel formato che ti aspetti per il database
          const eserciziDB = esercizi.map(e => ({
            nome: e.nome,
            descrizione: e.descrizione,
            video: e.video || '',
            serie: e.serie,
            ripetizioni: e.ripetizioni
          }));
      
          // Crea la nuova scheda di allenamento
          const newWorkout = {
            trainer_id,
            id_utente,
            descrizione,
            esercizi: eserciziDB,
            dataCreazione: new Date().toISOString() // Aggiungi la data di creazione se necessario
          };
      
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const schedaAllenamentoCollection = db.collection('scheda_allenamento'); // Modifica con il nome della tua collezione
          const utenteCollection = db.collection('utente'); // Modifica con il nome della tua collezione
      
          // Salvataggio della scheda di allenamento nel database
          const result = await schedaAllenamentoCollection.insertOne(newWorkout);
          console.log("Scheda creata:", result);
      
          // Verifica che i dati siano stati inseriti nella collezione
          const createdWorkout = await schedaAllenamentoCollection.findOne({ _id: result.insertedId });
          console.log("Scheda salvata nel database:", createdWorkout);
      
          // Aggiungi l'ID della nuova scheda all'utente
          await utenteCollection.updateOne(
            { _id: new ObjectId(id_utente) },  // Converti l'ID utente in ObjectId
            { $push: { schede: result.insertedId } }
          );
          
          res.status(201).json({ message: "Scheda creata con successo!", schedaId: result.insertedId });
        } catch (error) {
          console.error("Errore nella creazione della scheda:", error); // Dettaglio dell'errore
          res.status(500).json({ message: "Errore interno del server.", error: error.message });
        } finally {
          await client.close();
        }
      });
      // Funzione per ottenere tutte le schede di allenamento
      app.get('/schede', async (req, res) => {
  try {
    const schede = await schedaAllenamentoCollection.find().toArray();
    res.status(200).json(schede);
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero delle schede' });
  }
      });

      // Funzione per ottenere una scheda per ID (modificata per includere gli esercizi)
      app.get('/scheda/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Recupera la scheda
    const scheda = await schedaAllenamentoCollection.findOne({ _id: new ObjectId(id) });
    if (!scheda) {
      return res.status(404).json({ error: 'Scheda non trovata' });
    }

    // Recupera gli esercizi associati a quella scheda
    const esercizi = await esercizioCollection.find({ _id: { $in: scheda.id_esercizio.map(id => new ObjectId(id)) } }).toArray();

    // Restituisci sia la scheda che gli esercizi
    res.status(200).json({ scheda, esercizi });
  } catch (err) {
    res.status(500).json({ error: 'Errore nel recupero della scheda e degli esercizi' });
  }
      });

      // Funzione per aggiornare una scheda di allenamento
      app.put('/aggiorna-scheda/:id', async (req, res) => {
        const { id } = req.params;
        const { descrizione, esercizi, id_utente, trainer_id } = req.body;
      
        try {
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const schedaAllenamentoCollection = db.collection('scheda_allenamento'); // Modifica con il nome della tua collezione
      
          const updatedScheda = {
            descrizione,
            id_utente,
            trainer_id,
            esercizi // Includiamo gli esercizi aggiornati
          };
      
          const result = await schedaAllenamentoCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedScheda }
          );
      
          if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Scheda non trovata' });
          }
      
          res.status(200).json({ message: 'Scheda aggiornata con successo' });
        } catch (err) {
          console.error("Errore nell'aggiornamento della scheda:", err);
          res.status(500).json({ error: 'Errore nell\'aggiornamento della scheda' });
        } finally {
          await client.close();
        }
      });

      // Funzione per eliminare una scheda di allenamento
      app.delete('/schede/:id', async (req, res) => {
        try {
          const { id } = req.params;
      
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const schedaAllenamentoCollection = db.collection('scheda_allenamento'); // Modifica con il nome della tua collezione
      
          console.log("ID ricevuto per la rimozione della scheda:", id);  // Log per l'ID ricevuto
      
          // Utilizza findOne invece di findById se non stai usando Mongoose
          const workout = await schedaAllenamentoCollection.findOne({ _id: new ObjectId(id) });
      
          if (!workout) {
            console.log("Scheda non trovata con ID:", id);  // Log per scheda non trovata
            return res.status(404).json({ message: "Scheda non trovata" });
          }
      
          // Log prima di rimuovere la scheda
          console.log("Scheda trovata, rimuovo con ID:", workout._id);
      
          // Logica per rimuovere la scheda
          await schedaAllenamentoCollection.deleteOne({ _id: new ObjectId(id) });
      
          // Log dopo aver rimosso la scheda
          console.log("Scheda rimossa con successo:", workout._id);
      
          res.status(200).json({ message: "Scheda rimossa" });
        } catch (error) {
          console.error("Errore durante la rimozione della scheda:", error);  // Log per errore
      
          res.status(500).json({ message: "Errore nella rimozione della scheda" });
        } finally {
          await client.close();
        }
      });


      // Backend (Express.js)
      app.get('/esercizi', async (req, res) => {
        try {
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const esercizioCollection = db.collection('esercizio'); // Modifica con il nome della tua collezione
      
          const esercizi = await esercizioCollection.find().toArray(); // Usa toArray per ottenere i dati come array
          res.json(esercizi); // Rispondi con i dati
        } catch (error) {
          console.error('Errore durante il recupero degli esercizi:', error);
          res.status(500).json({ message: 'Errore nel recupero degli esercizi' });
        } finally {
          await client.close();
        }
      });

      //Endpoint per ottenere gli utenti assegnati a un trainer
      app.get('/api/trainer/:trainerId/utenti', async (req, res) => {
        try {
          const trainerId = req.params.trainerId;
      
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const utenteCollection = db.collection('utente');
      
          const utenti = await utenteCollection.find({ trainer_id: trainerId }).toArray();
          res.json(utenti);
        } catch (error) {
          console.error('Errore nel recupero degli utenti:', error);
          res.status(500).json({ message: 'Errore nel recupero degli utenti', error });
        } finally {
          await client.close();
        }
      });

      //Endpoint per assegnare una scheda di allenamento
      app.post("/api/trainer/:trainerId/assegnaScheda", async (req, res) => {
  try {
      const { id_utente, descrizione, id_esercizi } = req.body;
      const trainerId = req.params.trainerId;

      if (!id_utente || !descrizione || !id_esercizi || !Array.isArray(id_esercizi)) {
          return res.status(400).json({ message: "Dati mancanti o errati" });
      }

      const nuovaScheda = {
          dataCreazione: new Date(),
          descrizione,
          id_esercizio: id_esercizi.map(id => new ObjectId(id)), // Convertiamo in ObjectId
          id_utente: new ObjectId(id_utente),
          trainer_id: new ObjectId(trainerId)
      };

      const risultato = await schedaAllenamentoCollection.insertOne(nuovaScheda);
      res.json({ message: "Scheda assegnata con successo", schedaId: risultato.insertedId });
  } catch (error) {
      res.status(500).json({ message: "Errore nell'assegnazione della scheda", error });
  }
      });

      // Funzione per ottenere tutte le schede di allenamento di un trainer specifico
      app.get('/schede/:trainer_id', async (req, res) => {
        const { trainer_id } = req.params;
      
        try {
          await client.connect();
          const db = client.db('power-pt'); // Usa il nome del tuo database
          const schedaAllenamentoCollection = db.collection('scheda_allenamento'); // Modifica con il nome della tua collezione
      
          const schede = await schedaAllenamentoCollection.find({ trainer_id }).toArray();
          res.status(200).json(schede);
        } catch (err) {
          console.error('Errore nel recupero delle schede:', err);
          res.status(500).json({ error: 'Errore nel recupero delle schede' });
        } finally {
          await client.close();
        }
      });
      // Enpoint per ottenere la palestra su modifica profilo trainer
      app.get('/api/palestra/:id', verifyJWT, async (req, res) => {
        const id = req.params.id;
        console.log(`Ricevuto richiesta per palestra con ID: ${id}`);
        try {
          const palestra = await palestraCollection.findOne({ _id: new ObjectId(id) });
          if (!palestra) {
            console.log(`Palestra con ID ${id} non trovata`);
            return res.status(404).json({ error: 'Palestra non trovata' });
          }
          console.log(`Palestra trovata: ${JSON.stringify(palestra)}`);
          res.status(200).json(palestra);
        } catch (err) {
          console.error(`Errore nel recupero della palestra con ID ${id}:`, err);
          res.status(500).json({ error: 'Errore nel recupero della palestra' });
        }
      });
      app.post('/api/aggiornaPagamento', async (req, res) => {
        const { sessionId } = req.body;
    
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            const userId = session.metadata.userId;
            const tipoAbbonamento = session.metadata.tipoAbbonamento;
            const importo = session.amount_total / 100;
            const paymentIntentId = session.payment_intent;
            const metodoPagamento = session.payment_method_types[0];
            const transazioneId = session.id;
    
            console.log('Aggiornamento pagamento per userId:', userId, 'con abbonamento:', tipoAbbonamento);
    
            const nuovaIscrizione = {
                utenteId: userId,
                dataInizio: new Date(),
                dataScadenza: tipoAbbonamento === 'mensile' ? 
                    new Date(new Date().setMonth(new Date().getMonth() + 1)) : 
                    new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                tipoAbbonamento,
                stato: 'attiva',
                pagamenti: [{
                    pagamentoStripeId: paymentIntentId,
                    importo,
                    statoPagamento: 'completato',
                    dataPagamento: new Date(),
                    metodoPagamento,
                    transazioneId
                }],
                palestra_id: '67585b2e273efb169919c87b' // Recupera in base alla logica
            };
    
            await iscrizioneCollection.insertOne(nuovaIscrizione);
            console.log('Iscrizione registrata con successo:', nuovaIscrizione);
            res.status(200).send('Iscrizione creata con successo');
        } catch (err) {
            console.error('Errore nel salvataggio su MongoDB:', err);
            res.status(500).send('Errore nel salvataggio');
        }
    });
      // Funzione di disconnessione dal database
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server in ascolto sulla porta 3000");
        });
    } catch (error) {
        console.log("Errore di connessione a MongoDB", error);
    }
}

run().catch(console.error);
