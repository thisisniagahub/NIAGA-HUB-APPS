
import { LaborMarketData } from '../types';

// In a production app, this would fetch from https://auth.emsicloud.com/connect/token and then query the API
export const getLaborMarketData = async (role: string, location: string): Promise<LaborMarketData> => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Dynamic Mock Data Generation based on inputs to make it feel real
    const baseSalary = role.toLowerCase().includes('senior') ? 140000 : 
                       role.toLowerCase().includes('manager') ? 130000 : 95000;
    
    const locMultiplier = location.toLowerCase().includes('san francisco') ? 1.4 :
                          location.toLowerCase().includes('new york') ? 1.3 :
                          location.toLowerCase().includes('austin') ? 1.1 : 0.9;

    const median = Math.floor(baseSalary * locMultiplier);

    return {
        role,
        location,
        medianSalary: median,
        postingVolume: Math.floor(Math.random() * 5000) + 500,
        growthRate: parseFloat((Math.random() * 20 - 5).toFixed(1)), // -5% to +15%
        topSkills: ['JavaScript', 'React', 'Project Management', 'Communication', 'Python', 'Agile Methodologies'],
        salaryPercentiles: {
            p10: Math.floor(median * 0.7),
            p50: median,
            p90: Math.floor(median * 1.4)
        }
    };
};
