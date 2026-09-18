import { createClient } from '@supabase/supabase-js';

interface ApprovalBody {
  restaurantId: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_NEXT_PUBLIC_SUPABASE_ANON_KEY_SUPABASE_SERVICE_ROLE_KEY;

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
  return Response.json({ restaurant: data });
}
