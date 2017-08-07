<template lang='jade'>
div
  h3 Chart
  div#highchart
</template>

<script>

import _ from 'lodash'
import Vue from 'vue'
import * as Highcharts from 'highcharts/highstock'

// import { post } from '../../../tools/ajax'
// import spinner from '../../global/blockSpinner.vue'
// import dataset from '../../global/mixins/dataset'

export default {
  props: ['candles'],
  components: {
    // spinner
  },
  data: () => {
    return {
      chart: null
      // setIndex: -1,
      // customTo: false,
      // customFrom: false,
      // rangeVisible: false,
      // importCandleSize: 1,
      // importCandleSizeUnit: 'minutes',
      // set: false
    };
  },
  // mixins: [ dataset ],
  methods: {
    // humanizeDuration: (n) => {
    //   return window.humanizeDuration(n, {largest: 4});
    // },
    // fmt: mom => mom.utc().format('YYYY-MM-DDTHH:mm'),
  },
  mounted () {
    console.log('charts mounted')
    this.chart = Highcharts.stockChart({
      chart: {
        renderTo: 'highchart',
        zoomType: 'x'
      },
      rangeSelector: {
        selected: 1
      },
      title: {
        text: `Trades`
      },
      yAxis: [{ // Primary yAxis
        opposite: false,
        title: {
          text: 'Trade',
          style: {
            color: Highcharts.getOptions().colors[0]
          }
        }
      }],
      series: [{
        name: `Trade`,
        id: 'trades',
        data: this.candles.map((candle) => [candle.timestampMs, candle.open]),
        color: Highcharts.getOptions().colors[0],
        tooltip: {
          valueDecimals: 2
        }
      }]
    })

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
