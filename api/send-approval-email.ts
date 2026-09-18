interface ApprovalEmailBody {
  to: string;
  ownerName?: string;
  restaurantName: string;
  loginUrl: string;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.SENDINBLUE_API_TOKEN;
  if (!apiKey) {
    return Response.json({ error: 'Email provider is not configured.' }, { status: 503 });
  }

  let body: ApprovalEmailBody;
  try {
    body = await request.json() as ApprovalEmailBody;
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body.to || !body.restaurantName || !body.loginUrl) {
    return Response.json({ error: 'Missing required email fields.' }, { status: 400 });
  }

  const ownerName = body.ownerName || 'Restaurateur';
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'RESTO QR', email: 'dalphayaya249@gmail.com' },
      to: [{ email: body.to, name: ownerName }],
      subject: 'Votre restaurant a été approuvé',
      htmlContent: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Félicitations ${ownerName},</h2><p>Votre restaurant <strong>${body.restaurantName}</strong> a été approuvé par le Super Admin.</p><p>Vous pouvez maintenant vous connecter à votre espace restaurant :</p><p><a href="${body.loginUrl}">${body.loginUrl}</a></p><p>Bienvenue sur RESTO QR.</p></div>`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[v0] Brevo approval email failed:', errorText);
    return Response.json({ error: 'Brevo refused the email.' }, { status: 502 });
  }

  return Response.json({ sent: true });
}
