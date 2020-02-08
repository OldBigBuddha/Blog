hexo.extend.generator.register('netlify-headers', locals => {
  var fs = require('hexo-fs');
  var pathFn = require('path');
  const data = fs.readFileSync(pathFn.join( process.env.PWD || process.cwd() , 'underscore/_headers'));
  console.log("Generated: _headers");
  return {
    path: "_headers",
    data: data
  };
});

hexo.extend.generator.register('netlify-redirects', locals => {
  const fs = require('hexo-fs');
  const pathFn = require('path');
  const data =  fs.readFileSync(pathFn.join( process.env.PWD || process.cwd() , 'underscore/_redirects'));
  console.log("Generated: _redirects");
  return {
    path: "_redirects",
    data: data
  };
});
