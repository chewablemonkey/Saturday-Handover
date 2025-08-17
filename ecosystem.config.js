export default {
  apps: [{
    name: 'synergy-dev',
    script: 'npm',
    args: 'run dev',
    cwd: '/home/user/webapp',
    watch: false,
    env: {
      NODE_ENV: 'development'
    }
  }]
};