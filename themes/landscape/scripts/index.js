'use strict';

var generator = require('hexo-generator-restful/lib/generator');

hexo.extend.generator.register('restful', function(site) {
    return generator(Object.assign({}, hexo.config, hexo.theme.config), site);
});
