import { useEffect, useState } from "react";
import { Share2, LogIn } from "lucide-react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { Input, Select } from "../../components/ui/Input";

const PLATFORMS = ["instagram", "youtube", "facebook"];

// Meta sends the user back here with the connect outcome in the query string.
const readOauthResult = () => {
  const params = new URLSearchParams(window.location.search);
  return { social: params.get("social"), platform: params.get("platform") || "", message: params.get("message") };
};

export default function SocialMedia() {
  const [oauthResult] = useState(readOauthResult);
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ platform: "instagram", accountId: "", followers: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(() => (oauthResult.social === "error" ? oauthResult.message || "Couldn't connect this account." : ""));
  const [message, setMessage] = useState(() => (
    oauthResult.social === "connected"
      ? `Your ${oauthResult.platform[0]?.toUpperCase() + oauthResult.platform.slice(1)} account was connected and submitted for admin review.`
      : ""
  ));
  const connect = async (platform) => {
    try {
      const response = await api.get(`/partner/social/${platform}/start`, { params: { returnTo: window.location.origin } });
      window.location.assign(response.data.url);
    } catch (connectError) {
      setError(connectError.response?.data?.message || "Social login is not configured.");
    }
  };

  const loadAccounts = async () => {
    const response = await api.get("/partner/social/accounts");
    setAccounts(response.data.data);
  };

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("social")) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    loadAccounts()
      .catch((loadError) => setError(loadError.response?.data?.message || "Couldn't load social accounts."))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.post("/partner/social/accounts", { ...form, followers: Number(form.followers) });
      setForm((current) => ({ ...current, accountId: "", followers: "" }));
      setMessage("Your account was submitted for admin review.");
      await loadAccounts();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Couldn't submit this social account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Social Media Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">Submit your creator accounts for verification before submitting content.</p>
      </div>

      <Card className="p-6">
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h2 className="font-semibold text-slate-900">Connect Instagram or Facebook</h2>
          <p className="text-sm text-slate-500 mt-1 mb-3">Use Meta login to fetch your account ID and follower count automatically.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => connect("instagram")}><LogIn size={16} /> Connect Instagram</Button>
            <Button type="button" variant="outline" onClick={() => connect("facebook")}><LogIn size={16} /> Connect Facebook</Button>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <h2 className="font-semibold text-slate-900">Add an account</h2>
          {error && <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
          {message && <p role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{message}</p>}
          <div className="grid sm:grid-cols-3 gap-4">
            <Select label="Platform" value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })}>
              {PLATFORMS.map((platform) => <option key={platform} value={platform}>{platform[0].toUpperCase() + platform.slice(1)}</option>)}
            </Select>
            <Input
              label="Account ID / handle"
              value={form.accountId}
              onChange={(event) => setForm({ ...form, accountId: event.target.value })}
              placeholder="@yourhandle or channel ID"
              required
              maxLength={120}
            />
            <Input
              label="Follower / subscriber count"
              type="number"
              min="0"
              step="1"
              value={form.followers}
              onChange={(event) => setForm({ ...form, followers: event.target.value })}
              placeholder="e.g. 12500"
              required
            />
          </div>
          <Button type="submit" loading={busy}>Submit account</Button>
        </form>
      </Card>

      <Card>
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Submitted accounts</h2>
        </div>
        {loading ? <p className="p-6 text-sm text-slate-400">Loading accounts...</p> : accounts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            <Share2 size={24} className="mx-auto mb-2 text-slate-300" />
            No accounts submitted yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <div key={account._id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 capitalize">{account.platform} · {account.username || account.accountId}</p>
                  <p className="text-sm text-slate-500">{Number(account.followers || 0).toLocaleString()} followers/subscribers</p>
                  {account.rejectionReason && <p className="text-xs text-red-600 mt-1">Admin note: {account.rejectionReason}</p>}
                </div>
                <Badge status={account.reviewStatus} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
