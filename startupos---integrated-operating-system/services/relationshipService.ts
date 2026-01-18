
import { db } from './localStorageDb';
import { ProductFeature, StrategicGoal, FounderArchetype } from '../types';

export type EntityType = 'FEATURE' | 'IDEA' | 'GOAL' | 'CAMPAIGN';

export interface EntitySummary {
    id: string | number;
    name: string;
    type: EntityType;
}

export const getEntitySummary = (type: EntityType, id: string | number): EntitySummary | null => {
    let item: any;
    
    switch(type) {
        case 'FEATURE':
            const features = db.get<ProductFeature[]>('product_features', []);
            item = features.find(f => f.id == id);
            return item ? { id: item.id, name: item.name, type } : null;
        case 'IDEA':
            const ideas = db.get<FounderArchetype[]>('saved_ideas', []);
            item = ideas.find(i => i.id == id);
            return item ? { id: item.id, name: item.title, type } : null;
        case 'GOAL':
            const goals = db.get<StrategicGoal[]>('strategy_goals', []);
            item = goals.find(g => g.id == id);
            return item ? { id: item.id, name: item.title, type } : null;
        default:
            return null;
    }
};

export const getAvailableEntities = (type: EntityType): EntitySummary[] => {
    switch(type) {
        case 'FEATURE':
            return db.get<ProductFeature[]>('product_features', []).map(f => ({ id: f.id, name: f.name, type }));
        case 'IDEA':
            return db.get<FounderArchetype[]>('saved_ideas', []).map(i => ({ id: i.id!, name: i.title, type }));
        case 'GOAL':
            return db.get<StrategicGoal[]>('strategy_goals', []).map(g => ({ id: g.id, name: g.title, type }));
        default:
            return [];
    }
};
