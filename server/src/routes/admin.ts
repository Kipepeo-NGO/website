import { Router } from 'express';
import { z } from 'zod';
import { ApplicationStatus, Role, InfoRequestStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { env } from '../config/env';
import { sendMail } from '../services/mailer';
import crypto from 'node:crypto';

const adminRouter = Router();

adminRouter.use(requireAuth, requireRole([Role.ADMIN]));

adminRouter.get('/people', async (_req, res) => {
  const people = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
  return res.json(people);
});

adminRouter.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      memberProfile: true,
      volunteerApp: true,
      travelerApp: true,
      donations: true,
    },
  });
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  return res.json(user);
});

adminRouter.get('/volunteer-apps', async (_req, res) => {
  const apps = await prisma.volunteerApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(apps);
});

adminRouter.get('/traveler-apps', async (_req, res) => {
  const apps = await prisma.travelerApplication.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(apps);
});

adminRouter.get('/member-profiles', async (_req, res) => {
  const profiles = await prisma.memberProfile.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json(profiles);
});

adminRouter.get('/donations', async (_req, res) => {
  const mode = (_req.query.mode as string) || 'summary';
  const donations = await prisma.donation.findMany({ orderBy: { createdAt: 'desc' } });
  if (mode === 'list') {
    return res.json(
      donations.map((d) => ({
        ...d,
      }))
    );
  }
  const grouped = donations
    .filter((donation) => donation.status !== 'PENDING')
    .reduce<Record<string, any>>((acc, donation) => {
      const key = donation.email || `anon-${donation.id}`;
      if (!acc[key]) {
        acc[key] = {
          donorName: donation.donorName || 'Anónimo',
          email: donation.email,
          totalAmount: 0,
          count: 0,
          lastDonation: null as Date | null,
        };
      }
      acc[key].totalAmount += donation.amount;
      acc[key].count += 1;
      if (!acc[key].lastDonation || donation.createdAt > acc[key].lastDonation) {
        acc[key].lastDonation = donation.createdAt;
      }
      return acc;
    }, {});
  return res.json(Object.values(grouped));
});

adminRouter.get('/info-requests', async (_req, res) => {
  const requests = await prisma.infoRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      respondedBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
  return res.json(requests);
});

adminRouter.get('/member-contributions', async (req, res) => {
  const { email, userId } = req.query as { email?: string; userId?: string };
  const where: any = {};
  if (email) where.email = email as string;
  if (userId) where.userId = userId as string;
  const donations = await prisma.donation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return res.json(donations);
});

const donationStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED']),
});

adminRouter.patch('/donations/:id/status', async (req, res) => {
  const { id } = req.params;
  const parsed = donationStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Datos inválidos', issues: parsed.error.flatten() });
  }
  try {
    const updated = await prisma.donation.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return res.json(updated);
  } catch (error) {
    console.error('Error updating donation status', error);
    return res.status(500).json({ message: 'No se pudo actualizar la donación' });
  }
});

const infoRequestStatusSchema = z.object({
  status: z.nativeEnum(InfoRequestStatus),
});

adminRouter.patch('/info-requests/:id/status', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'ID requerido' });
  }
  const parsed = infoRequestStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Datos inválidos', issues: parsed.error.flatten() });
  }
  const nextStatus = parsed.data.status;
  try {
    const updated = await prisma.infoRequest.update({
      where: { id: String(id) },
      data:
        nextStatus === InfoRequestStatus.RESPONDED
          ? { status: nextStatus, respondedAt: new Date(), respondedById: req.user!.id }
          : { status: nextStatus, respondedAt: null, respondedById: null },
      include: {
        respondedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
    return res.json(updated);
  } catch (error) {
    console.error('Error updating info request status', error);
    return res.status(500).json({ message: 'No se pudo actualizar la solicitud' });
  }
});

const decideSchema = z.object({
  entityType: z.enum(['member', 'volunteer', 'traveler', 'MEMBER', 'VOLUNTEER', 'TRAVELER']),
  entityId: z.string().uuid(),
  approve: z.boolean(),
  notes: z.string().optional(),
});

adminRouter.post('/decide', async (req: AuthenticatedRequest, res) => {
  const parsed = decideSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Datos inválidos', issues: parsed.error.flatten() });
  }

  const { entityId, approve, notes } = parsed.data;
  const normalizedType = parsed.data.entityType.toLowerCase() as 'member' | 'volunteer' | 'traveler';
  const action = approve ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED;

  const map = {
    member: () => prisma.memberProfile.update({ where: { id: entityId }, data: { status: action } }),
    volunteer: () => prisma.volunteerApplication.update({ where: { id: entityId }, data: { status: action } }),
    traveler: () => prisma.travelerApplication.update({ where: { id: entityId }, data: { status: action } }),
  };

  const updater = map[normalizedType];
  if (!updater) {
    return res.status(400).json({ message: 'Tipo no soportado' });
  }

  const record = await updater();

  await prisma.approvalLog.create({
    data: {
      adminId: req.user!.id,
      entityType: normalizedType,
      entityId,
      action,
      notes: notes ?? null,
    },
  });

  if (approve) {
    let email: string;
    let role: Role;
    let name: string;
    if (normalizedType === 'member' && 'email' in record) {
      email = record.email;
      role = Role.MEMBER;
      name = `${record.firstName} ${record.lastName}`;
    } else if (normalizedType === 'volunteer' && 'email' in record) {
      email = record.email;
      role = Role.VOLUNTEER;
      name = `${record.firstName} ${record.lastName}`;
    } else if (normalizedType === 'traveler' && 'email' in record) {
      email = record.email;
      role = Role.TRAVELER;
      name = `${record.firstName} ${record.lastName}`;
    } else {
      return res.json({ status: action });
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + env.INVITE_EXPIRATION_HOURS * 3600 * 1000);
    await prisma.invitation.create({
      data: {
        email,
        role,
        token,
        expiresAt,
      },
    });

    const inviteLink = `${env.FRONTEND_URL.replace(/\/$/, '')}/registro?email=${encodeURIComponent(email)}&role=${role}&token=${token}`;
    await sendMail(
      email,
      'Tu acceso a Kipepeo',
      `<p>Hola ${name},</p><p>Tu solicitud ha sido aprobada. Completa tu registro en <a href="${inviteLink}">${inviteLink}</a>.</p>`
    );
  } else {
    if ('email' in record) {
      await sendMail(
        record.email,
        'Estado de tu solicitud Kipepeo',
        `<p>Hola ${record.firstName},</p><p>Tu solicitud ha sido revisada. Motivo: ${notes ?? 'Sin detalles'}.</p>`
      );
    }
  }

  return res.json({ status: action });
});

export { adminRouter };
