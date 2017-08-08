// helpers
var _ = require('lodash');
var log = require('../core/log.js');

// configuration
var config = require('../core/util.js').getConfig();
var settings = config.DDEMA;

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function() {
  this.name = 'DDEMA';
//   this.tickResultAxis =

  this.tickResult = null;

  this.currentTrend;
  this.lastBuySellStatus = 'sell';
  this.lastBuyDiff = 0.0;

  this.dpCount = 0;
  this.requiredHistory = config.tradingAdvisor.historySize;

  console.log('DDEMA settings', settings)

  // define the indicators we need
  this.addTalibIndicator('demaShort', 'dema', {
    optInTimePeriod: settings.short
  });
  this.addTalibIndicator('demaLong', 'dema', {
    optInTimePeriod: settings.long
  });
}

// what happens on every new candle?
method.update = function(candle) {
  this.dpCount += 1;
//   console.log('dpCount', this.dpCount)
}

// for debugging purposes: log the last calculated EMAs and diff.
method.log = function() {
  var dema = this.indicators.dema;

  log.debug('calculated DDEMA properties for candle:');
  log.debug('\t', 'long ema:', dema.long.result.toFixed(8));
  log.debug('\t', 'short ema:', dema.short.result.toFixed(8));
  log.debug('\t diff:', dema.result.toFixed(5));
  log.debug('\t DEMA age:', dema.short.age, 'candles');
}

method.check = function(candle) {
  var short = this.talibIndicators.demaShort.result.outReal;
  var long = this.talibIndicators.demaLong.result.outReal;
//   console.log('talib dema result4:', this.talibIndicators.dema4)
//   console.log('talib dema result4:', result4)

//   const short = _.last(result4)
//   const long = _.last(result8)
  if (!short || !long) {
    return
  }

  var price = candle.close;
  const diff = 100 * (short - long) / ((short + long) / 2)
  this.tickResult = diff;
//   console.log(`short=${short}, long=${long}, price=${price}, diff=${diff}, cnt=${this.dpCount}`)

  var message = '@ ' + price.toFixed(8) + ' (' + diff.toFixed(5) + ')';

  if (diff > 0.2 && (this.lastBuySellStatus !== 'buy' || diff > this.lastBuyDiff)) {
    console.log('buy', price, `short=${short}, long=${long}, diff=${diff}`)
    this.lastBuySellStatus = 'buy'
    this.lastBuyDiff = diff
    console.log('BUY')
    this.advice('long');
    return;
  } else {
    if (diff < -0.2 && this.lastBuySellStatus !== 'sell') {
      console.log('sell', price, `short=${short}, long=${long}, diff=${diff}`)
      this.lastBuySellStatus = 'sell'
      console.log('SELL')
      this.advice('short');
      return;
    }
  }

  this.advice();
}

module.exports = method;
