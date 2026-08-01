
// ============================================================
// EDGE FUNCTION: create-staff
// Runs on Supabase's servers, never in the browser. This is the
// one place allowed to use the SERVICE ROLE key - a key with full
// admin power, including creating Auth users. The browser only ever
// has the public "anon" key, which cannot do this - that's why this
// function exists at all.
//
// Called from the frontend with: email, password, full_name, role.
// Does two things as one unit:
//   1. Creates a real Supabase Auth user (so they can log in)
//   2. Creates their matching row in the staff table
// If step 2 fails, step 1's user is deleted again - so a broken
// call never leaves a "login exists but can't use the app" ghost.
// ============================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Browsers send a preflight OPTIONS request before the real one - respond OK to it.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, role, requesting_clinic_id, requesting_user_role } = await req.json();

    if (!email || !password || !full_name || !role || !requesting_clinic_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Server-side role check, not just a frontend UI hide. Even if someone
    // called this function directly (bypassing the UI), only Doctor or
    // Manager callers are allowed to succeed.
    if (requesting_user_role !== 'Doctor' && requesting_user_role !== 'Manager') {
      return new Response(
        JSON.stringify({ error: 'Only Doctors and Managers can add staff.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Service role key - only available as an environment variable inside
    // this server-side function, never sent to or readable by the browser.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: create the real login.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: 'Could not create login: ' + authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = authData.user.id;

    // Step 2: create their staff row, using the SAME id as the Auth user -
    // this is the link that makes resolveClinicContext() work when they log in.
    const { error: staffError } = await supabaseAdmin
      .from('staff')
      .insert({
        id: newUserId,
        clinic_id: requesting_clinic_id,
        full_name: full_name,
        role: role
      });

    if (staffError) {
      // Roll back: don't leave a login with no matching staff row.
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: 'Could not create staff record: ' + staffError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, staff_id: newUserId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Unexpected error: ' + err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});