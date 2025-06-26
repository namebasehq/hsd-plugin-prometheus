'use strict';

const http = require('http');
const os = require('os');

class PrometheusMetricsPlugin {
  constructor(node) {
    this.node = node;
    this.metrics = {};
    this.server = null;
    this.port = node.config.uint('prometheus-metrics-port', 9090);

    this.init();
  }

  init() {
    this.server = http.createServer((req, res) => {
      if (req.url === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(this.getMetrics());
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    });

    this.server.on('error', (err) => {
      this.node.logger.error('Prometheus metrics server error:', err.message);
    });
  }

  async open() {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        this.node.logger.info(
          'Prometheus metrics server listening on port %d',
          this.port
        );
        resolve();
      });
    });
  }

  async close() {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.node.logger.info('Prometheus metrics server closed.');
        resolve();
      });
    });
  }

  getMetrics() {
    const metrics = [];

    // Chain Metrics
    if (this.node.chain) {
      metrics.push({
        name: 'hsd_chain_height',
        help: 'Current block height of the blockchain.',
        type: 'counter',
        value: this.node.chain.height,
      });

      metrics.push({
        name: 'hsd_chain_difficulty',
        help: 'Current blockchain difficulty.',
        type: 'gauge',
        value: this.node.chain.tip.bits,
      });

      metrics.push({
        name: 'hsd_chain_last_block_time_seconds',
        help: `Unix timestamp of the last block's timestamp.`,
        type: 'gauge',
        value: this.node.chain.tip.time,
      });
    }

    // P2P Network Metrics
    if (this.node.pool) {
      metrics.push({
        name: 'hsd_peer_count',
        help: `Current number of connected peers.`,
        type: 'gauge',
        value: this.node.pool.peers.size(),
      });

      metrics.push({
        name: 'hsd_peer_inbound_count',
        help: `Number of inbound peer connections.`,
        type: 'gauge',
        value: this.node.pool.peers.inbound,
      });

      metrics.push({
        name: 'hsd_peer_outbound_count',
        help: `Number of outbound peer connections.`,
        type: 'gauge',
        value: this.node.pool.peers.outbound,
      });
    }

    // Mempool Metrics
    if (this.node.mempool) {
      metrics.push({
        name: 'hsd_mempool_tx_count',
        help: `Current number of transactions in the mempool.`,
        type: 'gauge',
        value: this.node.mempool.txIndex.index.size,
      });

      metrics.push({
        name: 'hsd_mempool_size_bytes',
        help: `Total size of transactions in the mempool in bytes.`,
        type: 'gauge',
        value: this.node.mempool.size,
      });
    }

    // System Metrics (basic)
    // Uptime can be calculated from process.uptime()
    metrics.push({
      name: 'hsd_uptime_seconds',
      help: `Total uptime of the hsd node.`,
      type: 'counter',
      value: Math.floor(process.uptime()),
    });

    // CPU and memory usage
    metrics.push({
      name: 'hsd_cpu_usage_percent',
      help: `CPU utilization of the hsd process`,
      type: 'gauge',
      value: Math.round(os.loadavg()[0] * 100) / os.cpus().length, // Average load over 1 minute
    });

    metrics.push({
      name: 'hsd_memory_usage_bytes',
      help: `Memory usage of the hsd process.`,
      type: 'gauge',
      value: process.memoryUsage().heapUsed,
    });

    return metrics
      .map((metric) =>
        [
          `# HELP ${metric.name} ${metric.help}`,
          `# TYPE ${metric.name} ${metric.type}`,
          `${metric.name} ${metric.value}`,
        ].join('\n')
      )
      .join('\n\n');
  }
}

const plugin = exports;
plugin.id = 'prometheus-metrics';
plugin.init = (node) => {
  return new PrometheusMetricsPlugin(node);
};
