"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var mmo_replacer_1 = __importDefault(require("mmo-replacer"));
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var ERR_CODE_PREFIX = "ERR_";
var _codes = JSON.parse(fs.readFileSync(path.resolve('langs/default-lang.json'), 'utf8'));
var ERROR_INFO = {
    error: {
        type: 'Error',
        message: _codes.ERR_ERROR,
        code: 'ERR_ERROR'
    },
    type: {
        type: 'Type',
        message: _codes.ERR_TYPE,
        code: 'ERR_TYPE'
    },
    range: {
        type: 'Range',
        message: _codes.ERR_RANGE,
        code: 'ERR_RANGE'
    },
    http: {
        type: 'HTTP',
        message: _codes.ERR_HTTP,
        params: ['statusCode'],
        code: 'ERR_HTTP'
    }
};
var MMOErrorClass = (function (_super) {
    __extends(MMOErrorClass, _super);
    function MMOErrorClass(info, source, args) {
        var _this = _super.call(this) || this;
        var count = info.params ? info.params.length : 0;
        var props = {};
        if (count > 0) {
            var params = info.params;
            for (var i = 0; i < count; i++) {
                props[params[i]] = args.shift();
            }
            _this.info = props;
        }
        var message = args.length ? args.shift() : info.message;
        message = mmo_replacer_1.default(_this.info, message);
        if (args.length)
            message = util_1.format.apply(void 0, __spreadArrays([message], args));
        var name = info.type + (!info.type.endsWith('Error') ? "Error " : " ");
        if (source)
            name = source + ':' + name;
        _this.type = info.type;
        _this.name = name;
        _this.message = message;
        _this.source = source;
        if (info.code)
            _this.code = info.code;
        return _this;
    }
    return MMOErrorClass;
}(Error));
function create_error(source) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var error = new MMOErrorClass(this, source, args);
    Error.captureStackTrace(error, create_error);
    return error;
}
function update_error_info(info) {
    var key = info.type.toLowerCase();
    var cur = ERROR_INFO[key];
    if (info.code) {
        info.code = info.code.toUpperCase();
        info.message = (_codes ? _codes[info.code] : info.message) || info.code;
    }
    else {
        info.code = ERR_CODE_PREFIX + info.type.toUpperCase();
    }
    if (cur) {
        if (info.message)
            cur.message = info.message;
    }
    else {
        cur = ERROR_INFO[key] = info;
    }
    return cur;
}
function is_code(str) {
    return str.substr(0, 4).toUpperCase() === ERR_CODE_PREFIX;
}
function errorset(source) {
    return new Proxy(create_error, {
        apply: function (target, self, args) {
            return target.call.apply(target, __spreadArrays([ERROR_INFO.error, source], args));
        },
        get: function (target, prop) {
            if (typeof prop !== 'string')
                return target.bind(ERROR_INFO.error, source, ['Unknown Error']);
            var key = prop.toLowerCase();
            if (!ERROR_INFO[key])
                return target.bind(ERROR_INFO.error, source, ['Unknown Error']);
            return target.bind(ERROR_INFO[key], source);
        }
    });
}
;
(function (errorset) {
    errorset.createErrorType = function (type, message, code, params) {
        if (typeof type === 'string') {
            type = type;
            if (is_code(message)) {
                params = code;
                code = message;
            }
            else if (Array.isArray(code)) {
                params = code;
                code = undefined;
            }
            update_error_info({
                type: type,
                message: message,
                code: code,
                params: params
            });
        }
        else if (Array.isArray(type)) {
            for (var _i = 0, type_1 = type; _i < type_1.length; _i++) {
                var info = type_1[_i];
                update_error_info(info);
            }
        }
        else {
            update_error_info(type);
        }
    };
    function setCodes(codes) {
        var info;
        for (var k in ERROR_INFO) {
            info = ERROR_INFO[k];
            if (info.code && codes[info.code])
                info.message = codes[info.code];
        }
        _codes = codes;
    }
    errorset.setCodes = setCodes;
})(errorset || (errorset = {}));
exports.default = errorset;
//# sourceMappingURL=index.js.map