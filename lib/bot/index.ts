import { createBot } from './chat';
import { registerMessageHandlers as registerHandlers } from './handlers/register';

// Create bot instance
const bot = createBot();

/**
 * Initialize bot with necessary caches and flow registrations.
 */
async function initializeBot() {
  try {
    // Register message handlers
    registerHandlers(bot);

    // Initialize bot
    await bot.initialize();
  } catch (error) {
    console.error('Failed to initialize bot:', error);
    throw error;
  }
}

// Initialize on startup
void initializeBot();

export { bot };
