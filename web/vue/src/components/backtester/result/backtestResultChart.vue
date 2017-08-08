<template lang='jade'>
div
  h3 Backtest Result Chart
  div#resultHighchart
</template>

<script>

import _ from 'lodash'
import Vue from 'vue'
import * as Highcharts from 'highcharts/highstock'

// import { post } from '../../../tools/ajax'
// import spinner from '../../global/blockSpinner.vue'
// import dataset from '../../global/mixins/dataset'

export default {
  props: ['result'],
  components: {
    // spinner
  },
  data: () => {
    return {
      chart: null,
    };
  },
  // mixins: [ dataset ],
  methods: {
    // humanizeDuration: (n) => {
    //   return window.humanizeDuration(n, {largest: 4});
    // },
    humanizeTimestamp: timestamp => moment.utc(timestamp).format('YYYY-MM-DD HH:mm')
  },
  mounted () {
    console.log('backtest result chart mounted', this.result)
    const chartOptions = {
      chart: {
        renderTo: 'resultHighchart',
        zoomType: 'x'
      },
      rangeSelector: {
        selected: 1
      },
      title: {
        // text: `${this.dataset.asset}-${this.dataset.currency} Trades`
      },
      yAxis: [{ // Primary yAxis
        opposite: false,
        title: {
          text: `${this.result.report.asset}-${this.result.report.currency} Trades`,
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }
      }],
      series: [{
        name: `${this.result.report.asset}-${this.result.report.currency}`,
        id: 'trades',
        data: this.result.candles.map((candle) => [moment(candle.start).unix() * 1000, candle.close]),
        color: Highcharts.getOptions().colors[0],
        tooltip: {
          valueDecimals: 2
        }
      }],
      plotOptions: {
        series: {
          animation: false
        //   marker: {
        //     enabled: true
        //   }
        }
      }
    }

    for (let name in this.result.indicatorResults) {
      const indicator = this.result.indicatorResults[name]
      console.log('add indicator result for', name, indicator)
      let displayName = name + (indicator.talib ? ` (talib ${indicator.type})` : ` (${indicator.type})`)

      const color = Highcharts.getOptions().colors[chartOptions.yAxis.length];
      const yAxisId = `y${chartOptions.yAxis.length}`;
      const seriesId = `s${chartOptions.yAxis.length}`;

      // Add yAxis
      chartOptions.yAxis.push({
        id: yAxisId,
        gridLineWidth: 0,
        opposite: true,
        title: {
          text: displayName,
          style: {
            color: color
          }
        }
      })

      // Add Series
      chartOptions.series.push({
        name: displayName,
        id: seriesId,
        data: indicator.data.map((res) => [moment(res.date).unix() * 1000, res.result]),
        yAxis: yAxisId,
        lineWidth: 1,
        color: color,
        tooltip: {
          valueDecimals: 3
        }
      })
    }

    // Add Buy/Sell Flags
    const buySellFlags = this.result.trades.map((trade) => {
      const isBuy = trade.action === 'buy';
      let text = isBuy ? `Buy for ${trade.price}` : `Sell for ${trade.price}`
      return {
        x: moment(trade.date).unix() * 1000,
        title: isBuy ? 'B' : 'S',
        text,
        marker:{ fillColor: 'red'}
      }
    })
    const flagSeriesId = `f${chartOptions.yAxis.length}`;
    chartOptions.series.push({
      type: 'flags',
      id: flagSeriesId,
      data: buySellFlags,
      // onSeries: stratInstance.highcharts.dataSeriesId,
      onSeries: 'trades',
      // color: stratInstance.highcharts.color,
      // fillColor: stratInstance.highcharts.color
    })

    this.chart = Highcharts.stockChart(chartOptions)

  },
  watch: {
    // setIndex: function() {
    //   this.set = this.datasets[this.setIndex];

    //   this.updateCustomRange();

    //   this.emitSet(this.set);
    // },

    // customTo: function() { this.emitSet(this.set); },
    // customFrom: function() { this.emitSet(this.set); },
    // importCandleSize: function() { this.emitSet(this.set); },
    // importCandleSizeUnit: function() { this.emitSet(this.set); }
  }
}
</script>
<style>
td.radio {
  width: 45px;
}
td label{
  display: inline;
  font-size: 1em;
}
</style>
