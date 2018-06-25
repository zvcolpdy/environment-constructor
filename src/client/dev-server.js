const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const config = require('./webpack.config.js');
const options = {
    contentBase: './dist',
    hot: true,
    host: 'localhost',
    port: 8000,
    disableHostCheck: true,
    headers: {
        'Access-Control-Allow-Origin': '*'
    }
};

webpackDevServer.addDevServerEntrypoints(config, options);
const compiler = webpack(config);
const server = new webpackDevServer(compiler, options);

server.listen(8000, '0.0.0.0', () => {
    console.log('dev server listening on port 8000');
});