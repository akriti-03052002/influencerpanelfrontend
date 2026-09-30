// Where the backend API lives. VITE_API_URL wins when it's set (local
// .env.local, or the Vercel project's env var). Vercel only gives env vars to
// the environments they're configured for, so preview deployments can build
// without it — those fall back to the hosted backend instead of a
// same-host :5000 address that doesn't exist and leaves requests hanging.
const HOSTED_API_URL = "https://influencerpanelbackend.onrender.com/api";

const isLocalHost = (host) =>
  host === "localhost" || host === "127.0.0.1" || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(host);

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (isLocalHost(window.location.hostname) ? `http://${window.location.hostname}:5000/api` : HOSTED_API_URL);

export default apiBaseUrl;
