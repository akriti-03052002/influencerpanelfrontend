import { useEffect, useState } from "react";
import { ExternalLink, Share2 } from "lucide-react";
import adminApi from "../../services/adminApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const formatPlatform = (platform) => platform ? platform[0].toUpperCase() + platform.slice(1) : "Social";

export default function AdminSocialMedia() {
  const [accounts, setAccounts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [reasons, setReasons] = useState({});
  const [notes, setNotes] = useState({});
  const [ownership, setOwnership] = useState({});
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const [accountResponse, submissionResponse] = await Promise.all([
      adminApi.get("/admin/social-media/accounts"),
      adminApi.get("/admin/social-media/posts")
    ]);
    setAccounts(accountResponse.data.data);
    setSubmissions(submissionResponse.data.data);
  };

  const saveRates = async (account) => {
    setBusyId(`rates-${account.partnerId}`);
    setError("");
    setMessage("");
    try {
      await adminApi.patch(`/admin/social-media/accounts/${account.partnerId}/rates`, {
        post: Number(rates[account.partnerId]?.post ?? account.paymentRates?.post),
        reel: Number(rates[account.partnerId]?.reel ?? account.paymentRates?.reel),
        currency: rates[account.partnerId]?.currency || account.paymentRates?.currency || "INR"
      });
      setMessage("Influencer payment rates updated.");
      await load();
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Couldn't update payment rates.");
    } finally {
      setBusyId("");
    }
  };

  useEffect(() => {
    load()
      .catch((loadError) => setError(loadError.response?.data?.message || "Couldn't load social media reviews."))
      .finally(() => setLoading(false));
  }, []);

  const reviewAccount = async (account, decision) => {
    setBusyId(account._id);
    setError("");
    setMessage("");
    try {
      await adminApi.patch(`/admin/social-media/accounts/${account.partnerId}/${account._id}/review`, {
        decision,
        rejectionReason: reasons[account._id] || ""
      });
      setMessage(`Account ${decision}.`);
      await load();
    } catch (reviewError) {
      setError(reviewError.response?.data?.message || "Couldn't review this account.");
    } finally {
      setBusyId("");
    }
  };

  const reviewSubmission = async (submission, decision) => {
    setBusyId(submission._id);
    setError("");
    setMessage("");
    try {
      await adminApi.patch(`/admin/social-media/posts/${submission._id}/review`, {
        decision,
        ownershipConfirmed: Boolean(ownership[submission._id]),
        reviewNote: notes[submission._id] || ""
      });
      setMessage(`Submission ${decision}.`);
      await load();
    } catch (reviewError) {
      setError(reviewError.response?.data?.message || "Couldn't review this submission.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Social Media Review</h1>
        <p className="text-sm text-slate-500 mt-1">Verify influencer accounts, check post/reel URLs for duplicates and ownership, and assign approved payments.</p>
      </div>

      {error && <p role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</p>}
      {message && <p role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{message}</p>}

      <Card>
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Share2 size={18} className="text-slate-500" />
          <h2 className="font-semibold text-slate-900">Influencer account verification</h2>
        </div>
        {loading ? <p className="p-6 text-sm text-slate-400">Loading accounts...</p> : accounts.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No social accounts submitted.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {accounts.map((account) => (
              <div key={account._id} className="p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{account.partnerName} <span className="font-normal text-slate-400">({account.partnerCode})</span></p>
                    <p className="text-sm text-slate-500">{account.email}</p>
                    <p className="mt-2 text-sm text-slate-700">{formatPlatform(account.platform)} · {account.username || account.accountId} · {Number(account.followers || 0).toLocaleString()} followers/subscribers</p>
                    <p className="text-xs text-slate-400 mt-1">Account ID / handle: {account.accountId}</p>
                    {account.rejectionReason && <p className="text-xs text-red-600 mt-1">Previous rejection: {account.rejectionReason}</p>}
                    <div className="mt-3 flex flex-wrap items-end gap-2">
                      <label className="text-xs text-slate-500">Post ₹
                        <input type="number" min="0.01" step="0.01" value={rates[account.partnerId]?.post ?? account.paymentRates?.post ?? ""} onChange={(event) => setRates({ ...rates, [account.partnerId]: { ...(rates[account.partnerId] || {}), post: event.target.value } })} className="ml-1 w-28 px-2 py-1.5 border border-slate-200 rounded-lg" />
                      </label>
                      <label className="text-xs text-slate-500">Reel ₹
                        <input type="number" min="0.01" step="0.01" value={rates[account.partnerId]?.reel ?? account.paymentRates?.reel ?? ""} onChange={(event) => setRates({ ...rates, [account.partnerId]: { ...(rates[account.partnerId] || {}), reel: event.target.value } })} className="ml-1 w-28 px-2 py-1.5 border border-slate-200 rounded-lg" />
                      </label>
                      <Button type="button" loading={busyId === `rates-${account.partnerId}`} onClick={() => saveRates(account)}>Save rates</Button>
                    </div>
                  </div>
                  <Badge status={account.reviewStatus} />
                </div>
                {account.reviewStatus === "pending" && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      aria-label={`Rejection reason for ${account.username || account.accountId}`}
                      value={reasons[account._id] || ""}
                      onChange={(event) => setReasons({ ...reasons, [account._id]: event.target.value })}
                      placeholder="Reason required if rejecting"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <Button type="button" loading={busyId === account._id} onClick={() => reviewAccount(account, "verified")}>Verify account</Button>
                    <Button type="button" variant="danger" disabled={!reasons[account._id]?.trim()} loading={busyId === account._id} onClick={() => reviewAccount(account, "rejected")}>Reject</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Post / reel review and payment</h2>
        </div>
        {loading ? <p className="p-6 text-sm text-slate-400">Loading submissions...</p> : submissions.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No posts or reels submitted.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {submissions.map((submission) => (
              <div key={submission._id} className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{submission.influencer?.name || "Influencer"} <span className="font-normal text-slate-400">({submission.influencer?.partnerCode})</span></p>
                    <p className="text-sm text-slate-500">{formatPlatform(submission.platform)} · {submission.contentType} · Account: {submission.socialAccount?.username || submission.socialAccount?.accountId || "unavailable"} ({Number(submission.socialAccount?.followers || 0).toLocaleString()} followers)</p>
                    <a href={submission.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline break-all">
                      {submission.url}<ExternalLink size={14} />
                    </a>
                    <p className="text-xs text-slate-400 mt-1">URL is unique across submissions. Confirm the public content belongs to the selected account before approval.</p>
                  </div>
                  <Badge status={submission.status} />
                </div>
                {submission.status === "pending" && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={Boolean(ownership[submission._id])} onChange={(event) => setOwnership({ ...ownership, [submission._id]: event.target.checked })} />
                      I verified URL ownership against the influencer account
                    </label>
                    <input
                      aria-label={`Review note for ${submission.url}`}
                      value={notes[submission._id] || ""}
                      onChange={(event) => setNotes({ ...notes, [submission._id]: event.target.value })}
                      placeholder="Rejection reason (required if rejecting)"
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <Button type="button" disabled={!ownership[submission._id]} loading={busyId === submission._id} onClick={() => reviewSubmission(submission, "approved")}>Approve & assign payment</Button>
                      <Button type="button" variant="danger" disabled={!notes[submission._id]?.trim()} loading={busyId === submission._id} onClick={() => reviewSubmission(submission, "rejected")}>Reject</Button>
                    </div>
                  </div>
                )}
                {submission.status === "approved" && (
                  <p className="text-sm font-semibold text-emerald-700">Payment approved: ₹{Number(submission.payment?.amount || 0).toLocaleString()} {submission.payment?.currency || "INR"}</p>
                )}
                {submission.reviewNote && submission.status === "rejected" && <p className="text-sm text-red-600">Reason: {submission.reviewNote}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
