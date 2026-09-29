import { useEffect, useState } from "react";
import adminApi from "../../services/adminApi";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

const TABS = ["Commission Rules"];
const PARTNER_TYPES = ["vendor", "influencer", "affiliate", "referral", "agency", "reseller", "technology", "strategic"];

const COMMISSION_TYPE_OPTIONS = ["percentage", "fixed_per_deal", "fixed_per_screen", "recurring_percentage", "recurring_fixed", "hybrid", "wholesale_discount"];

// Mirrors computeGrossCommission in backend/services/commissionEngine.js —
// each commission type only ever reads one of these field groups, so only
// the matching field(s) should be editable for a given type.
const RATE_TYPES = ["percentage", "recurring_percentage", "wholesale_discount"];
const FIXED_TYPES = ["fixed_per_deal", "recurring_fixed"];
const PER_SCREEN_TYPES = ["fixed_per_screen"];

const DEFAULT_RULE_FORM = {
  name: "", partnerType: "", isAddOn: false,
  commissionType: "percentage", rate: 0, fixedAmount: 0, perScreenAmount: 0,
  hybridPercentageRate: 0, hybridFixedAmount: 0, hybridPerScreenAmount: 0,
  recurringEnabled: false, durationType: "months", duration: 6
};

function CommissionRulesTab() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(DEFAULT_RULE_FORM);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.get("/admin/config/commission-rules").then((res) => setRules(res.data.data));
  useEffect(() => { load(); }, []);

  const startCreate = () => {
    setForm(DEFAULT_RULE_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (rule) => {
    setForm({
      name: rule.name || "",
      partnerType: rule.partnerType || "",
      isAddOn: rule.isAddOn || false,
      commissionType: rule.commissionType || "percentage",
      rate: rule.rate || 0,
      fixedAmount: rule.fixedAmount || 0,
      perScreenAmount: rule.perScreenAmount || 0,
      hybridPercentageRate: rule.hybrid?.percentageRate || 0,
      hybridFixedAmount: rule.hybrid?.fixedAmount || 0,
      hybridPerScreenAmount: rule.hybrid?.perScreenAmount || 0,
      recurringEnabled: rule.recurring?.enabled || false,
      durationType: rule.recurring?.durationType || "months",
      duration: rule.recurring?.duration || 6
    });
    setEditingId(rule._id);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      partnerType: form.partnerType || undefined,
      isAddOn: form.isAddOn,
      commissionType: form.commissionType,
      rate: RATE_TYPES.includes(form.commissionType) ? Number(form.rate) : 0,
      fixedAmount: FIXED_TYPES.includes(form.commissionType) ? Number(form.fixedAmount) : 0,
      perScreenAmount: PER_SCREEN_TYPES.includes(form.commissionType) ? Number(form.perScreenAmount) : 0,
      hybrid: form.commissionType === "hybrid"
        ? {
            percentageRate: Number(form.hybridPercentageRate),
            fixedAmount: Number(form.hybridFixedAmount),
            perScreenAmount: Number(form.hybridPerScreenAmount)
          }
        : undefined,
      recurring: form.recurringEnabled
        ? { enabled: true, durationType: form.durationType, duration: Number(form.duration) }
        : { enabled: false, durationType: "none" }
    };
    try {
      if (editingId) {
        await adminApi.patch(`/admin/config/commission-rules/${editingId}`, payload);
      } else {
        await adminApi.post("/admin/config/commission-rules", payload);
      }
      setForm(DEFAULT_RULE_FORM);
      setEditingId(null);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => (showForm ? setShowForm(false) : startCreate())}>{showForm ? "Cancel" : "New Rule"}</Button></div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Rule Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Select label="Partner Type (optional)" value={form.partnerType} onChange={(e) => setForm({ ...form, partnerType: e.target.value })}>
              <option value="">Any</option>
              {PARTNER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>

            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={form.isAddOn} onChange={(e) => setForm({ ...form, isAddOn: e.target.checked })} />
              This is an optional add-on rule (applied by an admin at their discretion)
            </label>

            <Select label="Commission Type" value={form.commissionType} onChange={(e) => setForm({ ...form, commissionType: e.target.value })}>
              {COMMISSION_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </Select>

            {/* Only the field(s) this commissionType actually reads (see
                computeGrossCommission in commissionEngine.js) are editable —
                showing all three regardless of type let you fill in a field
                the backend would just ignore. */}
            {RATE_TYPES.includes(form.commissionType) && (
              <Input label="Rate (%)" type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} />
            )}
            {FIXED_TYPES.includes(form.commissionType) && (
              <Input label="Fixed Amount (₹)" type="number" value={form.fixedAmount} onChange={(e) => setForm({ ...form, fixedAmount: e.target.value })} />
            )}
            {PER_SCREEN_TYPES.includes(form.commissionType) && (
              <Input label="Per Screen Amount (₹)" type="number" value={form.perScreenAmount} onChange={(e) => setForm({ ...form, perScreenAmount: e.target.value })} />
            )}
            {form.commissionType === "hybrid" && (
              <>
                <Input label="Percentage Rate (%)" type="number" value={form.hybridPercentageRate} onChange={(e) => setForm({ ...form, hybridPercentageRate: e.target.value })} />
                <Input label="Fixed Amount (₹)" type="number" value={form.hybridFixedAmount} onChange={(e) => setForm({ ...form, hybridFixedAmount: e.target.value })} />
                <Input label="Per Screen Amount (₹)" type="number" value={form.hybridPerScreenAmount} onChange={(e) => setForm({ ...form, hybridPerScreenAmount: e.target.value })} />
              </>
            )}

            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input type="checkbox" checked={form.recurringEnabled} onChange={(e) => setForm({ ...form, recurringEnabled: e.target.checked })} />
              Recurring
            </label>

            {form.recurringEnabled && (
              <>
                <Select label="Duration Type" value={form.durationType} onChange={(e) => setForm({ ...form, durationType: e.target.value })}>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                  <option value="lifetime">Lifetime (while active)</option>
                </Select>
                {form.durationType !== "lifetime" && (
                  <Input label="Duration" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                )}
              </>
            )}

            <div className="md:col-span-2 flex justify-end gap-2">
              {editingId && <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>}
              <Button type="submit" loading={saving}>{editingId ? "Save Changes" : "Create"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table
          empty="No commission rules yet."
          rows={rules}
          columns={[
            { key: "name", header: "Name" },
            { key: "partnerType", header: "Partner Type", render: (r) => r.partnerType ? <Badge tone="neutral">{r.partnerType}</Badge> : "Any" },
            { key: "addon", header: "Add-On?", render: (r) => (r.isAddOn ? <Badge tone="info">Add-on</Badge> : "—") },
            { key: "type", header: "Type", render: (r) => <Badge tone="neutral">{r.commissionType.replace(/_/g, " ")}</Badge> },
            {
              key: "rate",
              header: "Rate",
              render: (r) => {
                if (RATE_TYPES.includes(r.commissionType)) return `${r.rate || 0}%`;
                if (FIXED_TYPES.includes(r.commissionType)) return `₹${r.fixedAmount || 0}`;
                if (PER_SCREEN_TYPES.includes(r.commissionType)) return `₹${r.perScreenAmount || 0}/screen`;
                if (r.commissionType === "hybrid") return `${r.hybrid?.percentageRate || 0}% + ₹${r.hybrid?.fixedAmount || 0} + ₹${r.hybrid?.perScreenAmount || 0}/screen`;
                return "—";
              }
            },
            { key: "status", header: "Status", render: (r) => <Badge status={r.status} /> },
            { key: "actions", header: "", render: (r) => <button type="button" onClick={() => startEdit(r)} className="text-sm font-semibold text-brand-red hover:underline">Edit</button> }
          ]}
        />
      </Card>
    </div>
  );
}

export default function AdminConfig() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Commission Rules</h1>

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              tab === t ? "border-brand-red text-brand-red" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Commission Rules" && <CommissionRulesTab />}
    </div>
  );
}
