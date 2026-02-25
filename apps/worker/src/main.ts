import 'dotenv/config';
import { Worker } from 'bullmq';
const connection = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

const worker = new Worker(
  'axentrait-default',
  async (job) => {
    console.log(`Processing job ${job.id} (${job.name})`);
    return { ok: true };
  },
  { connection },
);

worker.on('ready', () => {
  console.log('Worker is ready');
});

worker.on('error', (error) => {
  console.error('Worker error', error);
});
