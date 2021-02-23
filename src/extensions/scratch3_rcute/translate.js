const _translations = require('./locales');
similar = {'zh-tw': 'zh-cn'};
//'use strict'
class _formatMessage extends Function {
  constructor(lo,extensionId) {
    super('return arguments.callee._call.apply(arguments.callee, arguments)')
    // We can't use the rest operator because of the strict mode rules.
    // But we can use the spread operator instead of apply:
    // super('return arguments.callee._call(...arguments)')
    var tr = (_translations[lo] || _translations[similar[lo]]);
    this.dict = tr && tr[extensionId];
  }
  
  _call(msg) {
  	return this.dict && this.dict[msg.id||msg] || msg.default || msg;
  }
}
module.exports = _formatMessage;