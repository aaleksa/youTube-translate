var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../v2-core/dynamodb/keys.ts
function userPk(userId) {
  return `${ENTITY.USER}#${userId}`;
}
var ENTITY;
var init_keys = __esm({
  "../v2-core/dynamodb/keys.ts"() {
    "use strict";
    ENTITY = {
      USER: "USER",
      CARD: "CARD",
      DECK: "DECK",
      PROFILE: "PROFILE",
      PROGRESS: "PROGRESS",
      REVIEW: "REVIEW",
      VIDEO: "VIDEO",
      PLAYBACK: "PLAYBACK",
      BOOKMARK: "BOOKMARK",
      QUIZ_RESULT: "QUIZ_RESULT",
      DAILY_STUDY: "DAILY_STUDY",
      PRONUNCIATION: "PRONUNCIATION",
      VOCAB_PROGRESS: "VOCAB_PROGRESS",
      EXPLAIN_SENTENCE: "EXPLAIN_SENTENCE",
      SELECTION_ANALYSIS: "SELECTION_ANALYSIS",
      USER_SETTINGS: "USER_SETTINGS",
      USER_SUBSCRIPTION: "USER_SUBSCRIPTION",
      AI_USAGE: "AI_USAGE"
    };
  }
});

// ../node_modules/better-sqlite3/lib/util.js
var require_util = __commonJS({
  "../node_modules/better-sqlite3/lib/util.js"(exports) {
    "use strict";
    exports.getBooleanOption = (options, key) => {
      let value = false;
      if (key in options && typeof (value = options[key]) !== "boolean") {
        throw new TypeError(`Expected the "${key}" option to be a boolean`);
      }
      return value;
    };
    exports.cppdb = Symbol();
    exports.inspect = Symbol.for("nodejs.util.inspect.custom");
  }
});

// ../node_modules/better-sqlite3/lib/sqlite-error.js
var require_sqlite_error = __commonJS({
  "../node_modules/better-sqlite3/lib/sqlite-error.js"(exports, module) {
    "use strict";
    var descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
    function SqliteError(message, code) {
      if (new.target !== SqliteError) {
        return new SqliteError(message, code);
      }
      if (typeof code !== "string") {
        throw new TypeError("Expected second argument to be a string");
      }
      Error.call(this, message);
      descriptor.value = "" + message;
      Object.defineProperty(this, "message", descriptor);
      Error.captureStackTrace(this, SqliteError);
      this.code = code;
    }
    Object.setPrototypeOf(SqliteError, Error);
    Object.setPrototypeOf(SqliteError.prototype, Error.prototype);
    Object.defineProperty(SqliteError.prototype, "name", descriptor);
    module.exports = SqliteError;
  }
});

// ../node_modules/file-uri-to-path/index.js
var require_file_uri_to_path = __commonJS({
  "../node_modules/file-uri-to-path/index.js"(exports, module) {
    var sep = __require("path").sep || "/";
    module.exports = fileUriToPath;
    function fileUriToPath(uri) {
      if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
        throw new TypeError("must pass in a file:// URI to convert to a file path");
      }
      var rest = decodeURI(uri.substring(7));
      var firstSlash = rest.indexOf("/");
      var host = rest.substring(0, firstSlash);
      var path = rest.substring(firstSlash + 1);
      if ("localhost" == host) host = "";
      if (host) {
        host = sep + sep + host;
      }
      path = path.replace(/^(.+)\|/, "$1:");
      if (sep == "\\") {
        path = path.replace(/\//g, "\\");
      }
      if (/^.+\:/.test(path)) {
      } else {
        path = sep + path;
      }
      return host + path;
    }
  }
});

