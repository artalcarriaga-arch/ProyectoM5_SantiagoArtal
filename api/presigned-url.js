const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
    const { fileName, contentType } = req.body;

    // Validaciones
    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName y contentType son requeridos' });
    }

    if (!process.env.AWS_S3_BUCKET_NAME) {
      return res.status(500).json({ error: 'AWS_S3_BUCKET_NAME no configurado' });
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const extension = fileName.split('.').pop() || 'jpg';
    const fileKey = `products/${timestamp}-${random}.${extension}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 15 * 60,
    });

    const imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`;

    return res.status(200).json({
      uploadUrl,
      fileKey,
      imageUrl,
    });
  } catch (error) {
    console.error('Error al generar URL presignada:', error);
    return res.status(500).json({
      error: 'Error al generar URL presignada',
      details: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
