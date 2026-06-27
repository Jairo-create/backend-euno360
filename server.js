require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS: Permite que tu frontend se comunique con este backend
app.use(cors({
    origin: ['https://euno360.com', 'https://www.euno360.com', 'http://localhost:5173'],
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Permitir que Express lea JSON
app.use(express.json());

// Ruta principal para el formulario de contacto
app.post('/api/contacto', async (req, res) => {
    const { nombre, empresa, email, telefono, mensaje } = req.body;

    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ success: false, message: 'Faltan datos obligatorios.' });
    }

    try {
        // Configuración del servidor de correo (SMTP)
        // Puedes usar las credenciales de correo que te da DonWeb, o usar Gmail, SendGrid, etc.
       const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,     
            port: process.env.SMTP_PORT,     
            secure: process.env.SMTP_PORT == 465, 
            auth: {
                user: process.env.SMTP_USER, 
                pass: process.env.SMTP_PASS  
            },
            // Esta línea ayuda a evitar bloqueos de certificados en hostings compartidos
            tls: {
                rejectUnauthorized: false
            }
        });

        // Configuración del mensaje
        const mailOptions = {
            from: `"Web Euno 360" <${process.env.SMTP_USER}>`,
            to: process.env.DESTINATION_EMAIL, // Dónde quieres recibir los leads
            replyTo: email, // Si le das "Responder" al correo, le responderá al cliente
            subject: `Nuevo Lead Web: ${nombre} - ${empresa || 'Sin empresa'}`,
            text: `
                Has recibido un nuevo contacto desde la web:
                
                Nombre: ${nombre}
                Empresa: ${empresa || 'No especificada'}
                Email: ${email}
                Teléfono: ${telefono || 'No especificado'}
                
                Mensaje:
                ${mensaje}
                
                Políticas aceptadas: Sí
            `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        
        res.status(200).json({ success: true, message: 'Mensaje enviado correctamente.' });
    } catch (error) {
        console.error('Error enviando correo:', error);
        res.status(500).json({ success: false, message: 'Error interno al enviar el mensaje.' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en el puerto ${PORT}`);
});