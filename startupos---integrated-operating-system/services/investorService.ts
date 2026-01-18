
import { Investor, FundingRound, PitchDeck } from '../types';
import { db } from './localStorageDb';

const SEED_INVESTORS: Investor[] = [
  { id: '1', name: 'Sarah Ventures', firm: 'Redwood Capital', status: 'DUE_DILIGENCE', checkSize: '$500k', lastContact: '2 days ago', notes: 'Asking for cohort analysis.' },
  { id: '2', name: 'Mike Angel', firm: 'Angel Syndicate', status: 'COMMITTED', checkSize: '$50k', lastContact: '1 week ago', notes: 'Signed SAFE.' },
  { id: '3', name: 'Global Tech Fund', firm: 'GTF', status: 'MEETING', checkSize: '$1M', lastContact: 'Yesterday', notes: 'Intro via LinkedIn.' },
  { id: '4', name: 'Early Bird', firm: 'Avian VC', status: 'PROSPECT', checkSize: 'Unknown', lastContact: 'Never', notes: 'Top target for Series A.' },
];

const SEED_ROUND: FundingRound = {
  id: 'r1',
  name: 'Seed Round',
  targetAmount: 2000000,
  raisedAmount: 450000,
  preMoneyValuation: 8000000,
  status: 'OPEN'
};

export const getInvestors = async (): Promise<Investor[]> => {
  return db.get<Investor[]>('investors', SEED_INVESTORS);
};

export const addInvestor = async (investor: Investor): Promise<Investor[]> => {
    return db.addItem('investors', investor, SEED_INVESTORS);
};

export const updateInvestorDetails = async (id: string, updates: Partial<Investor>): Promise<Investor[]> => {
    const items = db.get<Investor[]>('investors', SEED_INVESTORS);
    const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
    db.set('investors', updated);
    return updated;
};

export const deleteInvestor = async (id: string): Promise<Investor[]> => {
    return db.deleteItem('investors', id, SEED_INVESTORS);
};

export const getCurrentRound = async (): Promise<FundingRound> => {
  return db.get<FundingRound>('round', SEED_ROUND);
};

export const updateInvestorStatus = async (id: string, status: string): Promise<void> => {
    db.updateItem('investors', id, { status: status as any }, SEED_INVESTORS);
};

// --- PITCH DECKS ---

export const getPitchDecks = async (): Promise<PitchDeck[]> => {
    return db.get<PitchDeck[]>('pitch_decks', []);
};

export const savePitchDeck = async (deck: PitchDeck): Promise<PitchDeck[]> => {
    const decks = db.get<PitchDeck[]>('pitch_decks', []);
    // Check if deck exists to update, else add
    const exists = decks.some(d => d.id === deck.id);
    if (exists) {
        const updated = decks.map(d => d.id === deck.id ? deck : d);
        db.set('pitch_decks', updated);
        return updated;
    } else {
        return db.addItem('pitch_decks', deck, []);
    }
};

export const deletePitchDeck = async (id: string): Promise<PitchDeck[]> => {
    return db.deleteItem('pitch_decks', id, []);
};