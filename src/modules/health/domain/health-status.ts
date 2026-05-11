export type HealthStatus = {
  environment: string;
  service: string;
  status: 'ok';
  timestamp: string;
  uptime: number;
};
