
import { SynapseGeneration, ProductFeature, MarketingCampaign, Investor } from '../types';
import { db } from './localStorageDb';

// Keys must match those used in respective services
const PRODUCT_KEY = 'product_features';
const MARKETING_KEY = 'marketing_campaigns';
const INVESTOR_KEY = 'investors';

export const applySynapseData = (data: SynapseGeneration) => {
    // 1. Inject Product Features
    const currentFeatures = db.get<ProductFeature[]>(PRODUCT_KEY, []);
    const newFeatures: ProductFeature[] = data.productFeatures.map((f, i) => ({
        id: Date.now() + i,
        name: f.name,
        status: 'Backlog',
        priority: f.priority
    }));
    db.set(PRODUCT_KEY, [...currentFeatures, ...newFeatures]);

    // 2. Inject Marketing Campaigns
    const currentCampaigns = db.get<MarketingCampaign[]>(MARKETING_KEY, []);
    const newCampaigns: MarketingCampaign[] = data.marketingHooks.map((h, i) => ({
        id: `synapse_${Date.now()}_${i}`,
        name: h.name,
        status: 'DRAFT',
        channel: h.channel,
        budget: '0',
        performance: '-'
    }));
    db.set(MARKETING_KEY, [...currentCampaigns, ...newCampaigns]);

    // 3. Inject Investors
    const currentInvestors = db.get<Investor[]>(INVESTOR_KEY, []);
    const newInvestors: Investor[] = data.investorMatches.map((inv, i) => ({
        id: `synapse_${Date.now()}_${i}`,
        name: inv.name,
        firm: inv.firm,
        status: 'PROSPECT',
        checkSize: 'Unknown',
        lastContact: 'Never',
        notes: `Synapse Match: ${inv.notes}`
    }));
    db.set(INVESTOR_KEY, [...currentInvestors, ...newInvestors]);
    
    return {
        featuresCount: newFeatures.length,
        campaignsCount: newCampaigns.length,
        investorsCount: newInvestors.length
    };
};
