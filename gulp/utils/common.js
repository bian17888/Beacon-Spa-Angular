/**
 * @fileOverview
 * @author bian17888 16/4/26 09:55
 */

module.exports = function () {
  var url = require('url');
  // third parts
  var $ = require('gulp-load-plugins')({lazy: true});
  var gulp = require('gulp');
  var del = require('del');
  var browserSync = require('browser-sync').create();
  var modRewrite = require('connect-modrewrite');

  var config = require('../config')();
  var mock = require('../../mock/api');
  var port = config.env.port;

  // export object
  var utils = {
    log: log,
    clean: clean,
    errorLogger: errorLogger,
    serve: serve
  };

  return utils;

  // ////////////////////////////////////////////////

  /**
   * @func log
   * @param {(string|object)} msg - 日志信息
   * @returns {void}
   */
  function log (msg) {
    if (typeof (msg) === 'object') {
      for (var item in msg) {
        if (msg.hasOwnProperty(item)) {
          $.util.log($.util.colors.blue(msg[item]));
        }
      }
    } else {
      $.util.log($.util.colors.blue(msg));
    }
  }

  /**
   * @func clean
   * @desc 用同步删除, 防止异步的 bug
   * @param {(string|object)} path - 文件路径
   * @returns {void}
   */
  function clean (path) {
    log('Cleaning : ' + path);
    del.sync(path);
  }

  /**
   * @func errorLogger
   * @param {object} error - 错误信息
   * @returns {void}
   */
  function errorLogger (error) {
    log('*** Start of Error ***');
    log(error);
    log('*** End of Error ***');
    this.emit('end');
  }

  /**
   * @func changeEvent
   * @desc 显示改动文件信息
   * @param {objec} event - event
   * @returns {void}
   */
  // todo : 用正则截取文件路径
  function changeEvent (event) {
    log('File : ' + event.path + ' ' + event.type);
  }

  /**
   * @func serve
   * @desc 启动 server
   * @param {boolean} isDev - 开发模式
   * @returns {void}
   */
  function serve (isDev) {
    var watchBuildConfig = config.stylus.concat(config.js, config.html);

    if (browserSync.active) {
      return;
    }

    log('Starting browser-sync on port : ' + port);

    if (isDev) {
      gulp.watch(config.stylus, ['styles'])
        .on('change', changeEvent);
      // 国际化, 监听 i18n/json/**/*.json
      gulp.watch(config.i18n.src, ['wiredep', browserSync.reload])
        .on('change', changeEvent);
    } else {
      gulp.watch(watchBuildConfig, ['optimize', browserSync.reload])
        .on('change', changeEvent);
    }

    var middleware = [];
    // 本地 mock 方案
    if (config.env.mock === 'true') {
      middleware.push(mockData);
    }
    /**
     * 修复 angular 1.x 开启html5Model 模式, 刷新404问题
     * 参考 :
     *  https://github.com/Swiip/generator-gulp-angular/issues/26
     */
    if (config.env.html5Model === 'true') {
      middleware.push(
        modRewrite([
          '^/template/\\S* /index.html [L]'
        ])
      );
    }
    var options = {
      server: {
        baseDir: isDev ? config.client : config.build
      },
      port: port,
      files: isDev ? [
        config.client + '**/*.*',
        '!' + config.stylus,
        config.tmp + 'styles/*.css'
      ] : [],
      ghostMode: {
        clicks: true,
        location: false,
        forms: true,
        scroll: true
      },
      open: true,
      injectChanges: true,
      logFileChanges: true,
      logLevel: config.debug.logLevel,
      logPrefix: config.debug.logPrefix,
      notify: true,
      reloadDelay: config.browserReloadDelay,
      middleware: middleware
    };

    browserSync.init(options);
  }

  // ////////////////////////////////////////////////

  /**
   * 本地 Mock 数据
   * @param {object} req - req
   * @param {object} res - res
   * @param {object} next - next
   * @returns {void}
   */
  function mockData (req, res, next) {
    var theUrl = url.parse(req.url);
    theUrl = theUrl.pathname.replace('/', '');
    var json = mock[theUrl];

    if (json) {
      json = json();
      json = JSON.stringify(json);
      setTimeout(function () {
        // 模拟session3小时后失效
        if (theUrl === 'user/authTimeout') {
          res.writeHead(401, {'Content-Type': 'application/json'});
        } else {
          res.writeHead(200, {'Content-Type': 'application/json'});
        }
        res.write(json, 'utf8');
        res.end();
      }, 500);
    } else {
      next();
    }
  }
};
