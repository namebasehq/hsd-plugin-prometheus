# HSD Prometheus Metrics Plugin

This plugin for the Handshake Daemon (hsd) exposes various metrics in a Prometheus-compatible format, allowing you to monitor your hsd node's performance and status using Prometheus and Grafana.

## Features

- Exposes hsd chain, peer, and mempool metrics.
- Lightweight, with no external dependencies.
- Configurable HTTP port for metrics exposure.

## Installation

In your hsd project directory, install the plugin using npm:

```bash
npm install hsd-plugin-prometheus
```

## Usage

To enable the plugin, add it to `hsd` list of plugins. You can do this via the command line, environment variables, or your `hsd.conf` file.

### Command Line

Run `hsd` with the `--plugins` flag pointing to the plugin directory:

```bash
hsd --plugins hsd-plugin-prometheus
```

### Environment Variable

Set the `HSD_PLUGINS` environment variable:

```bash
export HSD_PLUGINS=hsd-plugin-prometheus
hsd
```

### `hsd.conf` File

Add the `plugins` entry to your `~/.hsd/hsd.conf` file:

```
plugins: hsd-plugin-prometheus
```

## Configuration

The plugin listens on port `9090` by default. You can change this port by adding the `prometheus-port` option to your `hsd.conf` file or as a command-line argument:

### `hsd.conf`

```
prometheus-port: 9091
prometheus-host: 127.0.0.1
prometheus-api-key: your-secret-key
```

### Command Line

```bash
hsd --plugins /path/to/hsd-plugin-prometheus --prometheus-port 9091 --prometheus-host 127.0.0.1 --prometheus-api-key your-secret-key
```

When the `prometheus-api-key` is set, the metrics endpoint will require Basic Authentication. The username must be `x`, and the password must be the configured API key.

## Exposed Metrics

Once the plugin is running, you can access the metrics by navigating to `http://your-hsd-node-ip:9090/metrics` (or your configured port) in your web browser or by configuring Prometheus to scrape this endpoint.

Here's a list of the metrics exposed by this plugin:

### Chain Metrics

- `hsd_chain_height`: Current block height of the blockchain.
- `hsd_chain_difficulty`: Current blockchain difficulty.
- `hsd_chain_last_block_time_seconds`: Unix timestamp of the last block's timestamp.

### Peer-to-Peer (P2P) Network Metrics

- `hsd_peer_count`: Current number of connected peers.
- `hsd_peer_inbound_count`: Number of inbound peer connections.
- `hsd_peer_outbound_count`: Number of outbound peer connections.

### Mempool Metrics

- `hsd_mempool_tx_count`: Current number of transactions in the mempool.
- `hsd_mempool_size_bytes`: Total size of transactions in the mempool in bytes.

### System Metrics

- `hsd_uptime_seconds`: Total uptime of the hsd node.
- `hsd_cpu_usage_percent`: CPU utilization of the hsd process
- `hsd_memory_usage_bytes`: Memory usage of the hsd process.

## Prometheus Configuration Example

To scrape metrics from your hsd node, add the following job to your `prometheus.yml` configuration file:

```yaml
scrape_configs:
  - job_name: 'hsd'
    static_configs:
      - targets: ['your-hsd-node-ip:9090'] # Replace with your hsd node's IP and port
```

Reload your Prometheus configuration after making changes.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details. (Note: A `LICENSE` file should be created if not already present.)
