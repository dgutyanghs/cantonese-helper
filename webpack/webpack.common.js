const webpack = require('webpack');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const srcDir = path.join(__dirname, '..', 'src');

module.exports = {
    entry: {
        serviceWorker: path.join(srcDir, 'serviceWorker.js'),
        contentScript: path.join(srcDir, 'contentScript.js'),
        popup: path.join(srcDir, 'popup.js'),
        options: path.join(srcDir, 'options.js'),
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js',
        clean: true,
    },
    module: {
        rules: [
            // {
            //     test: /\.html$/,
            //     exclude: /node_modules/,
            //     use: {
            //         loader: 'html-loader',
            //     },
            // },
            {
                test: /\.(js|ts)x?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                    }
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.css','.jsx'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [{ from: 'static' }],
            options: {},
        }),

        new MiniCssExtractPlugin({
            // filename: 'styles/[name].css',
            filename: '../dist/css/[name].css',
            // chunkFilename: '../dist/styles/[id].css',
        }),
    ],
};
