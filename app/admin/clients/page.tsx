'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/* ─── Types ─────────────────────────────────────────────── */
type Client = {
  id: string;
  name: string;
  email: string;
  services: string[];
  totalPaid: number;
  invoiceCount: number;
  lastInvoice: string | null;
  hasAgentIA: boolean;
  hasCarteNFC: boolean;
  cartePlan: string | null;
};

const FX: Record<string, number> = {
  USD: 1, EUR: 0.93, XOF: 655, XAF: 655,
  MAD: 10.5, NGN: 1580, GHS: 15.5, KES: 130, ZAR: 18.5, AED: 3.67,
};
function toUSD(amount: number, currency: string): number {
  return amount / (FX[currency] || 1);
}

const SERVICE_COLORS: Record<string, string> = {
  'Agent IA':   'rgba(167,139,250,0.15)',
  'Carte NFC':  'rgba(62,207,207,0.12)',
  'Site web':   'rgba(108,99,255,0.12)',
  'Maintenance':'rgba(212,168,67,0.12)',
};
const SERVICE_TEXT: Record<string, string> = {
  'Agent IA':   '#A78BFA',
  'Carte NFC':  'var(--secondary)',
  'Site web':   'var(--primary)',
  'Maintenance':'var(--gold, #D4A843)',
};

/* ═════════════════════════════════════════════════════════ */
export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterService, setFilterService] = useState('all');

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);

    const [invoicesRes, carteRes, agentsRes] = await Promise.all([
      supabase.from('invoices').select('client_name, client_email, amount, currency, status, service_type, created_at'),
      supabase.from('carte_profiles').select('full_name, email, plan, active'),
      fetch('/api/admin-agent?path=admin/clients-list').then(r => r.ok ? r.json() : []).catch(() => []),
    ]);

    const invoices: { client_name: string; client_email: string; amount: number; currency: string; status: string; service_type: string | null; created_at: string }[] = invoicesRes.data || [];
    const cartes: { full_name: string; email: string; plan: string; active: boolean }[] = carteRes.data || [];
    const agents: { business_name: string; contact_email: string; active: boolean }[] = Array.isArray(agentsRes) ? agentsRes : [];

    /* Construire la map clients par email */
    const map = new Map<string, Client>();

    function getOrCreate(email: string, name: string): Client {
      if (!map.has(email)) {
        map.set(email, { id: email, name, email, services: [], totalPaid: 0, invoiceCount: 0, lastInvoice: null, hasAgentIA: false, hasCarteNFC: false, cartePlan: null });
      }
      return map.get(email)!;
    }

    /* Clients Agent IA */
    agents.forEach(a => {
      const c = getOrCreate(a.contact_email, a.business_name);
      if (!c.services.includes('Agent IA')) c.services.push('Agent IA');
      c.hasAgentIA = true;
    });

    /* Clients Carte NFC */
    cartes.forEach(carte => {
      const c = getOrCreate(carte.email, carte.full_name);
      if (!c.services.includes('Carte NFC')) c.services.push('Carte NFC');
      c.hasCarteNFC = true;
      c.cartePlan   = carte.plan;
    });

    /* Factures — enrichir les clients + créer les ponctuel */
    invoices.forEach(inv => {
      const c = getOrCreate(inv.client_email, inv.client_name);
      c.invoiceCount++;
      if (inv.status === 'paid') c.totalPaid += toUSD(inv.amount || 0, inv.currency || 'USD');
      if (!c.lastInvoice || inv.created_at > c.lastInvoice) c.lastInvoice = inv.created_at;
      const serviceTypes = (inv.service_type || '').split(',').filter(Boolean);
      serviceTypes.forEach(s => {
        const label = s === 'site_web' ? 'Site web' : s === 'agent_ia' ? 'Agent IA' : s === 'carte_nfc' ? 'Carte NFC' : s === 'maintenance' ? 'Maintenance' : null;
        if (label && !c.services.includes(label)) c.services.push(label);
      });
    });

    setClients([...map.values()].sort((a, b) => b.totalPaid - a.totalPaid));
    setLoading(false);
  }

  const allServices = ['Agent IA', 'Carte NFC', 'Site web', 'Maintenance'];

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
    if (filterService !== 'all' && !c.services.includes(filterService)) return false;
    return true;
  });

  const totalRevenue = clients.reduce((s, c) => s + c.totalPaid, 0);

  /* ═════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Clients</h1>
          <p className="admin-subtitle">{clients.length} client{clients.length > 1 ? 's' : ''} · ${totalRevenue.toLocaleString()} encaissé au total</p>
        </div>
        <button className="btn btn-outline" onClick={loadClients} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
      </div>

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '8px 14px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none', minWidth: 220 }}
          placeholder="Rechercher par nom ou email..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <button onClick={() => setFilterService('all')} style={chipStyle(filterService === 'all')}>Tous</button>
        {allServices.map(s => (
          <button key={s} onClick={() => setFilterService(s)} style={chipStyle(filterService === s)}>{s}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Chargement...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>Aucun client trouvé.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(client => (
            <div key={client.id} style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>

              {/* Avatar */}
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(108,99,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'var(--primary)', flexShrink: 0 }}>
                {client.name.charAt(0).toUpperCase()}
              </div>

              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 2 }}>{client.name}</div>
                <div style={{ fontSize: '0.77rem', color: 'var(--text-muted)' }}>{client.email}</div>
              </div>

              {/* Badges services */}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flexShrink: 0 }}>
                {client.services.map(s => (
                  <span key={s} style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px', borderRadius: 50,
                    background: SERVICE_COLORS[s] || 'rgba(108,99,255,0.1)',
                    color: SERVICE_TEXT[s] || 'var(--primary)',
                  }}>
                    {s}{s === 'Carte NFC' && client.cartePlan ? ` · ${client.cartePlan}` : ''}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 100 }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: client.totalPaid > 0 ? '#22C55E' : 'var(--text-muted)' }}>
                  ${client.totalPaid.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>
                  {client.invoiceCount} facture{client.invoiceCount > 1 ? 's' : ''}
                </div>
              </div>

              {/* Dernière activité */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', flexShrink: 0, minWidth: 70, textAlign: 'right' }}>
                {client.lastInvoice ? new Date(client.lastInvoice).toLocaleDateString('fr-FR') : '—'}
              </div>

              {/* Action */}
              <Link href={`/admin/facturation?name=${encodeURIComponent(client.name)}&email=${encodeURIComponent(client.email)}`}>
                <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px', flexShrink: 0 }}>
                  + Facture
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '7px 16px', borderRadius: 50, border: '1px solid', cursor: 'pointer',
    borderColor: active ? 'var(--primary)' : 'var(--card-border)',
    background:  active ? 'rgba(108,99,255,0.1)' : 'transparent',
    color:       active ? 'var(--primary)' : 'var(--text-muted)',
    fontSize: '0.82rem', fontWeight: 600,
  };
}
