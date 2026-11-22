// Sends email through Resend's REST API directly (no SDK dependency).
// https://resend.com/docs/api-reference/emails/send-email

export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Gishah <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }

  return res.json();
}

export function confirmationEmailHtml({ ministerName, radiusMiles, unsubscribeUrl }) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 12px;">You're subscribed to ${escapeHtml(ministerName)}</h2>
      <p style="color: #444; line-height: 1.6;">
        You'll get an email whenever ${escapeHtml(ministerName)} posts a newsletter update,
        and whenever a new itinerary stop is added within ${radiusMiles} miles of your location.
      </p>
      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        Didn't mean to subscribe? <a href="${unsubscribeUrl}">Unsubscribe</a>.
      </p>
    </div>
  `;
}

export function notificationEmailHtml({ ministerName, city, venue, eventDate, distanceMiles, unsubscribeUrl }) {
  return `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin: 0 0 12px;">${escapeHtml(ministerName)} is coming near you</h2>
      <p style="color: #444; line-height: 1.6;">
        A new stop was just added about ${Math.round(distanceMiles)} miles from your location:
      </p>
      <div style="background: #f6f6f4; border-radius: 10px; padding: 16px 18px; margin: 16px 0;">
        <div style="font-weight: 600;">${escapeHtml(city)}</div>
        <div style="color: #555; font-size: 14px; margin-top: 2px;">${escapeHtml(venue)}</div>
        <div style="color: #888; font-size: 13px; margin-top: 6px;">${escapeHtml(eventDate)}</div>
      </div>
      <p style="color: #888; font-size: 13px; margin-top: 32px;">
        <a href="${unsubscribeUrl}">Unsubscribe</a> from these alerts.
      </p>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}
