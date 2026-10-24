const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve i file statici dalla cartella public
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/send-lead-email', async (req, res) => {
    const { clinicName, contactName, clinicEmail } = req.body;

    // Configurazione SMTP per Aruba
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtps.aruba.it',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true per 465, false per 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"Vocalis Artsoftware" <${process.env.SMTP_USER}>`,
        to: clinicEmail,
        subject: `Presentazione Vocalis per lo Studio ${clinicName}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                <h2 style="color: #0056b3;">Gentile ${contactName || 'Titolare'},</h2>
                <p>Ti scrivo da parte di <strong>Artsoftware2022</strong> per presentarle <strong>Vocalis</strong>, il nostro assistente virtuale basato su intelligenza artificiale progettato specificamente per gli studi dentistici.</p>
                <p>Vocalis gestisce automaticamente le chiamate telefoniche e i messaggi WhatsApp in modo naturale, fissando gli appuntamenti direttamente in agenda anche quando lo studio è chiuso.</p>
                <p>Vorremmo offrirti <strong>una settimana di prova gratuita e senza impegno</strong> del sistema.</p>
                <br>
                <p>Un cordiale saluto,</p>
                <p><strong>Team Artsoftware2022</strong><br>Email: ${process.env.SMTP_USER}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email inviata con successo!" });
    } catch (error) {
        console.er
        ror("Errore SMTP:", error);
        res.status(500).json({ success: false, error: "Errore durante l'invio dell'email: " + error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
