import { Router } from 'express';
import { z } from 'zod';
import { DonationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../utils/jwt';

const donationRouter = Router();

const donationSchema = z.object({
  donorName: z.string().min(2),
  email: z.string().email().optional(),
  amount: z.number().nonnegative().optional(),
  currency: z.string().default('EUR'),
  project: z.string().optional(),
  method: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED']).optional(),
});

donationRouter.post('/', async (req, res) => {
  const parsed = donationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Datos inválidos', issues: parsed.error.flatten() });
  }

  try {
    const payload = parsed.data;
    const amount = payload.amount ?? 0;
    let userId: string | null = null;
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.slice(7);
      try {
        const payloadToken = verifyToken(token);
        userId = payloadToken.sub;
      } catch (error) {
        // token inválido: continuamos sin asociar usuario
      }
    }
    const donationData: any = {
      donorName: payload.donorName,
      email: payload.email ?? null,
      amount,
      currency: payload.currency ?? 'EUR',
      project: payload.project ?? null,
      method: payload.method ?? null,
      message: payload.message ?? null,
      status: (payload.status as DonationStatus | undefined) ?? DonationStatus.CONFIRMED,
    };
    if (userId) {
      donationData.userId = userId;
    }
    const donation = await prisma.donation.create({ data: donationData });
    return res.status(201).json({ ok: true, id: donation.id });
  } catch (error) {
    console.error('Donation error', error);
    return res.status(500).json({ message: 'No se pudo registrar la donación' });
  }
});

export { donationRouter };
