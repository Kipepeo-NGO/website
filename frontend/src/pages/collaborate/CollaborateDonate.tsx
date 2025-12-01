import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { useSectionScroll } from '@/hooks/useSectionScroll';

export default function CollaborateDonate({ meta }: { meta?: any }) {
  const sectionId = 'colabora-dona';
  useSectionScroll(sectionId);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    setError(null);
    try {
      const donorName = `${firstName} ${lastName}`.trim();
      const message = [`Quiero hacer una donación.`, phone ? `Teléfono: ${phone}` : null]
        .filter(Boolean)
        .join(' ');
      await apiFetch('/donations', {
        method: 'POST',
        body: JSON.stringify({
          donorName,
          email,
          amount: 0,
          currency: 'EUR',
          method: 'manual',
          message,
        }),
      });
      setFeedback('Solicitud de donación registrada. Te contactaremos para completar el proceso.');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setError(err?.message || 'No pudimos registrar la donación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id={sectionId} className="section space-y-10 scroll-mt-32">
      <div
        className="rounded-3xl p-8 shadow-lg border border-white/60"
        style={{ background: 'var(--brand-gradient-soft)' }}
      >
        <p className="text-xs uppercase tracking-[0.3em] font-semibold" style={{ color: 'var(--brand-primary)' }}>
          💛 {meta?.breadcrumb || 'Dona ahora'}
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-3" style={{ color: 'var(--brand-text)' }}>
          {meta?.h1}
        </h1>
        <p className="text-lg mt-4" style={{ color: 'var(--brand-text)' }}>
          Puedes donar sin registrarte o, si lo prefieres, unirte a la familia Kipepeo para seguir el impacto de cerca.
          Tú eliges cómo participar.
        </p>
        <p className="text-lg" style={{ color: 'var(--brand-text)' }}>
          Cada aportación sostiene becas, alimentación, internado, materiales y formación docente en Kipepeo.
        </p>
        <a href="#form-donar" className="btn-primary mt-6 inline-flex items-center gap-2">
          Dona ahora
        </a>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="card space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-primary)' }}>
              💝 Cómo donar sin registrarte
            </p>
            <ul className="space-y-3 text-base" style={{ color: 'var(--brand-text)' }}>
              <li>
                <p className="font-semibold">Bizum</p>
                <p className="font-mono text-sm">Código ONG: 12985</p>
              </li>
              <li>
                <p className="font-semibold">PayPal</p>
                <a
                  href="https://www.paypal.com/ncp/payment/5J5BL2VJF2NTE"
                  className="text-[color:var(--brand-primary)] underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  https://www.paypal.com/ncp/payment/5J5BL2VJF2NTE
                </a>
              </li>
              <li>
                <p className="font-semibold">Transferencia bancaria</p>
                <div className="space-y-1 text-sm">
                  <p className="font-mono">IBAN: ES62 2100 4735 3702 0018 8894</p>
                  <p className="font-mono">BIC: CAIXESBBXXX</p>
                  <p>Titulares: Asoc Kipepeo</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-primary)' }}>
              🦋 Únete a la familia Kipepeo
            </p>
            <p style={{ color: 'var(--brand-text)' }}>
              Si quieres seguir el impacto, recibir actualizaciones y formar parte de la comunidad, puedes registrarte
              como donante y te informaremos de todo.
            </p>
            <Link to="/colabora/ser-socio" className="btn-secondary inline-flex w-fit">
              Hazte socio/a
            </Link>
          </div>

          <div className="card space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-primary)' }}>
              💬 Por qué?
            </p>
            <p style={{ color: 'var(--brand-text)' }}>
              Con tu donación sembramos oportunidades: construimos aulas, formamos docentes y abrimos caminos hacia un
              futuro mejor. Tu ayuda cambia vidas hoy y prepara el mañana para cientos de niñas y niños en Tanzania.
            </p>
          </div>
        </div>

        <form
          id="form-donar"
          className="card space-y-4 shadow-xl border border-white/80"
          style={{ background: 'var(--brand-surface)' }}
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
              Nombre
            </label>
            <input
              id="firstName"
              className="w-full border rounded-xl p-3 mt-1"
              placeholder="Tu nombre"
              autoComplete="name"
              required
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
              Apellidos
            </label>
            <input
              id="lastName"
              className="w-full border rounded-xl p-3 mt-1"
              placeholder="Tus apellidos"
              autoComplete="family-name"
              required
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="donorEmail" className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              id="donorEmail"
              className="w-full border rounded-xl p-3 mt-1"
              placeholder="nombre@ejemplo.com"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="donorPhone" className="block text-sm font-semibold text-gray-700">
              Teléfono
            </label>
            <input
              id="donorPhone"
              className="w-full border rounded-xl p-3 mt-1"
              placeholder="+255 700 000 000"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          {feedback && (
            <p className="text-sm" style={{ color: 'var(--brand-primary)' }}>
              {feedback}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button className="btn-primary w-full" type="submit" disabled={submitting}>
            {submitting ? 'Registrando…' : 'Enviar solicitud de donación'}
          </button>
        </form>
      </div>
    </section>
  );
}
