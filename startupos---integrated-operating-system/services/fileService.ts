
const getApiUrl = () => {
    // Safely access import.meta.env for Vite environments
    // Cast to any to avoid TypeScript strict checks on import.meta structure if types aren't loaded
    const env = (import.meta as any).env;
    return env?.VITE_API_URL || 'http://localhost:3000';
};

const API_URL = getApiUrl();

export const uploadFile = async (file: File): Promise<{ url: string, name: string }> => {
    const token = localStorage.getItem('startupos_token');
    if (!token) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        throw new Error('File upload failed');
    }

    return response.json();
};
