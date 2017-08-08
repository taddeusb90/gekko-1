<template lang='jade'>
  div
    h2.contain Backtest
    .hr.contain
    config-builder(v-on:config='check', v-on:previewCandles='previewCandles')

    a(name='highchart')
    div.contain.my2(v-if='candleFetch')
      div(v-if='candleFetch === "fetching"')
        div Fetching data...
      chart(v-if='candleFetch === "fetched"', :candles='candles', :dataset='config.dataset', v-on:useCustomTimerange='useCustomTimerange', v-on:resetCustomTimerange='resetCustomTimerange')
      .hr

    div(v-if='backtestable')
      .txt--center
        a.w100--s.my1.btn--blue(href='#', v-if='backtestState !== "fetching"', v-on:click.prevent='run') Backtest
        div(v-if='backtestState === "fetching"').scan-btn
          p Running backtest..
          spinner
    result(v-if='backtestResult && backtestState === "fetched"', :result='backtestResult')
</template>

<script>
import configBuilder from './backtestConfigBuilder.vue'
import chart from '../global/configbuilder/chart.vue'

import result from './result/result.vue'

import { post } from '../../tools/ajax'
import spinner from '../global/blockSpinner.vue'

export default {
  data: () => {
    return {
      backtestable: false,
      backtestState: 'idle',
      backtestResult: false,
      config: false,

      // timerange set by selection in chart
      customTimerange: {},

      // data preview
      candleFetch: null,
      candles: []
    }
  },
  methods: {
    fmt: mom => moment.utc(mom).format('YYYY-MM-DD HH:mm'),
    check: function(config) {
      // console.log('CHECK', config);
      this.config = config;

      if(!config.valid)
        return this.backtestable = false;

      this.backtestable = true;
    },
    run: function() {
      this.backtestState = 'fetching';
      if (this.customTimerange && this.customTimerange.fromTimestampMs) {
        this.config.backtest.daterange.from = moment(this.customTimerange.fromTimestampMs).format()
      }
      if (this.customTimerange && this.customTimerange.toTimestampMs) {
        this.config.backtest.daterange.to = moment(this.customTimerange.toTimestampMs).format()
      }
      const req = {
        gekkoConfig: this.config,
        data: {
          candleProps: ['close', 'start'],
          indicatorResults: true,
          report: true,
          roundtrips: true,
          trades: true
        }
      }

      post('backtest', req, (error, response) => {
        this.backtestState = 'fetched';
        this.backtestResult = response;
      });
    },

    useCustomTimerange: function(timerange) {
      console.log('useCustomTimerange', timerange);
      this.customTimerange = timerange
      console.log('useCustomTimerange this.customTimerange', this.customTimerange);
    },

    resetCustomTimerange: function() {
      console.log('resetCustomTimerange')
      this.customTimerange = {}
    },

    previewCandles: function() {
      console.log('backtester getcandles')
      this.getCandles();
    },

    getCandles: function() {
      this.candleFetch = 'fetching';

      let from = this.fmt(this.config.dataset.from);
      let to = this.fmt(this.config.dataset.to);
      let candleSize = this.config.dataset.candleSize;

      let config = {
          watch: {
            exchange: this.config.dataset.exchange,
            currency: this.config.dataset.currency,
            asset: this.config.dataset.asset
          },
          daterange: {
            to, from
          },
          candleSize
        };

      console.log('getCandles config:', config)
      post('getCandles', config, (err, res) => {
        this.candleFetch = 'fetched';
        // // todo
        if(!res || res.error || !_.isArray(res)) {
          console.log('getCandles api error:', res);
          return;
        }

        console.log('candles received:', res)
        this.candles = res.map(c => {
          c.timestampMs = c.start * 1000
          c.start = moment.unix(c.start).utc().format();
          return c;
        });
      })
    }
  },
  components: {
    configBuilder,
    result,
    spinner,
    chart
  }
}
</script>

<style>
.contain {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
</style>