// ../node_modules/bindings/bindings.js
var require_bindings = __commonJS({
  "../node_modules/bindings/bindings.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var fileURLToPath = require_file_uri_to_path();
    var join = path.join;
    var dirname2 = path.dirname;
    var exists = fs.accessSync && function(path2) {
      try {
        fs.accessSync(path2);
      } catch (e) {
        return false;
      }
      return true;
    } || fs.existsSync || path.existsSync;
    var defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || " \u2192 ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function bindings(opts) {
      if (typeof opts == "string") {
        opts = { bindings: opts };
      } else if (!opts) {
        opts = {};
      }
      Object.keys(defaults).map(function(i2) {
        if (!(i2 in opts)) opts[i2] = defaults[i2];
      });
      if (!opts.module_root) {
        opts.module_root = exports.getRoot(exports.getFileName());
      }
      if (path.extname(opts.bindings) != ".node") {
        opts.bindings += ".node";
      }
      var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
      var tries = [], i = 0, l = opts.try.length, n, b, err;
      for (; i < l; i++) {
        n = join.apply(
          null,
          opts.try[i].map(function(p) {
            return opts[p] || p;
          })
        );
        tries.push(n);
        try {
          b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
          if (!opts.path) {
            b.path = n;
          }
          return b;
        } catch (e) {
          if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
            throw e;
          }
        }
      }
      err = new Error(
        "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
          return opts.arrow + a;
        }).join("\n")
      );
      err.tries = tries;
      throw err;
    }
    module.exports = exports = bindings;
    exports.getFileName = function getFileName(calling_file) {
      var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
      Error.stackTraceLimit = 10;
      Error.prepareStackTrace = function(e, st) {
        for (var i = 0, l = st.length; i < l; i++) {
          fileName = st[i].getFileName();
          if (fileName !== __filename) {
            if (calling_file) {
              if (fileName !== calling_file) {
                return;
              }
            } else {
              return;
            }
          }
        }
      };
      Error.captureStackTrace(dummy);
      dummy.stack;
      Error.prepareStackTrace = origPST;
      Error.stackTraceLimit = origSTL;
      var fileSchema = "file://";
      if (fileName.indexOf(fileSchema) === 0) {
        fileName = fileURLToPath(fileName);
      }
      return fileName;
    };
    exports.getRoot = function getRoot(file) {
      var dir = dirname2(file), prev;
      while (true) {
        if (dir === ".") {
          dir = process.cwd();
        }
        if (exists(join(dir, "package.json")) || exists(join(dir, "node_modules"))) {
          return dir;
        }
        if (prev === dir) {
          throw new Error(
            'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
          );
        }
        prev = dir;
        dir = join(dir, "..");
      }
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/wrappers.js
var require_wrappers = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/wrappers.js"(exports) {
    "use strict";
    var { cppdb } = require_util();
    exports.prepare = function prepare(sql) {
      return this[cppdb].prepare(sql, this, false);
    };
    exports.exec = function exec(sql) {
      this[cppdb].exec(sql);
      return this;
    };
    exports.close = function close() {
      this[cppdb].close();
      return this;
    };
    exports.loadExtension = function loadExtension(...args) {
      this[cppdb].loadExtension(...args);
      return this;
    };
    exports.defaultSafeIntegers = function defaultSafeIntegers(...args) {
      this[cppdb].defaultSafeIntegers(...args);
      return this;
    };
    exports.unsafeMode = function unsafeMode(...args) {
      this[cppdb].unsafeMode(...args);
      return this;
    };
    exports.getters = {
      name: {
        get: function name() {
          return this[cppdb].name;
        },
        enumerable: true
      },
      open: {
        get: function open() {
          return this[cppdb].open;
        },
        enumerable: true
      },
      inTransaction: {
        get: function inTransaction() {
          return this[cppdb].inTransaction;
        },
        enumerable: true
      },
      readonly: {
        get: function readonly() {
          return this[cppdb].readonly;
        },
        enumerable: true
      },
      memory: {
        get: function memory() {
          return this[cppdb].memory;
        },
        enumerable: true
      }
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/transaction.js
var require_transaction = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/transaction.js"(exports, module) {
    "use strict";
    var { cppdb } = require_util();
    var controllers = /* @__PURE__ */ new WeakMap();
    module.exports = function transaction(fn) {
      if (typeof fn !== "function") throw new TypeError("Expected first argument to be a function");
      const db = this[cppdb];
      const controller = getController(db, this);
      const { apply } = Function.prototype;
      const properties = {
        default: { value: wrapTransaction(apply, fn, db, controller.default) },
        deferred: { value: wrapTransaction(apply, fn, db, controller.deferred) },
        immediate: { value: wrapTransaction(apply, fn, db, controller.immediate) },
        exclusive: { value: wrapTransaction(apply, fn, db, controller.exclusive) },
        database: { value: this, enumerable: true }
      };
      Object.defineProperties(properties.default.value, properties);
      Object.defineProperties(properties.deferred.value, properties);
      Object.defineProperties(properties.immediate.value, properties);
      Object.defineProperties(properties.exclusive.value, properties);
      return properties.default.value;
    };
    var getController = (db, self) => {
      let controller = controllers.get(db);
      if (!controller) {
        const shared = {
          commit: db.prepare("COMMIT", self, false),
          rollback: db.prepare("ROLLBACK", self, false),
          savepoint: db.prepare("SAVEPOINT `	_bs3.	`", self, false),
          release: db.prepare("RELEASE `	_bs3.	`", self, false),
          rollbackTo: db.prepare("ROLLBACK TO `	_bs3.	`", self, false)
        };
        controllers.set(db, controller = {
          default: Object.assign({ begin: db.prepare("BEGIN", self, false) }, shared),
          deferred: Object.assign({ begin: db.prepare("BEGIN DEFERRED", self, false) }, shared),
          immediate: Object.assign({ begin: db.prepare("BEGIN IMMEDIATE", self, false) }, shared),
          exclusive: Object.assign({ begin: db.prepare("BEGIN EXCLUSIVE", self, false) }, shared)
        });
      }
      return controller;
    };
    var wrapTransaction = (apply, fn, db, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
      let before, after, undo;
      if (db.inTransaction) {
        before = savepoint;
        after = release;
        undo = rollbackTo;
      } else {
        before = begin;
        after = commit;
        undo = rollback;
      }
      before.run();
      try {
        const result = apply.call(fn, this, arguments);
        if (result && typeof result.then === "function") {
          throw new TypeError("Transaction function cannot return a promise");
        }
        after.run();
        return result;
      } catch (ex) {
        if (db.inTransaction) {
          undo.run();
          if (undo !== rollback) after.run();
        }
        throw ex;
      }
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/pragma.js
var require_pragma = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/pragma.js"(exports, module) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module.exports = function pragma(source, options) {
      if (options == null) options = {};
      if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      const simple = getBooleanOption(options, "simple");
      const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true);
      return simple ? stmt.pluck().get() : stmt.all();
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/backup.js
var require_backup = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/backup.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var path = __require("path");
    var { promisify } = __require("util");
    var { cppdb } = require_util();
    var fsAccess = promisify(fs.access);
    module.exports = async function backup(filename, options) {
      if (options == null) options = {};
      if (typeof filename !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      filename = filename.trim();
      const attachedName = "attached" in options ? options.attached : "main";
      const handler2 = "progress" in options ? options.progress : null;
      if (!filename) throw new TypeError("Backup filename cannot be an empty string");
      if (filename === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
      if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
      if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
      if (handler2 != null && typeof handler2 !== "function") throw new TypeError('Expected the "progress" option to be a function');
      await fsAccess(path.dirname(filename)).catch(() => {
        throw new TypeError("Cannot save backup because the directory does not exist");
      });
      const isNewFile = await fsAccess(filename).then(() => false, () => true);
      return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler2 || null);
    };
    var runBackup = (backup, handler2) => {
      let rate = 0;
      let useDefault = true;
      return new Promise((resolve2, reject) => {
        setImmediate(function step() {
          try {
            const progress = backup.transfer(rate);
            if (!progress.remainingPages) {
              backup.close();
              resolve2(progress);
              return;
            }
            if (useDefault) {
              useDefault = false;
              rate = 100;
            }
            if (handler2) {
              const ret = handler2(progress);
              if (ret !== void 0) {
                if (typeof ret === "number" && ret === ret) rate = Math.max(0, Math.min(2147483647, Math.round(ret)));
                else throw new TypeError("Expected progress callback to return a number or undefined");
              }
            }
            setImmediate(step);
          } catch (err) {
            backup.close();
            reject(err);
          }
        });
      });
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/serialize.js
var require_serialize = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/serialize.js"(exports, module) {
    "use strict";
    var { cppdb } = require_util();
    module.exports = function serialize(options) {
      if (options == null) options = {};
      if (typeof options !== "object") throw new TypeError("Expected first argument to be an options object");
      const attachedName = "attached" in options ? options.attached : "main";
      if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
      if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
      return this[cppdb].serialize(attachedName);
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/function.js
var require_function = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/function.js"(exports, module) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module.exports = function defineFunction(name, options, fn) {
      if (options == null) options = {};
      if (typeof options === "function") {
        fn = options;
        options = {};
      }
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof fn !== "function") throw new TypeError("Expected last argument to be a function");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      if (!name) throw new TypeError("User-defined function name cannot be an empty string");
      const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
      const deterministic = getBooleanOption(options, "deterministic");
      const directOnly = getBooleanOption(options, "directOnly");
      const varargs = getBooleanOption(options, "varargs");
      let argCount = -1;
      if (!varargs) {
        argCount = fn.length;
        if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError("Expected function.length to be a positive integer");
        if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
      }
      this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
      return this;
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/aggregate.js
var require_aggregate = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/aggregate.js"(exports, module) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module.exports = function defineAggregate(name, options) {
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object" || options === null) throw new TypeError("Expected second argument to be an options object");
      if (!name) throw new TypeError("User-defined function name cannot be an empty string");
      const start = "start" in options ? options.start : null;
      const step = getFunctionOption(options, "step", true);
      const inverse = getFunctionOption(options, "inverse", false);
      const result = getFunctionOption(options, "result", false);
      const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
      const deterministic = getBooleanOption(options, "deterministic");
      const directOnly = getBooleanOption(options, "directOnly");
      const varargs = getBooleanOption(options, "varargs");
      let argCount = -1;
      if (!varargs) {
        argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
        if (argCount > 0) argCount -= 1;
        if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
      }
      this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
      return this;
    };
    var getFunctionOption = (options, key, required) => {
      const value = key in options ? options[key] : null;
      if (typeof value === "function") return value;
      if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
      if (required) throw new TypeError(`Missing required option "${key}"`);
      return null;
    };
    var getLength = ({ length }) => {
      if (Number.isInteger(length) && length >= 0) return length;
      throw new TypeError("Expected function.length to be a positive integer");
    };
  }
});

