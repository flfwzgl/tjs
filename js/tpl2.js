/**
* created by flf
*/


;(function (factory) {
  if(typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    window.tpl = factory();
  }
})(function () {
  function _rmJsComment(str) {
    return String(str).replace(/\/\/.*?\n/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
  }

  function _encodeHTML (html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`/g, '&#96;')
      .replace(/'/g, '&#39;')
      .replace(/"/g, '&quot;')
  }

  // 对 ", \n, \t 转义
  function _escape (str) {
    return String(str).replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
  }

  return function transform (str, opt) {
    str = str || '';
    opt = opt || {};

    var open = opt.open || '<%'
      , close = opt.close || '%>'
      , openLen = open.length
      , closeLen = close.length
    
    var i = 0, j = 0, res = '', frag = '', ch;

    var isJs = false;


    var i = 0, j = 0, frag = '';

    while (j < str.length) {
      if (!isJs) {
        // html
        if (str.indexOf(open, j) === j) {
          res += '\n_res += "' + _escape(str.substring(i, j)) + '";\n';
          i = j += openLen;
          isJs = true;
          continue;
        }
      } else {
        // js

        if (str.substring(j, j + 2) === '//') {
          j = str.indexOf('\n', j);
          j = ~j ? j + 1 : str.length;
        }

        if (str.substring(j, j + 2) === '/*') {
          j = str.indexOf('*/', j + 2);
          j = ~j ? j + 2 : str.length;
        }

        if (str.charAt(j) === '\'') {
          j = str.indexOf('\'', j + 1);
          while (~(j = str.indexOf('\'', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
        }

        if (str.charAt(j) === '"') {
          j = str.indexOf('"', j + 1);
          while (~(j = str.indexOf('"', j + 1)))
            if (str.charAt(j - 1) !== '\\') break;
        }

        if (i > 180) debugger

        if (str.indexOf(close, j) === j) {
          switch (str.charAt(i)) {
            case '=':
              res += '_res += _encodeHTML(' + str.substring(i + 1, j).trim() + ');\n';
            case '-':
              res += '_res += ' + str.substring(i + 1, j).trim() + ');\n';
            default:
              res += str.substring(i, j) + '\n';
          }
          i = j += closeLen;
          isJs = false;
          continue;
        }
      }
      j++;
    }


    res = 'var _res = "";\nwith(data || {}) {\n' + res + '\n}\nreturn _res;';

    var body = new Function('data', '_encodeHTML', res);

    var fn = function (data) {
      return body(data, _encodeHTML);
    }

    return fn.body = body, fn;
  }

});
















