'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/* ─── Types ─────────────────────────────────────────────── */
type Quote = {
  id: string;
  quote_number: string;
  client_name: string;
  client_email: string;
  total: number;
  status: 'sent' | 'accepted' | 'rejected' | 'converted';
  service_types: string | null;
  valid_until: string | null;
  notes: string | null;
  invoice_number: string | null;
  created_at: string;
};

type BillingType = 'one_time' | 'monthly' | 'annual';

/* ─── Catalogue (identique facturation) ─────────────────── */
const CATALOG: { category: string; items: { label: string; amount: number | null; billing: BillingType; note?: string }[] }[] = [
  {
    category: 'Création de site web',
    items: [
      { label: 'Site web Basique',       amount: 250,  billing: 'one_time' },
      { label: 'Site web Pro',           amount: 600,  billing: 'one_time' },
      { label: 'Site web Premium',       amount: 1200, billing: 'one_time' },
      { label: 'Refonte & amélioration', amount: null, billing: 'one_time', note: 'Devis' },
    ],
  },
  {
    category: 'Maintenance',
    items: [{ label: 'Maintenance mensuelle', amount: 170, billing: 'monthly', note: '/mois' }],
  },
  {
    category: 'Agent IA',
    items: [
      { label: 'Agent IA — Starter',  amount: 99,  billing: 'monthly', note: '/mois' },
      { label: 'Agent IA — Business', amount: 199, billing: 'monthly', note: '/mois' },
      { label: 'Agent IA — Premium',  amount: 299, billing: 'monthly', note: '/mois' },
    ],
  },
  {
    category: 'Carte de Visite NFC',
    items: [
      { label: 'Carte NFC — Starter',        amount: 9,  billing: 'monthly',  note: '/mois' },
      { label: 'Carte NFC — Pro',             amount: 19, billing: 'monthly',  note: '/mois' },
      { label: 'Carte NFC — Business',        amount: 39, billing: 'monthly',  note: '/mois' },
      { label: 'Carte NFC physique Standard', amount: 15, billing: 'one_time', note: 'Unique' },
      { label: 'Carte NFC physique Premium',  amount: 25, billing: 'one_time', note: 'Unique' },
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  sent: 'Envoyé', accepted: 'Accepté', rejected: 'Refusé', converted: 'Converti',
};
const STATUS_CLASS: Record<string, string> = {
  sent: 'status-contacted', accepted: 'status-converted', rejected: 'status-lost', converted: 'status-new',
};
const SERVICE_TYPE_LABELS: Record<string, string> = {
  site_web: 'Site web', agent_ia: 'Agent IA', carte_nfc: 'Carte NFC', autre: 'Autre',
};

const EMPTY_FORM = {
  client_name: '', client_email: '',
  notes: '',
  service_types: [] as string[],
  items: [{ description: '', amount: '', billing: 'one_time' as BillingType }],
};

/* ═════════════════════════════════════════════════════════ */
export default function DevisPage() {
  return <Suspense fallback={null}><DevisPageInner /></Suspense>;
}

function DevisPageInner() {
  const searchParams = useSearchParams();
  const [quotes, setQuotes]       = useState<Quote[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated]     = useState<string | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [agentClients, setAgentClients] = useState<{ business_name: string; contact_email: string }[]>([]);
  const [carteClients, setCarteClients] = useState<{ full_name: string; email: string }[]>([]);
  const [searchResults, setSearchResults] = useState<{ name: string; email: string; source: string }[]>([]);
  const [showResults, setShowResults] = useState(false);

  /* Pré-remplissage depuis ?name=...&email=... (lien depuis Leads) */
  useEffect(() => {
    const name  = searchParams.get('name');
    const email = searchParams.get('email');
    if (name || email) {
      setForm(f => ({ ...f, client_name: name || '', client_email: email || '' }));
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchQuotes();
    fetch('/api/admin-agent?path=admin/clients-list').then(r => r.json()).then(d => setAgentClients(Array.isArray(d) ? d : []));
    supabase.from('carte_profiles').select('full_name, email').then(({ data }) => setCarteClients(data || []));
  }, []);

  async function fetchQuotes() {
    setLoading(true);
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    setQuotes(data || []);
    setLoading(false);
  }

  /* ─── Recherche client ───────────────────────────────── */
  function handleSearch(q: string) {
    setSearchEmail(q);
    if (q.length < 2) { setSearchResults([]); setShowResults(false); return; }
    const term = q.toLowerCase();
    const results: typeof searchResults = [];
    agentClients.forEach(c => {
      if (c.contact_email?.toLowerCase().includes(term) || c.business_name?.toLowerCase().includes(term))
        results.push({ name: c.business_name, email: c.contact_email, source: 'Agent IA' });
    });
    carteClients.forEach(c => {
      if (c.email?.toLowerCase().includes(term) || c.full_name?.toLowerCase().includes(term)) {
        const ex = results.find(r => r.email === c.email);
        if (ex) ex.source += ' + Carte NFC';
        else results.push({ name: c.full_name, email: c.email, source: 'Carte NFC' });
      }
    });
    setSearchResults(results);
    setShowResults(true);
  }

  function selectClient(r: { name: string; email: string }) {
    setForm(f => ({ ...f, client_name: r.name, client_email: r.email }));
    setSearchEmail(r.email);
    setShowResults(false);
  }

  /* ─── Items ─────────────────────────────────────────── */
  function updateItem(i: number, field: 'description' | 'amount', value: string) {
    setForm(f => { const items = [...f.items]; items[i] = { ...items[i], [field]: value }; return { ...f, items }; });
  }
  function updateBilling(i: number, billing: BillingType) {
    setForm(f => { const items = [...f.items]; items[i] = { ...items[i], billing }; return { ...f, items }; });
  }
  function addItem() { setForm(f => ({ ...f, items: [...f.items, { description: '', amount: '', billing: 'one_time' as BillingType }] })); }
  function removeItem(i: number) { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); }

  function addCatalogItem(label: string, amount: number | null, billing: BillingType) {
    const newItem = { description: label, amount: amount != null ? String(amount) : '', billing };
    setForm(f => ({
      ...f,
      items: f.items.length === 1 && !f.items[0].description ? [newItem] : [...f.items, newItem],
      service_types: (() => {
        const d = label.includes('Agent IA') ? 'agent_ia' : label.includes('Carte NFC') ? 'carte_nfc'
          : (label.includes('Site') || label.includes('Refonte') || label.includes('Maintenance')) ? 'site_web' : null;
        if (d && !f.service_types.includes(d)) return [...f.service_types, d];
        return f.service_types;
      })(),
    }));
    setShowCatalog(false);
  }

  /* ─── Soumettre devis ───────────────────────────────── */
  async function handleCreate(e: { preventDefault(): void }) {
    e.preventDefault();
    setSaving(true); setFormError(null);
    if (!form.client_email || !form.client_name) {
      setFormError('Nom et email obligatoires.'); setSaving(false); return;
    }
    const validItems = form.items.filter(i => i.description);
    if (validItems.length === 0) { setFormError('Au moins une prestation obligatoire.'); setSaving(false); return; }

    const res = await fetch('/api/admin-agent?path=admin/create-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name:   form.client_name,
        client_email:  form.client_email,
        notes:         form.notes || undefined,
        service_types: form.service_types.join(',') || 'autre',
        items:         validItems.map(i => ({ description: i.description, amount: parseFloat(i.amount) || 0, billing: i.billing })),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setFormError(data.error || 'Erreur.'); setSaving(false); return; }
    setCreated(data.quoteNumber);
    setForm(EMPTY_FORM); fetchQuotes(); setSaving(false);
  }

  /* ─── Changer statut ────────────────────────────────── */
  async function updateStatus(quote_number: string, status: string) {
    await fetch('/api/admin-agent?path=admin/quote-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_number, status }),
    });
    setQuotes(prev => prev.map(q => q.quote_number === quote_number ? { ...q, status: status as Quote['status'] } : q));
  }

  function closeModal() { setShowModal(false); setFormError(null); setCreated(null); setForm(EMPTY_FORM); setShowCatalog(false); setSearchEmail(''); }

  const filtered = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);
  const counts   = { all: quotes.length, sent: 0, accepted: 0, rejected: 0, converted: 0 };
  quotes.forEach(q => { if (q.status in counts) counts[q.status as keyof typeof counts]++; });
  const formTotal = form.items.reduce((s, i) => s + (parseFloat(i.amount) || 0), 0);

  /* ═════════════════════════════════════════════════════ */
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Devis</h1>
          <p className="admin-subtitle">{quotes.length} devis · {counts.accepted} accepté{counts.accepted > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={fetchQuotes} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ fontSize: '0.82rem' }}>+ Nouveau devis</button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {(['all', 'sent', 'accepted', 'rejected', 'converted'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px', borderRadius: 50, border: '1px solid', cursor: 'pointer',
            borderColor: filter === s ? 'var(--primary)' : 'var(--card-border)',
            background:  filter === s ? 'rgba(108,99,255,0.1)' : 'transparent',
            color:       filter === s ? 'var(--primary)' : 'var(--text-muted)',
            fontSize: '0.82rem', fontWeight: 600,
          }}>
            {s === 'all' ? 'Tous' : STATUS_LABELS[s]} ({counts[s as keyof typeof counts] ?? quotes.length})
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucun devis.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="lead-table">
            <thead>
              <tr><th>N°</th><th>Client</th><th>Services</th><th>Total estimé</th><th>Validité</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.quote_number}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{q.client_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.client_email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {(q.service_types || 'autre').split(',').map(s => (
                        <span key={s} style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 50, background: 'rgba(108,99,255,0.12)', color: 'var(--primary)' }}>
                          {SERVICE_TYPE_LABELS[s] || s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>${q.total?.toLocaleString()}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {q.valid_until ? new Date(q.valid_until).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td><span className={`status-badge ${STATUS_CLASS[q.status] || 'status-new'}`}>{STATUS_LABELS[q.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {q.status === 'sent' && (
                        <>
                          <button onClick={() => updateStatus(q.quote_number, 'accepted')}
                            style={{ fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', color: '#22C55E', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                            ✓ Marquer accepté
                          </button>
                          <button onClick={() => updateStatus(q.quote_number, 'rejected')}
                            style={{ fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                            ✗ Marquer refusé
                          </button>
                        </>
                      )}
                      {q.status === 'accepted' && (
                        <a href={`/admin/facturation?from_quote=${q.quote_number}&client=${encodeURIComponent(q.client_email)}`}
                          style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                          → Convertir en facture
                        </a>
                      )}
                      {q.invoice_number && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>Facture : {q.invoice_number}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ════ MODAL NOUVEAU DEVIS ════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, overflowY: 'auto' }}
          onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 32, width: '100%', maxWidth: 580, margin: '24px auto' }}>
            {created ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✓</div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22C55E', marginBottom: 8 }}>Devis {created} envoyé</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Le PDF a été envoyé par email au client avec les boutons d'acceptation.</p>
                <button className="btn btn-primary" onClick={closeModal} style={{ minWidth: 160 }}>Fermer</button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>Nouveau devis</h2>
                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Recherche client */}
                  <div>
                    <label style={labelStyle}>Client *</label>
                    {form.client_email ? (
                      <div style={{ background: 'var(--dark-3)', border: '1.5px solid var(--primary)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{form.client_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--primary)' }}>{form.client_email}</div>
                        </div>
                        <button type="button" onClick={() => { setForm(f => ({ ...f, client_name: '', client_email: '' })); setSearchEmail(''); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ position: 'relative' }}>
                        <input style={inputStyle} placeholder="Rechercher par nom ou email..."
                          value={searchEmail} onChange={e => handleSearch(e.target.value)} autoComplete="off" />
                        {showResults && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 10, marginTop: 4, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
                            {searchResults.length === 0 ? (
                              <div style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                Aucun client —{' '}
                                <button type="button" onClick={() => { setShowResults(false); setForm(f => ({ ...f, client_email: searchEmail })); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Saisir manuellement</button>
                              </div>
                            ) : searchResults.map((r, i) => (
                              <button key={i} type="button" onClick={() => selectClient(r)}
                                style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--card-border)', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{r.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.email}</div>
                                </div>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 50, background: 'rgba(108,99,255,0.15)', color: 'var(--primary)' }}>{r.source}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {form.client_email && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                        <div>
                          <label style={labelStyle}>Nom</label>
                          <input style={inputStyle} value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} required />
                        </div>
                        <div>
                          <label style={labelStyle}>Email</label>
                          <input style={{ ...inputStyle, borderColor: 'var(--primary)' }} type="email" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} required />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div>
                    <label style={labelStyle}>Services concernés</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {[{ v: 'site_web', l: 'Site web' }, { v: 'agent_ia', l: 'Agent IA' }, { v: 'carte_nfc', l: 'Carte NFC' }, { v: 'autre', l: 'Autre' }].map(({ v, l }) => {
                        const active = form.service_types.includes(v);
                        return (
                          <button key={v} type="button"
                            onClick={() => setForm(f => ({ ...f, service_types: active ? f.service_types.filter(s => s !== v) : [...f.service_types, v] }))}
                            style={{ padding: '7px 16px', borderRadius: 50, border: '1.5px solid', cursor: 'pointer', fontSize: '0.83rem', fontWeight: active ? 700 : 400,
                              borderColor: active ? 'var(--primary)' : 'var(--card-border)',
                              background:  active ? 'rgba(108,99,255,0.15)' : 'var(--dark-3)',
                              color:       active ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {active ? '✓ ' : ''}{l}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prestations */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Prestations *</label>
                      <button type="button" onClick={() => setShowCatalog(v => !v)}
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        {showCatalog ? '▲ Masquer' : '▼ Catalogue'}
                      </button>
                    </div>
                    {showCatalog && (
                      <div style={{ background: 'var(--dark-3)', borderRadius: 10, padding: 14, marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {CATALOG.map(cat => (
                          <div key={cat.category}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{cat.category}</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {cat.items.map(item => (
                                <button key={item.label} type="button" onClick={() => addCatalogItem(item.label, item.amount, item.billing)}
                                  style={{ padding: '5px 12px', borderRadius: 50, border: '1px solid var(--card-border)', background: 'var(--dark-2)', color: 'var(--text)', cursor: 'pointer', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {item.label}
                                  {item.amount != null
                                    ? <span style={{ color: 'var(--primary)', fontWeight: 700 }}>${item.amount}{item.note || ''}</span>
                                    : <span style={{ color: 'var(--text-faint)' }}>{item.note}</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {form.items.map((item, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 110px 28px', gap: 6, alignItems: 'center' }}>
                          <input style={inputStyle} placeholder="Description de la prestation" value={item.description}
                            onChange={e => updateItem(i, 'description', e.target.value)} />
                          <input style={{ ...inputStyle, textAlign: 'right' }} placeholder="0.00" type="number" step="0.01" min="0" value={item.amount}
                            onChange={e => updateItem(i, 'amount', e.target.value)} />
                          <select style={{ ...inputStyle, padding: '10px 6px', fontSize: '0.75rem', cursor: 'pointer',
                            color: item.billing === 'monthly' ? 'var(--secondary)' : item.billing === 'annual' ? 'var(--gold, #D4A843)' : 'var(--text-muted)' }}
                            value={item.billing} onChange={e => updateBilling(i, e.target.value as BillingType)}>
                            <option value="one_time">Unique</option>
                            <option value="monthly">Mensuel</option>
                            <option value="annual">Annuel</option>
                          </select>
                          {form.items.length > 1 && (
                            <button type="button" onClick={() => removeItem(i)}
                              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '1.1rem' }}>×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" onClick={addItem}
                        style={{ background: 'none', border: '1px dashed var(--card-border)', borderRadius: 8, padding: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>
                        + Ajouter une prestation
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={labelStyle}>Notes / Conditions particulières</label>
                    <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' as const }}
                      placeholder="Ex : Prix valable sous réserve d'un cahier des charges validé..."
                      value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                  </div>

                  {/* Total */}
                  {formTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Total estimé</span>
                      <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>${formTotal.toFixed(2)} <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontWeight: 400 }}>USD</span></span>
                    </div>
                  )}

                  {formError && <p style={{ color: 'var(--accent)', fontSize: '0.82rem', margin: 0 }}>{formError}</p>}

                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button type="button" className="btn btn-outline" onClick={closeModal} style={{ flex: 1 }}>Annuler</button>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 2 }}>
                      {saving ? 'Envoi en cours...' : 'Créer & envoyer par email'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', background: 'var(--dark-3)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' };
