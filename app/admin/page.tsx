'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/* ─── Types ─────────────────────────────────────────────── */
type Stats = {
  leadsTotal: number; leadsNew: number;
  cartesActives: number; cartesTotal: number;
  agentsActifs: number; agentsTotal: number;
  revenusMonth: number; revenusTotal: number;
  facturesImpayees: number; facturesEnAttente: number;
};

type Renewal = {
  invoice_number: string;
  client_name: string;
  client_email: string;
  amount: number;
  subscription_end: string;
  daysLeft: number;
};

type RecentLead = { id: string; name: string; email: string; status: string; created_at: string };
type RecentInvoice = { invoice_number: string; client_name: string; amount: number; currency: string; status: string; created_at: string };

/* Taux de change fixes (1 USD = X unités) */
const FX: Record<string, number> = {
  USD: 1, EUR: 0.93, XOF: 655, XAF: 655,
  MAD: 10.5, NGN: 1580, GHS: 15.5, KES: 130, ZAR: 18.5, AED: 3.67,
};
function toUSD(amount: number, currency: string): number {
  const rate = FX[currency] || 1;
  return amount / rate;
}

/* ═════════════════════════════════════════════════════════ */
export default function AdminOverview() {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [recentLeads, setRecentLeads]     = useState<RecentLead[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    const now      = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const in30     = new Date(now.getTime() + 30 * 86400000).toISOString();

    const [leads, cartes, invoicesRes, agentsRes] = await Promise.all([
      supabase.from('leads').select('id, name, email, status, created_at').order('created_at', { ascending: false }),
      supabase.from('carte_profiles').select('id, active'),
      supabase.from('invoices').select('invoice_number, client_name, client_email, amount, currency, status, created_at, subscription_end'),
      fetch('/api/admin-agent?path=admin/clients-usage').then(r => r.ok ? r.json() : []).catch(() => []),
    ]);

    const leadsData    = leads.data    || [];
    const cartesData   = cartes.data   || [];
    const invoicesData = invoicesRes.data || [];
    const clientsData: { active?: boolean }[] = Array.isArray(agentsRes) ? agentsRes : [];

    /* Stats — montants convertis en USD */
    const revenusMonth = invoicesData
      .filter((i: { status: string; created_at: string }) => i.status === 'paid' && i.created_at >= firstDay)
      .reduce((s: number, i: { amount: number; currency: string }) => s + toUSD(i.amount || 0, i.currency || 'USD'), 0);
    const revenusTotal = invoicesData
      .filter((i: { status: string }) => i.status === 'paid')
      .reduce((s: number, i: { amount: number; currency: string }) => s + toUSD(i.amount || 0, i.currency || 'USD'), 0);

    setStats({
      leadsTotal:        leadsData.length,
      leadsNew:          leadsData.filter((l: { status: string }) => l.status === 'new').length,
      cartesActives:     cartesData.filter((c: { active: boolean }) => c.active).length,
      cartesTotal:       cartesData.length,
      agentsActifs:      clientsData.filter(c => c.active).length,
      agentsTotal:       clientsData.length,
      revenusMonth,
      revenusTotal,
      facturesImpayees:  invoicesData.filter((i: { status: string }) => i.status === 'unpaid').length,
      facturesEnAttente: invoicesData.filter((i: { status: string }) => i.status === 'sent').length,
    });

    /* Renouvellements dans les 30 prochains jours */
    const upcoming = invoicesData
      .filter((i: { subscription_end: string | null; status: string }) =>
        i.subscription_end && i.subscription_end <= in30 && i.subscription_end >= now.toISOString() && i.status === 'paid'
      )
      .map((i: { invoice_number: string; client_name: string; client_email: string; amount: number; subscription_end: string }) => ({
        ...i,
        daysLeft: Math.ceil((new Date(i.subscription_end).getTime() - now.getTime()) / 86400000),
      }))
      .sort((a: Renewal, b: Renewal) => a.daysLeft - b.daysLeft);
    setRenewals(upcoming);

    /* Derniers leads */
    setRecentLeads(leadsData.slice(0, 4));

    /* Dernières factures */
    const sorted = [...invoicesData].sort((a: { created_at: string }, b: { created_at: string }) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setRecentInvoices(sorted.slice(0, 4));

    setLoading(false);
  }

  const CARDS = stats ? [
    {
      icon: '◎', label: 'Leads', color: 'var(--primary)',
      value: stats.leadsTotal, sub: `${stats.leadsNew} nouveau${stats.leadsNew > 1 ? 'x' : ''}`,
      href: '/admin/leads',
    },
    {
      icon: '▣', label: 'Cartes NFC', color: 'var(--secondary)',
      value: stats.cartesActives, sub: `${stats.cartesTotal} au total`,
      href: '/admin/cartes',
    },
    {
      icon: '◉', label: 'Clients Agent IA', color: '#A78BFA',
      value: stats.agentsActifs, sub: `${stats.agentsTotal} au total`,
      href: '/admin/agents',
    },
    {
      icon: '◐', label: 'Revenus ce mois', color: 'var(--gold, #D4A843)',
      value: `$${stats.revenusMonth.toLocaleString()}`,
      sub: `$${stats.revenusTotal.toLocaleString()} au total · ${stats.facturesImpayees + stats.facturesEnAttente} en attente`,
      href: '/admin/facturation',
    },
  ] : [];

  const STATUS_LABELS: Record<string, string> = {
    new: 'Nouveau', contacted: 'Contacté', converted: 'Converti', lost: 'Perdu',
  };
  const STATUS_CLASS: Record<string, string> = {
    new: 'status-new', contacted: 'status-contacted', converted: 'status-converted', lost: 'status-lost',
  };
  const INV_STATUS_LABELS: Record<string, string> = {
    paid: 'Payée', sent: 'Envoyée', unpaid: 'Impayée', cancelled: 'Annulée',
  };
  const INV_STATUS_CLASS: Record<string, string> = {
    paid: 'status-converted', sent: 'status-contacted', unpaid: 'status-new', cancelled: 'status-lost',
  };

  /* ═════════════════════════════════════════════════════════ */
  return (
    <>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Vue globale</h1>
          <p className="admin-subtitle">
            G+Digital Success — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button className="btn btn-outline" onClick={loadAll} style={{ fontSize: '0.82rem' }}>↻ Actualiser</button>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 64 }}>Chargement...</p>
      ) : (
        <>
          {/* ── Stat cards ── */}
          <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
            {CARDS.map(card => (
              <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
                <div className="admin-stat-card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = card.color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--card-border)')}>
                  <div className="admin-stat-icon" style={{ color: card.color }}>{card.icon}</div>
                  <div className="admin-stat-value" style={{ color: card.color }}>{card.value}</div>
                  <div className="admin-stat-label">{card.label}</div>
                  {card.sub && <div className="admin-stat-sub">{card.sub}</div>}
                </div>
              </Link>
            ))}
          </div>

          {/* ── Alertes renouvellements ── */}
          {renewals.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{
                  background: renewals.some(r => r.daysLeft <= 7) ? 'rgba(239,68,68,0.15)' : 'rgba(212,168,67,0.15)',
                  color: renewals.some(r => r.daysLeft <= 7) ? '#ef4444' : 'var(--gold, #D4A843)',
                  fontWeight: 700, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 50,
                }}>
                  {renewals.some(r => r.daysLeft <= 7) ? '⚠ Urgent' : '↻ Renouvellements'}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  {renewals.length} abonnement{renewals.length > 1 ? 's' : ''} à renouveler dans les 30 jours
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {renewals.map(r => (
                  <div key={r.invoice_number} style={{
                    background: 'var(--dark-2)', border: `1px solid ${r.daysLeft <= 7 ? 'rgba(239,68,68,0.4)' : 'rgba(212,168,67,0.3)'}`,
                    borderRadius: 'var(--radius-sm)', padding: '12px 20px',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div style={{
                      minWidth: 52, textAlign: 'center', borderRadius: 8,
                      background: r.daysLeft <= 7 ? 'rgba(239,68,68,0.1)' : 'rgba(212,168,67,0.1)',
                      padding: '6px 4px',
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: r.daysLeft <= 7 ? '#ef4444' : 'var(--gold, #D4A843)', lineHeight: 1 }}>
                        {r.daysLeft}
                      </div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginTop: 2 }}>jour{r.daysLeft > 1 ? 's' : ''}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.client_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.client_email} · expire le {new Date(r.subscription_end).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gold, #D4A843)', flexShrink: 0 }}>
                      ${r.amount?.toLocaleString()}
                    </div>
                    <Link href="/admin/facturation" style={{ flexShrink: 0 }}>
                      <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
                        Renouveler
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Grille infos ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Derniers leads */}
            <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Derniers leads</span>
                <Link href="/admin/leads" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Voir tout →</Link>
              </div>
              {recentLeads.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aucun lead pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentLeads.map(lead => (
                    <div key={lead.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</div>
                      </div>
                      <span className={`status-badge ${STATUS_CLASS[lead.status] || 'status-new'}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                        {STATUS_LABELS[lead.status] || lead.status}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', flexShrink: 0 }}>
                        {new Date(lead.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dernières factures */}
            <div style={{ background: 'var(--dark-2)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dernières factures</span>
                <Link href="/admin/facturation" style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>Voir tout →</Link>
              </div>
              {recentInvoices.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Aucune facture pour l'instant.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recentInvoices.map(inv => (
                    <div key={inv.invoice_number} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.client_name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{inv.invoice_number}</div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: inv.status === 'paid' ? '#22C55E' : 'var(--text)', flexShrink: 0 }}>
                        {inv.currency && inv.currency !== 'USD' ? (
                          <>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>{inv.currency} </span>
                            {Math.round(inv.amount).toLocaleString()}
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontWeight: 400 }}> ≈ ${Math.round(toUSD(inv.amount, inv.currency))}</span>
                          </>
                        ) : (
                          `$${inv.amount?.toLocaleString()}`
                        )}
                      </span>
                      <span className={`status-badge ${INV_STATUS_CLASS[inv.status] || 'status-new'}`} style={{ fontSize: '0.65rem', flexShrink: 0 }}>
                        {INV_STATUS_LABELS[inv.status] || inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
