serveStatic = require('serve-static');
path = require('path');

var controllers = {
  index: function (req, res) {

    var config = module.cozyLight.configHelpers.loadConfigFile();
    var memoryUsage = process.memoryUsage();
    memoryUsage = Math.ceil(memoryUsage.heapUsed / 1000000);

    var applications = [];
    var plugins = [];

    if (Object.keys(config.apps).length > 0) {
      Object.keys(config.apps).forEach(function (appName) {
        if (config.apps[appName].disabled === undefined) {
          applications.push(config.apps[appName]);
        }
      });
    }
    applications.sort(function compare(a, b) {
      return a.name.localeCompare(b.name);
    });

    Object.keys(config.plugins).forEach(function (pluginName) {
      var plugin = config.plugins[pluginName];
      if (plugin.disabled === undefined) {
          var pluginPath = module.cozyLight.configHelpers.modulePath(plugin.name);
          var pluginModule = require(pluginPath);
          if (pluginModule.getTemplate !== undefined) {
            var template = plugin.getTemplate(config);
            plugins.push(template);
          }
      }
    });

    var result = {
      apps: applications,
      plugins: plugins,
      resources: {
        memoryUsage: memoryUsage
      }
    }
    res.send(result);
  }

}

var plugin = {
  configureAppServer: function(app, config, routes, callback) {
    var appPath = module.cozyLight.configHelpers.modulePath('cozy-light-simple-dashboard');
    var appPath = path.join(appPath, 'assets');
    app.use("/", serveStatic(appPath));
    app.all('/home', controllers.index);
    callback();
  },

  configure: function(options, config, program) {
    module.config = config;
    module.cozyLight = options.cozyLight;
  }
};

module.exports = plugin;
