// Server Configuration
// Update this IP address to match your computer's IP address
// You can find your IP by running: ifconfig | grep "inet " | grep -v 127.0.0.1

export const SERVER_CONFIG = {
  // Your computer's IP address (found using ifconfig command)
  SERVER_IP: '192.168.1.86',
  SERVER_PORT: 3000,
  
  // API Base URL
  get API_BASE_URL() {
    return `http://${this.SERVER_IP}:${this.SERVER_PORT}/api/v1`;
  },
  
  // Socket.IO URL
  get SOCKET_URL() {
    return `http://${this.SERVER_IP}:${this.SERVER_PORT}`;
  },
  
  // Timeout settings
  TIMEOUT: 10000,
  
  // Reconnection settings
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
};

// Development vs Production settings
export const isDevelopment = __DEV__;

// Use localhost for development on simulator, IP for physical device
export const getServerUrl = () => {
  if (isDevelopment) {
    return SERVER_CONFIG.SERVER_IP;
  }
  // In production, you would use your actual server domain
  return 'your-production-domain.com';
}; 