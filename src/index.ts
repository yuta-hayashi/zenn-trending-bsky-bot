import Bot from "./lib/bot.js";
import getPostText from "./lib/getPostText.js";

const text = await Bot.run(getPostText, {
  dryRun: process.env.NODE_ENV === 'development',
})

console.log(`[${new Date().toISOString()}] Posted: "${JSON.stringify(text)}"`)
