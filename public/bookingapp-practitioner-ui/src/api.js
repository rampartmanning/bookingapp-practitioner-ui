import settings from '@/settings.js';

export default {
  getApiHeaders: async () => {
    return {
        'x-api-key': settings.apiKey,
    };
  },    
  getApiUrl: (path) => {
    return settings.apiUrl + path;
  },
  prepareDateOnly(dt) {
    return new Date(dt).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
  },
  prepareDateTime(dt) {
    let d = new Date(dt).toISOString();
    return d.slice(0, -1) + '+00:00';
  }
}