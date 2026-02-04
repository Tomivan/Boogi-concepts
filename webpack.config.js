// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      // Options configuration
      analyzerMode: 'server',          // 'server', 'static', 'json', 'disabled'
      analyzerHost: '127.0.0.1',       // Host for server mode
      analyzerPort: 8888,              // Port for server mode
      reportFilename: 'report.html',   // File for static mode
      defaultSizes: 'parsed',          // 'parsed', 'gzip', 'stat'
      openAnalyzer: true,              // Open browser automatically
      generateStatsFile: false,        // Generate stats.json file
      statsFilename: 'stats.json',     // Stats file name
      statsOptions: null,              // Additional stats options
      excludeAssets: null,             // Exclude assets from report
      logLevel: 'info'                 // 'info', 'warn', 'error', 'silent'
    })
    (process.env.ANALYZE === 'true' 
      ? [new BundleAnalyzerPlugin()]
      : []
    )
  ]
};