/* PrismJS 1.29.0 - Core, Markup, CSS, and JavaScript */
var _self = (typeof window !== 'undefined') ? window : ((typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) ? self : {});

var Prism = (function(_self){
    var lang = /(?:^|\s)lang(?:uage)?-([\w-]+)(?=\s|$)/i;
    var uniqueId = 0;

    var _ = {
        manual: _self.Prism && _self.Prism.manual,
        disableWorkerAppend: _self.Prism && _self.Prism.disableWorkerAppend,
        util: {
            encode: function encode(tokens) {
                if (tokens instanceof Token) {
                    return new Token(tokens.type, encode(tokens.content), tokens.alias);
                } else if (Array.isArray(tokens)) {
                    return tokens.map(encode);
                } else {
                    return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
                }
            },
            type: function (o) { return Object.prototype.toString.call(o).slice(8, -1); },
            objId: function (obj) {
                if (!obj['__id']) {
                    Object.defineProperty(obj, '__id', { value: ++uniqueId });
                }
                return obj['__id'];
            }
        },
        languages: {
            plain: {},
            plaintext: {},
            text: {},
            txt: {},
            extend: function (id, redef) {
                var lang = _.util.clone(_.languages[id]);
                for (var key in redef) { lang[key] = redef[key]; }
                return lang;
            },
            insertBefore: function (inside, before, insert, root) {
                root = root || _.languages;
                var grammar = root[inside];
                var ret = {};
                for (var token in grammar) {
                    if (grammar.hasOwnProperty(token)) {
                        if (token == before) {
                            for (var newToken in insert) {
                                if (insert.hasOwnProperty(newToken)) { ret[newToken] = insert[newToken]; }
                            }
                        }
                        if (!insert.hasOwnProperty(token)) { ret[token] = grammar[token]; }
                    }
                }
                return root[inside] = ret;
            },
            DFS: function DFS(o, callback, type, visited) {
                visited = visited || {};
                var objId = _.util.objId;
                for (var i in o) {
                    if (o.hasOwnProperty(i)) {
                        callback.call(o, i, o[i], type || i);
                        var property = o[i], propertyType = _.util.type(property);
                        if (propertyType === 'Object' && !visited[objId(property)]) {
                            visited[objId(property)] = true;
                            DFS(property, callback, null, visited);
                        } else if (propertyType === 'Array' && !visited[objId(property)]) {
                            visited[objId(property)] = true;
                            DFS(property, callback, i, visited);
                        }
                    }
                }
            }
        },
        plugins: {},
        highlightAll: function (async, callback) { _.highlightAllUnder(document, async, callback); },
        highlightAllUnder: function (container, async, callback) {
            var env = {
                callback: callback,
                container: container,
                selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
            };
            var elements = env.container.querySelectorAll(env.selector);
            for (var i = 0, element; element = elements[i++];) {
                _.highlightElement(element, async === true, env.callback);
            }
        },
        highlightElement: function (element, async, callback) {
            var language = 'markup';
            var grammar = _.languages[language];
            var code = element.textContent;

            var env = {
                element: element,
                language: language,
                grammar: grammar,
                code: code
            };

            if (!env.grammar) {
                element.textContent = env.code;
                return;
            }

            env.highlightedCode = _.highlight(env.code, env.grammar, env.language);
            element.innerHTML = env.highlightedCode;

            callback && callback.call(element);
        },
        highlight: function (text, grammar, language) {
            var env = { code: text, grammar: grammar, language: language };
            env.tokens = _.tokenize(env.code, env.grammar);
            return Token.stringify(_.util.encode(env.tokens), env.language);
        },
        tokenize: function (text, grammar) {
            var strArr = [text];
            var rest = grammar.rest;
            if (rest) {
                for (var token in rest) { grammar[token] = rest[token]; }
                delete grammar.rest;
            }
            tokenLoop: for (var token in grammar) {
                if (!grammar.hasOwnProperty(token) || !grammar[token]) { continue; }
                var patterns = grammar[token];
                patterns = Array.isArray(patterns) ? patterns : [patterns];
                for (var j = 0; j < patterns.length; ++j) {
                    var pattern = patterns[j],
                        inside = pattern.inside,
                        lookbehind = !!pattern.lookbehind,
                        greedy = !!pattern.greedy,
                        lookbehindLength = 0,
                        alias = pattern.alias;

                    var regex = pattern.pattern || pattern;
                    for (var i = 0; i < strArr.length; i++) {
                        var str = strArr[i];
                        if (strArr.length > text.length) { break tokenLoop; }
                        if (str instanceof Token) { continue; }
                        
                        var match = regex.exec(str);
                        if (match) {
                            if (lookbehind) { lookbehindLength = match[1].length; }
                            var from = match.index + lookbehindLength,
                                matchStr = match[0].slice(lookbehindLength),
                                to = from + matchStr.length,
                                before = str.slice(0, from),
                                after = str.slice(to);

                            var args = [i, 1];
                            if (before) { args.push(before); }
                            var wrapped = new Token(token, inside ? _.tokenize(matchStr, inside) : matchStr, alias, matchStr);
                            args.push(wrapped);
                            if (after) { args.push(after); }
                            Array.prototype.splice.apply(strArr, args);
                        }
                    }
                }
            }
            return strArr;
        }
    };

    _self.Prism = _;

    function Token(type, content, alias, matchedStr) {
        this.type = type;
        this.content = content;
        this.alias = alias;
        this.length = (matchedStr || "").length;
    }

    Token.stringify = function stringify(o, language) {
        if (typeof o == 'string') { return o; }
        if (Array.isArray(o)) { return o.map(function (v) { return stringify(v, language); }).join(''); }

        var env = {
            type: o.type,
            content: stringify(o.content, language),
            tag: 'span',
            classes: ['token', o.type],
            attributes: {},
            language: language
        };

        if (o.alias) {
            var aliases = Array.isArray(o.alias) ? o.alias : [o.alias];
            Array.prototype.push.apply(env.classes, aliases);
        }

        var attributes = '';
        for (var name in env.attributes) {
            attributes += ' ' + name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
        }

        return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + attributes + '>' + env.content + '</' + env.tag + '>';
    };

    // --- LANGUAGE DEFINITIONS ---
    
    // MARKUP (HTML)
    _.languages.markup = {
        'comment': /<![\s\S]*?-->/,
        'prolog': /<\?[\s\S]*?\?>/,
        'doctype': /<!DOCTYPE[\s\S]*?>/i,
        'cdata': /<!\[CDATA\[[\s\S]*?\]\]>/i,
        'tag': {
            pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s(?:\s*[^\s>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+(?=[\s>]))|(?=[\s/>])))+)?\s*\/?>/i,
            greedy: true,
            inside: {
                'tag': {
                    pattern: /^<\/?[^\s>\/]+/i,
                    inside: { 'punctuation': /^<\/?/, 'namespace': /^[^\s>\/:]+:/ }
                },
                'attr-value': {
                    pattern: /=\s*(?:"[^"]*"|'[^']*'|[^\s'">=]+)/i,
                    inside: { 'punctuation': [ /^=/, /"|'/ ] }
                },
                'punctuation': /\/?>/,
                'attr-name': {
                    pattern: /[^\s>\/]+/,
                    inside: { 'namespace': /^[^\s>\/:]+:/ }
                }
            }
        },
        'entity': /&[\da-z]{1,8};/i
    };

    // CSS
    _.languages.css = {
        'comment': /\/\*[\s\S]*?\*\//,
        'atrule': { pattern: /@[\w-]+/i, inside: { 'punctuation': /[:;]/ } },
        'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
        'selector': /[^{}\s][^{}]*(?=\s*\{)/,
        'string': { pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/, greedy: true },
        'property': /[-_a-z0-9]+(?=\s*:)/i,
        'punctuation': /[(){};:]/
    };

    // JAVASCRIPT
    _.languages.javascript = _.languages.extend('markup', {
        'keyword': /\b(as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
        'number': /\b(0x[\da-f]+|0b[01]+|0o[0-7]+|\d+\.?\d*([eE][+-]?\d+)?|\.\d+([eE][+-]?\d+)?|NaN|Infinity)\b/,
        'function': /\w+(?=\()/,
        'operator': /-[-+]=?|=[=>]?|!={1,2}|>{1,3}=?|<{1,2}=?|&&?|\|\|?|\?|\*=?|\/=?|%=?|\^=?|~=?|:|\./
    });

    return _;
})(_self);

if (typeof module !== 'undefined' && module.exports) { module.exports = Prism; }