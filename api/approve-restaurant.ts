import { createClient } from '@supabase/supabase-js';

interface ApprovalBody {
  restaurantId: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_NEXT_PUBLIC_SUPABASE_ANON_KEY_SUPABASE_SERVICE_ROLE_KEY;
const brevoApiKey = process.env.SENDINBLUE_API_TOKEN;
const senderEmail = process.env.BREVO_SENDER_EMAIL || 'dalphayaya249@gmail.com';

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: 'Supabase server configuration is missing.' }, { status: 503 });
  }

  let body: ApprovalBody;
  try {
    body = await request.json() as ApprovalBody;
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  if (!body.restaurantId) return Response.json({ error: 'Missing restaurantId.' }, { status: 400 });

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase
    .from('restaurants')
    .update({ status: 'ACTIVE' })
    .eq('id', body.restaurantId)
    .select('id, status, name, owner_name, email')
    .single();

  if (error) {
    console.error('[v0] Server approval failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
  let emailSent = false;
  let emailError: string | undefined;
  if (brevoApiKey && data.email) {
    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { accept: 'application/json', 'api-key': brevoApiKey, 'content-type': 'application/json' },
      body: JSON.stringify({
        sender: { name: 'RESTO QR', email: senderEmail },
        to: [{ email: data.email, name: data.owner_name || 'Restaurateur' }],
        subject: 'Votre restaurant a été approuvé',
        htmlContent: `<p>Bonjour ${data.owner_name || 'Restaurateur'},</p><p>Votre restaurant <strong>${data.name}</strong> a été approuvé. Connectez-vous ici : <a href="${process.env.APP_URL || 'https://v0-resto-qr.vercel.app'}/login">Accéder à RESTO QR</a></p>`,
      }),
    });
    emailSent = emailResponse.ok;
    if (!emailSent) emailError = await emailResponse.text();
  } else {
    emailError = 'SENDINBLUE_API_TOKEN is missing.';
  }
  return Response.json({ restaurant: data, emailSent, emailError });
}
