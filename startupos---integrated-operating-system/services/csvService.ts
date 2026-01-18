
/**
 * Converts an array of objects to CSV format and triggers a browser download.
 * @param data Array of objects to export
 * @param filename Name of the file (without .csv extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        console.warn('No data to export');
        return;
    }

    // 1. Extract Headers
    const headers = Object.keys(data[0]);
    
    // 2. Convert Data to CSV String
    const csvRows = [
        headers.join(','), // Header row
        ...data.map(row => 
            headers.map(header => {
                const escaped = ('' + (row[header] || '')).replace(/"/g, '\\"');
                return `"${escaped}"`;
            }).join(',')
        )
    ];
    
    const csvString = csvRows.join('\n');

    // 3. Trigger Download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
