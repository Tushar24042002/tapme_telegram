const  TelegramBot=  require('node-telegram-bot-api');
const  { createClient } =  require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_API_KEY);

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

type Message = {
    chat: {
      id: number;
    };
    from?: {
      id: number;
      username?: string;
    };
  };
  
// Handle /start command
bot.onText(/\/start/, async (msg: Message) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id.toString() || ''; // Use Telegram user ID as a unique identifier
    const userName = msg.from?.username || 'User';
  
    // Insert or update user in the Supabase database
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, username: userName }, { onConflict: ['id'] })
      .single();
  
    if (error) {
      console.error('Error inserting/updating user:', error);
      bot.sendMessage(chatId, 'There was an error initializing your profile.');
      return;
    }
  
    // Send a welcome message with a link to the game
    const reply = `Welcome to TapMe, ${userName}! Click the link below to start playing:`;
    const gameLink = 'https://your-web-app-url.com'; // Replace with your deployed web app URL
  
    bot.sendMessage(chatId, `${reply}\n${gameLink}`);
  });
  
  console.log('Bot is running...');