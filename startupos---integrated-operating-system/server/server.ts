
import express, { Request, Response, NextFunction } from 'express';
// @ts-ignore
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { generateToken, authenticateToken } from './utils/auth.js';
import { uploadToS3 } from './utils/s3.js';

// Initialize
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(helmet() as any);
// Use JSON parser for everything except the stripe webhook which needs raw body (handled later if needed)
// For this scaffold, we stick to json globally for simplicity
app.use(express.json({ limit: '5mb' }) as any); 

// --- UTILS ---
const asyncHandler = (fn: Function) => (req: any, res: any, next: NextFunction) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// --- ROUTES ---

// Health Check
app.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// --- AUTHENTICATION ---

app.post('/api/auth/login', asyncHandler(async (req: any, res: any) => {
  const { email, password } = req.body;

  // 1. Find User
  let user = await prisma.user.findUnique({ where: { email } });

  // Mock Admin seeding for Dev if DB is empty/user missing
  if (!user && email === 'admin@startupos.com' && password === 'admin123') {
     // Ensure company exists
     let company = await prisma.company.findFirst({ where: { name: 'StartupOS Demo' } });
     if (!company) {
         company = await prisma.company.create({ data: { name: 'StartupOS Demo' } });
     }
     
     user = await prisma.user.create({
         data: {
             email,
             name: 'Admin User',
             role: 'ADMIN',
             companyId: company.id
         }
     });
  } else if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
  }

  // In production: Verify password hash (e.g. bcrypt.compare)
  // if (!await bcrypt.compare(password, user.passwordHash)) ...

  const token = generateToken(user);
  res.json({ user, token });
}));

app.get('/api/auth/me', authenticateToken, asyncHandler(async (req: any, res: any) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json(user);
}));

// --- FILES (S3) ---

app.post('/api/files/upload', authenticateToken, upload.single('file'), asyncHandler(async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const key = `company_${req.user.companyId}/${Date.now()}_${req.file.originalname}`;
    const url = await uploadToS3(req.file, key);

    // Optional: Save file metadata to DB
    // await prisma.document.create(...)

    res.json({ success: true, url, name: req.file.originalname });
}));

// --- STRIPE WEBHOOKS ---

app.post('/api/webhooks/stripe', asyncHandler(async (req: any, res: any) => {
    const event = req.body;

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const clientReferenceId = session.client_reference_id; // Pass companyId here during checkout
        
        console.log(`[Stripe] Payment success for Company ${clientReferenceId}`);
        
        // Update DB
        /*
        await prisma.subscription.update({
            where: { companyId: clientReferenceId },
            data: { status: 'ACTIVE', plan: 'GROWTH' }
        });
        */
    }

    res.json({ received: true });
}));

// --- DATA MIGRATION ---

app.post('/api/v1/migrate', asyncHandler(async (req: any, res: any) => {
  const { companyName, investors, deals, features } = req.body;
  
  // 1. Create Company
  const company = await prisma.company.create({
    data: {
      name: companyName || 'My Startup',
      users: {
        create: {
          email: `admin-${Date.now()}@startupos.io`,
          name: 'Admin User',
          role: 'FOUNDER'
        }
      }
    }
  });

  // 2. Batch Operations
  const results = await prisma.$transaction([
    // Investors
    ...investors.map((inv: any) => prisma.investor.create({
        data: {
            name: inv.name,
            firm: inv.firm,
            status: inv.status,
            checkSize: inv.checkSize,
            companyId: company.id
        }
    })),
    // Sales Deals
    ...deals.map((deal: any) => prisma.salesDeal.create({
        data: {
            companyName: deal.company,
            leadName: deal.leadName,
            value: Number(deal.value),
            stage: deal.stage,
            probability: Number(deal.probability),
            companyId: company.id
        }
    })),
    // Product Features
    ...features.map((feat: any) => prisma.productFeature.create({
        data: {
            name: feat.name,
            status: feat.status,
            priority: feat.priority,
            companyId: company.id
        }
    }))
  ]);

  res.json({ success: true, companyId: company.id, recordsCreated: results.length });
}));

// --- API RESOURCES ---

app.get('/api/v1/investors', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const investors = await prisma.investor.findMany({ where: { companyId: req.user.companyId } });
  res.json(investors);
}));

app.post('/api/v1/investors', authenticateToken, asyncHandler(async (req: any, res: any) => {
  const newInvestor = await prisma.investor.create({ 
      data: { ...req.body, companyId: req.user.companyId } 
  });
  res.json(newInvestor);
}));

// Error Handling
app.use((err: Error, req: any, res: any, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 StartupOS Server running on port ${PORT}`);
});