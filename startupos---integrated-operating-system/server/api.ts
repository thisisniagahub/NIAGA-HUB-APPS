// This file represents the Server-Side API Handler structure for Phase 3.
// In a real deployment, this would be your Express app or Next.js API Routes.

// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- Generic Handler Wrapper for Error Handling ---
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// --- API ROUTES ---

// 1. INVESTORS
export const getInvestors = asyncHandler(async (req: any, res: any) => {
  const investors = await prisma.investor.findMany({
    where: { companyId: req.user.companyId }
  });
  res.json(investors);
});

export const createInvestor = asyncHandler(async (req: any, res: any) => {
  const newInvestor = await prisma.investor.create({
    data: {
      ...req.body,
      companyId: req.user.companyId
    }
  });
  res.json(newInvestor);
});

// 2. SALES
export const getDeals = asyncHandler(async (req: any, res: any) => {
  const deals = await prisma.salesDeal.findMany({
    where: { companyId: req.user.companyId }
  });
  res.json(deals);
});

// 3. AUTH (Login)
export const loginUser = asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;
  // In production: Verify password hash (bcrypt)
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token here
  res.json({ user, token: 'mock_jwt_token' });
});

// --- SERVER SETUP (Example) ---
/*
import express from 'express';
const app = express();
app.use(express.json());

app.get('/api/investors', authMiddleware, getInvestors);
app.post('/api/investors', authMiddleware, createInvestor);
// ... more routes

app.listen(3000, () => console.log('Server running on port 3000'));
*/