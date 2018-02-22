'use strict';

var generator = require('./generator');

hexo.extend.generator.register('restful', function(site) {
    return generator(Object.assign({}, hexo.config, hexo.theme.config), site);
});
