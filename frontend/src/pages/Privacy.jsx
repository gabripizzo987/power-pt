import React from "react";

const Privacy = () => {
  return (
    <div className="container mx-auto p-6 mt-12 bg-gradient-to-r from-green-800 to-green-600 text-white rounded-lg shadow-xl pt-24">
      <h1 className="text-4xl font-bold text-center mb-6">Privacy e Policy</h1>
      <div className="prose lg:prose-xl mx-auto">
        <p>
          La privacy dei nostri utenti è molto importante per noi. In questa pagina, spieghiamo come raccogliamo, utilizziamo e proteggiamo le tue informazioni personali quando utilizzi il nostro servizio.
        </p>

        <h2>1. Informazioni che raccogliamo</h2>
        <p>
          Raccogliamo informazioni come il tuo nome, email, dati di pagamento, e altre informazioni necessarie per fornire il nostro servizio. Queste informazioni vengono utilizzate per creare il tuo profilo utente e permetterti di scegliere il personal trainer.
        </p>

        <h2>2. Uso delle informazioni</h2>
        <p>
          Utilizziamo le informazioni raccolte per:
          <ul>
            <li>Creare e gestire il tuo account;</li>
            <li>Fornire schede di allenamento personalizzate;</li>
            <li>Garantire la sicurezza dei nostri servizi;</li>
          </ul>
        </p>

        <h2>3. Protezione delle informazioni</h2>
        <p>
          Utilizziamo tecnologie di sicurezza avanzate per proteggere le tue informazioni personali. La tua password è criptata e le transazioni di pagamento sono gestite tramite sistemi sicuri.
        </p>

        <h2>4. Condivisione delle informazioni</h2>
        <p>
          Non condivideremo mai le tue informazioni personali con terze parti senza il tuo consenso, ad eccezione dei nostri partner di pagamento e dei personal trainer con cui entrerai in contatto.
        </p>

        <h2>5. I tuoi diritti</h2>
        <p>
          Hai il diritto di accedere, correggere o eliminare i tuoi dati personali in qualsiasi momento. Puoi farlo accedendo al tuo account o contattandoci direttamente.
        </p>

        <h2>6. Modifiche alla Privacy Policy</h2>
        <p>
          Ci riserviamo il diritto di aggiornare questa Privacy Policy. Eventuali modifiche verranno pubblicate su questa pagina.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
