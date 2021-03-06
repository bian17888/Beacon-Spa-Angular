/**
 * @fileOverview
 * @author bian17888 16/4/25 07:57
 */

module.exports = function () {
  var client = './src/client/',
    clientApp = client + 'app/',
    clientContent = client + 'content/',
    tmp = client + '_tmp/',
    build = './build/';

  var config = {
    client: client,
    tmp: tmp,
    build: build,
    buildContent: build + 'content/',

    /**
     * browserSync中的 log 设置
     */
    debug: {
      logLevel: 'debug',
      logPrefix: 'Connect'
    },

    /**
     * node env
     */
    env: {
      port: process.env.PORT || 3100,
      mock: process.env.MOCK || 'false',
      node_env: process.env.NODE_ENV || 'development',
      html5Model: process.env.HTML5MODEL || 'true'
    },

    /**
     * file path
     */
    index: client + 'index.html',
    htmltemplates: clientApp + '**/*.html',
    html: clientApp + '**/*.html',
    stylus: [
      client + 'styles/**/*.styl',
      clientApp + 'widgets/**/*.styl'
    ],
    css: tmp + '**/*.css',
    // alljs : 用于 eslint 语法检测
    alljs: [
      './gulp/**/*.js',
      clientApp + '**/*.js'
    ],
    js: [
      clientApp + '**/*.module.js',
      clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js'
    ],
    images: clientContent + 'images/**/*.*',
    fonts: clientContent + 'fonts/**/*.*',
    libs: clientContent + 'libs/**/*.*',

    /**
     * templateCache
     */
    templateCache: {
      file: 'templates.js',
      options: {
        root: 'app/',
        module: 'app.core',
        standAlone: false
      }
    },
    /**
     * 国际化
     */
    i18n: {
      src: [
        clientApp + 'blocks/i18n/lang/**/*.json',
        clientApp + 'widgets/**/lang/*.json'
      ],
      file: 'i18n.js',
      exportModule: 'var I18N'
    },
    /**
     * browser sync
     */
    browserReloadDelay: 1000,

    /**
     * Bower and NPM locations
     */
    bower: {
      bowerJson: require('../bower.json')
    },
    packages: [
      './package.json',
      './bower.json'
    ],

    /**
     * jsdoc
     */
    jsdoc: {
      bin: './node_modules/.bin/jsdoc ',
      path: './jsdoc/'
    }

  };

  config.getWiredepDefaultOptions = function () {
    var options = {
      directory: config.bower.directory,
      bowerJson: config.bower.bowerJson,
      ignorePath: config.bower.ignorePath
    };
    return options;
  };

  return config;
};
