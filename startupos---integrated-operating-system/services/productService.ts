
import { ProductFeature } from '../types';
import { db } from './localStorageDb';

const SEED_FEATURES: ProductFeature[] = [
    { id: 1, name: 'Auth System', status: 'Done', priority: 'High' },
    { id: 2, name: 'Billing Integration', status: 'In Progress', priority: 'High' },
    { id: 3, name: 'Mobile App', status: 'Backlog', priority: 'Medium' },
    { id: 4, name: 'Dark Mode', status: 'Backlog', priority: 'Low' },
    { id: 5, name: 'API Rate Limiting', status: 'In Progress', priority: 'High' },
];

export const getFeatures = async (): Promise<ProductFeature[]> => {
    return db.get<ProductFeature[]>('product_features', SEED_FEATURES);
};

export const updateFeatureStatus = async (id: string | number, status: ProductFeature['status']): Promise<ProductFeature[]> => {
    // Determine type of ID to match correctly
    const features = db.get<ProductFeature[]>('product_features', SEED_FEATURES);
    const updated = features.map(f => f.id == id ? { ...f, status } : f);
    db.set('product_features', updated);
    return updated;
};

export const updateFeatureDetails = async (id: string | number, updates: Partial<ProductFeature>): Promise<ProductFeature[]> => {
    const features = db.get<ProductFeature[]>('product_features', SEED_FEATURES);
    const updated = features.map(f => f.id == id ? { ...f, ...updates } : f);
    db.set('product_features', updated);
    return updated;
};

export const deleteFeature = async (id: string | number): Promise<ProductFeature[]> => {
    const features = db.get<ProductFeature[]>('product_features', SEED_FEATURES);
    const updated = features.filter(f => f.id != id); // Loose equality to handle string/number id mix
    db.set('product_features', updated);
    return updated;
};

export const addFeature = async (feature: ProductFeature): Promise<ProductFeature[]> => {
    return db.addItem('product_features', feature, SEED_FEATURES);
};
