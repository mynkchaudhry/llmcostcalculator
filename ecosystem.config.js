module.exports = {
  apps: [
    {
      name: 'llmcostcalculator',
      script: 'npm',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logging configuration
      log_file: '/home/akshay_siraswar/.pm2/logs/llmcostcalculator-combined.log',
      out_file: '/home/akshay_siraswar/.pm2/logs/llmcostcalculator-out.log',
      error_file: '/home/akshay_siraswar/.pm2/logs/llmcostcalculator-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart configuration
      min_uptime: '10s',
      max_restarts: 10,
      
      // Advanced configuration
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Environment file
      env_file: '.env'
    }
  ]
};