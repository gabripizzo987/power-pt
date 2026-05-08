const express = require("express");
const app = express();
require("dotenv").config();

const jwt = require("jsonwebtoken");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const stripe = require("stripe")(process.env.PAYMENT_SECRET);

// =========================
// Middleware
// =========================
app.use(cors());

// Webhook Stripe: raw body solo per questa route
app.use((req, res, next) => {
  if (req.originalUrl === "/api/stripeWebhook") {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});

app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// MongoDB
// =========================
const client = new MongoClient(process.env.MONGO_URI);

// =========================
// Helpers
// =========================
const isValidObjectId = (id) => ObjectId.isValid(id);

const toObjectId = (id) => {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
};

const verifyJWT = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        message: "Token mancante o formato non valido",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ASSESS_SECRET);

    // 👉 mettiamo tutto dentro req.user (più standard)
    req.user = decoded;

    next();
  } catch (err) {
    console.error("❌ JWT Error:", err.message);

    return res.status(403).json({
      error: true,
      message: "Token non valido o scaduto",
    });
  }
};

// =========================
// Multer
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// =========================
// App bootstrap
// =========================
async function run() {
  try {
    await client.connect();
    console.log("✅ Connesso a MongoDB");

    const db = client.db("power-pt");

    const palestraCollection = db.collection("palestra");
    const personalTrainerCollection = db.collection("personal_trainer");
    const utenteCollection = db.collection("utente");
    const schedaAllenamentoCollection = db.collection("scheda_allenamento");
    const iscrizioneCollection = db.collection("iscrizione");
    const esercizioCollection = db.collection("esercizio");

    await palestraCollection.createIndex({ singleton: 1 }, { unique: true });
    await palestraCollection.createIndex({ email: 1 }, { unique: true });

    await personalTrainerCollection.createIndex({ email: 1 }, { unique: true });
    await utenteCollection.createIndex({ email: 1 }, { unique: true });
    // =========================
    // Utility init
    // =========================
    const updateAllTrainersWithPalestraId = async () => {
      const palestraId = "67585b2e273efb169919c87b";

      try {
        const result = await personalTrainerCollection.updateMany(
          { palestra_id: { $exists: false } },
          { $set: { palestra_id: palestraId } }
        );

        const userResult = await utenteCollection.updateMany(
          { id_palestra: { $exists: false } },
          { $set: { id_palestra: palestraId } }
        );

        console.log(
          "✅ Personal trainer aggiornati con palestra_id:",
          result.modifiedCount
        );
        console.log(
          "✅ Utenti aggiornati con id_palestra:",
          userResult.modifiedCount
        );
      } catch (err) {
        console.error("Errore aggiornamento palestra_id:", err);
      }
    };

    updateAllTrainersWithPalestraId();

    const helmet = require("helmet");
    const rateLimit = require("express-rate-limit");

    app.use(helmet());
    app.disable("x-powered-by");

    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { message: "Troppe richieste, riprova più tardi." },
    });

    app.use("/api/login-utente", authLimiter);
    app.use("/api/login-trainer", authLimiter);
    app.use("/login-palestra", authLimiter);
    app.use("/register-user", authLimiter);
    app.use("/register-trainer", authLimiter);
    app.use("/registerPalestra", authLimiter);
    // =========================
    // Health check
    // =========================
    app.get("/ping-db", async (req, res) => {
      try {
        const result = await db.command({ ping: 1 });
        res.json({ ok: true, result });
      } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: error.message });
      }
    });

    // =========================
    // Uploads
    // =========================
    app.get("/uploads/:filename", (req, res) => {
      const filePath = path.resolve(__dirname, "uploads", req.params.filename);
      res.sendFile(filePath);
    });

    // =========================
    // Auth token
    // =========================
    app.post("/api/set-token", (req, res) => {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email obbligatoria" });
      }

      const user = { email };
      const token = jwt.sign(user, process.env.ASSESS_SECRET, {
        expiresIn: "24h",
      });

      res.send({ token });
    });

    // =========================
    // Palestra
    // =========================
    app.get("/palestra/:id", async (req, res) => {
      try {
        const palestraId = req.params.id;

        if (!isValidObjectId(palestraId)) {
          return res.status(400).json({ message: "ID palestra non valido" });
        }

        const palestra = await palestraCollection.findOne({
          _id: new ObjectId(palestraId),
        });

        if (!palestra) {
          return res
            .status(404)
            .send({ error: true, message: "Palestra non trovata" });
        }

        res.status(200).send(palestra);
      } catch (error) {
        console.error("Errore nel recupero dei dati palestra:", error);
        res
          .status(500)
          .send({ error: true, message: "Errore interno del server" });
      }
    });

    app.get("/api/palestra", async (req, res) => {
      try {
        const palestra = await palestraCollection.findOne({});

        if (!palestra) {
          return res.status(404).json({ message: "Palestra non trovata" });
        }

        res.json(palestra);
      } catch (error) {
        console.error("Errore nel recupero della palestra:", error);
        res.status(500).json({ message: "Errore nel server" });
      }
    });

    app.get("/api/palestra/:id", verifyJWT, async (req, res) => {
      try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(400).json({ error: "ID palestra non valido" });
        }

        const palestra = await palestraCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!palestra) {
          return res.status(404).json({ error: "Palestra non trovata" });
        }

        res.status(200).json(palestra);
      } catch (err) {
        console.error("Errore nel recupero della palestra:", err);
        res.status(500).json({ error: "Errore nel recupero della palestra" });
      }
    });

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

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Palestra non trovata" });
        }

        res.json({ message: "Palestra aggiornata con successo" });
      } catch (error) {
        console.error("Errore nell'aggiornamento palestra:", error);
        res.status(500).json({ message: "Errore nell'aggiornamento", error });
      }
    });

    app.get("/check-email", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ message: "Email mancante" });
        }

        const emailExists = await palestraCollection.findOne({ email });

        if (emailExists) {
          return res.status(400).json({ message: "Email già in uso" });
        }

        res.status(200).json({ message: "Email disponibile" });
      } catch (error) {
        console.error("Errore controllo email:", error);
        res.status(500).json({ message: "Errore del server" });
      }
    });

    app.post("/registerPalestra", async (req, res) => {
      const { nome, email, password } = req.body;

      try {
        const existingPalestra = await palestraCollection.findOne({});
        if (existingPalestra) {
          return res
            .status(400)
            .send({ error: true, message: "Esiste già una palestra registrata" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newPalestra = {
          singleton: "main_gym",
          nome,
          email,
          password: hashedPassword,
          role: "admin",
          createdAt: new Date(),
        };

        await palestraCollection.insertOne(newPalestra);

        const token = jwt.sign(
          { email: newPalestra.email, role: newPalestra.role },
          process.env.ASSESS_SECRET,
          { expiresIn: "24h" }
        );

        res
          .status(201)
          .send({ message: "Palestra registrata con successo", token });
      } catch (error) {
        console.error("Errore durante la registrazione palestra:", error);
        res
          .status(500)
          .send({ error: true, message: "Errore durante la registrazione" });
      }
    });

    app.post("/login-palestra", async (req, res) => {
      try {
        const { email, password } = req.body;

    // 🔒 Controllo input
      if (!email || !password) {
        return res.status(400).json({ message: "Email e password obbligatorie" });
      }

    // 🔍 Cerca palestra
      const palestra = await palestraCollection.findOne({ email });

      if (!palestra) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

    // 🔑 Verifica password
      const isMatch = await bcrypt.compare(password, palestra.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }

    // 🎟️ JWT
      const token = jwt.sign(
        {
          id: palestra._id.toString(),
          email: palestra.email,
          role: palestra.role || "admin",
        },
        process.env.ASSESS_SECRET,
        { expiresIn: "1h" }
      );

    // 📤 Risposta
      res.status(200).json({
        success: true,
        token,
        palestraId: palestra._id.toString(),
      });

    } catch (error) {
      console.error("❌ Login palestra error:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  });
    // =========================
    // Utenti
    // =========================
    app.post("/register-user", async (req, res) => {
      try {
        const { nome, cognome, email, password, obiettivo, altezza, peso } =
          req.body;

        if (!nome || !cognome || !email || !password || !altezza || !peso) {
          return res
            .status(400)
            .json({ message: "Tutti i campi sono obbligatori!" });
        }

        const existingUser = await utenteCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email già registrata" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nuovoUtente = {
          nome,
          cognome,
          email,
          password: hashedPassword,
          obiettivo,
          altezza: parseFloat(altezza),
          peso: parseFloat(peso),
          dataRegistrazione: new Date(),
        };

        const result = await utenteCollection.insertOne(nuovoUtente);

        res.status(201).json({
          message: "Utente registrato con successo!",
          userId: result.insertedId.toString(),
        });
      } catch (error) {
        console.error("Errore nel server:", error);
        res.status(500).json({ message: "Errore del server." });
      }
    });

    app.get("/users", verifyJWT, async (req, res) => {
      try {
        const users = await utenteCollection.find({}).toArray();
        res.send(users);
      } catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        res.status(500).json({ message: "Errore nel recupero degli utenti" });
      }
    });

    app.get("/api/users", async (req, res) => {
      try {
        const users = await utenteCollection.find({}).toArray();
        res.json(users);
      } catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        res.status(500).json({ message: "Errore nel recupero degli utenti" });
      }
    });

    app.get("/api/users/:id", async (req, res) => {
      try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
          return res.status(400).send("ID utente non valido");
        }

        const user = await utenteCollection.findOne({
          _id: new ObjectId(userId),
        });

        if (!user) {
          return res.status(404).send("Utente non trovato");
        }

        res.json(user);
      } catch (error) {
        console.error("Errore nel recupero dell'utente:", error);
        res.status(500).send("Errore nel recupero dell'utente");
      }
    });

    app.post("/api/login-utente", async (req, res) => {
      const { email, password } = req.body;

      try {
        const utente = await utenteCollection.findOne({ email });

        if (!utente) {
          return res.status(401).json({ message: "Email o password errati" });
        }

        const isMatch = await bcrypt.compare(password, utente.password);

        if (!isMatch) {
          return res.status(401).json({ message: "Email o password errati" });
        }

        const token = jwt.sign(
          { id: utente._id, email: utente.email },
          process.env.ASSESS_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          message: "Login effettuato con successo",
          token,
          utente: {
            id: utente._id,
            nome: utente.nome,
            email: utente.email,
            trainer_id: utente.trainer_id || null,
          },
        });
      } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).json({ message: "Errore durante il login" });
      }
    });

    app.put("/update-user/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;

      try {
        if (!isValidObjectId(id)) {
          return res.status(400).json({ message: "ID utente non valido" });
        }

        if (updatedUser.password && !updatedUser.password.startsWith("$2b$")) {
          const salt = await bcrypt.genSalt(10);
          updatedUser.password = await bcrypt.hash(updatedUser.password, salt);
        }

        const result = await utenteCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedUser }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Utente non trovato" });
        }

        const updatedUserData = await utenteCollection.findOne({
          _id: new ObjectId(id),
        });

        res.send(updatedUserData);
      } catch (error) {
        console.error("Errore nell'aggiornamento dell'utente:", error);
        res
          .status(500)
          .json({ message: "Errore nell'aggiornamento dell'utente" });
      }
    });

    app.delete("/api/users/:id", async (req, res) => {
      try {
        const userId = req.params.id;

        if (!isValidObjectId(userId)) {
          return res.status(400).json({ message: "ID utente non valido" });
        }

        const result = await utenteCollection.deleteOne({
          _id: new ObjectId(userId),
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Utente non trovato" });
        }

        res.status(200).json({ message: "Account eliminato con successo" });
      } catch (error) {
        console.error("Errore nell'eliminazione dell'account:", error);
        res
          .status(500)
          .json({ message: "Errore nell'eliminazione dell'account" });
      }
    });

    app.put("/api/utente/:id", async (req, res) => {
      const { id } = req.params;
      const { trainer_id } = req.body;

      if (!trainer_id) {
        return res.status(400).json({ message: "Trainer ID non fornito" });
      }

      try {
        if (!isValidObjectId(id) || !isValidObjectId(trainer_id)) {
          return res.status(400).json({ message: "ID non valido" });
        }

        const trainer = await personalTrainerCollection.findOne({
          _id: new ObjectId(trainer_id),
        });

        if (!trainer) {
          return res.status(404).json({ message: "Trainer non trovato" });
        }

        const result = await utenteCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { trainer_id } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Utente non trovato" });
        }

        res
          .status(200)
          .json({ message: "Trainer assegnato correttamente all'utente" });
      } catch (error) {
        console.error("Errore durante l'aggiornamento dell'utente:", error);
        res.status(500).json({ message: "Errore nell'aggiornare l'utente" });
      }
    });

    app.post("/api/utente/associa-trainer", async (req, res) => {
      const { userId, trainerId } = req.body;

      if (!userId || !trainerId) {
        return res
          .status(400)
          .json({ error: "userId e trainerId sono obbligatori" });
      }

      try {
        if (!isValidObjectId(userId) || !isValidObjectId(trainerId)) {
          return res.status(400).json({ error: "ID non validi" });
        }

        const userObjectId = new ObjectId(userId);
        const trainerObjectId = new ObjectId(trainerId);

        const utente = await utenteCollection.findOne({ _id: userObjectId });
        if (!utente) {
          return res.status(404).json({ error: "Utente non trovato" });
        }

        const trainer = await personalTrainerCollection.findOne({
          _id: trainerObjectId,
        });
        if (!trainer) {
          return res.status(404).json({ error: "Trainer non trovato" });
        }

        const utenteUpdate = await utenteCollection.updateOne(
          { _id: userObjectId },
          { $set: { trainer_id: trainerObjectId } }
        );

        const trainerUpdate = await personalTrainerCollection.updateOne(
          { _id: trainerObjectId },
          { $addToSet: { utenti_iscritti: userObjectId } }
        );

        if (utenteUpdate.matchedCount === 0) {
          return res
            .status(404)
            .json({ error: "Utente non trovato o non aggiornato" });
        }

        if (trainerUpdate.matchedCount === 0) {
          return res.status(404).json({ error: "Trainer non aggiornato" });
        }

        res
          .status(200)
          .json({ message: "Trainer assegnato e aggiornato correttamente!" });
      } catch (error) {
        console.error("Errore durante l'assegnazione del trainer:", error);
        res.status(500).json({ error: "Errore interno del server" });
      }
    });

    // =========================
    // Personal trainer
    // =========================
    app.post(
      "/register-trainer",
      upload.single("document"),
      async (req, res) => {
        const {
          nome,
          cognome,
          email,
          password,
          specializzazione,
          esperienza,
          descrizione,
        } = req.body;

        if (
          !nome ||
          !cognome ||
          !email ||
          !password ||
          !specializzazione ||
          !esperienza ||
          !descrizione ||
          !req.file
        ) {
          return res.status(400).json({
            error: true,
            message:
              "Tutti i campi sono obbligatori, inclusa la laurea/curriculum",
          });
        }

        try {
          const existingTrainer = await personalTrainerCollection.findOne({
            email,
          });

          if (existingTrainer) {
            return res
              .status(400)
              .json({ error: true, message: "Email già registrata" });
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
            documentUrl: `/uploads/${req.file.filename}`,
            approved: false,
            utenti_iscritti: [],
          };

          await personalTrainerCollection.insertOne(newTrainer);

          res.status(201).json({
            success: true,
            message: "Personal trainer registrato con successo",
          });
        } catch (error) {
          console.error("Errore nel salvataggio del trainer:", error);
          res
            .status(500)
            .json({ error: true, message: "Errore interno del server" });
        }
      }
    );

    app.get("/api/personal-trainers", async (req, res) => {
      try {
        const trainers = await personalTrainerCollection
          .find({ isDeleted: { $ne: true } })
          .toArray();

        if (!trainers || trainers.length === 0) {
          return res
            .status(404)
            .json({ message: "Nessun personal trainer trovato" });
        }

        res.status(200).json(trainers);
      } catch (error) {
        console.error(
          "Errore durante il recupero dei personal trainer:",
          error
        );
        res.status(500).json({
          message: "Errore durante il recupero dei personal trainer",
        });
      }
    });

    app.post("/api/login-trainer", async (req, res) => {
      const { email, password } = req.body;

      try {
        const personalTrainer = await personalTrainerCollection.findOne({
          email,
        });

        if (!personalTrainer) {
          return res.status(401).json({ message: "Email o password errati" });
        }

        const isMatch = await bcrypt.compare(
          password,
          personalTrainer.password
        );

        if (!isMatch) {
          return res.status(401).json({ message: "Email o password errati" });
        }

        const token = jwt.sign(
          { id: personalTrainer._id, email: personalTrainer.email },
          process.env.ASSESS_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({
          message: "Login effettuato con successo",
          token,
          personalTrainer: {
            id: personalTrainer._id,
            name: personalTrainer.nome,
            email: personalTrainer.email,
          },
        });
      } catch (error) {
        console.error("Errore durante il login trainer:", error);
        res.status(500).json({ message: "Errore durante il login" });
      }
    });

    app.get("/pending-trainers", verifyJWT, async (req, res) => {
      try {
        const trainers = await personalTrainerCollection
          .find({ approved: false, isDeleted: { $ne: true } })
          .toArray();

        res.json(trainers);
      } catch (error) {
        console.error("Errore nel recupero dei personal trainer:", error);
        res.status(500).json({
          error: true,
          message: "Errore nel recupero dei personal trainer",
        });
      }
    });

    app.get("/api/approved-trainers", verifyJWT, async (req, res) => {
      try {
        const trainers = await personalTrainerCollection
          .find({ approved: true, isDeleted: { $ne: true } })
          .toArray();

        res.json(trainers);
      } catch (error) {
        console.error("Errore nel recupero dei trainer approvati:", error);
        res
          .status(500)
          .json({ message: "Errore nel recupero dei trainer approvati" });
      }
    });

    app.post("/api/approve-trainer/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(400).send({ message: "ID trainer non valido" });
        }

        const objectId = new ObjectId(id);

        const trainer = await personalTrainerCollection.findOne({
          _id: objectId,
        });

        if (!trainer) {
          return res.status(404).send("Trainer non trovato");
        }

        const result = await personalTrainerCollection.updateOne(
          { _id: objectId },
          { $set: { approved: true } }
        );

        if (result.modifiedCount === 1) {
          return res
            .status(200)
            .send({ message: "Trainer approvato con successo" });
        }

        return res
          .status(400)
          .send({ message: "Nessun cambiamento effettuato" });
      } catch (error) {
        console.error("Errore durante l'approvazione del trainer:", error);
        res.status(500).send("Errore interno del server");
      }
    });

    // tengo solo la soft delete, che è quella più sicura
    app.delete("/api/remove-trainer/:trainerId", verifyJWT, async (req, res) => {
      const { trainerId } = req.params;

      try {
        if (!isValidObjectId(trainerId)) {
          return res.status(400).json({ message: "ID non valido" });
        }

        const trainer = await personalTrainerCollection.updateOne(
          { _id: new ObjectId(trainerId) },
          { $set: { isDeleted: true, deletedAt: new Date() } }
        );

        if (trainer.modifiedCount === 0) {
          return res.status(404).json({ message: "Trainer non trovato" });
        }

        res.json({ message: "Personal trainer rimosso con successo" });
      } catch (error) {
        console.error("Errore nel processare la richiesta:", error);
        res
          .status(500)
          .json({ message: "Errore nel processare la richiesta" });
      }
    });

    app.get("/api/deleted-trainers", verifyJWT, async (req, res) => {
      try {
        const deletedTrainers = await personalTrainerCollection
          .find({ isDeleted: true })
          .toArray();

        res.json(deletedTrainers);
      } catch (error) {
        console.error("Errore nel processare la richiesta:", error);
        res
          .status(500)
          .json({ message: "Errore nel processare la richiesta" });
      }
    });

    app.post(
      "/upload-profile-pic",
      upload.single("profilePic"),
      async (req, res) => {
        try {
          const file = req.file;
          const trainerId = req.body.trainer_id;

          if (!file) {
            return res.status(400).json({ error: "Nessun file caricato" });
          }

          if (!isValidObjectId(trainerId)) {
            return res.status(400).json({ error: "ID trainer non valido" });
          }

          const profilePicUrl = `/uploads/${file.filename}`;

          await personalTrainerCollection.updateOne(
            { _id: new ObjectId(trainerId) },
            { $set: { profilePicUrl } }
          );

          res.status(200).json({ profilePicUrl });
        } catch (err) {
          console.error("Errore upload profile pic:", err);
          res
            .status(500)
            .json({ error: "Errore nel caricamento della foto" });
        }
      }
    );

    app.get("/api/trainer/overview/:id", async (req, res) => {
      const { id } = req.params;

      try {
        if (!isValidObjectId(id)) {
          return res.status(400).json({ message: "ID trainer non valido" });
        }

        const personalTrainer = await personalTrainerCollection.findOne(
          { _id: new ObjectId(id) },
          { projection: { password: 0 } }
        );

        if (!personalTrainer) {
          return res
            .status(404)
            .json({ message: "Personal trainer non trovato" });
        }

        res.json(personalTrainer);
      } catch (error) {
        console.error("Errore nel recupero del profilo:", error);
        res.status(500).json({ message: "Errore nel recupero del profilo" });
      }
    });

    app.put("/api/trainer/:id", upload.single("profilePicture"), async (req, res) => {
      const { id } = req.params;
      const { nome, cognome, specializzazione, palestra_id } = req.body;
      const profilePicture = req.file;

      try {
        if (!isValidObjectId(id)) {
          return res.status(400).json({ error: "ID trainer non valido" });
        }

        const updateData = {
          nome,
          cognome,
          specializzazione,
          palestra_id,
        };

        if (profilePicture) {
          updateData.profilePicture = profilePicture.path.replace(/\\/g, "/");
        }

        const result = await personalTrainerCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Trainer non trovato" });
        }

        res.status(200).json({ message: "Profilo aggiornato con successo" });
      } catch (err) {
        console.error("Errore nell'aggiornamento del profilo:", err);
        res.status(500).json({
          error: "Si è verificato un errore nell'aggiornamento del profilo",
        });
      }
    });

    app.get("/api/trainers", async (req, res) => {
      try {
        const trainers = await personalTrainerCollection
          .find({ approved: true, isDeleted: { $ne: true } })
          .toArray();

        res.status(200).json(trainers);
      } catch (error) {
        console.error("Errore nel recupero dei trainer:", error);
        res.status(500).json({
          message: "Errore nel recupero dei trainer",
          error: error.message,
        });
      }
    });

    app.get("/api/trainers/:trainerId", async (req, res) => {
      try {
        const trainerId = req.params.trainerId;

        if (!isValidObjectId(trainerId)) {
          return res.status(400).send({ message: "Trainer ID non valido" });
        }

        const trainer = await personalTrainerCollection.findOne({
          _id: new ObjectId(trainerId),
        });

        if (!trainer) {
          return res.status(404).send({ message: "Trainer not found" });
        }

        if (trainer.profilePicture) {
          trainer.profilePicture = trainer.profilePicture.replace(/\\/g, "/");
        }

        res.json(trainer);
      } catch (error) {
        console.error("Errore nel recupero del trainer:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/api/trainer/:id/users", async (req, res) => {
      try {
        const trainerId = req.params.id;
        const trainerObjectId = isValidObjectId(trainerId)
          ? new ObjectId(trainerId)
          : null;

        const query = trainerObjectId
          ? { $or: [{ trainer_id: trainerId }, { trainer_id: trainerObjectId }] }
          : { trainer_id: trainerId };

        const users = await utenteCollection.find(query).toArray();

        if (users.length === 0) {
          return res.status(404).json({
            message: "Nessun utente trovato per questo personal trainer",
          });
        }

        const updatedUsers = users.map((user) => ({
          _id: user._id,
          nome: user.nome,
          cognome: user.cognome,
          email: user.email,
        }));

        return res.status(200).json(updatedUsers);
      } catch (error) {
        console.error("Errore interno del server:", error);
        return res.status(500).json({
          message: "Errore interno del server",
          error: error.message,
        });
      }
    });

    app.get("/api/trainer/:trainerId/utenti", async (req, res) => {
      try {
        const trainerId = req.params.trainerId;

        let trainerObjectId = trainerId;
        if (isValidObjectId(trainerId)) {
          trainerObjectId = new ObjectId(trainerId);
        }

        const utenti = await utenteCollection
          .find({ trainer_id: { $in: [trainerObjectId, trainerId] } })
          .toArray();

        res.json(utenti);
      } catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        res.status(500).json({
          message: "Errore nel recupero degli utenti",
          error: error.message,
        });
      }
    });

    // =========================
    // Schede allenamento
    // =========================
    app.post("/crea-scheda", async (req, res) => {
      try {
        const { trainer_id, id_utente, descrizione, esercizi } = req.body;

        if (!trainer_id || !id_utente || !descrizione || !esercizi || esercizi.length === 0) {
          return res.status(400).json({ message: "Dati insufficienti." });
        }

        let trainerObjectId = trainer_id;
        if (ObjectId.isValid(trainer_id)) {
          trainerObjectId = new ObjectId(trainer_id);
        }

        let utenteObjectId = id_utente;
        if (ObjectId.isValid(id_utente)) {
          utenteObjectId = new ObjectId(id_utente);
        }

        const eserciziDB = esercizi.map((e) => ({
          nome: e.nome,
          descrizione: e.descrizione,
          video: e.video || "",
          serie: e.serie,
          ripetizioni: e.ripetizioni,
        }));

        const newWorkout = {
          trainer_id: trainerObjectId,
          id_utente: utenteObjectId,
          descrizione,
          esercizi: eserciziDB,
          dataCreazione: new Date().toISOString(),
        };

        const result = await schedaAllenamentoCollection.insertOne(newWorkout);

        await utenteCollection.updateOne(
          { _id: utenteObjectId },
          { $push: { schede: result.insertedId } }
        );

        res.status(201).json({
          message: "Scheda creata con successo!",
          schedaId: result.insertedId,
        });
      } catch (error) {
        console.error("Errore nella creazione della scheda:", error);
        res.status(500).json({
          message: "Errore interno del server.",
          error: error.message,
        });
      }
    });

    app.get("/schede", async (req, res) => {
      try {
        const schede = await schedaAllenamentoCollection.find().toArray();
        res.status(200).json(schede);
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Errore nel recupero delle schede" });
      }
    });

    app.get("/scheda/:id", async (req, res) => {
      const { id } = req.params;

      try {
        if (!isValidObjectId(id)) {
          return res.status(400).json({ error: "ID scheda non valido" });
        }

        const scheda = await schedaAllenamentoCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!scheda) {
          return res.status(404).json({ error: "Scheda non trovata" });
        }

        let esercizi = [];
        if (scheda.id_esercizio && Array.isArray(scheda.id_esercizio)) {
          esercizi = await esercizioCollection
            .find({
              _id: {
                $in: scheda.id_esercizio
                  .filter((id) => ObjectId.isValid(id))
                  .map((id) => new ObjectId(id)),
              },
            })
            .toArray();
        }

        res.status(200).json({ scheda, esercizi });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          error: "Errore nel recupero della scheda e degli esercizi",
        });
      }
    });

    app.put("/aggiorna-scheda/:id", async (req, res) => {
      const { id } = req.params;
      const { descrizione, esercizi, id_utente, trainer_id } = req.body;

      try {
        if (!isValidObjectId(id)) {
          return res.status(400).json({ error: "ID scheda non valido" });
        }

        const updatedScheda = {
          descrizione,
          id_utente,
          trainer_id,
          esercizi,
        };

        const result = await schedaAllenamentoCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedScheda }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Scheda non trovata" });
        }

        res.status(200).json({ message: "Scheda aggiornata con successo" });
      } catch (err) {
        console.error("Errore nell'aggiornamento della scheda:", err);
        res
          .status(500)
          .json({ error: "Errore nell'aggiornamento della scheda" });
      }
    });

    app.delete("/schede/:id", async (req, res) => {
      try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
          return res.status(400).json({ message: "ID scheda non valido" });
        }

        const workout = await schedaAllenamentoCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!workout) {
          return res.status(404).json({ message: "Scheda non trovata" });
        }

        await schedaAllenamentoCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.status(200).json({ message: "Scheda rimossa" });
      } catch (error) {
        console.error("Errore durante la rimozione della scheda:", error);
        res
          .status(500)
          .json({ message: "Errore nella rimozione della scheda" });
      }
    });

    app.get("/schede/:trainer_id", async (req, res) => {
      const { trainer_id } = req.params;

      try {
        if (!ObjectId.isValid(trainer_id)) {
          return res.status(400).json({ message: "Trainer ID non valido" });
        }

        const trainerObjectId = new ObjectId(trainer_id);

        const schede = await schedaAllenamentoCollection
          .find({ trainer_id: trainerObjectId })
          .toArray();

        res.status(200).json(schede);
      } catch (err) {
        console.error("Errore nel recupero delle schede:", err);
        res.status(500).json({ error: "Errore nel recupero delle schede" });
      }
    });

    app.post("/api/trainer/:trainerId/assegnaScheda", async (req, res) => {
      try {
        const { id_utente, descrizione, id_esercizi } = req.body;
        const trainerId = req.params.trainerId;

        if (
          !id_utente ||
          !descrizione ||
          !id_esercizi ||
          !Array.isArray(id_esercizi)
        ) {
          return res.status(400).json({ message: "Dati mancanti o errati" });
        }

        if (!isValidObjectId(id_utente) || !isValidObjectId(trainerId)) {
          return res.status(400).json({ message: "ID non validi" });
        }

        const nuovaScheda = {
          dataCreazione: new Date(),
          descrizione,
          id_esercizio: id_esercizi
            .filter((id) => ObjectId.isValid(id))
            .map((id) => new ObjectId(id)),
          id_utente: new ObjectId(id_utente),
          trainer_id: new ObjectId(trainerId),
        };

        const risultato = await schedaAllenamentoCollection.insertOne(
          nuovaScheda
        );

        const updateResult = await utenteCollection.updateOne(
          { _id: new ObjectId(id_utente) },
          { $push: { schede: risultato.insertedId } }
        );

        if (updateResult.modifiedCount === 0) {
          return res
            .status(500)
            .json({ message: "Errore nell'aggiornamento dell'utente" });
        }

        res.json({
          message: "Scheda assegnata con successo",
          schedaId: risultato.insertedId,
        });
      } catch (error) {
        console.error("Errore assegnazione scheda:", error);
        res.status(500).json({
          message: "Errore nell'assegnazione della scheda",
          error: error.message,
        });
      }
    });

    app.get("/api/schede-utente/:userId", async (req, res) => {
      const { userId } = req.params;

      try {
        console.log("Richiesta schede per userId:", userId);

        const query = ObjectId.isValid(userId)
          ? {
              $or: [
                { id_utente: userId },
                { id_utente: new ObjectId(userId) },
              ],
            }
          : { id_utente: userId };

        const schede = await schedaAllenamentoCollection.find(query).toArray();

        console.log("Schede trovate:", schede.length);

        // meglio mandare array vuoto, non errore 404
        res.json(schede);
      } catch (error) {
        console.error("Errore nel recuperare le schede dell'utente:", error);
        res.status(500).json({
          message: "Errore nel recuperare le schede dell'utente",
          error: error.message,
        });
      }
    });

    // =========================
    // Esercizi
    // =========================
    app.get("/esercizi", async (req, res) => {
      try {
        const esercizi = await esercizioCollection.find().toArray();
        res.json(esercizi);
      } catch (error) {
        console.error("Errore durante il recupero degli esercizi:", error);
        res
          .status(500)
          .json({ message: "Errore nel recupero degli esercizi" });
      }
    });

    // =========================
    // Iscrizioni / Stripe
    // =========================
    app.post("/api/creaCheckoutSession", async (req, res) => {
      const { userId, tipoAbbonamento } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "L'ID dell'utente è obbligatorio" });
      }

      if (
        !tipoAbbonamento ||
        (tipoAbbonamento !== "mensile" && tipoAbbonamento !== "annuale")
      ) {
        return res.status(400).json({ error: "Tipo di abbonamento non valido" });
      }

      const importo = tipoAbbonamento === "mensile" ? 30 : 330;

      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name:
                    tipoAbbonamento === "mensile"
                      ? "Abbonamento Mensile"
                      : "Abbonamento Annuale",
                },
                unit_amount: importo * 100,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url:
            "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:5173/cancellato",
          metadata: { userId, tipoAbbonamento },
        });

        res.json({ sessionId: session.id,
                  url: session.url
         });
      } catch (error) {
        console.error("Errore nella creazione della sessione di pagamento:", error);
        res.status(500).send("Errore nel processo di pagamento");
      }
    });
    
    app.post(
      "/api/stripeWebhook",
      express.raw({ type: "application/json" }),
      async (req, res) => {
        const sig = req.headers["stripe-signature"];
        let event;

        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err) {
          console.error("Errore nella verifica del webhook:", err.message);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        if (event.type === "checkout.session.completed") {
          const session = event.data.object;
          const userId = session.metadata.userId;
          const tipoAbbonamento = session.metadata.tipoAbbonamento;
          const importo = session.amount_total / 100;
          const palestraId = "67585b2e273efb169919c87b";

          try {
            const nuovaIscrizione = {
              utenteId: userId,
              dataInizio: new Date(),
              dataScadenza:
                tipoAbbonamento === "mensile"
                  ? new Date(new Date().setMonth(new Date().getMonth() + 1))
                  : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              tipoAbbonamento,
              stato: "attiva",
              pagamenti: [
                {
                  pagamentoStripeId: session.payment_intent,
                  importo,
                  statoPagamento: "completato",
                  dataPagamento: new Date(),
                  metodoPagamento: session.payment_method_types?.[0] || "card",
                  transazioneId: session.id,
                },
              ],
              palestra_id: palestraId,
            };

            await iscrizioneCollection.insertOne(nuovaIscrizione);
            console.log("✅ Iscrizione registrata con successo");
          } catch (err) {
            console.error("Errore nel salvataggio su MongoDB:", err);
            return res.status(500).send("Errore nel salvataggio");
          }
        }

        res.json({ received: true });
      }
    );

    app.post("/api/aggiornaPagamento", async (req, res) => {
      const { sessionId } = req.body;

      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const userId = session.metadata.userId;
        const tipoAbbonamento = session.metadata.tipoAbbonamento;
        const importo = session.amount_total / 100;
        const paymentIntentId = session.payment_intent;
        const metodoPagamento = session.payment_method_types[0];
        const transazioneId = session.id;

        const nuovaIscrizione = {
          utenteId: userId,
          dataInizio: new Date(),
          dataScadenza:
            tipoAbbonamento === "mensile"
              ? new Date(new Date().setMonth(new Date().getMonth() + 1))
              : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          tipoAbbonamento,
          stato: "attiva",
          pagamenti: [
            {
              pagamentoStripeId: paymentIntentId,
              importo,
              statoPagamento: "completato",
              dataPagamento: new Date(),
              metodoPagamento,
              transazioneId,
            },
          ],
          palestra_id: "67585b2e273efb169919c87b",
        };

        await iscrizioneCollection.insertOne(nuovaIscrizione);
        res.status(200).send("Iscrizione creata con successo");
      } catch (err) {
        console.error("Errore nel salvataggio su MongoDB:", err);
        res.status(500).send("Errore nel salvataggio");
      }
    });

    app.get("/api/iscrizioni", async (req, res) => {
      try {
        const iscrizioni = await iscrizioneCollection.find({}).toArray();
        res.json(iscrizioni);
      } catch (error) {
        console.error("Errore nel recupero delle iscrizioni:", error);
        res.status(500).send("Errore nel recupero delle iscrizioni");
      }
    });

    app.get("/api/iscrizioni/:utenteId", async (req, res) => {
      try {
        const utenteId = req.params.utenteId;
        const iscrizione = await iscrizioneCollection.findOne({ utenteId });

        if (iscrizione) {
          res.json(iscrizione);
        } else {
          res.status(404).send("Iscrizione non trovata");
        }
      } catch (error) {
        console.error("Errore nel recupero dell'iscrizione:", error);
        res.status(500).send("Errore nel recupero dell'iscrizione");
      }
    });

    // =========================
    // Start server
    // =========================
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server in ascolto sulla porta ${PORT}`);
    });
  } catch (error) {
    console.log("Errore di connessione a MongoDB", error);
  }
}

run().catch(console.error);