module.exports = locals => {
  var fs = require('hexo-fs');
  var pathFn = require('path');
  const data = fs.readFileSync(pathFn.join( process.env.PWD || process.cwd() , 'underscore/_headers'));
  return {
    path: "_headers",
    data: data
  };
};