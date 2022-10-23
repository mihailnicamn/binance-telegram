const { Telegraf } = require('telegraf');
const binance = require('./binance');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.command('positions', async (conv) => {
    const data = await binance.getPostions();
    conv.reply(data[0]);
    data[1].forEach(position => {
        conv.reply(position);
    });
});
bot.command('position', async (conv) => {
    let symbol = conv.message.text.split(' ')[1].toUpperCase();
    if(symbol.includes('PERP')){
        symbol = symbol.replace('PERP', '');
    }
    const data = await binance.getPosition(symbol);
    conv.reply(data);

});
bot.command('entry', async (conv) => {
    let symbol = conv.message.text.split(' ')[1].toUpperCase();
    if(symbol.includes('PERP')){
        symbol = symbol.replace('PERP', '');
    }
    const data = await binance.getPositionInfo(symbol);
    data.forEach(order => {
        conv.reply(order);
    });

});
bot.launch();