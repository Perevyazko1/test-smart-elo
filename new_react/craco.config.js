const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@app': path.resolve(__dirname, 'src/app/'),
      '@features': path.resolve(__dirname, 'src/features/'),
      '@pages': path.resolve(__dirname, 'src/pages/'),
      '@widgets': path.resolve(__dirname, 'src/widgets/'),
      '@processes': path.resolve(__dirname, 'src/processes/'),
      '@entities': path.resolve(__dirname, 'src/entities/'),
    },
  },
};