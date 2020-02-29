module.exports = locals => {
  const fs = require('hexo-fs');
  const pathFn = require('path');
  const data =  fs.readFileSync(pathFn.join( process.env.PWD || process.cwd() , 'underscore/_redirects'));
  return {
    path: "_redirects",
    data: data
  };
};