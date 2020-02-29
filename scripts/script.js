// Generator
hexo.extend.generator.register('netlify-headers',require('./generator/netlify-headers.js'));
hexo.extend.generator.register('netlify-redirects', require('./generator/netlify-redirects.js'));

// Tag
hexo.extend.tag.register('noindent', require('./tag/no-indent.js'));
hexo.extend.tag.register('commentout', require('./tag/accordion-commentout.js'), {ends: true});