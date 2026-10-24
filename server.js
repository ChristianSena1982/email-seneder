const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configurazione trasportatore SMTP Aruba
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtps.aruba.it',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/api/send-lead-email', async (req, res) => {
    const { studioName, contactName, email } = req.body;

    if (!studioName || !contactName || !email) {
        return res.status(400).json({ success: false, error: 'Tutti i campi sono obbligatori.' });
    }

    const mailOptions = {
        from: `"Vocalis AI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Soluzione AI per ${studioName}: Gestione automatica chiamate e WhatsApp`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #2c3e50; text-align: center;">Presentazione Vocalis AI</h2>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                
                <p>Gentile <strong>${contactName}</strong>,</p>
                <p>Ti contattiamo dal team di sviluppo di <strong>Vocalis</strong>, l'assistente virtuale con intelligenza artificiale sviluppato appositamente per gli studi dentistici.</p>
                
                <h3 style="color: #2c3e50;">Cosa fa Vocalis per lo ${studioName}:</h3>
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 8px;"><strong>WhatsApp Automatico:</strong> Risponde H24 ai messaggi e richieste dei pazienti in modo naturale.</li>
                    <li style="margin-bottom: 8px;"><strong>Chiamate Vocali:</strong> Gestisce le telefonate con voce naturale per informazioni e supporto.</li>
                    <li style="margin-bottom: 8px;"><strong>Agenda & Appuntamenti:</strong> Fissa e organizza gli appuntamenti in totale autonomia.</li>
                </ul>

                <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #27ae60; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold; color: #27ae60;">PROVA GRATUITA</p>
                    <p style="margin: 5px 0 0 0;">Vi offriamo <strong>1 settimana di prova gratuita e senza alcun impegno</strong> per testare direttamente sul campo l'efficacia del sistema nel vostro studio.</p>
                </div>

                <p>Se volete saperne di più o attivare la prova gratuita, potete rispondere direttamente a questa email.</p>
                
                <p style="margin-top: 30px;">Cordiali saluti,<br><strong>Team Vocalis AI</strong></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Errore invio email:', error);
        return res.status(500).json({ success: false, error: 'Errore durante l\'invio dell\'email.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});