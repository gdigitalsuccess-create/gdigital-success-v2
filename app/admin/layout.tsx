'use client';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const NAV = [
  { href: '/admin',                 icon: '◈', label: 'Vue globale'    },
  { href: '/admin/clients',         icon: '◍', label: 'Clients'        },
  { href: '/admin/leads',           icon: '◎', label: 'Leads'          },
  { href: '/admin/cartes',          icon: '▣', label: 'Cartes NFC'     },
  { href: '/admin/agents',          icon: '◉', label: 'Agents IA'      },
  { href: '/admin/conversations',   icon: '◫', label: 'Conversations'  },
  { href: '/admin/devis',           icon: '◑', label: 'Devis'          },
  { href: '/admin/facturation',     icon: '◐', label: 'Facturation'    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

  async function handleLogout() {
    await fetch('/api/admin-auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <Image src="/assets/logo.png" alt="G+Digital Success" width={110} height={36} style={{ objectFit: 'contain' }} />
          <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: 6 }}>Dashboard Admin</p>
        </div>

        <nav className="admin-sidebar-nav">
          {NAV.map(({ href, icon, label }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`admin-nav-link${active ? ' active' : ''}`}>
                <span className="admin-nav-icon">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-nav-link"
            style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left' }}
          >
            <span className="admin-nav-icon">⎋</span>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}
