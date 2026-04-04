import { createPostgresState } from '@chat-adapter/state-pg';
import { createTelegramAdapter } from '@chat-adapter/telegram';

const telegram = createTelegramAdapter({
  mode: 'webhook',
});

export const adapters = { telegram };

export const state = createPostgresState();
