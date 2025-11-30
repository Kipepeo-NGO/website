import { useEffect, useMemo, useState } from 'react';
import RequireRole from '@/components/auth/RequireRole';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

type Donation = {
  id: string;
  amount: number;
  currency: string;
  project?: string | null;
  status?: 'PENDING' | 'CONFIRMED';
  createdAt: string;
};

export default function MemberArea() {
  const { user, token } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const annualFee = 30;

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<{ ok: boolean; user: { donations?: Donation[] } }>('/profile/me', { token });
      setDonations(response.user.donations || []);
    } catch (err: any) {
      setError(err?.message || 'No pudimos cargar tus contribuciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [token]);

  const totalConfirmed = useMemo(
    () => donations.filter((d) => d.status === 'CONFIRMED').reduce((sum, d) => sum + d.amount, 0),
    [donations]
  );

  const handleRegisterFee = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch('/donations', {
        method: 'POST',
        token,
        body: JSON.stringify({
          donorName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Socio/a Kipepeo',
          email: user?.email,
          amount: annualFee,
          currency: 'EUR',
          project: 'Cuota de socio',
          method: 'transferencia',
          message: 'Concepto: cuota de socio',
          status: 'PENDING',
        }),
      });
      setShowPaymentInfo(false);
      loadProfile();
    } catch (err: any) {
      setError(err?.message || 'No pudimos registrar tu cuota.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireRole roles={['MEMBER']}>
      <section className="section space-y-6">
        <header className="space-y-2">
          <p className="uppercase text-xs tracking-[0.3em]" style={{ color: 'var(--brand-primary)' }}>
            Bienvenido/a a Kipepeo
          </p>
          <h1 className="text-3xl font-semibold">Hola, {user?.firstName}</h1>
          <p className="text-[color:var(--brand-muted)]">
            Gracias por ser parte de la comunidad. Desde aquí puedes registrar tu cuota anual y ver tus contribuciones.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white shadow border border-white/70 p-4">
            <p className="text-sm text-[color:var(--brand-muted)]">Total aportado (confirmado)</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--brand-primary)' }}>
              {totalConfirmed.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </p>
          </div>
          <div className="rounded-2xl bg-white shadow border border-white/70 p-4 flex flex-col gap-2">
            <p className="text-sm text-[color:var(--brand-muted)]">Cuota anual</p>
            <p className="text-xl font-semibold">{annualFee.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
            <button className="btn-primary" type="button" onClick={() => setShowPaymentInfo(true)}>
              Registrar pago de cuota anual
            </button>
          </div>
          <div className="rounded-2xl bg-white shadow border border-white/70 p-4 flex flex-col gap-2">
            <p className="text-sm text-[color:var(--brand-muted)]">¿Quieres aportar más?</p>
            <button className="btn-secondary" type="button" onClick={() => (window.location.href = '/colabora/dona-ahora')}>
              Registrar otra donación
            </button>
          </div>
        </div>

        {showPaymentInfo && (
          <div className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-primary)' }}>
                  Cómo pagar la cuota
                </p>
                <p className="text-sm text-[color:var(--brand-muted)]">Concepto: Cuota de socio</p>
              </div>
              <button type="button" className="text-sm text-[color:var(--brand-muted)]" onClick={() => setShowPaymentInfo(false)}>
                Cerrar
              </button>
            </div>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--brand-text)' }}>
              <li>
                <strong>Bizum:</strong> Código ONG 12985
              </li>
              <li>
                <strong>Transferencia:</strong> IBAN ES62 2100 4735 3702 0018 8894 · BIC CAIXESBBXXX · Titulares Asoc Kipepeo
              </li>
              <li>
                <strong>PayPal:</strong>{' '}
                <a
                  href="https://www.paypal.com/ncp/payment/5J5BL2VJF2NTE"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-[color:var(--brand-primary)]"
                >
                  Abrir enlace
                </a>
              </li>
            </ul>
            <button className="btn-primary w-full" type="button" onClick={handleRegisterFee} disabled={submitting}>
              {submitting ? 'Registrando…' : 'Confirmo que he realizado el pago'}
            </button>
          </div>
        )}

        <div className="card space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-primary)' }}>
                Contribuciones
              </p>
              <p className="text-sm text-[color:var(--brand-muted)]">Tus cuotas y donaciones registradas</p>
            </div>
          </header>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {loading ? (
            <p className="text-sm text-[color:var(--brand-muted)]">Cargando...</p>
          ) : donations.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-[color:var(--brand-muted)]">
                    <th className="py-2 pr-4">Fecha</th>
                    <th className="py-2 pr-4">Concepto</th>
                    <th className="py-2 pr-4">Importe</th>
                    <th className="py-2 pr-4">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation.id} className="border-t border-white/60">
                      <td className="py-2 pr-4">{new Date(donation.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">{donation.project || 'Donación'}</td>
                      <td className="py-2 pr-4">
                        {donation.amount.toLocaleString('es-ES', { style: 'currency', currency: donation.currency || 'EUR' })}
                      </td>
                      <td className="py-2 pr-4">
                        {donation.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            ⓘ Pending · confirmando pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-600">✔ Confirmado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[color:var(--brand-muted)]">Todavía no registras contribuciones.</p>
          )}
        </div>
      </section>
    </RequireRole>
  );
}
