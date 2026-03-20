const { join } = require('path');
const webpack = require('webpack'); // Import webpack to access plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  target: 'node',
  entry: './src/main.ts',
  output: {
    path: join(__dirname, 'dist'),
    filename: 'main.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(d\.ts|js\.map)$/,
        use: 'ignore-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    conditionNames: ['import', 'require', 'node', 'default'], // Prioritize 'import' for module resolution
  },
  externals: {
    'mssql': 'commonjs mssql',
    'class-validator': 'commonjs class-validator',
    'class-transformer': 'commonjs class-transformer',
    '@nestjs/microservices': 'commonjs @nestjs/microservices',
    '@nestjs/websockets': 'commonjs @nestjs/websockets',
    '@nestjs/platform-socket.io': 'commonjs @nestjs/platform-socket.io',
    'class-transformer/storage': 'commonjs class-transformer/storage',
    '@nestjs/core': 'commonjs @nestjs/core', // Externalize @nestjs/core
    '@nestjs/common': 'commonjs @nestjs/common', // Externalize @nestjs/common
    // Microservices transports
    '@grpc/grpc-js': 'commonjs @grpc/grpc-js',
    '@grpc/proto-loader': 'commonjs @grpc/proto-loader',
    'kafkajs': 'commonjs kafkajs',
    'mqtt': 'commonjs mqtt',
    'nats': 'commonjs nats',
    'ioredis': 'commonjs ioredis',
    'amqplib': 'commonjs amqplib',
    'amqp-connection-manager': 'commonjs amqp-connection-manager',
    '@nestjs/platform-express': 'commonjs @nestjs/platform-express', // Add platform-express to externals
    'express': 'commonjs express', // Add express to externals
    // Terminus database health checks (optional)
    '@mikro-orm/core': 'commonjs @mikro-orm/core',
    '@nestjs/mongoose': 'commonjs @nestjs/mongoose',
    '@nestjs/sequelize/dist/common/sequelize.utils': 'commonjs @nestjs/sequelize/dist/common/sequelize.utils',
    '@nestjs/typeorm/dist/common/typeorm.utils': 'commonjs @nestjs/typeorm/dist/common/typeorm.utils',
    'file-type': 'commonjs file-type', // Add file-type to externals
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      /(.+?)\/node_modules\/@nestjs\/(.+)/,
      (context) => {
        context.request = context.request.replace(/@nestjs\//g, '@nestjs-webpack/');
      },
    ),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/public',
          to: 'public',
          noErrorOnMissing: false,
        },
        {
          from: 'node_modules/swagger-ui-dist',
          to: 'swagger-ui',
          noErrorOnMissing: false,
          filter: (resourcePath) => {
            // Skip swagger-initializer.js from node_modules - we'll use our custom one
            return !resourcePath.includes('swagger-initializer.js');
          },
        },
        {
          // Copy our custom swagger-initializer.js that points to /api-json
          from: 'src/swagger-ui/swagger-initializer.js',
          to: 'swagger-ui/swagger-initializer.js',
          noErrorOnMissing: false,
        },
      ],
    }),
  ],
  optimization: {
    minimize: false,
  },
  devtool: 'source-map',
};
