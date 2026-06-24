const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const sesClient = new SESClient({
  region: process.env.AWS_SES_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, htmlBody } = req.body;

    if (!to || !subject || !htmlBody) {
      return res.status(400).json({
        error: 'to, subject y htmlBody son requeridos',
      });
    }

    if (!process.env.AWS_SES_FROM_EMAIL) {
      return res.status(500).json({
        error: 'AWS_SES_FROM_EMAIL no configurado',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ error: 'Email destino inválido' });
    }

    const sendEmailCommand = new SendEmailCommand({
      Source: process.env.AWS_SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const result = await sesClient.send(sendEmailCommand);

    return res.status(200).json({
      success: true,
      messageId: result.MessageId,
      message: 'Email enviado correctamente',
    });
  } catch (error) {
    console.error('Error al enviar email:', error);

    if (error.name === 'MessageRejected') {
      return res.status(400).json({
        error: 'Email rechazado por SES (posible email no verificado)',
        details: error.message,
      });
    }

    if (error.name === 'ConfigurationSetDoesNotExist') {
      return res.status(500).json({
        error: 'Configuration Set no existe en SES',
        details: error.message,
      });
    }

    return res.status(500).json({
      error: 'Error al enviar email',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
