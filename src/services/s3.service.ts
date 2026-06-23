interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  imageUrl: string;
}


export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  try {
    const response = await fetch('/api/presigned-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType,
      }),
    });

    if (!response.ok) {
      throw new Error('Error al obtener URL presignada');
    }

    return response.json();
  } catch (error) {
    console.error('Error en getPresignedUploadUrl:', error);
    throw error;
  }
}


export async function uploadFileToS3(
  uploadUrl: string,
  file: File
): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Error al subir archivo a S3');
    }
  } catch (error) {
    console.error('Error en uploadFileToS3:', error);
    throw error;
  }
}


export function isValidImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024;

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const extension = originalName.split('.').pop() || 'jpg';
  return `products/${timestamp}-${random}.${extension}`;
}
