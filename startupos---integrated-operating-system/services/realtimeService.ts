
// Simulates a Socket.io client
type Listener = (data: any) => void;

class RealtimeService {
  private listeners: Map<string, Listener[]> = new Map();
  private interval: any;

  constructor() {
    this.startSimulation();
  }

  // Subscribe to an event (e.g., 'new_order', 'server_alert')
  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Publish an event (used internally or to simulate incoming server events)
  emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  // Simulate "Server Push" events
  private startSimulation() {
    // Random user activity
    setInterval(() => {
      const activities = [
        { type: 'USER_LOGIN', user: 'sarah_scale', time: 'Just now' },
        { type: 'NEW_LEAD', user: 'System', time: 'Just now', details: 'New lead: TechCorp ($12k)' },
        { type: 'TASK_COMPLETE', user: 'mike_dev', time: 'Just now', details: 'Deployed v2.1' }
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      this.emit('activity', randomActivity);
    }, 15000); // Every 15 seconds

    // Random alerts
    setInterval(() => {
        if (Math.random() > 0.8) {
            this.emit('alert', { level: 'warning', message: 'High API latency detected in US-East' });
        }
    }, 30000);
  }
}

export const realtime = new RealtimeService();
