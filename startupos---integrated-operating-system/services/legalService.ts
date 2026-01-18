
import { LegalDoc } from '../types';
import { db } from './localStorageDb';

const DEFAULT_DOCS: LegalDoc[] = [
    { id: '1', title: 'Mutual NDA', type: 'Contract', status: 'FINAL', lastModified: '2 days ago' },
    { id: '2', title: 'IP Assignment', type: 'Agreement', status: 'SIGNED', lastModified: '1 week ago' },
    { id: '3', title: 'Advisor Agreement', type: 'Contract', status: 'DRAFT', lastModified: 'Just now' },
];

export const getDocuments = async (): Promise<LegalDoc[]> => {
    return db.get<LegalDoc[]>('legal_docs', DEFAULT_DOCS);
};

export const addDocument = async (doc: LegalDoc): Promise<LegalDoc[]> => {
    return db.addItem('legal_docs', doc, DEFAULT_DOCS);
};

export const deleteDocument = async (id: string): Promise<LegalDoc[]> => {
    return db.deleteItem('legal_docs', id, DEFAULT_DOCS);
};
