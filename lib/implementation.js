var pathToRegexp = Npm.require('path-to-regexp');
var Fiber = Npm.require('fibers');
var urlParse = Npm.require('url').parse;

FinePickerImp = function(filterFunction) {
  this.filterFunction = filterFunction;
  this.routes = [];
  this.subRouters = [];
  this.middlewares = [];
}

FinePickerImp.prototype.middleware = function(callback) {
  this.middlewares.push(callback);
};

FinePickerImp.prototype.route = function(path, callback) {
  var regExp = pathToRegexp(path);
  regExp.callback = callback;
  this.routes.push(regExp);
  return this;
};

FinePickerImp.prototype.filter = function(callback) {
  var subRouter = new FinePickerImp(callback);
  this.subRouters.push(subRouter);
  return subRouter;
};

FinePickerImp.prototype._dispatch = function(req, res, bypass) {
  var self = this;
  var currentRoute = 0;
  var currentSubRouter = 0;
  var currentMiddleware = 0;

  if(this.filterFunction) {
    var result = this.filterFunction(req, res);
    if(!result) {
      return bypass();
    }
  }

  processNextMiddleware();
  function processNextMiddleware () {
    var middleware = self.middlewares[currentMiddleware++];
    if(middleware) {
      self._processMiddleware(middleware, req, res, processNextMiddleware);
    } else {
      processNextRoute();
    }
  }

  function processNextRoute () {
    var route = self.routes[currentRoute++];
    if(route) {
      var uri = req.url.replace(/\?.*/, '');
      var m = uri.match(route);
      if(m) {
        var params = self._buildParams(route.keys, m);
        params.query = urlParse(req.url, true).query;
        self._processRoute(route.callback, params, req, res, bypass);
      } else {
        processNextRoute();
      }
    } else {
      processNextSubRouter();
    } 
  }

  function processNextSubRouter () {
    var subRouter = self.subRouters[currentSubRouter++];
    if(subRouter) {
      subRouter._dispatch(req, res, processNextSubRouter);
    } else {
      bypass();
    }
  }
};

FinePickerImp.prototype._buildParams = function(keys, m) {
  var params = {};
  for(var lc=1; lc<m.length; lc++) {
    var key = keys[lc-1].name;
    var value = m[lc];
    params[key] = value;
  }

  return params;
};

FinePickerImp.prototype._processRoute = function(callback, params, req, res, next) {
  if(Fiber.current) {
    doCall();
  } else {
    new Fiber(doCall).run();
  }

  function doCall () {
    callback.call(null, params, req, res, next); 
  }
};

FinePickerImp.prototype._processMiddleware = function(middleware, req, res, next) {
  if(Fiber.current) {
    doCall();
  } else {
    new Fiber(doCall).run();
  }

  function doCall() {
    middleware.call(null, req, res, next);
  }
};