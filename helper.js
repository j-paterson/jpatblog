var hbs = require('express-hbs'),
  api = require('./core/server/api'),
  _ = require('lodash'),
  async = require('express-hbs/lib/async'), // To redefine `registerAsyncHelper`
  registerAsyncHelper;

// Redefine `registerAsyncHelper` from `express-hbs`
registerAsyncHelper = function(name, fn) {
  hbs.handlebars.registerHelper(name, function(context, options) {
    // Pass `[context, options]` as arg instead of `context` only
    return async.resolve(fn.bind(this), [context, options]);
  });
};

module.exports = function() {

  // {{#by_tag}} Helper
  //
  // Example:
  // {{#by_tag 'dev,prod' limit=3}}
  //    {{#foreach posts}}
  //        {{title}}
  //        {{content}}
  //    {{/foreach}}
  // {{/by_tag}}
  //
  // TODO `page` or smth like this functionality
  //
  registerAsyncHelper('by_tag', function(context_data, callback) {
    var context = context_data[0], // get context and options passed from context_data array
      options = context_data[1],
      parameters = (options || {}).hash || {},
      request = {
        context: {
          internal: true
        }
      };

    var tags = (context || '').split(',');
    _.each(tags, function(tag, i) {
      tags[i] = 'tag:' + tags[i];
    });
    if (tags.length > 0) {
      request.filter = tags.join(',');
    }

    if (parameters.hasOwnProperty('limit')) {
      request.limit = parameters.limit
    }

    return api.posts.browse(request).then(function(responce) {
      var data;
      if (options !== undefined && typeof options.fn === 'function') {
        data = hbs.handlebars.createFrame(options.data || {});
        data.posts = responce.posts;
        data.pagination = {
          page: 1,
          prev: 0,
          next: 0,
          pages: 1,
          total: request.limit || 100,
          limit: request.limit || 100
        };
        callback(options.fn(data))
      } else {
        callback('')
      }
    });
  });
};