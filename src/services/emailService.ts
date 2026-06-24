export interface EmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
}

export async function sendOrderCreatedEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  total: number,
  items: Array<{ name: string; quantity: number; price: number }>
): Promise<void> {
  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>$${item.price.toFixed(2)}</td>
          <td>$${(item.quantity * item.price).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 5px; }
          .content { margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
          .total { font-weight: bold; font-size: 18px; color: #4F46E5; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Orden Confirmada!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Tu orden ha sido creada exitosamente. Aquí están los detalles:</p>
            
            <h3>ID de Orden: <span style="color: #4F46E5;">#${orderId}</span></h3>
            
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div class="total" style="margin-top: 20px; text-align: right;">
              Total: $${total.toFixed(2)}
            </div>
            
            <p style="margin-top: 20px;">
              Tu orden está siendo procesada. Recibirás actualizaciones por email cuando cambie el estado.
            </p>
            
            <div class="footer">
              <p>MultiShop - Tu tienda en línea de confianza</p>
              <p>Este es un correo automático, no responda a este email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Orden Confirmada #${orderId} - MultiShop`,
    htmlBody,
  });
}

export async function sendOrderStatusEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string
): Promise<void> {
  const statusMessages: Record<string, { message: string; color: string }> = {
    pending: {
      message: 'Tu orden está pendiente de procesamiento',
      color: '#F59E0B',
    },
    processing: {
      message: 'Estamos preparando tu orden',
      color: '#3B82F6',
    },
    completed: {
      message: '¡Tu orden ha sido completada y está lista para recoger!',
      color: '#10B981',
    },
    cancelled: {
      message: 'Tu orden ha sido cancelada',
      color: '#EF4444',
    },
  };

  const status = statusMessages[newStatus] || {
    message: `Tu orden ha cambiado a estado: ${newStatus}`,
    color: '#6B7280',
  };

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .status-banner { background-color: ${status.color}; color: white; padding: 20px; border-radius: 5px; text-align: center; }
          .content { margin: 20px 0; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="status-banner">
            <h1>Actualización de tu Orden</h1>
            <p style="font-size: 18px; margin: 10px 0;">Estado: <strong>${newStatus.toUpperCase()}</strong></p>
          </div>
          <div class="content">
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>${status.message}</p>
            
            <h3>ID de Orden: <span style="color: ${status.color};">#${orderId}</span></h3>
            
            <p>Gracias por tu compra en MultiShop. Si tienes preguntas, contáctanos.</p>
            
            <div class="footer">
              <p>MultiShop - Tu tienda en línea de confianza</p>
              <p>Este es un correo automático, no responda a este email.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail({
    to: customerEmail,
    subject: `Actualización: Tu Orden #${orderId} - ${newStatus.toUpperCase()}`,
    htmlBody,
  });
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Error al enviar email');
    }
  } catch (error) {
    console.error('Error en sendEmail:', error);
  }
}
