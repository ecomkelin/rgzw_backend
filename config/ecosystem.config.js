module.exports = {
  apps: [{
    name: 'rgzw_plat',
    script: './src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'dev',
    },
    env_production: {
      NODE_ENV: 'production',
    },
    error_file: './logs/pm2-err.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
  }],
};