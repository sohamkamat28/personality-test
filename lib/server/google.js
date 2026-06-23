export async function verifyGoogleIdToken(credential) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return { ok: false, status: 500, message: "Google sign-in is not configured." };
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    return { ok: false, status: 401, message: "Could not verify Google sign-in." };
  }

  const profile = await response.json();
  if (profile.aud !== clientId || profile.email_verified !== "true") {
    return { ok: false, status: 401, message: "Google account verification failed." };
  }

  return {
    ok: true,
    email: profile.email,
    name: profile.name || profile.email
  };
}