// ../node_modules/better-sqlite3/lib/methods/table.js
var require_table = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/table.js"(exports, module) {
    "use strict";
    var { cppdb } = require_util();
    module.exports = function defineTable(name, factory) {
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (!name) throw new TypeError("Virtual table module name cannot be an empty string");
      let eponymous = false;
      if (typeof factory === "object" && factory !== null) {
        eponymous = true;
        factory = defer(parseTableDefinition(factory, "used", name));
      } else {
        if (typeof factory !== "function") throw new TypeError("Expected second argument to be a function or a table definition object");
        factory = wrapFactory(factory);
      }
      this[cppdb].table(factory, name, eponymous);
      return this;
    };
    function wrapFactory(factory) {
      return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
        const thisObject = {
          module: moduleName,
          database: databaseName,
          table: tableName
        };
        const def = apply.call(factory, thisObject, args);
        if (typeof def !== "object" || def === null) {
          throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
        }
        return parseTableDefinition(def, "returned", moduleName);
      };
    }
    function parseTableDefinition(def, verb, moduleName) {
      if (!hasOwnProperty.call(def, "rows")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
      }
      if (!hasOwnProperty.call(def, "columns")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
      }
      const rows = def.rows;
      if (typeof rows !== "function" || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
      }
      let columns = def.columns;
      if (!Array.isArray(columns) || !(columns = [...columns]).every((x) => typeof x === "string")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
      }
      if (columns.length !== new Set(columns).size) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
      }
      if (!columns.length) {
        throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
      }
      let parameters;
      if (hasOwnProperty.call(def, "parameters")) {
        parameters = def.parameters;
        if (!Array.isArray(parameters) || !(parameters = [...parameters]).every((x) => typeof x === "string")) {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
        }
      } else {
        parameters = inferParameters(rows);
      }
      if (parameters.length !== new Set(parameters).size) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
      }
      if (parameters.length > 32) {
        throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
      }
      for (const parameter of parameters) {
        if (columns.includes(parameter)) {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
        }
      }
      let safeIntegers = 2;
      if (hasOwnProperty.call(def, "safeIntegers")) {
        const bool = def.safeIntegers;
        if (typeof bool !== "boolean") {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
        }
        safeIntegers = +bool;
      }
      let directOnly = false;
      if (hasOwnProperty.call(def, "directOnly")) {
        directOnly = def.directOnly;
        if (typeof directOnly !== "boolean") {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
        }
      }
      const columnDefinitions = [
        ...parameters.map(identifier).map((str) => `${str} HIDDEN`),
        ...columns.map(identifier)
      ];
      return [
        `CREATE TABLE x(${columnDefinitions.join(", ")});`,
        wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
        parameters,
        safeIntegers,
        directOnly
      ];
    }
    function wrapGenerator(generator, columnMap, moduleName) {
      return function* virtualTable(...args) {
        const output = args.map((x) => Buffer.isBuffer(x) ? Buffer.from(x) : x);
        for (let i = 0; i < columnMap.size; ++i) {
          output.push(null);
        }
        for (const row of generator(...args)) {
          if (Array.isArray(row)) {
            extractRowArray(row, output, columnMap.size, moduleName);
            yield output;
          } else if (typeof row === "object" && row !== null) {
            extractRowObject(row, output, columnMap, moduleName);
            yield output;
          } else {
            throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
          }
        }
      };
    }
    function extractRowArray(row, output, columnCount, moduleName) {
      if (row.length !== columnCount) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
      }
      const offset = output.length - columnCount;
      for (let i = 0; i < columnCount; ++i) {
        output[i + offset] = row[i];
      }
    }
    function extractRowObject(row, output, columnMap, moduleName) {
      let count = 0;
      for (const key of Object.keys(row)) {
        const index = columnMap.get(key);
        if (index === void 0) {
          throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
        }
        output[index] = row[key];
        count += 1;
      }
      if (count !== columnMap.size) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
      }
    }
    function inferParameters({ length }) {
      if (!Number.isInteger(length) || length < 0) {
        throw new TypeError("Expected function.length to be a positive integer");
      }
      const params = [];
      for (let i = 0; i < length; ++i) {
        params.push(`$${i + 1}`);
      }
      return params;
    }
    var { hasOwnProperty } = Object.prototype;
    var { apply } = Function.prototype;
    var GeneratorFunctionPrototype = Object.getPrototypeOf(function* () {
    });
    var identifier = (str) => `"${str.replace(/"/g, '""')}"`;
    var defer = (x) => () => x;
  }
});

