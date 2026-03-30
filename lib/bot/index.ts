import { createPostgresState } from '@chat-adapter/state-pg';
import { createTelegramAdapter } from '@chat-adapter/telegram';
import { Chat } from 'chat';

const telegram = createTelegramAdapter({
  mode: 'webhook',
});

export const bot = new Chat({
  userName: 'project_hermes_bot',
  adapters: { telegram },
  state: createPostgresState(),
});

void bot.initialize();

bot.onNewMention(async (thread, message) => {
  await thread.subscribe();
  await thread.post(`You said: ${message.text}`);
});

bot.onSubscribedMessage(async (thread, message) => {
  if (message.isMention) {
    // User @-mentioned us in a thread we're already watching
  }
  await thread.post(`Got: ${message.text}`);
});
