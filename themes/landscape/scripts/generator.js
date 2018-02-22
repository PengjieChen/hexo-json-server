'use strict';

var pagination = require('hexo-pagination');
var _pick = require('lodash.pick');

function filterHTMLTags(str) {
    return str ? str
            .replace(/\<(?!img|br).*?\>/g, "")
            .replace(/\r?\n|\r/g, '')
            .replace(/<img(.*)>/g, ' [Figure] ') : null
}
function fetchCovers(str) {
    var temp,
        imgURLs = [],
        rex = /<img[^>]+src="?([^"\s]+)"(.*)>/g;
    while ( temp = rex.exec( str ) ) {
        imgURLs.push( temp[1] );
    }
    return imgURLs.length > 0 ? imgURLs : null;
}
function fetchCover(str) {
    var covers = fetchCovers(str)
    return covers ? covers[0] : null; 
}

module.exports = function (cfg, site) {

    var restful = cfg.hasOwnProperty('restful') ? cfg.restful :
        {
            site: true,
            posts_size: 10,
            posts_props: {
                title: true,
                slug: true,
                date: true,
                updated: true,
                comments: true,
                cover: true,
                path: true,
                raw: false,
                excerpt: true,
                content: false,
                categories: true,
                tags: true
            },
            categories: true,
            tags: true,
            post: true,
            pages: false,
        },

        posts = site.posts.sort('-date').filter(function (post) {
            return post.published;
        }),

        posts_props = (function () {
            var props = restful.posts_props;

            return function (name, val) {
                return props[name] ? (typeof val === 'function' ? val() : val) : null;
            }
        })(),

        postMap = function (post) {
            return {
                title: posts_props('title', post.title),
                slug: posts_props('slug', post.slug),
                date: posts_props('date', post.date),
                updated: posts_props('updated', post.updated),
                comments: posts_props('comments', post.comments),
                path: posts_props('path', 'api/articles/' + post.slug + '.json'),
                excerpt: posts_props('excerpt', filterHTMLTags(post.excerpt)),
                keywords: posts_props('keywords', cfg.keywords),
                // cover: posts_props('cover',  fetchCover(post.content)),
                cover: posts_props('cover', post.cover || fetchCover(post.content)),
                content: posts_props('content', post.content),
                raw: posts_props('raw', post.raw),
                categories: posts_props('categories', function () {
                    return post.categories.map(function (cat) {
                        return {
                            name: cat.name,
                            path: 'api/categories/' + cat.name + '.json'
                        };
                    });
                }),
                tags: posts_props('tags', function () {
                    return post.tags.map(function (tag) {
                        return {
                            name: tag.name,
                            path: 'api/tags/' + tag.name + '.json'
                        };
                    });
                })
            };
        },

        cateReduce = function (cates, name) {
            return cates.reduce(function (result, item) {
                if (!item.length) return result;

                return result.concat(pagination(item.path, posts, {
                    perPage: 0,
                    data: {
                        name: item.name,
                        path: 'api/' + name + '/' + item.name + '.json',
                        postlist: item.posts.map(postMap)
                    }

                }));
            }, []);
        },

        catesMap = function (item) {
            return {
                name: item.data.name,
                path: item.data.path,
                count: item.data.postlist.length
            };
        },

        cateMap = function (item) {
            var itemData = item.data;
            return {
                path: itemData.path,
                data: JSON.stringify({
                    name: itemData.name,
                    postlist: itemData.postlist
                })
            };
        },

        apiData = [];


    if (restful.site) {
        apiData.push({
            path: 'api/site.json',
            data: JSON.stringify(restful.site instanceof Array ? _pick(cfg, restful.site) : cfg)
        });
    }

    if (restful.categories) {
        var cates = cateReduce(site.categories, 'categories');

        if (!!cates.length) {
            apiData.push({
                path: 'api/categories.json',
                data: JSON.stringify(cates.map(catesMap))
            });
            // /Cats/**.html
            let cathtmllist = cates.map(function (item) {
                return {
                    path: 'Cats/' + item.data.name + '/index.html',
                    layout:'index',
                    data: {}
                };
            });
            // console.log(cathtmllist);
            apiData = apiData.concat(cathtmllist);
            apiData = apiData.concat(cates.map(cateMap));

            function getChildrenTree(node, arr) {
                let childrenTree = [],
                    result = [];
                for (let tempNode of arr) {
                    if (node._id == tempNode.parent) {
                        let result = getChildrenTree(tempNode, arr);
                        if (result.length > 0) {
                            tempNode.children = result;
                        }
                        childrenTree.push(tempNode);
                    }
                }
                return childrenTree;
            }

            let dataItems = [];
            for (let temp in site.categories.data) {
                dataItems.push(site.categories.data[temp]);
            }
            let totalTree = [];
            for (let head of dataItems) {
                if (head.parent === undefined) {
                    head.children = getChildrenTree(head, dataItems);
                    totalTree.push(head);
                }
            }

            apiData.push({
                path: 'api/tree.json',
                data: JSON.stringify(totalTree)
            });
        }

    }

    if (restful.tags) {
        var tags = cateReduce(site.tags, 'tags');

        if (tags.length) {
            apiData.push({
                path: 'api/tags.json',
                data: JSON.stringify(tags.map(catesMap))
            });

            apiData = apiData.concat(tags.map(cateMap));
        }

    }

    var postlist = posts.map(postMap);
    let timeline = {};
    // let postlistSort = postlist.sort((x,y)=>{return y.date - x.date});
    // console.log(postlistSort);
    for (let post of postlist) {
        // console.log(post.date);
        // console.log(timeline[""+post.date.year()]);
        if (timeline[""+post.date.year()] === undefined) {
            timeline[""+post.date.year()] = {};
        }
        if (timeline[""+post.date.year()][""+(post.date.month()+1)] === undefined) {
            timeline[""+post.date.year()][""+(post.date.month()+1)] = Array(post);
        } else {
            timeline[""+post.date.year()][""+(post.date.month()+1)].push(post);
        }
    }

    let timelineM = [],
        yearlist = {},
        monthlist = {};
    for (let year in timeline) {
        yearlist = {};
        yearlist.year = year;
        yearlist.postlist = [];
        for (let month in timeline[year]) {
            monthlist = {};
            monthlist.month = month;
            monthlist.postlist = timeline[year][month];
            yearlist.postlist.push(monthlist);
        }
        timelineM.push(yearlist);
    }

    for (let list of timelineM) {
        list.postlist = list.postlist.sort((x,y)=>{return y.month - x.month});
    }
    timelineM = timelineM.sort((x,y)=>{return y.year - x.year});

    if (timeline !== {}) {
        apiData.push({
            path: 'api/timeline.json',
            data: JSON.stringify(timelineM)
        });
    }
    // html for /Timeline/**
    for (let year of timelineM) {
        for (let month of year.postlist) {
            apiData.push({
                path: 'Timeline/' + year.year + '/' + month.month + '/index.html',
                layout:'index',
                data: {}
            });
        }
    }
    if (restful.posts_size > 0) {

        var page_posts = [],
            i = 0,
            len = postlist.length,
            ps = restful.posts_size,
            pc = Math.ceil(len / ps);

        for (; i < len; i += ps) {
            page_posts.push({
                path: 'api/posts/' + Math.ceil((i + 1) / ps) + '.json',
                data: JSON.stringify({
                    total: len,
                    pageSize: ps,
                    pageCount: pc,
                    data: postlist.slice(i, i + ps)
                })
            });
            // html for /Posts/**
            apiData.push({
                path: 'Posts/' + Math.ceil((i + 1) / ps) + '/index.html',
                layout:'index',
                data: {}
            });
        }

        apiData.push({
            path: 'api/posts.json',
            data: page_posts[0].data
        });

        apiData = apiData.concat(page_posts);

    } else {

        apiData.push({
            path: 'api/posts.json',
            data: JSON.stringify(postlist)
        });
    }

    if (restful.post) {
        apiData = apiData.concat(posts.map(function (post) {
            var path = 'api/articles/' + post.slug + '.json';
            return {
                path: path,
                data: JSON.stringify({
                    title: post.title,
                    slug: post.slug,
                    date: post.date,
                    updated: post.updated,
                    comments: post.comments,
                    path: path,
                    excerpt: filterHTMLTags(post.excerpt),
                    covers: fetchCovers(post.content),
                    keywords: cfg.keyword,
                    content: post.content,
                    categories: post.categories.map(function (cat) {
                        return {
                            name: cat.name,
                            path: 'api/categories/' + cat.name + '.json'
                        };
                    }),
                    tags: post.tags.map(function (tag) {
                        return {
                            name: tag.name,
                            path: 'api/tags/' + tag.name + '.json'
                        };
                    })
                })
            };
        }));
        // html for /Post/**
        apiData = apiData.concat(posts.map(function (post) {
            var path = '/Post/' + post.slug + '/index.html';
            return {
                path: path,
                layout:'index',
                data: {}
            };
        }));
    }

    if (restful.pages) {
        apiData = apiData.concat(site.pages.data.map(function (page) {
            var safe_title = page.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()
            var path = 'api/pages/' + safe_title + '.json';

            return {
                path: path,
                data: JSON.stringify({
                    title: page.title,
                    date: page.date,
                    updated: page.updated,
                    comments: page.comments,
                    path: path,
                    covers: fetchCovers(page.content),
                    excerpt: filterHTMLTags(page.excerpt),
                    content: page.content
                })
            };
        }));
    }

    // html for /CV
    apiData.push({
        path: '/CV/index.html',
        layout:'index',
        data: {}
    });
    // html for 404
    apiData.push({
        path: '/non-exist/index.html',
        layout:'index',
        data: {}
    });
    apiData.push({
        path: '/404.html',
        layout:'index',
        data: {}
    });

    return apiData;
};
