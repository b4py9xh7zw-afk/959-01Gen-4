import app from './app.js';
import expiryCheckScheduler from './cron/expiryCheck.js';
import traceService from './services/TraceService.js';

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  
  setTimeout(() => {
    traceService.generateMockData();
    console.log('模拟数据生成完成');
  }, 1000);
  
  expiryCheckScheduler.start();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  expiryCheckScheduler.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  expiryCheckScheduler.stop();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
