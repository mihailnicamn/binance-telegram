require('dotenv').config();
const filesystem = require('fs');
const Binance = require('node-binance-api');
const binance = new Binance().options({
  APIKEY: process.env.BINANCE_API_KEY,
  APISECRET: process.env.BINANCE_API_SECRET,
});

async function getPostions(){
    const positions = await binance.futuresPositionRisk();
    const postionsString =  positions.filter(position => position.positionAmt != 0).map(position => {
        if(position.positionSide == 'LONG'){
            return `Bought ${Math.abs(position.positionAmt)} ${position.symbol} at ${position.entryPrice}, current price is ${position.markPrice} with a PnL of ${position.unRealizedProfit}`
        }
        if(position.positionSide == 'SHORT'){
            return `Sold ${Math.abs(position.positionAmt)} ${position.symbol} at ${position.entryPrice}, current price is ${position.markPrice} with a PnL of ${position.unRealizedProfit}`
        }
    });
    const desc = `You have ${postionsString.length} open positions with a total PnL of ${positions.reduce((acc, position) => acc + parseFloat(position.unRealizedProfit), 0)}`
    return [desc, postionsString];

    
}
async function getPosition(symbol){
    const positions = await binance.futuresPositionRisk();
    const position = positions.filter(position => position.symbol == symbol);
    if(position.length == 0){
        return `Invalid symbol ${symbol}`;
    }
    if(position[0].positionAmt!=0){
    if(position[0].positionSide == 'LONG'){
        return `Bought ${Math.abs(position[0].positionAmt)} ${position[0].symbol} at ${position[0].entryPrice}, current price is ${position[0].markPrice} with a PnL of ${position[0].unRealizedProfit}`
    }
    if(position[0].positionSide == 'SHORT'){
        return `Sold ${Math.abs(position[0].positionAmt)} ${position[0].symbol} at ${position[0].entryPrice}, current price is ${position[0].markPrice} with a PnL of ${position[0].unRealizedProfit}`
    }
}else{
    return `You don't have any open positions for ${symbol}`
}
}
async function getPositionInfo(symbol){
    const data =  await binance.futuresOpenOrders(symbol)
    const positions = await binance.futuresPositionRisk();
    const position = positions.filter(position => position.symbol == symbol);
    const orders = data.map(order => {
        if(order.positionSide=="LONG" && order.side=="SELL"){
            return [order.price,`TP sell ${order.origQty} ${symbol} at ${order.price}`]
        }
        if(order.positionSide=="LONG" && order.side=="BUY"){
            return [order.price, `DCA buy ${order.origQty} ${symbol} at ${order.price}`]
        }
        if(order.positionSide=="SHORT" && order.side=="BUY"){
            return [order.price, `TP buy ${order.origQty} ${symbol} at ${order.price}`]
        }
        if(order.positionSide=="SHORT" && order.side=="SELL"){
            return [order.price, `DCA sell ${order.origQty} ${symbol} at ${order.price}`]
        }
    });

    const res_be = [];
    const res_af = [];
    orders.forEach(order => {
        if(order[0] > position[0].entryPrice){
            res_be.push(order[1]);
        }
        if(order[0] < position[0].entryPrice){
            res_af.push(order[1]);
        }
    });
    return res_be.concat(position[0].positionSide == 'LONG' ? `Bought ${Math.abs(position[0].positionAmt)} ${position[0].symbol} at ${position[0].entryPrice}, current price is ${position[0].markPrice} with a PnL of ${position[0].unRealizedProfit}` : `Sold ${Math.abs(position[0].positionAmt)} ${position[0].symbol} at ${position[0].entryPrice}, current price is ${position[0].markPrice} with a PnL of ${position[0].unRealizedProfit}`, res_af);
}
module.exports = {
    getPostions,
    getPosition,
    getPositionInfo
}