// ../node_modules/better-sqlite3/lib/methods/inspect.js
var require_inspect = __commonJS({
  "../node_modules/better-sqlite3/lib/methods/inspect.js"(exports, module) {
    "use strict";
    var DatabaseInspection = function Database2() {
    };
    module.exports = function inspect(depth, opts) {
      return Object.assign(new DatabaseInspection(), this);
    };
  }
});

// ../node_modules/better-sqlite3/lib/database.js
var require_database = __commonJS({
  "../node_modules/better-sqlite3/lib/database.js"(exports, module) {
    "use strict";
    var fs = __require("fs");
    var path = __require("path");
    var util = require_util();
    var SqliteError = require_sqlite_error();
    var DEFAULT_ADDON;
    function Database2(filenameGiven, options) {
      if (new.target == null) {
        return new Database2(filenameGiven, options);
      }
      let buffer;
      if (Buffer.isBuffer(filenameGiven)) {
        buffer = filenameGiven;
        filenameGiven = ":memory:";
      }
      if (filenameGiven == null) filenameGiven = "";
      if (options == null) options = {};
      if (typeof filenameGiven !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      if ("readOnly" in options) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
      if ("memory" in options) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
      const filename = filenameGiven.trim();
      const anonymous = filename === "" || filename === ":memory:";
      const readonly = util.getBooleanOption(options, "readonly");
      const fileMustExist = util.getBooleanOption(options, "fileMustExist");
      const timeout = "timeout" in options ? options.timeout : 5e3;
      const verbose = "verbose" in options ? options.verbose : null;
      const nativeBinding = "nativeBinding" in options ? options.nativeBinding : null;
      if (readonly && anonymous && !buffer) throw new TypeError("In-memory/temporary databases cannot be readonly");
      if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
      if (timeout > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
      if (verbose != null && typeof verbose !== "function") throw new TypeError('Expected the "verbose" option to be a function');
      if (nativeBinding != null && typeof nativeBinding !== "string" && typeof nativeBinding !== "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
      let addon;
      if (nativeBinding == null) {
        addon = DEFAULT_ADDON || (DEFAULT_ADDON = require_bindings()("better_sqlite3.node"));
      } else if (typeof nativeBinding === "string") {
        const requireFunc = typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : __require;
        addon = requireFunc(path.resolve(nativeBinding).replace(/(\.node)?$/, ".node"));
      } else {
        addon = nativeBinding;
      }
      if (!addon.isInitialized) {
        addon.setErrorConstructor(SqliteError);
        addon.isInitialized = true;
      }
      if (!anonymous && !filename.startsWith("file:") && !fs.existsSync(path.dirname(filename))) {
        throw new TypeError("Cannot open database because the directory does not exist");
      }
      Object.defineProperties(this, {
        [util.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
        ...wrappers.getters
      });
    }
    var wrappers = require_wrappers();
    Database2.prototype.prepare = wrappers.prepare;
    Database2.prototype.transaction = require_transaction();
    Database2.prototype.pragma = require_pragma();
    Database2.prototype.backup = require_backup();
    Database2.prototype.serialize = require_serialize();
    Database2.prototype.function = require_function();
    Database2.prototype.aggregate = require_aggregate();
    Database2.prototype.table = require_table();
    Database2.prototype.loadExtension = wrappers.loadExtension;
    Database2.prototype.exec = wrappers.exec;
    Database2.prototype.close = wrappers.close;
    Database2.prototype.defaultSafeIntegers = wrappers.defaultSafeIntegers;
    Database2.prototype.unsafeMode = wrappers.unsafeMode;
    Database2.prototype[util.inspect] = require_inspect();
    module.exports = Database2;
  }
});

// ../node_modules/better-sqlite3/lib/index.js
var require_lib = __commonJS({
  "../node_modules/better-sqlite3/lib/index.js"(exports, module) {
    "use strict";
    module.exports = require_database();
    module.exports.SqliteError = require_sqlite_error();
  }
});

// ../v2-core/dynamodb/client.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
function getTableName() {
  return process.env.DYNAMODB_TABLE_NAME ?? "yoytube-main";
}
function getDynamoClient() {
  if (documentClient) return documentClient;
  const region = process.env.AWS_REGION ?? "eu-west-1";
  const client = new DynamoDBClient({ region });
  documentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true }
  });
  return documentClient;
}
var documentClient;
var init_client = __esm({
  "../v2-core/dynamodb/client.ts"() {
    "use strict";
    documentClient = null;
  }
});

// ../v2-core/dynamodb/dynamo-repository.ts
var dynamo_repository_exports = {};
__export(dynamo_repository_exports, {
  deleteItem: () => deleteItem,
  getItem: () => getItem,
  putItem: () => putItem,
  queryByUser: () => queryByUser2,
  updateItem: () => updateItem
});
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
async function putItem(item) {
  const client = getDynamoClient();
  await client.send(
    new PutCommand({
      TableName: getTableName(),
      Item: item
    })
  );
}
async function getItem(pk, sk) {
  const client = getDynamoClient();
  const result = await client.send(
    new GetCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk }
    })
  );
  return result.Item ?? null;
}
async function queryByUser2(userId, skPrefix) {
  const client = getDynamoClient();
  const result = await client.send(
    new QueryCommand({
      TableName: getTableName(),
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": userPk(userId),
        ":skPrefix": skPrefix
      }
    })
  );
  return result.Items ?? [];
}
async function deleteItem(pk, sk) {
  const client = getDynamoClient();
  await client.send(
    new DeleteCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk }
    })
  );
}
async function updateItem(pk, sk, updates) {
  const entries = Object.entries(updates).filter(([, value]) => value !== void 0);
  if (entries.length === 0) return;
  const expressionParts = [];
  const names = {};
  const values = {};
  for (const [index, [key, value]] of entries.entries()) {
    const nameKey = `#k${index}`;
    const valueKey = `:v${index}`;
    names[nameKey] = key;
    values[valueKey] = value;
    expressionParts.push(`${nameKey} = ${valueKey}`);
  }
  const client = getDynamoClient();
  await client.send(
    new UpdateCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk },
      UpdateExpression: `SET ${expressionParts.join(", ")}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values
    })
  );
}
var init_dynamo_repository = __esm({
  "../v2-core/dynamodb/dynamo-repository.ts"() {
    "use strict";
    init_client();
    init_keys();
  }
});

// ../v2-core/errors.ts
var ApiError = class extends Error {
  constructor(message, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
};
var UnauthorizedError = class extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
};
function isApiError(error) {
  return error instanceof ApiError;
}

// ../v2-core/services/deck-service.ts
init_keys();

// ../v2-core/auth/config.ts
function getCognitoConfig() {
  const region = process.env.AWS_REGION ?? process.env.COGNITO_REGION ?? "eu-west-1";
  const userPoolId = process.env.COGNITO_USER_POOL_ID ?? "";
  const clientId = process.env.COGNITO_CLIENT_ID ?? "";
  return { region, userPoolId, clientId };
}
function isCognitoConfigured() {
  const { userPoolId, clientId } = getCognitoConfig();
  return Boolean(userPoolId && clientId);
}

// ../v2-core/storage/config.ts
function getStorageBackend() {
  const configured = process.env.STORAGE_BACKEND?.trim().toLowerCase();
  if (configured === "local" || configured === "dynamodb") {
    return configured;
  }
  return isCognitoConfigured() ? "dynamodb" : "local";
}
function isLocalBackend() {
  return getStorageBackend() === "local";
}
function getLocalDbPath() {
  return process.env.LOCAL_DB_PATH ?? "data/local.db";
}

// ../v2-core/storage/local-db.ts
var import_better_sqlite3 = __toESM(require_lib());
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
var database = null;
function ensureSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      PK TEXT NOT NULL,
      SK TEXT NOT NULL,
      entityType TEXT NOT NULL,
      userId TEXT NOT NULL,
      data TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER,
      PRIMARY KEY (PK, SK)
    );

    CREATE INDEX IF NOT EXISTS idx_items_user_sk ON items(userId, SK);

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      passwordHash TEXT NOT NULL DEFAULT '',
      emailVerified INTEGER NOT NULL DEFAULT 1,
      resetCode TEXT,
      resetCodeExpiresAt INTEGER,
      googleId TEXT,
      authProvider TEXT NOT NULL DEFAULT 'local'
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(userId);

    CREATE TABLE IF NOT EXISTS flashcards (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      example TEXT NOT NULL DEFAULT '',
      videoId TEXT,
      createdAt INTEGER NOT NULL,
      meta TEXT NOT NULL DEFAULT '{}'
    );

    CREATE INDEX IF NOT EXISTS idx_flashcards_user ON flashcards(userId);
    CREATE INDEX IF NOT EXISTS idx_flashcards_user_video ON flashcards(userId, videoId);

    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      timestamp REAL NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(userId);
    CREATE INDEX IF NOT EXISTS idx_bookmarks_user_video ON bookmarks(userId, videoId);

    CREATE TABLE IF NOT EXISTS quiz_results (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      score INTEGER NOT NULL,
      totalQuestions INTEGER NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON quiz_results(userId);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_user_video ON quiz_results(userId, videoId);
    CREATE INDEX IF NOT EXISTS idx_quiz_results_user_created ON quiz_results(userId, createdAt);

    CREATE TABLE IF NOT EXISTS daily_study_log (
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      cardsReviewed INTEGER NOT NULL DEFAULT 0,
      correctReviews INTEGER NOT NULL DEFAULT 0,
      incorrectReviews INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      PRIMARY KEY (userId, date)
    );

    CREATE INDEX IF NOT EXISTS idx_daily_study_user ON daily_study_log(userId);
    CREATE INDEX IF NOT EXISTS idx_daily_study_user_date ON daily_study_log(userId, date);

    CREATE TABLE IF NOT EXISTS pronunciation_attempts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      videoId TEXT NOT NULL,
      sentenceId TEXT,
      phraseId TEXT,
      expectedText TEXT NOT NULL,
      recognizedText TEXT NOT NULL,
      score INTEGER NOT NULL,
      missedWords TEXT NOT NULL DEFAULT '[]',
      extraWords TEXT NOT NULL DEFAULT '[]',
      durationMs INTEGER NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_pronunciation_attempts_user ON pronunciation_attempts(userId);
    CREATE INDEX IF NOT EXISTS idx_pronunciation_attempts_user_created
      ON pronunciation_attempts(userId, createdAt);

    CREATE TABLE IF NOT EXISTS vocabulary_progress (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      word TEXT NOT NULL,
      reviewCount INTEGER NOT NULL DEFAULT 0,
      mastered INTEGER NOT NULL DEFAULT 0,
      lastReviewDate INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_vocabulary_progress_user ON vocabulary_progress(userId);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_vocabulary_progress_user_word
      ON vocabulary_progress(userId, word);

    CREATE TABLE IF NOT EXISTS sentence_explanations (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      sentence TEXT NOT NULL,
      explanation TEXT NOT NULL,
      translation TEXT NOT NULL DEFAULT '',
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sentence_explanations_user ON sentence_explanations(userId);
    CREATE INDEX IF NOT EXISTS idx_sentence_explanations_user_created
      ON sentence_explanations(userId, createdAt);

    CREATE TABLE IF NOT EXISTS selection_analyses (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      selectedText TEXT NOT NULL,
      analysis TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_selection_analyses_user ON selection_analyses(userId);
    CREATE INDEX IF NOT EXISTS idx_selection_analyses_user_created
      ON selection_analyses(userId, createdAt);

    CREATE TABLE IF NOT EXISTS user_settings (
      userId TEXT PRIMARY KEY,
      interfaceLanguage TEXT NOT NULL DEFAULT 'uk',
      translationLanguage TEXT NOT NULL DEFAULT 'uk',
      theme TEXT NOT NULL DEFAULT 'light',
      autoPause TEXT NOT NULL DEFAULT '{}',
      bilingualMode INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS user_subscriptions (
      userId TEXT PRIMARY KEY,
      plan TEXT NOT NULL DEFAULT 'free',
      status TEXT NOT NULL DEFAULT 'inactive',
      startDate INTEGER,
      endDate INTEGER
    );

    CREATE TABLE IF NOT EXISTS ai_usage (
      userId TEXT NOT NULL,
      periodKey TEXT NOT NULL,
      requestCount INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (userId, periodKey)
    );

    CREATE INDEX IF NOT EXISTS idx_ai_usage_user_period
      ON ai_usage(userId, periodKey);
  `);
}
function getLocalDatabase() {
  if (database) return database;
  const dbPath = resolve(process.cwd(), getLocalDbPath());
  mkdirSync(dirname(dbPath), { recursive: true });
  database = new import_better_sqlite3.default(dbPath);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  ensureSchema(database);
  migrateUsersTable(database);
  migrateUserSettingsTable(database);
  migrateFlashcardsFromItems(database);
  return database;
}
function migrateUserSettingsTable(db) {
  const columns = db.prepare(`PRAGMA table_info(user_settings)`).all();
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("dailyCardGoal")) {
    db.exec(
      `ALTER TABLE user_settings ADD COLUMN dailyCardGoal INTEGER NOT NULL DEFAULT 30`
    );
  }
  if (!names.has("vocabularyGoal")) {
    db.exec(
      `ALTER TABLE user_settings ADD COLUMN vocabularyGoal INTEGER NOT NULL DEFAULT 1000`
    );
  }
  if (!names.has("learningLevel")) {
    db.exec(
      `ALTER TABLE user_settings ADD COLUMN learningLevel TEXT NOT NULL DEFAULT 'intermediate'`
    );
  }
}
function migrateUsersTable(db) {
  const columns = db.prepare(`PRAGMA table_info(users)`).all();
  const names = new Set(columns.map((column) => column.name));
  if (!names.has("googleId")) {
    db.exec(`ALTER TABLE users ADD COLUMN googleId TEXT`);
  }
  if (!names.has("authProvider")) {
    db.exec(
      `ALTER TABLE users ADD COLUMN authProvider TEXT NOT NULL DEFAULT 'local'`
    );
  }
  if (!names.has("name")) {
    db.exec(`ALTER TABLE users ADD COLUMN name TEXT NOT NULL DEFAULT ''`);
  }
  if (!names.has("updatedAt")) {
    db.exec(`ALTER TABLE users ADD COLUMN updatedAt INTEGER`);
    db.exec(`UPDATE users SET updatedAt = createdAt WHERE updatedAt IS NULL`);
  }
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
      ON users(googleId) WHERE googleId IS NOT NULL
  `);
}
function migrateFlashcardsFromItems(db) {
  const legacyRows = db.prepare(
    `SELECT userId, SK, data, createdAt, updatedAt
       FROM items
       WHERE entityType = 'CARD' OR SK LIKE 'CARD#%'`
  ).all();
  const insert = db.prepare(
    `INSERT OR IGNORE INTO flashcards (
      id, userId, word, translation, example, videoId, createdAt, meta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const row of legacyRows) {
    const extra = JSON.parse(row.data);
    const id = String(extra.id ?? row.SK.replace(/^CARD#/, ""));
    const meta = {
      tags: extra.tags,
      deckIds: extra.deckIds,
      repetitions: extra.repetitions,
      ease: extra.ease,
      interval: extra.interval,
      nextReview: extra.nextReview,
      knownCount: extra.knownCount,
      unknownCount: extra.unknownCount,
      updatedAt: row.updatedAt ?? extra.updatedAt
    };
    insert.run(
      id,
      row.userId,
      String(extra.word ?? ""),
      String(extra.translation ?? ""),
      String(extra.example ?? ""),
      extra.videoId ? String(extra.videoId) : null,
      row.createdAt,
      JSON.stringify(meta)
    );
  }
}

// ../v2-core/storage/local-repository.ts
function deserializeItem(row) {
  const extra = JSON.parse(row.data);
  return {
    PK: row.PK,
    SK: row.SK,
    entityType: row.entityType,
    userId: row.userId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? void 0,
    ...extra
  };
}
function queryByUser(userId, skPrefix) {
  const db = getLocalDatabase();
  const rows = db.prepare(
    `SELECT PK, SK, entityType, userId, data, createdAt, updatedAt
       FROM items
       WHERE userId = ? AND SK LIKE ?
       ORDER BY createdAt ASC`
  ).all(userId, `${skPrefix}%`);
  return rows.map((row) => deserializeItem(row));
}

// ../v2-core/dynamodb/repository.ts
async function getDynamoRepo() {
  try {
    return await Promise.resolve().then(() => (init_dynamo_repository(), dynamo_repository_exports));
  } catch {
    throw new ApiError(
      "AWS DynamoDB mode is not available. Install AWS dependencies or set STORAGE_BACKEND=local.",
      503,
      "DYNAMODB_UNAVAILABLE"
    );
  }
}
async function queryByUser3(userId, skPrefix) {
  if (isLocalBackend()) {
    return queryByUser(userId, skPrefix);
  }
  const dynamo = await getDynamoRepo();
  return dynamo.queryByUser(userId, skPrefix);
}

// ../v2-core/services/deck-service.ts
function toRecord(item) {
  return {
    id: item.id,
    userId: item.userId,
    name: item.name,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}
async function listDecks(auth) {
  const items = await queryByUser3(auth.userId, "DECK#");
  return items.map(toRecord).sort((left, right) => left.name.localeCompare(right.name));
}

// ../v2-core/auth/context.ts
function getAuthFromApiGatewayEvent(event) {
  const claims = event.requestContext.authorizer?.jwt?.claims;
  if (!claims?.sub) {
    throw new UnauthorizedError("Missing JWT claims");
  }
  const email = typeof claims.email === "string" ? claims.email : typeof claims.username === "string" ? claims.username : "";
  return {
    userId: String(claims.sub),
    email
  };
}

// ../v2-core/logging/logger.ts
function write(level, message, context) {
  const entry = {
    level,
    message,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    ...context
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
var logger = {
  debug(message, context) {
    write("debug", message, context);
  },
  info(message, context) {
    write("info", message, context);
  },
  warn(message, context) {
    write("warn", message, context);
  },
  error(message, context) {
    write("error", message, context);
  }
};

// ../v2-core/response.ts
function jsonResponse(body, statusCode = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  });
}
function successResponse(data) {
  return data === void 0 ? { success: true } : { success: true, data };
}
function errorResponse(error, code) {
  return { success: false, error, code };
}
function handleServiceError(error) {
  if (isApiError(error)) {
    return jsonResponse(
      errorResponse(error.message, error.code),
      error.statusCode
    );
  }
  logger.error("Unhandled service error", {
    code: "INTERNAL",
    error: error instanceof Error ? error.message : String(error)
  });
  return jsonResponse(errorResponse("Internal server error", "INTERNAL"), 500);
}

// ../v2-core/lambda/handler.ts
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  };
}
function createProtectedHandler(handler2) {
  return async (event) => {
    if (event.requestContext.http.method === "OPTIONS") {
      return {
        statusCode: 204,
        headers: corsHeaders()
      };
    }
    try {
      const auth = getAuthFromApiGatewayEvent(event);
      return await handler2(event, auth);
    } catch (error) {
      const response = handleServiceError(error);
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        },
        body: await response.text()
      };
    }
  };
}
async function ok(data, statusCode = 200) {
  const response = jsonResponse(successResponse(data), statusCode, corsHeaders());
  return {
    statusCode: response.status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    },
    body: await response.text()
  };
}

// src/handlers/decks/list.ts
var handler = createProtectedHandler(async (_event, auth) => {
  const decks = await listDecks(auth);
  return ok(decks);
});
export {
  handler
};
//# sourceMappingURL=list.js.map
