function transform(ast, rule) {
  function next(node) {
    if (node) {
      if (typeof node === 'string') {
        return rule(node);
      }

      if (Array.isArray(node)) {
        return node.map(function (n, index) {
          if (typeof n !== 'string') {
            n.index = index; // critical array element index
          }

          return rule(n, next(n.children));
        });
      } else {
        return rule(node, next(node.children));
      }
    }

    return null;
  }

  return next(ast);
}

var voidElementTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function isSelfClose(tagName) {
  return voidElementTags.indexOf(tagName) > -1;
}

function isPair(tagX, tagY) {
  return tagX.name === tagY.name && tagX.type === 'start' && tagY.type === 'end';
}

var utils = {
  isPair: isPair,
  isSelfClose: isSelfClose
};

var ATTR_FIND = /((^\w|\s+)[a-zA-Z-:]+)(="[^"]+"|\s+|\s*$)?/;

function extraAttrs(str) {
  var i = 0;
  var attrs = {};

  while (i < str.length) {
    var suffix = str.slice(i);
    var match = ATTR_FIND.exec(suffix);

    if (!match || !match[1]) {
      break;
    }

    var result = match[0];
    var key = match[1];
    var value = match[3];
    key = key.trim();
    value = value && value.trim();
    attrs[key] = value && value[0] === '=' ? value.slice(2, -1) : true;
    i += result.length;
  }

  return attrs;
}

function makeToken(tag) {
  var isTag = tag[0] === '<' && tag[tag.length - 1] === '>';

  if (!isTag) {
    return {
      type: 'string',
      value: tag
    };
  } else if (tag.startsWith('</')) {
    return {
      type: 'end',
      name: tag.slice(2, -1)
    };
  } else {
    var match = tag.match(/<([\w+:?\w*]+)\s*([^>]*)/);
    var tagName = match[1];
    var tagBody = match[2];
    return {
      type: utils.isSelfClose(tagName) || tagBody[tagBody.length - 1] === '/' ? 'self-close' : 'start',
      name: tagName,
      attributes: extraAttrs(tagBody)
    };
  }
}

function splitTokens(html) {
  var i = 0;
  var j = 0;
  var tokens = [];

  while (i < html.length) {
    var curr = html[i];

    if (curr === '<') {
      if (j < i) {
        tokens.push(html.slice(j, i));
        j = i;
      }

      var k = i;

      while (html[k] !== '>') {
        k++;
      }

      tokens.push(html.slice(i, k + 1));
      i = j = k + 1;
      continue;
    }

    i++;
  }

  return tokens;
}

function tokenize(html) {
  return splitTokens(html).map(function (s) {
    return s.replace(/^\n+$/g, '');
  }).map(function (s) {
    return s.trim();
  }).filter(Boolean).map(makeToken);
}

function isEmpty(stack) {
  return stack.length === 0;
}

function getTop(stack) {
  return stack[stack.length - 1];
}

function appendChild(node, child) {
  if (!node.children) {
    node.children = [];
  }

  node.children.push(filterProps(child));
}

function filterProps(node) {
  if (typeof node === 'string') {
    return node;
  }

  return ['name', 'children', 'attributes'].reduce(function (r, c) {
    var _Object$assign;

    return Object.assign({}, r, (_Object$assign = {}, _Object$assign[c] = node[c], _Object$assign));
  }, {});
}

function parse(src) {
  var tokens = tokenize(src);
  var stack = [];
  var tree = {
    type: 'root',
    children: []
  };
  stack.push(tree);

  while (!isEmpty(stack) && !isEmpty(tokens)) {
    var curr = tokens.shift();
    var top = getTop(stack);

    if (curr.type === 'string') {
      appendChild(top, curr.value);
    } else if (utils.isPair(top, curr)) {
      var node = stack.pop();

      if (!isEmpty(stack)) {
        appendChild(getTop(stack), node);
      }
    } else if (curr.type === 'self-close') {
      appendChild(top, curr);
    } else if (curr.type === 'start') {
      stack.push(curr);
    }
  }

  return tree.children;
}

function html2any(html, rule) {
  return transform(parse(html)[0], rule);
}