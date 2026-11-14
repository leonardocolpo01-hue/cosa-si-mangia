# Cosa si mangia?

L'app della cucina di famiglia: chi mangia a casa ai tre pasti, gli impegni di ognuno, cosa c'è in frigo e in dispensa, le ricette che si possono fare con quello che c'è e la lista della spesa. Si installa sul telefono come un'app e funziona anche offline.

- **Settimana**: per ogni giorno, chi è a casa a colazione, pranzo e cena (basta toccare l'iniziale), gli impegni e cosa si mangia.
- **Dispensa**: frigo, dispensa e freezer, con quantità e scadenze. Si riempie a mano, scrivendo più cose insieme oppure **fotografando lo scontrino**.
- **Ricette**: si vede subito quanti ingredienti ci sono già in casa. Le dosi cambiano in base al numero di persone, gli ingredienti mancanti vanno in spesa con un tocco e "L'ho cucinata" li toglie dalla dispensa.
- **Spesa**: si spuntano le cose comprate e poi si spostano in dispensa. "Manda a Keep" la condivide in una nota di Google Keep.

## Messa online (GitHub Pages)

1. Carica tutti i file nella radice di un repository (es. `cosa-si-mangia`).
2. Nel repository vai su **Settings → Pages → Build and deployment**: Source "Deploy from a branch", branch `main`, cartella `/ (root)`. Premi Save.
3. Dopo un minuto l'app sarà su `https://<utente>.github.io/cosa-si-mangia/`.

## Firebase (una volta sola, gratis)

I dati condivisi stanno su Firebase Firestore. Il piano gratuito basta e avanza per una famiglia.

1. Su [console.firebase.google.com](https://console.firebase.google.com) crea un progetto (Google Analytics non serve).
2. **Build → Firestore Database → Crea database**: scegli la modalità produzione e un server in Europa (es. `europe-west8`, Milano).
3. Nella scheda **Regole** incolla il contenuto di [`firestore.rules`](firestore.rules) e premi **Pubblica**.
4. **Build → Authentication → Inizia → Metodo di accesso**: attiva **Anonimo**.
5. **Impostazioni progetto → Le tue app →** icona **`</>`**: registra l'app web e copia il blocco `firebaseConfig`.
6. Hai due possibilità:
   - incolla la configurazione in [`config.js`](config.js), così vale per tutti;
   - oppure lascia `config.js` così com'è e incollala nell'app al primo avvio: finirà dentro il link di invito.

Poi apri l'app, tocca **Crea la famiglia**, scrivi i nomi e da ⚙︎ **Impostazioni → Condividi il link di invito** mandalo agli altri tre (anche su WhatsApp). Aprendo il link entrano subito.

Se compare un errore sul dominio, aggiungi `<utente>.github.io` in **Authentication → Impostazioni → Domini autorizzati**.

## Installarla sul telefono

- **Android (Chrome)**: menu ⋮ → **Aggiungi a schermata Home** / **Installa app**.
- **iPhone (Safari)**: tasto Condividi → **Aggiungi alla schermata Home**.

## Scontrini

Tocca **Scontrino**, fotografa lo scontrino intero, dritto e con buona luce. Prima di metterli in dispensa puoi controllare e correggere i prodotti letti, e quelli comprati spariscono dalla lista della spesa.

- Senza configurare nulla, la lettura avviene sul telefono con [Tesseract.js](https://tesseract.projectnaptha.com/): funziona, ma i nomi escono come sullo scontrino ("MOZZ.FIORDILATTE 125G") e conviene sistemarli.
- **Con Gemini (consigliato)**: crea una chiave gratuita su [aistudio.google.com/apikey](https://aistudio.google.com/apikey) e inseriscila in ⚙︎ Impostazioni. I prodotti escono già con nomi semplici ("mozzarella"), quantità e posto (frigo/dispensa/freezer). Con la stessa chiave si attivano anche le **Idee**: tre ricette proposte su quello che c'è in casa. La chiave resta salvata solo sul telefono dove la inserisci.

## Google Keep

Google non permette alle app di scrivere direttamente in Keep, quindi l'app usa la condivisione del telefono. Con **Manda a Keep** (nella spesa, nella dispensa e in ogni ricetta) si apre il menu Condividi: scegli **Keep** e la nota viene creata. Per avere le caselle da spuntare, in Keep apri la nota, tocca ⋮ e scegli **Mostra caselle di controllo**. Dal computer il testo viene copiato e basta incollarlo in una nota.

## Sicurezza

Ogni famiglia ha un codice casuale di 18 caratteri. Chi ha il link di invito può leggere e modificare i dati: mandalo solo in famiglia. Per ricominciare da zero su un telefono: ⚙︎ → **Esci dalla famiglia su questo telefono**.
