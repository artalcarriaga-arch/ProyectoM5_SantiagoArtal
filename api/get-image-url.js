const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
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
    const { fileKey } = req.body;

    if (!fileKey) {
      return res.status(400).json({ error: 'fileKey es requerido' });
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
      return res.status(500).json({ error: 'AWS_S3_BUCKET_NAME no configurado' });
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });

    const imageUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 7 * 24 * 60 * 60,
    });

    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Error al generar URL presignada para GET:', error);
    return res.status(500).json({
      error: 'Error al generar URL presignada',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
};
