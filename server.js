const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send-lead-email', async (req, res) => {
    // Estrazione flessibile dei campi per supportare qualsiasi nome usato nel form HTML
    const clinicName = req.body.clinicName || req.body.nomeStudio || req.body.studio || '';
    const contactName = req.body.contactName || req.body.nomeReferente || req.body.referente || '';
    const recipientEmail = req.body.clinicEmail || req.body.email || req.body.emailStudio || req.body.toEmail;

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.error("Errore: BREVO_API_KEY non configurata nelle variabili d'ambiente.");
        return res.status(500).json({ 
            success: false, 
            error: "Chiave BREVO_API_KEY non configurata su Render." 
        });
    }

    if (!recipientEmail) {
        console.error("Errore: Indirizzo email del destinatario non trovato nel corpo della richiesta.", req.body);
        return res.status(400).json({ 
            success: false, 
            error: "Indirizzo email del destinatario mancante nel form." 
        });
    }

    console.log(`Tentativo di invio email via API Brevo a: ${recipientEmail}`);

    const payload = {
        sender: {
            name: "Vocalis Artsoftware",
            email: "info@artsoftware2022.it"
        },
        to: [
            {
                email: recipientEmail.trim(),
                name: clinicName || "Studio Dentistico"
            }
        ],
        subject: `Presentazione Vocalis per lo Studio ${clinicName}`,
        htmlContent: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #0056b3;">Gentile ${contactName || 'Titolare'},</h2>
                <p>Ti scrivo da parte di <strong>Artsoftware2022</strong> per presentarle <strong>Vocalis</strong>, il nostro assistente virtuale basato su intelligenza artificiale progettato specificamente per gli studi dentistici.</p>
                <p>Vocalis gestisce automaticamente le chiamate telefoniche e i messaggi WhatsApp in modo naturale, fissando gli appuntamenti direttamente in agenda anche quando lo studio è chiuso.</p>
                <p>Vorremmo offrirti <strong>una settimana di prova gratuita e senza impegno</strong> del sistema.</p>
                <br>
                <p>Un cordiale saluto,</p>
                <p><strong>${setterName}</strong><strong>Team Artsoftware2022</strong><br>Email: info@artsoftware2022.it</p>
            </div>
        `
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Email inviata con successo via API Brevo:", data);
            return res.json({ success: true, message: "Email inviata con successo!" });
        } else {
            console.error("Errore restituito dalle API di Brevo:", data);
            return res.status(500).json({ 
                success: false, 
                error: data.message || "Errore durante l'invio via API Brevo" 
            });
        }
    } catch (error) {
        console.error("Errore di connessione HTTP verso Brevo:", error);
        return res.status(500).json({ 
            success: false, 
            error: "Errore di connessione: " + error.message 
        });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
