import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Business } from '../../types';

type EditableBusiness = Pick<
  Business,
  'name' | 'description' | 'email' | 'phone' | 'whatsapp' | 'address' | 'business_hours' | 'facebook_url' | 'instagram_url' | 'location'
>;

const editableFields: Array<{ key: keyof EditableBusiness; label: string }> = [
  { key: 'name', label: 'Business name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'location', label: 'Location' },
  { key: 'business_hours', label: 'Business hours' },
  { key: 'facebook_url', label: 'Facebook' },
  { key: 'instagram_url', label: 'Instagram' },
];

const toForm = (business: Business): EditableBusiness => ({
  name: business.name,
  description: business.description,
  email: business.email,
  phone: business.phone,
  whatsapp: business.whatsapp,
  address: business.address,
  business_hours: business.business_hours,
  facebook_url: business.facebook_url,
  instagram_url: business.instagram_url,
  location: business.location,
});

export default function AdminSettingsPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [forms, setForms] = useState<Record<string, EditableBusiness>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error: queryError } = await supabase.from('businesses').select('*').order('name');
      if (queryError) setError(queryError.message);
      const rows = (data ?? []) as Business[];
      setBusinesses(rows);
      setForms(Object.fromEntries(rows.map((business) => [business.id, toForm(business)])));
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const updateField = (businessId: string, key: keyof EditableBusiness, value: string) => {
    setForms((current) => ({ ...current, [businessId]: { ...current[businessId], [key]: value } }));
  };

  const saveBusiness = async (business: Business) => {
    const form = forms[business.id];
    if (!form.name.trim()) {
      setError('Business name is required.');
      return;
    }

    setBusyId(business.id);
    setError('');
    setSuccess('');
    const { data, error: updateError } = await supabase
      .from('businesses')
      .update(Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value?.trim() || null])))
      .eq('id', business.id)
      .select('*')
      .single();

    if (updateError) {
      setError(updateError.message);
    } else if (data) {
      const updated = data as Business;
      setBusinesses((current) => current.map((item) => item.id === updated.id ? updated : item));
      setForms((current) => ({ ...current, [updated.id]: toForm(updated) }));
      setSuccess('Business settings saved successfully.');
    }
    setBusyId(null);
  };

  if (loading) return <div>Loading settings…</div>;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Business settings</div>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Settings</h1>
      </div>
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div> : null}

      {businesses.map((business) => {
        const form = forms[business.id];
        return (
          <form key={business.id} onSubmit={(event) => { event.preventDefault(); void saveBusiness(business); }} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="mb-4 text-xl font-semibold text-slate-900">{business.name}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {editableFields.map(({ key, label }) => (
                <label key={key} className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</span>
                  <input value={form?.[key] ?? ''} onChange={(event) => updateField(business.id, key, event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
                </label>
              ))}
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Description</span>
                <textarea value={form?.description ?? ''} onChange={(event) => updateField(business.id, 'description', event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Address</span>
                <input value={form?.address ?? ''} onChange={(event) => updateField(business.id, 'address', event.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
              </label>
            </div>
            <button type="submit" disabled={busyId === business.id} className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white disabled:opacity-60">
              {busyId === business.id ? 'Saving…' : 'Save settings'}
            </button>
          </form>
        );
      })}
    </div>
  );
}
