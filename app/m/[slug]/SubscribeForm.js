"use client";

import { useState } from "react";

export default function SubscribeForm({ ministerId }) {
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(150);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ministerId, email, location, radiusMiles: radius }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  if (status === "done") {
    return (
      <div className="card" style={{ background: "var(--good-bg)", color: "var(--good-fg)", border: "none" }}>
        You&rsquo;re subscribed. Check your email for confirmation.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="label">Get updates &amp; nearby-stop alerts</div>

      <div>
        <label htmlFor="sub-email" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
          Email
        </label>
        <input
          id="sub-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="sub-location" style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
          Your city or ZIP code
        </label>
        <input
          id="sub-location"
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Charlotte, NC"
        />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          <span>Notification radius</span>
          <span style={{ color: "var(--accent)" }}>{radius} miles</span>
        </div>
        <input
          id="sub-radius"
          type="range"
          min="50"
          max="500"
          step="10"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent)" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>
          <span>50 mi</span>
          <span>500 mi</span>
        </div>
      </div>

      {status === "error" && (
        <div style={{ color: "oklch(50% 0.18 25)", fontSize: 13 }}>{errorMsg}</div>
      )}

      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}
