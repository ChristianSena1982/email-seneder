const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send-lead-email', async (req, res) => {
    try {
        console.log("BODY RICEVUTO DAL FORM:", req.body); // Controlla i log su Render per vedere cosa arriva

        const clinicName = req.body.studioName || req.body.clinicName || req.body.nomeStudio || req.body.studio || '';
        const contactName = req.body.contactName || req.body.nomeReferente || req.body.referente || '';
        const recipientEmail = req.body.email || req.body.clinicEmail || req.body.emailStudio || req.body.toEmail;
        
        // Cattura aggressiva del nome setter da qualsiasi proprietà possibile
        const rawSetter = req.body.setterName || req.body.setter || req.body.name || req.body.nome || '';
        const setterName = rawSetter.trim();

        const apiKey = process.env.BREVO_API_KEY;

        if (!apiKey) {
            console.error("Errore: BREVO_API_KEY non configurata.");
            return res.status(500).json({ success: false, error: "Chiave BREVO_API_KEY non configurata su Render." });
        }

        if (!recipientEmail) {
            return res.status(400).json({ success: false, error: "Email del destinatario mancante." });
        }

        // Se il setter ha scritto qualcosa, usiamo il suo nome. Altrimenti fallback pulito.
        const displayName = setterName ? setterName : "Team Artsoftware2022";
        const senderName = setterName ? `Vocalis - ${setterName}` : "Vocalis - Artsoftware2022";

        console.log(`Invio email a ${recipientEmail} | Setter usato nella firma: "${displayName}"`);

        const payload = JSON.stringify({
            sender: {
                name: senderName,
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
                    <p>Ti scrivo da parte di <strong>Artsoftware2022</strong> per presentarti <strong>Vocalis</strong>, il nostro assistente virtuale basato su intelligenza artificiale progettato specificamente per gli studi dentistici.</p>
                    <p>Vocalis gestisce automaticamente le chiamate telefoniche e i messaggi WhatsApp in modo naturale, fissando gli appuntamenti direttamente in agenda anche quando lo studio è chiuso.</p>
                    <p>Vorremmo offrirti <strong>una settimana di prova gratuita e senza impegno</strong> del sistema.</p>
                    <br>
                    <p>Un cordiale saluto,</p>
                    <p><strong>${displayName}</strong><br>Team Artsoftware2022<br>Email: info@artsoftware2022.it</p>
                </div>
            `
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(payload)
            }
        };

        const brevoReq = https.request(options, (brevoRes) => {
            let data = '';
            brevoRes.on('data', (chunk) => { data += chunk; });
            brevoRes.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(data);
                    if (brevoRes.statusCode >= 200 && brevoRes.statusCode < 300) {
                        console.log("Email inviata con successo!");
                        return res.json({ success: true, message: "Email inviata con successo!" });
                    } else {
                        console.error("Errore da Brevo:", jsonResponse);
                        return res.status(500).json({ success: false, error: jsonResponse.message || "Errore Brevo" });
                    }
                } catch (e) {
                    return res.status(500).json({ success: false, error: "Risposta non valida da Brevo" });
                }
            });
        });

        brevoReq.on('error', (e) => {
            console.error("Errore di rete HTTPS:", e);
            return res.status(500).json({ success: false, error: "Errore di rete: " + e.message });
        });

        brevoReq.write(payload);
        brevoReq.end();

    } catch (err) {
        console.error("Errore interno server:", err);
        return res.status(500).json({ success: false, error: "Errore interno del server: " + err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
