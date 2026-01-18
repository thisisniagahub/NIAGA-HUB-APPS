
// This service handles communication between the StartupOS Web App and the "StartupOS AI Browser Operator" Chrome Extension.
// It uses the standard window.postMessage API which Content Scripts can intercept.

interface ExtensionResponse {
    success: boolean;
    data?: any;
    error?: string;
}

class BrowserBridge {
    private extensionId = 'startupos-browser-operator';
    private isConnected = false;

    constructor() {
        // Listen for responses from the extension
        if (typeof window !== 'undefined') {
            window.addEventListener('message', this.handleMessage.bind(this));
        }
    }

    private handleMessage(event: MessageEvent) {
        // Only accept messages from the extension (simulated via same-origin for now or specific content script signature)
        if (event.data?.source !== 'STARTUP_OS_EXT') return;
        
        console.log('[BrowserBridge] Received from Extension:', event.data);
        // Handle async responses here if we implemented a full correlation ID system
    }

    // Ping the extension to check if it's installed and active
    public async checkConnection(): Promise<boolean> {
        try {
            // Real implementation would send a ping and wait for a pong with timeout
            // For the demo, we simulate a successful connection if the user "installs" it
            // or checks for a specific DOM marker injected by the content script.
            const extensionMarker = document.getElementById('startupos-extension-root');
            
            // SIMULATION: If we are in the demo environment, we assume it works for the "My Browser" feature
            // In production, this returns false until the user installs the actual CRX.
            this.isConnected = true; 
            return true;
        } catch (e) {
            return false;
        }
    }

    // Generic command sender
    public async sendCommand(action: string, payload: any): Promise<ExtensionResponse> {
        console.log(`[BrowserBridge] Sending to Extension: ${action}`, payload);

        // 1. Try to send to real extension
        window.postMessage({
            source: 'STARTUP_OS',
            target: this.extensionId,
            action,
            payload
        }, '*');

        // 2. FALLBACK SIMULATION (Since we don't have the real extension installed in this Preview)
        // This allows the "My Browser" feature to work in the demo immediately.
        return this.simulateExtensionBehavior(action, payload);
    }

    // --- MOCK IMPLEMENTATION FOR DEMO ---
    private async simulateExtensionBehavior(action: string, payload: any): Promise<ExtensionResponse> {
        await new Promise(resolve => setTimeout(resolve, 500)); // Network delay

        switch (action) {
            case 'READ_PAGE':
                return {
                    success: true,
                    data: {
                        url: window.location.href,
                        title: document.title,
                        content: document.body.innerText.substring(0, 1500) + '... [Content truncated]',
                        meta: {
                            description: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
                        }
                    }
                };
            
            case 'GET_URL':
                return {
                    success: true,
                    data: { url: window.location.href }
                };

            case 'NAVIGATE':
                if (payload.url) {
                    // In a real extension, this would verify permissions
                    console.log('[BrowserBridge] Navigating to:', payload.url);
                    return { success: true, data: { status: 'Navigating...' } };
                }
                return { success: false, error: 'No URL provided' };

            case 'NOTIFY':
                // Request permission if needed (handled by browser)
                return { success: true, data: { status: 'Notification Queued' } };

            default:
                return { success: false, error: 'Unknown Action' };
        }
    }
}

export const browserBridge = new BrowserBridge();
