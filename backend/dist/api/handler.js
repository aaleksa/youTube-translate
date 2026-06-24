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

// ../v2-core/errors.ts
var errors_exports = {};
__export(errors_exports, {
  ApiError: () => ApiError,
  ConflictError: () => ConflictError,
  ForbiddenError: () => ForbiddenError,
  NotFoundError: () => NotFoundError,
  QuotaExceededError: () => QuotaExceededError,
  UnauthorizedError: () => UnauthorizedError,
  isApiError: () => isApiError
});
function isApiError(error) {
  return error instanceof ApiError;
}
var ApiError, UnauthorizedError, NotFoundError, ConflictError, ForbiddenError, QuotaExceededError;
var init_errors = __esm({
  "../v2-core/errors.ts"() {
    "use strict";
    ApiError = class extends Error {
      constructor(message2, statusCode = 400, code = "BAD_REQUEST") {
        super(message2);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.code = code;
      }
    };
    UnauthorizedError = class extends ApiError {
      constructor(message2 = "Unauthorized") {
        super(message2, 401, "UNAUTHORIZED");
        this.name = "UnauthorizedError";
      }
    };
    NotFoundError = class extends ApiError {
      constructor(message2 = "Not found") {
        super(message2, 404, "NOT_FOUND");
        this.name = "NotFoundError";
      }
    };
    ConflictError = class extends ApiError {
      constructor(message2 = "Conflict") {
        super(message2, 409, "CONFLICT");
        this.name = "ConflictError";
      }
    };
    ForbiddenError = class extends ApiError {
      constructor(message2 = "Forbidden", code = "FORBIDDEN") {
        super(message2, 403, code);
        this.name = "ForbiddenError";
      }
    };
    QuotaExceededError = class extends ApiError {
      constructor(message2 = "AI request limit reached") {
        super(message2, 429, "AI_QUOTA_EXCEEDED");
        this.name = "QuotaExceededError";
      }
    };
  }
});

// ../v2-core/auth/google-config.ts
function getGoogleClientId() {
  return process.env.GOOGLE_CLIENT_ID?.trim() || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim() || "";
}
function isGoogleAuthConfigured() {
  return Boolean(getGoogleClientId());
}
var init_google_config = __esm({
  "../v2-core/auth/google-config.ts"() {
    "use strict";
  }
});

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
var init_config = __esm({
  "../v2-core/auth/config.ts"() {
    "use strict";
  }
});

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
function getLocalAuthSecret() {
  return process.env.LOCAL_AUTH_SECRET ?? "yoytube-local-dev-secret-change-me";
}
function isEmailVerificationEnabled() {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}
var init_config2 = __esm({
  "../v2-core/storage/config.ts"() {
    "use strict";
    init_config();
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
    function SqliteError(message2, code) {
      if (new.target !== SqliteError) {
        return new SqliteError(message2, code);
      }
      if (typeof code !== "string") {
        throw new TypeError("Expected second argument to be a string");
      }
      Error.call(this, message2);
      descriptor.value = "" + message2;
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

// ../v2-core/storage/local-db.ts
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
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
  migrateFlashcardsFromItems(database);
  return database;
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
var import_better_sqlite3, database;
var init_local_db = __esm({
  "../v2-core/storage/local-db.ts"() {
    "use strict";
    import_better_sqlite3 = __toESM(require_lib());
    init_config2();
    database = null;
  }
});

// ../node_modules/jose/dist/webapi/lib/buffer_utils.js
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
function encode(string) {
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127) {
      throw new TypeError("non-ASCII string encountered in encode()");
    }
    bytes[i] = code;
  }
  return bytes;
}
var encoder, decoder, MAX_INT32;
var init_buffer_utils = __esm({
  "../node_modules/jose/dist/webapi/lib/buffer_utils.js"() {
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    MAX_INT32 = 2 ** 32;
  }
});

// ../node_modules/jose/dist/webapi/lib/base64.js
function encodeBase64(input) {
  if (Uint8Array.prototype.toBase64) {
    return input.toBase64();
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < input.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
var init_base64 = __esm({
  "../node_modules/jose/dist/webapi/lib/base64.js"() {
  }
});

// ../node_modules/jose/dist/webapi/util/base64url.js
function decode(input) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
      alphabet: "base64url"
    });
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
function encode2(input) {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  if (Uint8Array.prototype.toBase64) {
    return unencoded.toBase64({ alphabet: "base64url", omitPadding: true });
  }
  return encodeBase64(unencoded).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
var init_base64url = __esm({
  "../node_modules/jose/dist/webapi/util/base64url.js"() {
    init_buffer_utils();
    init_base64();
  }
});

// ../node_modules/jose/dist/webapi/lib/crypto_key.js
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function checkHashLength(algorithm, expected) {
  const actual = getHashLength(algorithm.hash);
  if (actual !== expected)
    throw unusable(`SHA-${expected}`, "algorithm.hash");
}
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
function checkSigCryptoKey(key, alg, usage) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "Ed25519":
    case "EdDSA": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87": {
      if (!isAlgorithm(key.algorithm, alg))
        throw unusable(alg);
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usage);
}
var unusable, isAlgorithm;
var init_crypto_key = __esm({
  "../node_modules/jose/dist/webapi/lib/crypto_key.js"() {
    unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
    isAlgorithm = (algorithm, name) => algorithm.name === name;
  }
});

// ../node_modules/jose/dist/webapi/lib/invalid_key_input.js
function message(msg, actual, ...types) {
  types = types.filter(Boolean);
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
var invalidKeyInput, withAlg;
var init_invalid_key_input = __esm({
  "../node_modules/jose/dist/webapi/lib/invalid_key_input.js"() {
    invalidKeyInput = (actual, ...types) => message("Key must be ", actual, ...types);
    withAlg = (alg, actual, ...types) => message(`Key for the ${alg} algorithm must be `, actual, ...types);
  }
});

// ../node_modules/jose/dist/webapi/util/errors.js
var JOSEError, JWTClaimValidationFailed, JWTExpired, JOSEAlgNotAllowed, JOSENotSupported, JWSInvalid, JWTInvalid, JWSSignatureVerificationFailed;
var init_errors2 = __esm({
  "../node_modules/jose/dist/webapi/util/errors.js"() {
    JOSEError = class extends Error {
      static code = "ERR_JOSE_GENERIC";
      code = "ERR_JOSE_GENERIC";
      constructor(message2, options) {
        super(message2, options);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
      }
    };
    JWTClaimValidationFailed = class extends JOSEError {
      static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      claim;
      reason;
      payload;
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTExpired = class extends JOSEError {
      static code = "ERR_JWT_EXPIRED";
      code = "ERR_JWT_EXPIRED";
      claim;
      reason;
      payload;
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JOSEAlgNotAllowed = class extends JOSEError {
      static code = "ERR_JOSE_ALG_NOT_ALLOWED";
      code = "ERR_JOSE_ALG_NOT_ALLOWED";
    };
    JOSENotSupported = class extends JOSEError {
      static code = "ERR_JOSE_NOT_SUPPORTED";
      code = "ERR_JOSE_NOT_SUPPORTED";
    };
    JWSInvalid = class extends JOSEError {
      static code = "ERR_JWS_INVALID";
      code = "ERR_JWS_INVALID";
    };
    JWTInvalid = class extends JOSEError {
      static code = "ERR_JWT_INVALID";
      code = "ERR_JWT_INVALID";
    };
    JWSSignatureVerificationFailed = class extends JOSEError {
      static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      constructor(message2 = "signature verification failed", options) {
        super(message2, options);
      }
    };
  }
});

// ../node_modules/jose/dist/webapi/lib/is_key_like.js
var isCryptoKey, isKeyObject, isKeyLike;
var init_is_key_like = __esm({
  "../node_modules/jose/dist/webapi/lib/is_key_like.js"() {
    isCryptoKey = (key) => {
      if (key?.[Symbol.toStringTag] === "CryptoKey")
        return true;
      try {
        return key instanceof CryptoKey;
      } catch {
        return false;
      }
    };
    isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
    isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
  }
});

// ../node_modules/jose/dist/webapi/lib/helpers.js
function assertNotSet(value, name) {
  if (value) {
    throw new TypeError(`${name} can only be called once`);
  }
}
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}
var unprotected;
var init_helpers = __esm({
  "../node_modules/jose/dist/webapi/lib/helpers.js"() {
    init_base64url();
    unprotected = Symbol();
  }
});

// ../node_modules/jose/dist/webapi/lib/type_checks.js
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
function isDisjoint(...headers) {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}
var isObjectLike, isJWK, isPrivateJWK, isPublicJWK, isSecretJWK;
var init_type_checks = __esm({
  "../node_modules/jose/dist/webapi/lib/type_checks.js"() {
    isObjectLike = (value) => typeof value === "object" && value !== null;
    isJWK = (key) => isObject(key) && typeof key.kty === "string";
    isPrivateJWK = (key) => key.kty !== "oct" && (key.kty === "AKP" && typeof key.priv === "string" || typeof key.d === "string");
    isPublicJWK = (key) => key.kty !== "oct" && key.d === void 0 && key.priv === void 0;
    isSecretJWK = (key) => key.kty === "oct" && typeof key.k === "string";
  }
});

// ../node_modules/jose/dist/webapi/lib/signing.js
function checkKeyLength(alg, key) {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}
function subtleAlgorithm(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: parseInt(alg.slice(-3), 10) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
    case "EdDSA":
      return { name: "Ed25519" };
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      return { name: alg };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
async function getSigKey(alg, key, usage) {
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
    }
    return crypto.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  checkSigCryptoKey(key, alg, usage);
  return key;
}
async function sign(alg, key, data) {
  const cryptoKey = await getSigKey(alg, key, "sign");
  checkKeyLength(alg, cryptoKey);
  const signature = await crypto.subtle.sign(subtleAlgorithm(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}
async function verify(alg, key, signature, data) {
  const cryptoKey = await getSigKey(alg, key, "verify");
  checkKeyLength(alg, cryptoKey);
  const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
  try {
    return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}
var init_signing = __esm({
  "../node_modules/jose/dist/webapi/lib/signing.js"() {
    init_errors2();
    init_crypto_key();
    init_invalid_key_input();
  }
});

// ../node_modules/jose/dist/webapi/lib/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "AKP": {
      switch (jwk.alg) {
        case "ML-DSA-44":
        case "ML-DSA-65":
        case "ML-DSA-87":
          algorithm = { name: jwk.alg };
          keyUsages = jwk.priv ? ["sign"] : ["verify"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
        case "ES384":
        case "ES512":
          algorithm = {
            name: "ECDSA",
            namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[jwk.alg]
          };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
        case "EdDSA":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
async function jwkToKey(jwk) {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const keyData = { ...jwk };
  if (keyData.kty !== "AKP") {
    delete keyData.alg;
  }
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? (jwk.d || jwk.priv ? false : true), jwk.key_ops ?? keyUsages);
}
var unsupportedAlg;
var init_jwk_to_key = __esm({
  "../node_modules/jose/dist/webapi/lib/jwk_to_key.js"() {
    init_errors2();
    unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
  }
});

// ../node_modules/jose/dist/webapi/lib/normalize_key.js
async function normalizeKey(key, alg) {
  if (key instanceof Uint8Array) {
    return key;
  }
  if (isCryptoKey(key)) {
    return key;
  }
  if (isKeyObject(key)) {
    if (key.type === "secret") {
      return key.export();
    }
    if ("toCryptoKey" in key && typeof key.toCryptoKey === "function") {
      try {
        return handleKeyObject(key, alg);
      } catch (err) {
        if (err instanceof TypeError) {
          throw err;
        }
      }
    }
    let jwk = key.export({ format: "jwk" });
    return handleJWK(key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k) {
      return decode(key.k);
    }
    return handleJWK(key, key, alg, true);
  }
  throw new Error("unreachable");
}
var unusableForAlg, cache, handleJWK, handleKeyObject;
var init_normalize_key = __esm({
  "../node_modules/jose/dist/webapi/lib/normalize_key.js"() {
    init_type_checks();
    init_base64url();
    init_jwk_to_key();
    init_is_key_like();
    unusableForAlg = "given KeyObject instance cannot be used for this algorithm";
    handleJWK = async (key, jwk, alg, freeze = false) => {
      cache ||= /* @__PURE__ */ new WeakMap();
      let cached = cache.get(key);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const cryptoKey = await jwkToKey({ ...jwk, alg });
      if (freeze)
        Object.freeze(key);
      if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    };
    handleKeyObject = (keyObject, alg) => {
      cache ||= /* @__PURE__ */ new WeakMap();
      let cached = cache.get(keyObject);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const isPublic = keyObject.type === "public";
      const extractable = isPublic ? true : false;
      let cryptoKey;
      if (keyObject.asymmetricKeyType === "x25519") {
        switch (alg) {
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            break;
          default:
            throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ["deriveBits"]);
      }
      if (keyObject.asymmetricKeyType === "ed25519") {
        if (alg !== "EdDSA" && alg !== "Ed25519") {
          throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
          isPublic ? "verify" : "sign"
        ]);
      }
      switch (keyObject.asymmetricKeyType) {
        case "ml-dsa-44":
        case "ml-dsa-65":
        case "ml-dsa-87": {
          if (alg !== keyObject.asymmetricKeyType.toUpperCase()) {
            throw new TypeError(unusableForAlg);
          }
          cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
            isPublic ? "verify" : "sign"
          ]);
        }
      }
      if (keyObject.asymmetricKeyType === "rsa") {
        let hash;
        switch (alg) {
          case "RSA-OAEP":
            hash = "SHA-1";
            break;
          case "RS256":
          case "PS256":
          case "RSA-OAEP-256":
            hash = "SHA-256";
            break;
          case "RS384":
          case "PS384":
          case "RSA-OAEP-384":
            hash = "SHA-384";
            break;
          case "RS512":
          case "PS512":
          case "RSA-OAEP-512":
            hash = "SHA-512";
            break;
          default:
            throw new TypeError(unusableForAlg);
        }
        if (alg.startsWith("RSA-OAEP")) {
          return keyObject.toCryptoKey({
            name: "RSA-OAEP",
            hash
          }, extractable, isPublic ? ["encrypt"] : ["decrypt"]);
        }
        cryptoKey = keyObject.toCryptoKey({
          name: alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5",
          hash
        }, extractable, [isPublic ? "verify" : "sign"]);
      }
      if (keyObject.asymmetricKeyType === "ec") {
        const nist = /* @__PURE__ */ new Map([
          ["prime256v1", "P-256"],
          ["secp384r1", "P-384"],
          ["secp521r1", "P-521"]
        ]);
        const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
        if (!namedCurve) {
          throw new TypeError(unusableForAlg);
        }
        const expectedCurve = { ES256: "P-256", ES384: "P-384", ES512: "P-521" };
        if (expectedCurve[alg] && namedCurve === expectedCurve[alg]) {
          cryptoKey = keyObject.toCryptoKey({
            name: "ECDSA",
            namedCurve
          }, extractable, [isPublic ? "verify" : "sign"]);
        }
        if (alg.startsWith("ECDH-ES")) {
          cryptoKey = keyObject.toCryptoKey({
            name: "ECDH",
            namedCurve
          }, extractable, isPublic ? [] : ["deriveBits"]);
        }
      }
      if (!cryptoKey) {
        throw new TypeError(unusableForAlg);
      }
      if (!cached) {
        cache.set(keyObject, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    };
  }
});

// ../node_modules/jose/dist/webapi/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
var init_validate_crit = __esm({
  "../node_modules/jose/dist/webapi/lib/validate_crit.js"() {
    init_errors2();
  }
});

// ../node_modules/jose/dist/webapi/lib/validate_algorithms.js
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}
var init_validate_algorithms = __esm({
  "../node_modules/jose/dist/webapi/lib/validate_algorithms.js"() {
  }
});

// ../node_modules/jose/dist/webapi/lib/check_key_type.js
function checkKeyType(alg, key, usage) {
  switch (alg.substring(0, 2)) {
    case "A1":
    case "A2":
    case "di":
    case "HS":
    case "PB":
      symmetricTypeCheck(alg, key, usage);
      break;
    default:
      asymmetricTypeCheck(alg, key, usage);
  }
}
var tag, jwkMatchesOp, symmetricTypeCheck, asymmetricTypeCheck;
var init_check_key_type = __esm({
  "../node_modules/jose/dist/webapi/lib/check_key_type.js"() {
    init_invalid_key_input();
    init_is_key_like();
    init_type_checks();
    tag = (key) => key?.[Symbol.toStringTag];
    jwkMatchesOp = (alg, key, usage) => {
      if (key.use !== void 0) {
        let expected;
        switch (usage) {
          case "sign":
          case "verify":
            expected = "sig";
            break;
          case "encrypt":
          case "decrypt":
            expected = "enc";
            break;
        }
        if (key.use !== expected) {
          throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
        }
      }
      if (key.alg !== void 0 && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
      }
      if (Array.isArray(key.key_ops)) {
        let expectedKeyOp;
        switch (true) {
          case (usage === "sign" || usage === "verify"):
          case alg === "dir":
          case alg.includes("CBC-HS"):
            expectedKeyOp = usage;
            break;
          case alg.startsWith("PBES2"):
            expectedKeyOp = "deriveBits";
            break;
          case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
            if (!alg.includes("GCM") && alg.endsWith("KW")) {
              expectedKeyOp = usage === "encrypt" ? "wrapKey" : "unwrapKey";
            } else {
              expectedKeyOp = usage;
            }
            break;
          case (usage === "encrypt" && alg.startsWith("RSA")):
            expectedKeyOp = "wrapKey";
            break;
          case usage === "decrypt":
            expectedKeyOp = alg.startsWith("RSA") ? "unwrapKey" : "deriveBits";
            break;
        }
        if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
          throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
        }
      }
      return true;
    };
    symmetricTypeCheck = (alg, key, usage) => {
      if (key instanceof Uint8Array)
        return;
      if (isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
      }
      if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
      }
      if (key.type !== "secret") {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
      }
    };
    asymmetricTypeCheck = (alg, key, usage) => {
      if (isJWK(key)) {
        switch (usage) {
          case "decrypt":
          case "sign":
            if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation must be a private JWK`);
          case "encrypt":
          case "verify":
            if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation must be a public JWK`);
        }
      }
      if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
      }
      if (key.type === "secret") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
      }
      if (key.type === "public") {
        switch (usage) {
          case "sign":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
          case "decrypt":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
      }
      if (key.type === "private") {
        switch (usage) {
          case "verify":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
          case "encrypt":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
      }
    };
  }
});

// ../node_modules/jose/dist/webapi/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!isDisjoint(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validateAlgorithms("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
  }
  checkKeyType(alg, key, "verify");
  const data = concat(jws.protected !== void 0 ? encode(jws.protected) : new Uint8Array(), encode("."), typeof jws.payload === "string" ? b64 ? encode(jws.payload) : encoder.encode(jws.payload) : jws.payload);
  const signature = decodeBase64url(jws.signature, "signature", JWSInvalid);
  const k = await normalizeKey(key, alg);
  const verified = await verify(alg, k, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    payload = decodeBase64url(jws.payload, "payload", JWSInvalid);
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key: k };
  }
  return result;
}
var init_verify = __esm({
  "../node_modules/jose/dist/webapi/jws/flattened/verify.js"() {
    init_base64url();
    init_signing();
    init_errors2();
    init_buffer_utils();
    init_helpers();
    init_type_checks();
    init_type_checks();
    init_check_key_type();
    init_validate_crit();
    init_validate_algorithms();
    init_normalize_key();
  }
});

// ../node_modules/jose/dist/webapi/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify2 = __esm({
  "../node_modules/jose/dist/webapi/jws/compact/verify.js"() {
    init_verify();
    init_errors2();
    init_buffer_utils();
  }
});

// ../node_modules/jose/dist/webapi/lib/jwt_claims_set.js
function secs(str) {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now2 = epoch(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now2 + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now2 - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now2 - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}
var epoch, minute, hour, day, week, year, REGEX, normalizeTyp, checkAudiencePresence, JWTClaimsBuilder;
var init_jwt_claims_set = __esm({
  "../node_modules/jose/dist/webapi/lib/jwt_claims_set.js"() {
    init_errors2();
    init_buffer_utils();
    init_type_checks();
    epoch = (date) => Math.floor(date.getTime() / 1e3);
    minute = 60;
    hour = minute * 60;
    day = hour * 24;
    week = day * 7;
    year = day * 365.25;
    REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
    normalizeTyp = (value) => {
      if (value.includes("/")) {
        return value.toLowerCase();
      }
      return `application/${value.toLowerCase()}`;
    };
    checkAudiencePresence = (audPayload, audOption) => {
      if (typeof audPayload === "string") {
        return audOption.includes(audPayload);
      }
      if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
      }
      return false;
    };
    JWTClaimsBuilder = class {
      #payload;
      constructor(payload) {
        if (!isObject(payload)) {
          throw new TypeError("JWT Claims Set MUST be an object");
        }
        this.#payload = structuredClone(payload);
      }
      data() {
        return encoder.encode(JSON.stringify(this.#payload));
      }
      get iss() {
        return this.#payload.iss;
      }
      set iss(value) {
        this.#payload.iss = value;
      }
      get sub() {
        return this.#payload.sub;
      }
      set sub(value) {
        this.#payload.sub = value;
      }
      get aud() {
        return this.#payload.aud;
      }
      set aud(value) {
        this.#payload.aud = value;
      }
      set jti(value) {
        this.#payload.jti = value;
      }
      set nbf(value) {
        if (typeof value === "number") {
          this.#payload.nbf = validateInput("setNotBefore", value);
        } else if (value instanceof Date) {
          this.#payload.nbf = validateInput("setNotBefore", epoch(value));
        } else {
          this.#payload.nbf = epoch(/* @__PURE__ */ new Date()) + secs(value);
        }
      }
      set exp(value) {
        if (typeof value === "number") {
          this.#payload.exp = validateInput("setExpirationTime", value);
        } else if (value instanceof Date) {
          this.#payload.exp = validateInput("setExpirationTime", epoch(value));
        } else {
          this.#payload.exp = epoch(/* @__PURE__ */ new Date()) + secs(value);
        }
      }
      set iat(value) {
        if (value === void 0) {
          this.#payload.iat = epoch(/* @__PURE__ */ new Date());
        } else if (value instanceof Date) {
          this.#payload.iat = validateInput("setIssuedAt", epoch(value));
        } else if (typeof value === "string") {
          this.#payload.iat = validateInput("setIssuedAt", epoch(/* @__PURE__ */ new Date()) + secs(value));
        } else {
          this.#payload.iat = validateInput("setIssuedAt", value);
        }
      }
    };
  }
});

// ../node_modules/jose/dist/webapi/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify3 = __esm({
  "../node_modules/jose/dist/webapi/jwt/verify.js"() {
    init_verify2();
    init_jwt_claims_set();
    init_errors2();
  }
});

// ../node_modules/jose/dist/webapi/jws/flattened/sign.js
var FlattenedSign;
var init_sign = __esm({
  "../node_modules/jose/dist/webapi/jws/flattened/sign.js"() {
    init_base64url();
    init_signing();
    init_type_checks();
    init_errors2();
    init_buffer_utils();
    init_check_key_type();
    init_validate_crit();
    init_normalize_key();
    init_helpers();
    FlattenedSign = class {
      #payload;
      #protectedHeader;
      #unprotectedHeader;
      constructor(payload) {
        if (!(payload instanceof Uint8Array)) {
          throw new TypeError("payload must be an instance of Uint8Array");
        }
        this.#payload = payload;
      }
      setProtectedHeader(protectedHeader) {
        assertNotSet(this.#protectedHeader, "setProtectedHeader");
        this.#protectedHeader = protectedHeader;
        return this;
      }
      setUnprotectedHeader(unprotectedHeader) {
        assertNotSet(this.#unprotectedHeader, "setUnprotectedHeader");
        this.#unprotectedHeader = unprotectedHeader;
        return this;
      }
      async sign(key, options) {
        if (!this.#protectedHeader && !this.#unprotectedHeader) {
          throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
        }
        if (!isDisjoint(this.#protectedHeader, this.#unprotectedHeader)) {
          throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
        }
        const joseHeader = {
          ...this.#protectedHeader,
          ...this.#unprotectedHeader
        };
        const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this.#protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has("b64")) {
          b64 = this.#protectedHeader.b64;
          if (typeof b64 !== "boolean") {
            throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
          }
        }
        const { alg } = joseHeader;
        if (typeof alg !== "string" || !alg) {
          throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        checkKeyType(alg, key, "sign");
        let payloadS;
        let payloadB;
        if (b64) {
          payloadS = encode2(this.#payload);
          payloadB = encode(payloadS);
        } else {
          payloadB = this.#payload;
          payloadS = "";
        }
        let protectedHeaderString;
        let protectedHeaderBytes;
        if (this.#protectedHeader) {
          protectedHeaderString = encode2(JSON.stringify(this.#protectedHeader));
          protectedHeaderBytes = encode(protectedHeaderString);
        } else {
          protectedHeaderString = "";
          protectedHeaderBytes = new Uint8Array();
        }
        const data = concat(protectedHeaderBytes, encode("."), payloadB);
        const k = await normalizeKey(key, alg);
        const signature = await sign(alg, k, data);
        const jws = {
          signature: encode2(signature),
          payload: payloadS
        };
        if (this.#unprotectedHeader) {
          jws.header = this.#unprotectedHeader;
        }
        if (this.#protectedHeader) {
          jws.protected = protectedHeaderString;
        }
        return jws;
      }
    };
  }
});

// ../node_modules/jose/dist/webapi/jws/compact/sign.js
var CompactSign;
var init_sign2 = __esm({
  "../node_modules/jose/dist/webapi/jws/compact/sign.js"() {
    init_sign();
    CompactSign = class {
      #flattened;
      constructor(payload) {
        this.#flattened = new FlattenedSign(payload);
      }
      setProtectedHeader(protectedHeader) {
        this.#flattened.setProtectedHeader(protectedHeader);
        return this;
      }
      async sign(key, options) {
        const jws = await this.#flattened.sign(key, options);
        if (jws.payload === void 0) {
          throw new TypeError("use the flattened module for creating JWS with b64: false");
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
      }
    };
  }
});

// ../node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT;
var init_sign3 = __esm({
  "../node_modules/jose/dist/webapi/jwt/sign.js"() {
    init_sign2();
    init_errors2();
    init_jwt_claims_set();
    SignJWT = class {
      #protectedHeader;
      #jwt;
      constructor(payload = {}) {
        this.#jwt = new JWTClaimsBuilder(payload);
      }
      setIssuer(issuer) {
        this.#jwt.iss = issuer;
        return this;
      }
      setSubject(subject) {
        this.#jwt.sub = subject;
        return this;
      }
      setAudience(audience) {
        this.#jwt.aud = audience;
        return this;
      }
      setJti(jwtId) {
        this.#jwt.jti = jwtId;
        return this;
      }
      setNotBefore(input) {
        this.#jwt.nbf = input;
        return this;
      }
      setExpirationTime(input) {
        this.#jwt.exp = input;
        return this;
      }
      setIssuedAt(input) {
        this.#jwt.iat = input;
        return this;
      }
      setProtectedHeader(protectedHeader) {
        this.#protectedHeader = protectedHeader;
        return this;
      }
      async sign(key, options) {
        const sig = new CompactSign(this.#jwt.data());
        sig.setProtectedHeader(this.#protectedHeader);
        if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes("b64") && this.#protectedHeader.b64 === false) {
          throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
        }
        return sig.sign(key, options);
      }
    };
  }
});

// ../node_modules/jose/dist/webapi/index.js
var init_webapi = __esm({
  "../node_modules/jose/dist/webapi/index.js"() {
    init_verify3();
    init_sign3();
  }
});

// ../v2-core/auth/local-jwt.ts
var local_jwt_exports = {};
__export(local_jwt_exports, {
  REFRESH_TOKEN_TTL_MS: () => REFRESH_TOKEN_TTL_MS,
  issueLocalTokens: () => issueLocalTokens,
  verifyLocalAccessToken: () => verifyLocalAccessToken
});
import { randomUUID } from "node:crypto";
function getSecretKey() {
  return new TextEncoder().encode(getLocalAuthSecret());
}
async function issueLocalTokens(user) {
  const secret = getSecretKey();
  const refreshToken = randomUUID();
  const expiresIn = 3600;
  const accessToken = await new SignJWT({
    email: user.email,
    token_use: "access"
  }).setProtectedHeader({ alg: "HS256" }).setSubject(user.userId).setIssuedAt().setExpirationTime(ACCESS_TOKEN_TTL).sign(secret);
  const idToken = await new SignJWT({
    email: user.email,
    token_use: "id"
  }).setProtectedHeader({ alg: "HS256" }).setSubject(user.userId).setIssuedAt().setExpirationTime(ACCESS_TOKEN_TTL).sign(secret);
  const { saveRefreshToken: saveRefreshToken2 } = await Promise.resolve().then(() => (init_local_auth_store(), local_auth_store_exports));
  saveRefreshToken2(refreshToken, user.userId, Date.now() + REFRESH_TOKEN_TTL_MS);
  return {
    accessToken,
    refreshToken,
    idToken,
    expiresIn
  };
}
async function verifyLocalAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.token_use !== "access") {
      throw new UnauthorizedError("Invalid token type");
    }
    return {
      userId: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : ""
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
var ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_MS;
var init_local_jwt = __esm({
  "../v2-core/auth/local-jwt.ts"() {
    "use strict";
    init_webapi();
    init_errors();
    init_config2();
    ACCESS_TOKEN_TTL = "1h";
    REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
  }
});

// ../v2-core/auth/google-verify.ts
var google_verify_exports = {};
__export(google_verify_exports, {
  verifyGoogleIdToken: () => verifyGoogleIdToken
});
import { OAuth2Client } from "google-auth-library";
async function verifyGoogleIdToken(idToken) {
  if (!isGoogleAuthConfigured()) {
    throw new ApiError(
      "Google sign-in is not configured. Set GOOGLE_CLIENT_ID.",
      503,
      "GOOGLE_NOT_CONFIGURED"
    );
  }
  const clientId = getGoogleClientId();
  const client = new OAuth2Client(clientId);
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedError("Invalid Google token");
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? true,
      name: payload.name,
      picture: payload.picture
    };
  } catch (error) {
    if (error instanceof ApiError || error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Invalid Google token");
  }
}
var init_google_verify = __esm({
  "../v2-core/auth/google-verify.ts"() {
    "use strict";
    init_errors();
    init_google_config();
  }
});

// ../v2-core/storage/local-auth-store.ts
var local_auth_store_exports = {};
__export(local_auth_store_exports, {
  confirmForgotPassword: () => confirmForgotPassword,
  confirmSignUp: () => confirmSignUp,
  forgotPassword: () => forgotPassword,
  getCurrentUser: () => getCurrentUser,
  login: () => login,
  loginWithGoogle: () => loginWithGoogle,
  logout: () => logout,
  refreshTokens: () => refreshTokens,
  saveRefreshToken: () => saveRefreshToken,
  signUp: () => signUp
});
import { randomInt, randomUUID as randomUUID2 } from "node:crypto";
import bcrypt from "bcryptjs";
function now() {
  return Date.now();
}
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
function getUserByEmail(email) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM users WHERE email = ?`).get(normalizeEmail(email)) ?? null;
}
function getUserByGoogleId(googleId) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM users WHERE googleId = ?`).get(googleId) ?? null;
}
function getUserById(userId) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(userId) ?? null;
}
function saveRefreshToken(token, userId, expiresAt) {
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO refresh_tokens (token, userId, expiresAt) VALUES (?, ?, ?)`
  ).run(token, userId, expiresAt);
}
function getRefreshToken(token) {
  const db = getLocalDatabase();
  const row = db.prepare(`SELECT userId, expiresAt FROM refresh_tokens WHERE token = ?`).get(token);
  if (!row) return null;
  if (row.expiresAt < Date.now()) {
    db.prepare(`DELETE FROM refresh_tokens WHERE token = ?`).run(token);
    return null;
  }
  return row;
}
function revokeRefreshToken(token) {
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM refresh_tokens WHERE token = ?`).run(token);
}
function revokeAllRefreshTokens(userId) {
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM refresh_tokens WHERE userId = ?`).run(userId);
}
function toAuthUser(user) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    emailVerified: user.emailVerified === 1
  };
}
async function signUp(input) {
  const email = normalizeEmail(input.email);
  if (!email || input.password.length < 8) {
    throw new ApiError("Email and password (min 8 chars) are required", 400);
  }
  if (getUserByEmail(email)) {
    throw new ConflictError("An account with this email already exists");
  }
  const db = getLocalDatabase();
  const passwordHash = await bcrypt.hash(input.password, 12);
  const timestamp = now();
  db.prepare(
    `INSERT INTO users (
      id, email, name, createdAt, updatedAt, passwordHash, emailVerified
    ) VALUES (?, ?, '', ?, ?, ?, 1)`
  ).run(randomUUID2(), email, timestamp, timestamp, passwordHash);
  return { success: true };
}
async function confirmSignUp(input) {
  const user = getUserByEmail(input.email);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return { success: true };
}
async function login(input) {
  const user = getUserByEmail(input.email);
  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }
  if (!user.passwordHash) {
    throw new UnauthorizedError("This account uses Google sign-in");
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }
  return issueLocalTokens({ userId: user.id, email: user.email });
}
async function loginWithGoogle(input) {
  const { verifyGoogleIdToken: verifyGoogleIdToken2 } = await Promise.resolve().then(() => (init_google_verify(), google_verify_exports));
  const profile = await verifyGoogleIdToken2(input.idToken);
  const email = normalizeEmail(profile.email);
  const db = getLocalDatabase();
  let user = getUserByGoogleId(profile.googleId);
  if (!user) {
    const existingByEmail = getUserByEmail(email);
    if (existingByEmail) {
      const authProvider = existingByEmail.passwordHash ? "both" : "google";
      const displayName = existingByEmail.name || profile.name?.trim() || "";
      db.prepare(
        `UPDATE users
         SET googleId = ?, authProvider = ?, emailVerified = 1,
             name = ?, updatedAt = ?
         WHERE id = ?`
      ).run(
        profile.googleId,
        authProvider,
        displayName,
        now(),
        existingByEmail.id
      );
      user = getUserById(existingByEmail.id);
    } else {
      const id = randomUUID2();
      const timestamp = now();
      const displayName = profile.name?.trim() || "";
      db.prepare(
        `INSERT INTO users (
          id, email, name, createdAt, updatedAt,
          passwordHash, emailVerified, googleId, authProvider
        ) VALUES (?, ?, ?, ?, ?, '', 1, ?, 'google')`
      ).run(id, email, displayName, timestamp, timestamp, profile.googleId);
      user = getUserById(id);
    }
  }
  if (!user) {
    throw new ApiError("Failed to create Google user", 500, "GOOGLE_LOGIN_FAILED");
  }
  return issueLocalTokens({ userId: user.id, email: user.email });
}
async function refreshTokens(input) {
  const stored = getRefreshToken(input.refreshToken);
  if (!stored) {
    throw new UnauthorizedError("Invalid refresh token");
  }
  const user = getUserById(stored.userId);
  if (!user) {
    throw new UnauthorizedError("Invalid refresh token");
  }
  revokeRefreshToken(input.refreshToken);
  return issueLocalTokens({ userId: user.id, email: user.email });
}
async function logout(input) {
  if (input.refreshToken) {
    revokeRefreshToken(input.refreshToken);
  }
  return { success: true };
}
async function forgotPassword(input) {
  const user = getUserByEmail(input.email);
  if (!user) {
    return { success: true };
  }
  const resetCode = String(randomInt(1e5, 999999));
  const expiresAt = Date.now() + 15 * 60 * 1e3;
  const db = getLocalDatabase();
  db.prepare(
    `UPDATE users SET resetCode = ?, resetCodeExpiresAt = ?, updatedAt = ? WHERE id = ?`
  ).run(resetCode, expiresAt, now(), user.id);
  if (process.env.NODE_ENV !== "production") {
    console.info(`[local-auth] Password reset code for ${user.email}: ${resetCode}`);
    return { success: true, devResetCode: resetCode };
  }
  return { success: true };
}
async function confirmForgotPassword(input) {
  const user = getUserByEmail(input.email);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  if (!user.resetCode || !user.resetCodeExpiresAt || user.resetCodeExpiresAt < Date.now() || user.resetCode !== input.code.trim()) {
    throw new ApiError("Invalid or expired reset code", 400, "INVALID_RESET_CODE");
  }
  const db = getLocalDatabase();
  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  db.prepare(
    `UPDATE users
     SET passwordHash = ?, resetCode = NULL, resetCodeExpiresAt = NULL, updatedAt = ?
     WHERE id = ?`
  ).run(passwordHash, now(), user.id);
  revokeAllRefreshTokens(user.id);
  return { success: true };
}
async function getCurrentUser(accessToken) {
  const { verifyLocalAccessToken: verifyLocalAccessToken2 } = await Promise.resolve().then(() => (init_local_jwt(), local_jwt_exports));
  const context = await verifyLocalAccessToken2(accessToken);
  const user = getUserById(context.userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }
  return toAuthUser(user);
}
var init_local_auth_store = __esm({
  "../v2-core/storage/local-auth-store.ts"() {
    "use strict";
    init_errors();
    init_local_db();
    init_local_jwt();
  }
});

// ../v2-core/services/cognito-auth-service.ts
var cognito_auth_service_exports = {};
__export(cognito_auth_service_exports, {
  confirmForgotPassword: () => confirmForgotPassword2,
  confirmSignUp: () => confirmSignUp2,
  forgotPassword: () => forgotPassword2,
  login: () => login2,
  logout: () => logout2,
  refreshTokens: () => refreshTokens2,
  signUp: () => signUp2
});
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GlobalSignOutCommand,
  InitiateAuthCommand,
  RevokeTokenCommand,
  SignUpCommand
} from "@aws-sdk/client-cognito-identity-provider";
function getCognitoClient() {
  const { region } = getCognitoConfig();
  return new CognitoIdentityProviderClient({ region });
}
function mapCognitoError(error) {
  const name = typeof error === "object" && error !== null && "name" in error && typeof error.name === "string" ? error.name : "UnknownError";
  const message2 = typeof error === "object" && error !== null && "message" in error && typeof error.message === "string" ? error.message : "Authentication failed";
  switch (name) {
    case "UsernameExistsException":
      throw new ApiError("An account with this email already exists", 409, name);
    case "NotAuthorizedException":
      throw new ApiError("Invalid email or password", 401, name);
    case "UserNotConfirmedException":
      throw new ApiError("Email is not confirmed yet", 403, name);
    case "CodeMismatchException":
      throw new ApiError("Invalid confirmation code", 400, name);
    case "ExpiredCodeException":
      throw new ApiError("Confirmation code has expired", 400, name);
    case "InvalidPasswordException":
      throw new ApiError(message2, 400, name);
    default:
      throw new ApiError(message2, 400, name);
  }
}
function mapAuthResult(authenticationResult) {
  if (!authenticationResult?.AccessToken || !authenticationResult.RefreshToken || !authenticationResult.IdToken) {
    throw new ApiError("Authentication tokens were not returned", 500, "AUTH_TOKENS_MISSING");
  }
  return {
    accessToken: authenticationResult.AccessToken,
    refreshToken: authenticationResult.RefreshToken,
    idToken: authenticationResult.IdToken,
    expiresIn: authenticationResult.ExpiresIn ?? 3600
  };
}
async function signUp2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    await client.send(
      new SignUpCommand({
        ClientId: clientId,
        Username: input.email,
        Password: input.password,
        UserAttributes: [{ Name: "email", Value: input.email }]
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}
async function confirmSignUp2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    await client.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: input.email,
        ConfirmationCode: input.code
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}
async function login2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    const result = await client.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
          USERNAME: input.email,
          PASSWORD: input.password
        }
      })
    );
    return mapAuthResult(result.AuthenticationResult);
  } catch (error) {
    mapCognitoError(error);
  }
}
async function refreshTokens2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    const result = await client.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: clientId,
        AuthParameters: {
          REFRESH_TOKEN: input.refreshToken
        }
      })
    );
    const tokens = mapAuthResult(result.AuthenticationResult);
    return {
      ...tokens,
      refreshToken: input.refreshToken
    };
  } catch (error) {
    mapCognitoError(error);
  }
}
async function logout2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    if (input.accessToken) {
      await client.send(
        new GlobalSignOutCommand({
          AccessToken: input.accessToken
        })
      );
    } else if (input.refreshToken) {
      await client.send(
        new RevokeTokenCommand({
          ClientId: clientId,
          Token: input.refreshToken
        })
      );
    }
    return { success: true };
  } catch {
    return { success: true };
  }
}
async function forgotPassword2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    await client.send(
      new ForgotPasswordCommand({
        ClientId: clientId,
        Username: input.email
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}
async function confirmForgotPassword2(input) {
  const { clientId } = getCognitoConfig();
  const client = getCognitoClient();
  try {
    await client.send(
      new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: input.email,
        ConfirmationCode: input.code,
        Password: input.newPassword
      })
    );
    return { success: true };
  } catch (error) {
    mapCognitoError(error);
  }
}
var init_cognito_auth_service = __esm({
  "../v2-core/services/cognito-auth-service.ts"() {
    "use strict";
    init_errors();
    init_config();
  }
});

// ../v2-core/auth/cognito-jwt-verifier.ts
var cognito_jwt_verifier_exports = {};
__export(cognito_jwt_verifier_exports, {
  verifyCognitoAccessToken: () => verifyCognitoAccessToken
});
import { CognitoJwtVerifier } from "aws-jwt-verify";
function getAccessTokenVerifier() {
  if (accessTokenVerifier) return accessTokenVerifier;
  const config = getCognitoConfig();
  accessTokenVerifier = CognitoJwtVerifier.create({
    userPoolId: config.userPoolId,
    tokenUse: "access",
    clientId: config.clientId
  });
  return accessTokenVerifier;
}
async function verifyCognitoAccessToken(token) {
  try {
    const payload = await getAccessTokenVerifier().verify(token);
    const email = typeof payload.email === "string" ? payload.email : typeof payload.username === "string" ? payload.username : "";
    return {
      userId: String(payload.sub),
      email
    };
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
var accessTokenVerifier;
var init_cognito_jwt_verifier = __esm({
  "../v2-core/auth/cognito-jwt-verifier.ts"() {
    "use strict";
    init_errors();
    init_config();
    accessTokenVerifier = null;
  }
});

// ../v2-core/auth/jwt-verifier.ts
var jwt_verifier_exports = {};
__export(jwt_verifier_exports, {
  verifyAccessToken: () => verifyAccessToken
});
async function verifyAccessToken(token) {
  if (isLocalBackend()) {
    return verifyLocalAccessToken(token);
  }
  try {
    const { verifyCognitoAccessToken: verifyCognitoAccessToken2 } = await Promise.resolve().then(() => (init_cognito_jwt_verifier(), cognito_jwt_verifier_exports));
    return verifyCognitoAccessToken2(token);
  } catch {
    throw new ApiError(
      "AWS Cognito mode is not available. Install AWS dependencies or set STORAGE_BACKEND=local.",
      503,
      "COGNITO_UNAVAILABLE"
    );
  }
}
var init_jwt_verifier = __esm({
  "../v2-core/auth/jwt-verifier.ts"() {
    "use strict";
    init_errors();
    init_config2();
    init_local_jwt();
  }
});

// ../v2-core/dynamodb/keys.ts
function userPk(userId) {
  return `${ENTITY.USER}#${userId}`;
}
function cardSk(cardId) {
  return `${ENTITY.CARD}#${cardId}`;
}
function progressSk() {
  return ENTITY.PROGRESS;
}
function videoHistorySk(videoId) {
  return `${ENTITY.VIDEO}#${videoId}`;
}
function playbackPositionSk(videoId) {
  return `${ENTITY.PLAYBACK}#${videoId}`;
}
function bookmarkSk(bookmarkId) {
  return `${ENTITY.BOOKMARK}#${bookmarkId}`;
}
function vocabularyProgressSk(progressId) {
  return `${ENTITY.VOCAB_PROGRESS}#${progressId}`;
}
function userSettingsSk() {
  return ENTITY.USER_SETTINGS;
}
function userSubscriptionSk() {
  return ENTITY.USER_SUBSCRIPTION;
}
function aiUsageSk(periodKey) {
  return `${ENTITY.AI_USAGE}#${periodKey}`;
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
      VOCAB_PROGRESS: "VOCAB_PROGRESS",
      EXPLAIN_SENTENCE: "EXPLAIN_SENTENCE",
      SELECTION_ANALYSIS: "SELECTION_ANALYSIS",
      USER_SETTINGS: "USER_SETTINGS",
      USER_SUBSCRIPTION: "USER_SUBSCRIPTION",
      AI_USAGE: "AI_USAGE"
    };
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
  deleteItem: () => deleteItem2,
  getItem: () => getItem2,
  putItem: () => putItem2,
  queryByUser: () => queryByUser2,
  updateItem: () => updateItem2
});
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";
async function putItem2(item) {
  const client = getDynamoClient();
  await client.send(
    new PutCommand({
      TableName: getTableName(),
      Item: item
    })
  );
}
async function getItem2(pk, sk) {
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
async function deleteItem2(pk, sk) {
  const client = getDynamoClient();
  await client.send(
    new DeleteCommand({
      TableName: getTableName(),
      Key: { PK: pk, SK: sk }
    })
  );
}
async function updateItem2(pk, sk, updates) {
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

// ../v2-core/auth/context.ts
init_errors();
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

// ../v2-core/lambda/api-router.ts
init_google_config();
init_errors();

// ../v2-core/logging/logger.ts
function write(level, message2, context) {
  const entry = {
    level,
    message: message2,
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
  debug(message2, context) {
    write("debug", message2, context);
  },
  info(message2, context) {
    write("info", message2, context);
  },
  warn(message2, context) {
    write("warn", message2, context);
  },
  error(message2, context) {
    write("error", message2, context);
  }
};

// ../v2-core/response.ts
init_errors();
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

// ../v2-core/lambda/api-router.ts
init_config2();

// ../v2-core/services/auth-service.ts
init_config2();
init_local_auth_store();
init_errors();
async function getProvider() {
  if (isLocalBackend()) {
    return local_auth_store_exports;
  }
  try {
    return await Promise.resolve().then(() => (init_cognito_auth_service(), cognito_auth_service_exports));
  } catch {
    const { ApiError: ApiError2 } = await Promise.resolve().then(() => (init_errors(), errors_exports));
    throw new ApiError2(
      "AWS Cognito mode is not available. Install AWS dependencies or set STORAGE_BACKEND=local.",
      503,
      "COGNITO_UNAVAILABLE"
    );
  }
}
async function signUp3(input) {
  const provider = await getProvider();
  return provider.signUp(input);
}
async function confirmSignUp3(input) {
  if (!isEmailVerificationEnabled()) {
    return { success: true };
  }
  const provider = await getProvider();
  return provider.confirmSignUp(input);
}
async function login3(input) {
  const provider = await getProvider();
  return provider.login(input);
}
async function loginWithGoogle2(input) {
  if (!isLocalBackend()) {
    throw new ApiError(
      "Google sign-in is only available in local mode for now.",
      503,
      "GOOGLE_NOT_SUPPORTED"
    );
  }
  return loginWithGoogle(input);
}
async function refreshTokens3(input) {
  const provider = await getProvider();
  return provider.refreshTokens(input);
}
async function logout3(input) {
  const provider = await getProvider();
  return provider.logout(input);
}
async function forgotPassword3(input) {
  if (!isEmailVerificationEnabled()) {
    throw new ApiError(
      "Password reset by email is not available yet.",
      503,
      "EMAIL_NOT_CONFIGURED"
    );
  }
  const provider = await getProvider();
  return provider.forgotPassword(input);
}
async function confirmForgotPassword3(input) {
  if (!isEmailVerificationEnabled()) {
    throw new ApiError(
      "Password reset by email is not available yet.",
      503,
      "EMAIL_NOT_CONFIGURED"
    );
  }
  const provider = await getProvider();
  return provider.confirmForgotPassword(input);
}
async function getCurrentUser2(accessToken) {
  if (isLocalBackend()) {
    return getCurrentUser(accessToken);
  }
  const { verifyAccessToken: verifyAccessToken2 } = await Promise.resolve().then(() => (init_jwt_verifier(), jwt_verifier_exports));
  const context = await verifyAccessToken2(accessToken);
  return {
    userId: context.userId,
    email: context.email,
    name: "",
    createdAt: 0,
    updatedAt: 0
  };
}

// ../v2-core/services/bookmark-service.ts
init_errors();
init_config2();

// ../v2-core/storage/local-bookmark-store.ts
init_errors();
import { randomUUID as randomUUID3 } from "node:crypto";

// ../v2-core/validation/bookmark-input.ts
init_errors();
var BOOKMARK_DUPLICATE_TOLERANCE_SECONDS = 0.5;
var MAX_VIDEO_ID_LENGTH = 20;
var MAX_NOTE_LENGTH = 500;
var VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
function validateVideoId(videoId) {
  if (!videoId) {
    throw new ApiError("videoId is required", 400, "INVALID_BOOKMARK");
  }
  if (videoId.length > MAX_VIDEO_ID_LENGTH) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH} characters`,
      400,
      "INVALID_BOOKMARK"
    );
  }
  if (!VIDEO_ID_PATTERN.test(videoId)) {
    throw new ApiError("videoId has an invalid format", 400, "INVALID_BOOKMARK");
  }
  return videoId;
}
function normalizeBookmarkVideoIdFilter(videoId) {
  if (videoId === void 0 || videoId === null) {
    return void 0;
  }
  const trimmed = videoId.trim();
  if (!trimmed) {
    return void 0;
  }
  return validateVideoId(trimmed);
}
function validateCreateBookmarkInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_BOOKMARK");
  }
  const videoId = validateVideoId(String(input.videoId ?? "").trim());
  const timestamp = input.timestamp;
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp < 0) {
    throw new ApiError(
      "timestamp must be a non-negative number",
      400,
      "INVALID_BOOKMARK"
    );
  }
  let note = "";
  if (input.note !== void 0 && input.note !== null) {
    if (typeof input.note !== "string") {
      throw new ApiError("note must be a string", 400, "INVALID_BOOKMARK");
    }
    note = input.note.trim();
    if (note.length > MAX_NOTE_LENGTH) {
      throw new ApiError(
        `note must be at most ${MAX_NOTE_LENGTH} characters`,
        400,
        "INVALID_BOOKMARK"
      );
    }
  }
  return { videoId, timestamp, note };
}

// ../v2-core/validation/bookmark-id.ts
init_errors();
function normalizeBookmarkId(bookmarkId) {
  const id = bookmarkId.trim();
  if (!id) {
    throw new ApiError("Bookmark id is required", 400, "INVALID_BOOKMARK_ID");
  }
  if (id.length > 64) {
    throw new ApiError("Bookmark id is invalid", 400, "INVALID_BOOKMARK_ID");
  }
  return id;
}

// ../v2-core/storage/local-bookmark-store.ts
init_local_db();
function toRecord(row) {
  return {
    id: row.id,
    userId: row.userId,
    videoId: row.videoId,
    timestamp: row.timestamp,
    note: row.note,
    createdAt: row.createdAt
  };
}
function getRow(userId, bookmarkId) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM bookmarks WHERE id = ? AND userId = ?`).get(bookmarkId, userId) ?? null;
}
function hasBookmarkNearTime(userId, videoId, timestamp, tolerance = BOOKMARK_DUPLICATE_TOLERANCE_SECONDS) {
  const db = getLocalDatabase();
  const row = db.prepare(
    `SELECT id FROM bookmarks
       WHERE userId = ? AND videoId = ?
         AND abs(timestamp - ?) <= ?`
  ).get(userId, videoId, timestamp, tolerance);
  return Boolean(row);
}
function listBookmarks(userId, videoId) {
  const db = getLocalDatabase();
  const rows = videoId ? db.prepare(
    `SELECT * FROM bookmarks
           WHERE userId = ? AND videoId = ?
           ORDER BY timestamp ASC, createdAt ASC`
  ).all(userId, videoId) : db.prepare(
    `SELECT * FROM bookmarks
           WHERE userId = ?
           ORDER BY videoId ASC, timestamp ASC, createdAt ASC`
  ).all(userId);
  return rows.map(toRecord);
}
function createBookmark(userId, input) {
  const validated = validateCreateBookmarkInput(input);
  if (hasBookmarkNearTime(
    userId,
    validated.videoId,
    validated.timestamp
  )) {
    throw new ConflictError("A bookmark already exists at this timestamp");
  }
  const now2 = Date.now();
  const id = randomUUID3();
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO bookmarks (
      id, userId, videoId, timestamp, note, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    validated.videoId,
    validated.timestamp,
    validated.note,
    now2
  );
  const row = getRow(userId, id);
  if (!row) {
    throw new ApiError("Failed to create bookmark", 500, "BOOKMARK_CREATE_FAILED");
  }
  return toRecord(row);
}
function deleteBookmark(userId, bookmarkId) {
  const normalizedId = normalizeBookmarkId(bookmarkId);
  const existing = getRow(userId, normalizedId);
  if (!existing) {
    throw new NotFoundError("Bookmark not found");
  }
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM bookmarks WHERE id = ? AND userId = ?`).run(
    normalizedId,
    userId
  );
  return { success: true };
}

// ../v2-core/services/bookmark-service.ts
init_keys();

// ../v2-core/dynamodb/repository.ts
init_config2();

// ../v2-core/storage/local-repository.ts
init_local_db();
function serializeItem(item) {
  const { PK, SK, entityType, userId, createdAt, updatedAt, ...rest } = item;
  return JSON.stringify(rest);
}
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
function putItem(item) {
  const db = getLocalDatabase();
  const { PK, SK, entityType, userId, createdAt, updatedAt } = item;
  db.prepare(
    `INSERT INTO items (PK, SK, entityType, userId, data, createdAt, updatedAt)
     VALUES (@PK, @SK, @entityType, @userId, @data, @createdAt, @updatedAt)
     ON CONFLICT(PK, SK) DO UPDATE SET
       entityType = excluded.entityType,
       userId = excluded.userId,
       data = excluded.data,
       createdAt = excluded.createdAt,
       updatedAt = excluded.updatedAt`
  ).run({
    PK,
    SK,
    entityType,
    userId,
    data: serializeItem(item),
    createdAt,
    updatedAt: updatedAt ?? null
  });
}
function getItem(pk, sk) {
  const db = getLocalDatabase();
  const row = db.prepare(
    `SELECT PK, SK, entityType, userId, data, createdAt, updatedAt
       FROM items WHERE PK = ? AND SK = ?`
  ).get(pk, sk);
  return row ? deserializeItem(row) : null;
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
function deleteItem(pk, sk) {
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM items WHERE PK = ? AND SK = ?`).run(pk, sk);
}
function updateItem(pk, sk, updates) {
  const existing = getItem(pk, sk);
  if (!existing) return;
  const merged = { ...existing, ...updates, PK: pk, SK: sk };
  putItem(merged);
}

// ../v2-core/dynamodb/repository.ts
init_errors();
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
async function putItem3(item) {
  if (isLocalBackend()) {
    putItem(item);
    return;
  }
  const dynamo = await getDynamoRepo();
  await dynamo.putItem(item);
}
async function getItem3(pk, sk) {
  if (isLocalBackend()) {
    return getItem(pk, sk);
  }
  const dynamo = await getDynamoRepo();
  return dynamo.getItem(pk, sk);
}
async function queryByUser3(userId, skPrefix) {
  if (isLocalBackend()) {
    return queryByUser(userId, skPrefix);
  }
  const dynamo = await getDynamoRepo();
  return dynamo.queryByUser(userId, skPrefix);
}
async function deleteItem3(pk, sk) {
  if (isLocalBackend()) {
    deleteItem(pk, sk);
    return;
  }
  const dynamo = await getDynamoRepo();
  await dynamo.deleteItem(pk, sk);
}
async function updateItem3(pk, sk, updates) {
  if (isLocalBackend()) {
    updateItem(pk, sk, updates);
    return;
  }
  const dynamo = await getDynamoRepo();
  await dynamo.updateItem(pk, sk, updates);
}

// ../v2-core/services/bookmark-service.ts
import { randomUUID as randomUUID4 } from "node:crypto";
function toRecord2(item) {
  return {
    id: item.id,
    userId: item.userId,
    videoId: item.videoId,
    timestamp: item.timestamp,
    note: item.note,
    createdAt: item.createdAt
  };
}
function hasBookmarkNearTime2(items, videoId, timestamp, tolerance = BOOKMARK_DUPLICATE_TOLERANCE_SECONDS) {
  return items.some(
    (bookmark) => bookmark.videoId === videoId && Math.abs(bookmark.timestamp - timestamp) <= tolerance
  );
}
function normalizeVideoIdFilter(videoId) {
  return normalizeBookmarkVideoIdFilter(videoId);
}
async function listBookmarks2(auth, videoId) {
  const filter = normalizeVideoIdFilter(videoId ?? null);
  if (isLocalBackend()) {
    return listBookmarks(auth.userId, filter);
  }
  const items = await queryByUser3(auth.userId, "BOOKMARK#");
  const records = items.map(toRecord2);
  if (!filter) {
    return records.sort(
      (left, right) => left.videoId.localeCompare(right.videoId) || left.timestamp - right.timestamp || left.createdAt - right.createdAt
    );
  }
  return records.filter((bookmark) => bookmark.videoId === filter).sort(
    (left, right) => left.timestamp - right.timestamp || left.createdAt - right.createdAt
  );
}
async function createBookmark2(auth, input) {
  const validated = validateCreateBookmarkInput(input);
  if (isLocalBackend()) {
    return createBookmark(auth.userId, validated);
  }
  const existing = await queryByUser3(auth.userId, "BOOKMARK#");
  if (hasBookmarkNearTime2(existing, validated.videoId, validated.timestamp)) {
    throw new ConflictError("A bookmark already exists at this timestamp");
  }
  const now2 = Date.now();
  const id = randomUUID4();
  const item = {
    PK: userPk(auth.userId),
    SK: bookmarkSk(id),
    entityType: "BOOKMARK",
    userId: auth.userId,
    id,
    videoId: validated.videoId,
    timestamp: validated.timestamp,
    note: validated.note,
    createdAt: now2
  };
  await putItem3(item);
  return toRecord2(item);
}
async function deleteBookmark2(auth, bookmarkId) {
  const normalizedId = normalizeBookmarkId(bookmarkId);
  if (isLocalBackend()) {
    return deleteBookmark(auth.userId, normalizedId);
  }
  const pk = userPk(auth.userId);
  const sk = bookmarkSk(normalizedId);
  const existing = await getItem3(pk, sk);
  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError("Bookmark not found");
  }
  await deleteItem3(pk, sk);
  return { success: true };
}

// ../v2-core/services/deck-service.ts
function toRecord3(item) {
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
  return items.map(toRecord3);
}

// ../v2-core/services/flashcard-service.ts
init_errors();
init_config2();

// ../v2-core/storage/local-flashcard-store.ts
init_errors();
import { randomUUID as randomUUID5 } from "node:crypto";

// ../v2-core/validation/flashcard-id.ts
init_errors();
function normalizeFlashcardId(cardId) {
  const id = cardId.trim();
  if (!id) {
    throw new ApiError("Flashcard id is required", 400, "INVALID_FLASHCARD_ID");
  }
  if (id.length > 64) {
    throw new ApiError("Flashcard id is invalid", 400, "INVALID_FLASHCARD_ID");
  }
  return id;
}

// ../v2-core/validation/flashcard-input.ts
init_errors();
var MAX_WORD_LENGTH = 200;
var MAX_TRANSLATION_LENGTH = 500;
var MAX_EXAMPLE_LENGTH = 2e3;
var MAX_TAG_LENGTH = 50;
var MAX_TAGS = 20;
var MAX_DECK_IDS = 50;
var MIN_EASE = 1.3;
var MAX_EASE = 5;
function normalizeWord(word) {
  return word.trim().replace(/\s+/g, " ");
}
function readOptionalString(value, field, maxLength) {
  if (value === void 0 || value === null || value === "") {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new ApiError(`${field} must be a string`, 400, "INVALID_FLASHCARD");
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    throw new ApiError(
      `${field} must be at most ${maxLength} characters`,
      400,
      "INVALID_FLASHCARD"
    );
  }
  return trimmed;
}
function readOptionalStringArray(value, field, maxItems, maxItemLength) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (!Array.isArray(value)) {
    throw new ApiError(`${field} must be an array`, 400, "INVALID_FLASHCARD");
  }
  if (value.length > maxItems) {
    throw new ApiError(
      `${field} must contain at most ${maxItems} items`,
      400,
      "INVALID_FLASHCARD"
    );
  }
  const items = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      throw new ApiError(`${field} items must be strings`, 400, "INVALID_FLASHCARD");
    }
    const trimmed = entry.trim();
    if (!trimmed) continue;
    if (trimmed.length > maxItemLength) {
      throw new ApiError(
        `${field} items must be at most ${maxItemLength} characters`,
        400,
        "INVALID_FLASHCARD"
      );
    }
    items.push(trimmed);
  }
  return [...new Set(items)];
}
function readOptionalNonNegativeNumber(value, field) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new ApiError(
      `${field} must be a non-negative number`,
      400,
      "INVALID_FLASHCARD"
    );
  }
  return value;
}
function readOptionalEase(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ApiError("ease must be a number", 400, "INVALID_FLASHCARD");
  }
  if (value < MIN_EASE || value > MAX_EASE) {
    throw new ApiError(
      `ease must be between ${MIN_EASE} and ${MAX_EASE}`,
      400,
      "INVALID_FLASHCARD"
    );
  }
  return value;
}
function validateCreateFlashcardInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_FLASHCARD");
  }
  const word = normalizeWord(String(input.word ?? ""));
  const translation = String(input.translation ?? "").trim();
  if (!word) {
    throw new ApiError("word is required", 400, "INVALID_FLASHCARD");
  }
  if (word.length > MAX_WORD_LENGTH) {
    throw new ApiError(
      `word must be at most ${MAX_WORD_LENGTH} characters`,
      400,
      "INVALID_FLASHCARD"
    );
  }
  if (!translation) {
    throw new ApiError("translation is required", 400, "INVALID_FLASHCARD");
  }
  if (translation.length > MAX_TRANSLATION_LENGTH) {
    throw new ApiError(
      `translation must be at most ${MAX_TRANSLATION_LENGTH} characters`,
      400,
      "INVALID_FLASHCARD"
    );
  }
  const example = readOptionalString(input.example, "example", MAX_EXAMPLE_LENGTH);
  const videoId = readOptionalString(input.videoId, "videoId", 20);
  if (videoId && !/^[a-zA-Z0-9_-]+$/.test(videoId)) {
    throw new ApiError("videoId has an invalid format", 400, "INVALID_FLASHCARD");
  }
  return {
    word,
    translation,
    example,
    tags: readOptionalStringArray(input.tags, "tags", MAX_TAGS, MAX_TAG_LENGTH),
    videoId,
    deckIds: readOptionalStringArray(
      input.deckIds,
      "deckIds",
      MAX_DECK_IDS,
      64
    ),
    repetitions: readOptionalNonNegativeNumber(input.repetitions, "repetitions"),
    ease: readOptionalEase(input.ease),
    interval: readOptionalNonNegativeNumber(input.interval, "interval"),
    nextReview: readOptionalNonNegativeNumber(input.nextReview, "nextReview"),
    knownCount: readOptionalNonNegativeNumber(input.knownCount, "knownCount"),
    unknownCount: readOptionalNonNegativeNumber(input.unknownCount, "unknownCount")
  };
}
function normalizeFlashcardWord(word) {
  return normalizeWord(word).toLowerCase();
}

// ../v2-core/storage/local-flashcard-store.ts
init_local_db();
function parseMeta(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function toFlashcard(row) {
  return {
    id: row.id,
    userId: row.userId,
    word: row.word,
    translation: row.translation,
    example: row.example,
    videoId: row.videoId,
    createdAt: row.createdAt
  };
}
function toRecord4(row) {
  const meta = parseMeta(row.meta);
  return {
    ...toFlashcard(row),
    example: row.example || void 0,
    videoId: row.videoId ?? void 0,
    tags: meta.tags,
    deckIds: meta.deckIds,
    repetitions: meta.repetitions,
    ease: meta.ease,
    interval: meta.interval,
    nextReview: meta.nextReview,
    knownCount: meta.knownCount,
    unknownCount: meta.unknownCount,
    updatedAt: meta.updatedAt
  };
}
function listFlashcards(userId) {
  const db = getLocalDatabase();
  const rows = db.prepare(
    `SELECT * FROM flashcards WHERE userId = ? ORDER BY createdAt ASC`
  ).all(userId);
  return rows.map(toRecord4);
}
function listFlashcardsPaginated(userId, params) {
  const db = getLocalDatabase();
  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM flashcards WHERE userId = ?`).get(userId);
  const rows = db.prepare(
    `SELECT * FROM flashcards
       WHERE userId = ?
       ORDER BY createdAt ASC
       LIMIT ? OFFSET ?`
  ).all(userId, params.limit, params.offset);
  return {
    items: rows.map(toRecord4),
    total: totalRow.count
  };
}
function getRow2(userId, cardId) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM flashcards WHERE id = ? AND userId = ?`).get(cardId, userId) ?? null;
}
function hasFlashcardWithWord(userId, word) {
  const db = getLocalDatabase();
  const normalized = normalizeFlashcardWord(word);
  const row = db.prepare(
    `SELECT id FROM flashcards
       WHERE userId = ? AND lower(trim(word)) = ?`
  ).get(userId, normalized);
  return Boolean(row);
}
function createFlashcard(userId, input) {
  const validated = validateCreateFlashcardInput(input);
  if (hasFlashcardWithWord(userId, validated.word)) {
    throw new ConflictError("A flashcard with this word already exists");
  }
  const now2 = Date.now();
  const id = randomUUID5();
  const meta = {
    tags: validated.tags ?? [],
    deckIds: validated.deckIds ?? [],
    repetitions: validated.repetitions ?? 0,
    ease: validated.ease ?? 2.5,
    interval: validated.interval ?? 0,
    nextReview: validated.nextReview,
    knownCount: validated.knownCount ?? 0,
    unknownCount: validated.unknownCount ?? 0,
    updatedAt: now2
  };
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO flashcards (
      id, userId, word, translation, example, videoId, createdAt, meta
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    validated.word,
    validated.translation,
    validated.example ?? "",
    validated.videoId ?? null,
    now2,
    JSON.stringify(meta)
  );
  const row = getRow2(userId, id);
  if (!row) {
    throw new ApiError("Failed to create flashcard", 500, "FLASHCARD_CREATE_FAILED");
  }
  return toRecord4(row);
}
function updateFlashcard(userId, cardId, input) {
  const existing = getRow2(userId, cardId);
  if (!existing) {
    throw new NotFoundError("Flashcard not found");
  }
  const meta = parseMeta(existing.meta);
  const updatedAt = Date.now();
  const nextMeta = {
    ...meta,
    tags: input.tags ?? meta.tags,
    deckIds: input.deckIds ?? meta.deckIds,
    repetitions: input.repetitions ?? meta.repetitions,
    ease: input.ease ?? meta.ease,
    interval: input.interval ?? meta.interval,
    nextReview: input.nextReview ?? meta.nextReview,
    knownCount: input.knownCount ?? meta.knownCount,
    unknownCount: input.unknownCount ?? meta.unknownCount,
    updatedAt
  };
  const db = getLocalDatabase();
  db.prepare(
    `UPDATE flashcards
     SET word = ?, translation = ?, example = ?, videoId = ?, meta = ?
     WHERE id = ? AND userId = ?`
  ).run(
    input.word?.trim() ?? existing.word,
    input.translation?.trim() ?? existing.translation,
    input.example !== void 0 ? input.example.trim() : existing.example,
    input.videoId !== void 0 ? input.videoId.trim() || null : existing.videoId,
    JSON.stringify(nextMeta),
    cardId,
    userId
  );
  const row = getRow2(userId, cardId);
  if (!row) {
    throw new NotFoundError("Flashcard not found");
  }
  return toRecord4(row);
}
function deleteFlashcard(userId, cardId) {
  const normalizedId = normalizeFlashcardId(cardId);
  const existing = getRow2(userId, normalizedId);
  if (!existing) {
    throw new NotFoundError("Flashcard not found");
  }
  const db = getLocalDatabase();
  db.prepare(`DELETE FROM flashcards WHERE id = ? AND userId = ?`).run(
    normalizedId,
    userId
  );
  return { success: true };
}

// ../v2-core/validation/pagination.ts
init_errors();
var DEFAULT_LIMIT = 50;
var MAX_LIMIT = 100;
function parsePaginationParams(searchParams, options = {}) {
  const defaultLimit = options.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = options.maxLimit ?? MAX_LIMIT;
  const limitRaw = searchParams.get("limit");
  const offsetRaw = searchParams.get("offset");
  let limit = defaultLimit;
  if (limitRaw !== null && limitRaw !== "") {
    const parsed = Number(limitRaw);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new ApiError(
        "limit must be a positive integer",
        400,
        "INVALID_PAGINATION"
      );
    }
    limit = Math.min(parsed, maxLimit);
  }
  let offset = 0;
  if (offsetRaw !== null && offsetRaw !== "") {
    const parsed = Number(offsetRaw);
    if (!Number.isInteger(parsed) || parsed < 0) {
      throw new ApiError(
        "offset must be a non-negative integer",
        400,
        "INVALID_PAGINATION"
      );
    }
    offset = parsed;
  }
  return { limit, offset };
}
function toPaginatedResponse(items, total, pagination) {
  return {
    items,
    total,
    limit: pagination.limit,
    offset: pagination.offset,
    hasMore: pagination.offset + items.length < total
  };
}

// ../v2-core/services/flashcard-service.ts
init_keys();
import { randomUUID as randomUUID6 } from "node:crypto";
function toRecord5(item) {
  return {
    id: item.id,
    userId: item.userId,
    word: item.word,
    translation: item.translation,
    example: item.example,
    tags: item.tags,
    videoId: item.videoId,
    deckIds: item.deckIds,
    repetitions: item.repetitions,
    ease: item.ease,
    interval: item.interval,
    nextReview: item.nextReview,
    knownCount: item.knownCount,
    unknownCount: item.unknownCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}
async function listAllFlashcards(auth) {
  if (isLocalBackend()) {
    return listFlashcards(auth.userId);
  }
  const items = await queryByUser3(auth.userId, "CARD#");
  return items.map(toRecord5);
}
async function listFlashcards2(auth, params = {}) {
  const pagination = parsePaginationParams(
    new URLSearchParams({
      ...params.limit !== void 0 ? { limit: String(params.limit) } : {},
      ...params.offset !== void 0 ? { offset: String(params.offset) } : {}
    })
  );
  if (isLocalBackend()) {
    const page = listFlashcardsPaginated(
      auth.userId,
      pagination
    );
    return toPaginatedResponse(page.items, page.total, pagination);
  }
  const items = await queryByUser3(auth.userId, "CARD#");
  const records = items.map(toRecord5).sort((left, right) => left.createdAt - right.createdAt);
  const slice = records.slice(
    pagination.offset,
    pagination.offset + pagination.limit
  );
  return toPaginatedResponse(slice, records.length, pagination);
}
async function createFlashcard2(auth, input) {
  const validated = validateCreateFlashcardInput(input);
  if (isLocalBackend()) {
    return createFlashcard(auth.userId, validated);
  }
  const existing = await queryByUser3(auth.userId, "CARD#");
  const normalized = normalizeFlashcardWord(validated.word);
  if (existing.some(
    (card) => normalizeFlashcardWord(card.word) === normalized
  )) {
    throw new ConflictError("A flashcard with this word already exists");
  }
  const now2 = Date.now();
  const id = randomUUID6();
  const item = {
    PK: userPk(auth.userId),
    SK: cardSk(id),
    entityType: "CARD",
    userId: auth.userId,
    id,
    word: validated.word,
    translation: validated.translation,
    example: validated.example,
    tags: validated.tags ?? [],
    videoId: validated.videoId,
    deckIds: validated.deckIds ?? [],
    repetitions: validated.repetitions ?? 0,
    ease: validated.ease ?? 2.5,
    interval: validated.interval ?? 0,
    nextReview: validated.nextReview,
    knownCount: validated.knownCount ?? 0,
    unknownCount: validated.unknownCount ?? 0,
    createdAt: now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord5(item);
}
async function updateFlashcard2(auth, cardId, input) {
  const normalizedId = normalizeFlashcardId(cardId);
  if (isLocalBackend()) {
    return updateFlashcard(auth.userId, normalizedId, input);
  }
  const pk = userPk(auth.userId);
  const sk = cardSk(normalizedId);
  const existing = await getItem3(pk, sk);
  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError("Flashcard not found");
  }
  const updatedAt = Date.now();
  await updateItem3(pk, sk, { ...input, updatedAt });
  const updated = await getItem3(pk, sk);
  if (!updated) {
    throw new NotFoundError("Flashcard not found");
  }
  return toRecord5(updated);
}
async function deleteFlashcard2(auth, cardId) {
  const normalizedId = normalizeFlashcardId(cardId);
  if (isLocalBackend()) {
    return deleteFlashcard(auth.userId, normalizedId);
  }
  const pk = userPk(auth.userId);
  const sk = cardSk(normalizedId);
  const existing = await getItem3(pk, sk);
  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError("Flashcard not found");
  }
  await deleteItem3(pk, sk);
  return { success: true };
}

// ../v2-core/services/premium-access-service.ts
init_errors();

// ../v2-core/premium/config.ts
function getFreeAiDailyLimit() {
  const configured = Number(process.env.FREE_AI_DAILY_LIMIT);
  return Number.isFinite(configured) && configured > 0 ? configured : 20;
}
function getPremiumAiDailyLimit() {
  const raw = process.env.PREMIUM_AI_DAILY_LIMIT?.trim().toLowerCase();
  if (!raw || raw === "unlimited") {
    return null;
  }
  const configured = Number(raw);
  return Number.isFinite(configured) && configured > 0 ? configured : null;
}
function formatUsagePeriodKey(date = /* @__PURE__ */ new Date()) {
  const year2 = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day2 = String(date.getUTCDate()).padStart(2, "0");
  return `${year2}-${month}-${day2}`;
}

// ../v2-core/premium/is-premium.ts
function defaultUserSubscription(userId) {
  return {
    userId,
    plan: "free",
    status: "inactive",
    startDate: null,
    endDate: null
  };
}
function isPremiumSubscription(subscription, now2 = Date.now()) {
  if (subscription.endDate !== null && subscription.endDate < now2) {
    return false;
  }
  if (subscription.plan === "premium" && subscription.status === "active") {
    return true;
  }
  if (subscription.plan === "trial" && subscription.status === "trialing") {
    return true;
  }
  return false;
}
function getEffectivePlan(subscription, now2 = Date.now()) {
  return isPremiumSubscription(subscription, now2) ? subscription.plan : "free";
}
function getEffectiveStatus(subscription, now2 = Date.now()) {
  if (subscription.endDate !== null && subscription.endDate < now2) {
    return "expired";
  }
  return subscription.status;
}

// ../v2-core/services/premium-access-service.ts
init_config2();

// ../v2-core/storage/local-ai-usage-store.ts
init_errors();
init_local_db();
function getAiUsageCount(userId, periodKey = formatUsagePeriodKey()) {
  const db = getLocalDatabase();
  const row = db.prepare(
    `SELECT requestCount FROM ai_usage WHERE userId = ? AND periodKey = ?`
  ).get(userId, periodKey);
  return row?.requestCount ?? 0;
}

// ../v2-core/services/premium-access-service.ts
init_keys();

// ../v2-core/services/subscription-service.ts
init_config2();

// ../v2-core/storage/local-subscription-store.ts
init_local_db();
function toRecord6(row) {
  return {
    userId: row.userId,
    plan: row.plan,
    status: row.status,
    startDate: row.startDate,
    endDate: row.endDate
  };
}
function getUserSubscription(userId) {
  const db = getLocalDatabase();
  const row = db.prepare(`SELECT * FROM user_subscriptions WHERE userId = ?`).get(userId);
  if (!row) {
    return defaultUserSubscription(userId);
  }
  return toRecord6(row);
}

// ../v2-core/services/subscription-service.ts
init_keys();
function toRecord7(item) {
  return {
    userId: item.userId,
    plan: item.plan,
    status: item.status,
    startDate: item.startDate,
    endDate: item.endDate
  };
}
async function getUserSubscription2(auth) {
  if (isLocalBackend()) {
    return getUserSubscription(auth.userId);
  }
  const item = await getItem3(
    userPk(auth.userId),
    userSubscriptionSk()
  );
  if (!item || item.userId !== auth.userId) {
    return defaultUserSubscription(auth.userId);
  }
  return toRecord7(item);
}

// ../v2-core/services/premium-access-service.ts
function buildAiUsageInfo(subscriptionIsPremium, used, periodKey) {
  const limit = subscriptionIsPremium ? getPremiumAiDailyLimit() : getFreeAiDailyLimit();
  if (limit === null) {
    return {
      limit: null,
      used,
      remaining: null,
      periodKey
    };
  }
  return {
    limit,
    used,
    remaining: Math.max(0, limit - used),
    periodKey
  };
}
async function getAiUsageCountRemote(userId, periodKey) {
  const item = await getItem3(
    userPk(userId),
    aiUsageSk(periodKey)
  );
  return item?.requestCount ?? 0;
}
async function getPremiumAccess(auth) {
  const subscription = await getUserSubscription2(auth);
  const periodKey = formatUsagePeriodKey();
  const isPremium = isPremiumSubscription(subscription);
  const used = isLocalBackend() ? getAiUsageCount(auth.userId, periodKey) : await getAiUsageCountRemote(auth.userId, periodKey);
  return {
    userId: auth.userId,
    plan: getEffectivePlan(subscription),
    status: getEffectiveStatus(subscription),
    isPremium,
    subscription,
    aiUsage: buildAiUsageInfo(isPremium, used, periodKey)
  };
}

// ../v2-core/services/progress-service.ts
init_keys();
function toRecord8(item) {
  return {
    userId: item.userId,
    cardsTotal: item.cardsTotal,
    cardsMastered: item.cardsMastered,
    cardsDueToday: item.cardsDueToday,
    streakDays: item.streakDays,
    lastStudiedAt: item.lastStudiedAt,
    updatedAt: item.updatedAt ?? item.createdAt
  };
}
async function getProgress(auth) {
  const stored = await getItem3(
    userPk(auth.userId),
    progressSk()
  );
  if (stored) {
    return toRecord8(stored);
  }
  const cards = await listAllFlashcards(auth);
  const now2 = Date.now();
  return {
    userId: auth.userId,
    cardsTotal: cards.length,
    cardsMastered: cards.filter((card) => (card.repetitions ?? 0) >= 7).length,
    cardsDueToday: cards.filter(
      (card) => !card.nextReview || card.nextReview <= now2
    ).length,
    streakDays: 0,
    updatedAt: Date.now()
  };
}

// ../v2-core/services/quiz-result-service.ts
init_config2();

// ../v2-core/storage/local-quiz-result-store.ts
init_local_db();
function toRecord9(row) {
  return {
    id: row.id,
    userId: row.userId,
    videoId: row.videoId,
    score: row.score,
    totalQuestions: row.totalQuestions,
    createdAt: row.createdAt
  };
}
function listQuizResults(userId, videoId) {
  const db = getLocalDatabase();
  const rows = videoId ? db.prepare(
    `SELECT * FROM quiz_results
           WHERE userId = ? AND videoId = ?
           ORDER BY createdAt DESC`
  ).all(userId, videoId) : db.prepare(
    `SELECT * FROM quiz_results
           WHERE userId = ?
           ORDER BY createdAt DESC`
  ).all(userId);
  return rows.map(toRecord9);
}

// ../v2-core/validation/quiz-result-input.ts
init_errors();
var MAX_VIDEO_ID_LENGTH2 = 20;
var VIDEO_ID_PATTERN2 = /^[a-zA-Z0-9_-]+$/;
function validateVideoId2(videoId) {
  if (!videoId) {
    throw new ApiError("videoId is required", 400, "INVALID_QUIZ_RESULT");
  }
  if (videoId.length > MAX_VIDEO_ID_LENGTH2) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH2} characters`,
      400,
      "INVALID_QUIZ_RESULT"
    );
  }
  if (!VIDEO_ID_PATTERN2.test(videoId)) {
    throw new ApiError("videoId has an invalid format", 400, "INVALID_QUIZ_RESULT");
  }
  return videoId;
}
function normalizeQuizResultVideoIdFilter(videoId) {
  if (videoId === void 0 || videoId === null) {
    return void 0;
  }
  const trimmed = videoId.trim();
  if (!trimmed) {
    return void 0;
  }
  return validateVideoId2(trimmed);
}

// ../v2-core/services/quiz-result-service.ts
function toRecord10(item) {
  return {
    id: item.id,
    userId: item.userId,
    videoId: item.videoId,
    score: item.score,
    totalQuestions: item.totalQuestions,
    createdAt: item.createdAt
  };
}
async function listQuizResults2(auth, videoId) {
  const filter = normalizeQuizResultVideoIdFilter(videoId ?? null);
  if (isLocalBackend()) {
    return listQuizResults(auth.userId, filter);
  }
  const items = await queryByUser3(auth.userId, "QUIZ_RESULT#");
  const records = items.map(toRecord10);
  if (!filter) {
    return records.sort((left, right) => right.createdAt - left.createdAt);
  }
  return records.filter((result) => result.videoId === filter).sort((left, right) => right.createdAt - left.createdAt);
}

// ../v2-core/srs/spaced-repetition.ts
var AGAIN_DELAY_MS = 10 * 60 * 1e3;
function startOfDay(date = /* @__PURE__ */ new Date()) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.getTime();
}
function isReviewDue(nextReview, now2 = Date.now()) {
  if (nextReview === void 0) return true;
  return now2 >= nextReview;
}

// ../v2-core/srs/review-queue.ts
function getWeaknessScore(card) {
  const known = card.knownCount ?? 0;
  const unknown = card.unknownCount ?? 0;
  if (unknown > known) {
    return 10 + (unknown - known);
  }
  return 0;
}
function filterDueFlashcards(cards, now2 = Date.now()) {
  return cards.filter((card) => isReviewDue(card.nextReview, now2));
}
function sortReviewQueue(cards) {
  return [...cards].sort((left, right) => {
    const weakDiff = getWeaknessScore(right) - getWeaknessScore(left);
    if (weakDiff !== 0) return weakDiff;
    const leftDue = left.nextReview ?? 0;
    const rightDue = right.nextReview ?? 0;
    if (leftDue !== rightDue) return leftDue - rightDue;
    return left.createdAt - right.createdAt;
  });
}
function buildTodayReviewQueue(cards, now2 = Date.now()) {
  return sortReviewQueue(filterDueFlashcards(cards, now2));
}

// ../v2-core/services/review-service.ts
async function listTodayReviews(auth) {
  const now2 = Date.now();
  const cards = await listAllFlashcards(auth);
  const items = buildTodayReviewQueue(cards, now2);
  return {
    date: startOfDay(new Date(now2)),
    total: items.length,
    items
  };
}

// ../v2-core/services/user-settings-service.ts
init_config2();

// ../v2-core/storage/local-user-settings-store.ts
init_errors();

// ../v2-core/validation/user-settings-input.ts
init_errors();
var DEFAULT_INTERFACE_LANGUAGE = "uk";
var DEFAULT_TRANSLATION_LANGUAGE = "uk";
var DEFAULT_THEME = "light";
var VALID_LANGUAGE_CODES = /* @__PURE__ */ new Set([
  "uk",
  "en",
  "pl",
  "es",
  "de",
  "fr"
]);
var VALID_THEMES = /* @__PURE__ */ new Set(["light", "dark"]);
var AUTO_PAUSE_KEYS = [
  "explainSentence",
  "translateSelection",
  "grammarAnalysis",
  "quiz"
];
var DEFAULT_AUTO_PAUSE = {
  explainSentence: false,
  translateSelection: false,
  grammarAnalysis: false,
  quiz: false
};
function defaultUserSettings(userId) {
  return {
    userId,
    interfaceLanguage: DEFAULT_INTERFACE_LANGUAGE,
    translationLanguage: DEFAULT_TRANSLATION_LANGUAGE,
    theme: DEFAULT_THEME,
    autoPause: { ...DEFAULT_AUTO_PAUSE },
    bilingualMode: false
  };
}
function validateLanguageCode(value, field) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new ApiError(`${field} must be a string`, 400, "INVALID_USER_SETTINGS");
  }
  const code = value.trim().toLowerCase();
  if (!VALID_LANGUAGE_CODES.has(code)) {
    throw new ApiError(`${field} has an invalid value`, 400, "INVALID_USER_SETTINGS");
  }
  return code;
}
function validateTheme(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new ApiError("theme must be a string", 400, "INVALID_USER_SETTINGS");
  }
  const theme = value.trim().toLowerCase();
  if (!VALID_THEMES.has(theme)) {
    throw new ApiError("theme must be light or dark", 400, "INVALID_USER_SETTINGS");
  }
  return theme;
}
function validateAutoPausePatch(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "object") {
    throw new ApiError("autoPause must be an object", 400, "INVALID_USER_SETTINGS");
  }
  const source = value;
  const patch = {};
  for (const key of AUTO_PAUSE_KEYS) {
    if (source[key] === void 0) continue;
    if (typeof source[key] !== "boolean") {
      throw new ApiError(
        `autoPause.${key} must be a boolean`,
        400,
        "INVALID_USER_SETTINGS"
      );
    }
    patch[key] = source[key];
  }
  return Object.keys(patch).length > 0 ? patch : void 0;
}
function validateUpdateUserSettingsInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_USER_SETTINGS");
  }
  const interfaceLanguage = validateLanguageCode(
    input.interfaceLanguage,
    "interfaceLanguage"
  );
  const translationLanguage = validateLanguageCode(
    input.translationLanguage,
    "translationLanguage"
  );
  const theme = validateTheme(input.theme);
  const autoPause = validateAutoPausePatch(input.autoPause);
  let bilingualMode;
  if (input.bilingualMode !== void 0 && input.bilingualMode !== null) {
    if (typeof input.bilingualMode !== "boolean") {
      throw new ApiError(
        "bilingualMode must be a boolean",
        400,
        "INVALID_USER_SETTINGS"
      );
    }
    bilingualMode = input.bilingualMode;
  }
  if (interfaceLanguage === void 0 && translationLanguage === void 0 && theme === void 0 && autoPause === void 0 && bilingualMode === void 0) {
    throw new ApiError(
      "At least one setting field is required",
      400,
      "INVALID_USER_SETTINGS"
    );
  }
  return {
    ...interfaceLanguage !== void 0 ? { interfaceLanguage } : {},
    ...translationLanguage !== void 0 ? { translationLanguage } : {},
    ...theme !== void 0 ? { theme } : {},
    ...autoPause !== void 0 ? { autoPause } : {},
    ...bilingualMode !== void 0 ? { bilingualMode } : {}
  };
}
function mergeUserSettings(current, patch) {
  return {
    userId: current.userId,
    interfaceLanguage: patch.interfaceLanguage ?? current.interfaceLanguage,
    translationLanguage: patch.translationLanguage ?? current.translationLanguage,
    theme: patch.theme ?? current.theme,
    autoPause: {
      ...current.autoPause,
      ...patch.autoPause ?? {}
    },
    bilingualMode: patch.bilingualMode ?? current.bilingualMode
  };
}
function parseAutoPause(value) {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_AUTO_PAUSE };
  }
  const source = value;
  return {
    explainSentence: Boolean(source.explainSentence),
    translateSelection: Boolean(source.translateSelection),
    grammarAnalysis: Boolean(source.grammarAnalysis),
    quiz: Boolean(source.quiz)
  };
}
function parseStoredAutoPause(raw) {
  try {
    return parseAutoPause(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_AUTO_PAUSE };
  }
}

// ../v2-core/storage/local-user-settings-store.ts
init_local_db();
function toRecord11(row) {
  return {
    userId: row.userId,
    interfaceLanguage: row.interfaceLanguage,
    translationLanguage: row.translationLanguage,
    theme: row.theme,
    autoPause: parseStoredAutoPause(row.autoPause),
    bilingualMode: row.bilingualMode === 1
  };
}
function getUserSettings(userId) {
  const db = getLocalDatabase();
  const row = db.prepare(`SELECT * FROM user_settings WHERE userId = ?`).get(userId);
  if (!row) {
    return defaultUserSettings(userId);
  }
  return toRecord11(row);
}
function updateUserSettings(userId, input) {
  const validated = validateUpdateUserSettingsInput(input);
  const current = getUserSettings(userId);
  const merged = mergeUserSettings(current, validated);
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO user_settings (
      userId, interfaceLanguage, translationLanguage, theme, autoPause, bilingualMode
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      interfaceLanguage = excluded.interfaceLanguage,
      translationLanguage = excluded.translationLanguage,
      theme = excluded.theme,
      autoPause = excluded.autoPause,
      bilingualMode = excluded.bilingualMode`
  ).run(
    userId,
    merged.interfaceLanguage,
    merged.translationLanguage,
    merged.theme,
    JSON.stringify(merged.autoPause),
    merged.bilingualMode ? 1 : 0
  );
  const row = db.prepare(`SELECT * FROM user_settings WHERE userId = ?`).get(userId);
  if (!row) {
    throw new ApiError(
      "Failed to save user settings",
      500,
      "USER_SETTINGS_SAVE_FAILED"
    );
  }
  return toRecord11(row);
}

// ../v2-core/services/user-settings-service.ts
init_keys();
function toRecord12(item) {
  const autoPause = typeof item.autoPause === "string" ? parseStoredAutoPause(item.autoPause) : parseAutoPause(item.autoPause);
  return {
    userId: item.userId,
    interfaceLanguage: item.interfaceLanguage,
    translationLanguage: item.translationLanguage,
    theme: item.theme,
    autoPause,
    bilingualMode: Boolean(item.bilingualMode)
  };
}
async function getUserSettings2(auth) {
  if (isLocalBackend()) {
    return getUserSettings(auth.userId);
  }
  const item = await getItem3(
    userPk(auth.userId),
    userSettingsSk()
  );
  if (!item || item.userId !== auth.userId) {
    return defaultUserSettings(auth.userId);
  }
  return toRecord12(item);
}
async function updateUserSettings2(auth, input) {
  const validated = validateUpdateUserSettingsInput(input);
  if (isLocalBackend()) {
    return updateUserSettings(auth.userId, validated);
  }
  const existing = await getItem3(
    userPk(auth.userId),
    userSettingsSk()
  );
  const current = existing && existing.userId === auth.userId ? toRecord12(existing) : defaultUserSettings(auth.userId);
  const merged = mergeUserSettings(current, validated);
  const now2 = Date.now();
  const item = {
    PK: userPk(auth.userId),
    SK: userSettingsSk(),
    entityType: "USER_SETTINGS",
    userId: auth.userId,
    interfaceLanguage: merged.interfaceLanguage,
    translationLanguage: merged.translationLanguage,
    theme: merged.theme,
    autoPause: merged.autoPause,
    bilingualMode: merged.bilingualMode,
    createdAt: existing?.createdAt ?? now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord12(item);
}

// ../v2-core/services/vocabulary-progress-service.ts
init_config2();

// ../v2-core/storage/local-vocabulary-progress-store.ts
init_errors();
import { randomUUID as randomUUID7 } from "node:crypto";

// ../v2-core/validation/vocabulary-progress-input.ts
init_errors();
var MAX_WORD_LENGTH2 = 200;
var MAX_REVIEW_COUNT = 1e6;
function normalizeVocabularyProgressWord(word) {
  return normalizeFlashcardWord(word);
}
function validateUpsertVocabularyProgressInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_VOCABULARY_PROGRESS");
  }
  const rawWord = String(input.word ?? "").trim().replace(/\s+/g, " ");
  if (!rawWord) {
    throw new ApiError("word is required", 400, "INVALID_VOCABULARY_PROGRESS");
  }
  if (rawWord.length > MAX_WORD_LENGTH2) {
    throw new ApiError(
      `word must be at most ${MAX_WORD_LENGTH2} characters`,
      400,
      "INVALID_VOCABULARY_PROGRESS"
    );
  }
  const word = normalizeVocabularyProgressWord(rawWord);
  const reviewCount = input.reviewCount;
  if (typeof reviewCount !== "number" || !Number.isInteger(reviewCount) || reviewCount < 0 || reviewCount > MAX_REVIEW_COUNT) {
    throw new ApiError(
      "reviewCount must be a non-negative integer",
      400,
      "INVALID_VOCABULARY_PROGRESS"
    );
  }
  if (typeof input.mastered !== "boolean") {
    throw new ApiError("mastered must be a boolean", 400, "INVALID_VOCABULARY_PROGRESS");
  }
  if (input.lastReviewDate !== void 0 && input.lastReviewDate !== null) {
    if (typeof input.lastReviewDate !== "number" || !Number.isFinite(input.lastReviewDate) || input.lastReviewDate < 0) {
      throw new ApiError(
        "lastReviewDate must be a non-negative number or null",
        400,
        "INVALID_VOCABULARY_PROGRESS"
      );
    }
  }
  return {
    word,
    reviewCount,
    mastered: input.mastered,
    lastReviewDate: input.lastReviewDate
  };
}

// ../v2-core/storage/local-vocabulary-progress-store.ts
init_local_db();
function toRecord13(row) {
  return {
    id: row.id,
    userId: row.userId,
    word: row.word,
    reviewCount: row.reviewCount,
    mastered: row.mastered === 1,
    lastReviewDate: row.lastReviewDate
  };
}
function getRowByWord(userId, word) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM vocabulary_progress WHERE userId = ? AND word = ?`).get(userId, word) ?? null;
}
function getRowById(userId, id) {
  const db = getLocalDatabase();
  return db.prepare(`SELECT * FROM vocabulary_progress WHERE id = ? AND userId = ?`).get(id, userId) ?? null;
}
function upsertVocabularyProgress(userId, input) {
  const validated = validateUpsertVocabularyProgressInput(input);
  const existing = getRowByWord(userId, validated.word);
  const id = existing?.id ?? randomUUID7();
  const lastReviewDate = validated.lastReviewDate !== void 0 ? validated.lastReviewDate : existing?.lastReviewDate ?? null;
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO vocabulary_progress (
      id, userId, word, reviewCount, mastered, lastReviewDate
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId, word) DO UPDATE SET
      reviewCount = excluded.reviewCount,
      mastered = excluded.mastered,
      lastReviewDate = excluded.lastReviewDate`
  ).run(
    id,
    userId,
    validated.word,
    validated.reviewCount,
    validated.mastered ? 1 : 0,
    lastReviewDate
  );
  const row = getRowById(userId, id) ?? getRowByWord(userId, validated.word);
  if (!row) {
    throw new ApiError(
      "Failed to save vocabulary progress",
      500,
      "VOCABULARY_PROGRESS_SAVE_FAILED"
    );
  }
  return toRecord13(row);
}

// ../v2-core/services/vocabulary-progress-service.ts
init_keys();
import { randomUUID as randomUUID8 } from "node:crypto";
function toRecord14(item) {
  return {
    id: item.id,
    userId: item.userId,
    word: item.word,
    reviewCount: item.reviewCount,
    mastered: item.mastered,
    lastReviewDate: item.lastReviewDate
  };
}
async function upsertVocabularyProgress2(auth, input) {
  const validated = validateUpsertVocabularyProgressInput(input);
  if (isLocalBackend()) {
    return upsertVocabularyProgress(auth.userId, validated);
  }
  const items = await queryByUser3(
    auth.userId,
    "VOCAB_PROGRESS#"
  );
  const existing = items.find(
    (item2) => normalizeVocabularyProgressWord(item2.word) === validated.word
  );
  const id = existing?.id ?? randomUUID8();
  const lastReviewDate = validated.lastReviewDate !== void 0 ? validated.lastReviewDate : existing?.lastReviewDate ?? null;
  const item = {
    PK: userPk(auth.userId),
    SK: vocabularyProgressSk(id),
    entityType: "VOCAB_PROGRESS",
    userId: auth.userId,
    id,
    word: validated.word,
    reviewCount: validated.reviewCount,
    mastered: validated.mastered,
    lastReviewDate,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now()
  };
  await putItem3(item);
  return toRecord14(item);
}

// ../v2-core/services/playback-position-service.ts
init_errors();
init_keys();
var MIN_POSITION_SECONDS = 0;
function normalizeVideoId(videoId) {
  const normalized = videoId.trim();
  if (!normalized) {
    throw new ApiError("videoId is required", 400, "INVALID_PLAYBACK_POSITION");
  }
  return normalized;
}
function normalizePosition(lastPosition) {
  if (!Number.isFinite(lastPosition) || lastPosition < MIN_POSITION_SECONDS) {
    throw new ApiError(
      "lastPosition must be a non-negative number",
      400,
      "INVALID_PLAYBACK_POSITION"
    );
  }
  return lastPosition;
}
function toRecord15(item) {
  return {
    userId: item.userId,
    videoId: item.videoId,
    lastPosition: item.lastPosition,
    updatedAt: item.updatedAt ?? item.createdAt
  };
}
function emptyRecord(auth, videoId) {
  return {
    userId: auth.userId,
    videoId,
    lastPosition: 0,
    updatedAt: 0
  };
}
async function getPlaybackPosition(auth, videoId) {
  const normalizedVideoId = normalizeVideoId(videoId);
  const existing = await getItem3(
    userPk(auth.userId),
    playbackPositionSk(normalizedVideoId)
  );
  if (!existing || existing.userId !== auth.userId) {
    return emptyRecord(auth, normalizedVideoId);
  }
  return toRecord15(existing);
}
async function savePlaybackPosition(auth, input) {
  const videoId = normalizeVideoId(input.videoId);
  const lastPosition = normalizePosition(input.lastPosition);
  const now2 = Date.now();
  const pk = userPk(auth.userId);
  const sk = playbackPositionSk(videoId);
  const existing = await getItem3(pk, sk);
  const item = {
    PK: pk,
    SK: sk,
    entityType: "PLAYBACK",
    userId: auth.userId,
    videoId,
    lastPosition,
    createdAt: existing?.createdAt ?? now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord15(item);
}

// ../v2-core/services/video-history-service.ts
init_errors();
init_keys();
function normalizeInput(input) {
  const videoId = input.videoId?.trim();
  const url = input.url?.trim();
  const title = input.title?.trim() || videoId || "";
  const channel = input.channel?.trim() || "";
  if (!videoId || !url) {
    throw new ApiError("videoId and url are required", 400, "INVALID_VIDEO_HISTORY");
  }
  return { videoId, url, title, channel };
}
function toRecord16(item) {
  return {
    userId: item.userId,
    videoId: item.videoId,
    title: item.title,
    url: item.url,
    channel: item.channel,
    createdAt: item.createdAt
  };
}
async function listVideoHistory(auth) {
  const items = await queryByUser3(auth.userId, "VIDEO#");
  return items.map(toRecord16).sort((left, right) => right.createdAt - left.createdAt);
}
async function recordVideoHistory(auth, input) {
  const normalized = normalizeInput(input);
  const pk = userPk(auth.userId);
  const sk = videoHistorySk(normalized.videoId);
  const now2 = Date.now();
  const item = {
    PK: pk,
    SK: sk,
    entityType: "VIDEO",
    userId: auth.userId,
    videoId: normalized.videoId,
    title: normalized.title,
    url: normalized.url,
    channel: normalized.channel,
    createdAt: now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord16(item);
}
async function deleteVideoHistory(auth, videoId) {
  const normalizedVideoId = videoId.trim();
  if (!normalizedVideoId) {
    throw new ApiError("videoId is required", 400, "INVALID_VIDEO_HISTORY");
  }
  const pk = userPk(auth.userId);
  const sk = videoHistorySk(normalizedVideoId);
  const existing = await getItem3(pk, sk);
  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError("Video history entry not found");
  }
  await deleteItem3(pk, sk);
  return { success: true };
}

// ../v2-core/lambda/event.ts
function parseEventBody(event) {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
function getEventPath(event) {
  const rawPath = event.rawPath ?? event.requestContext.http.path ?? "/";
  const normalized = rawPath.replace(/^\/api\/v2/, "") || "/";
  return normalized.endsWith("/") && normalized.length > 1 ? normalized.slice(0, -1) : normalized;
}
function getQueryParams(event) {
  return new URLSearchParams(event.rawQueryString ?? "");
}
function getRequestId(event) {
  return event.requestContext.requestId;
}

// ../v2-core/lambda/api-router.ts
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS"
  };
}
async function toApiGatewayResponse(response) {
  return {
    statusCode: response.status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders()
    },
    body: await response.text()
  };
}
async function ok(data, statusCode = 200) {
  return toApiGatewayResponse(jsonResponse(successResponse(data), statusCode, corsHeaders()));
}
var PUBLIC_ROUTES = {
  "GET /status": async () => ok({
    storageBackend: isLocalBackend() ? "local" : "dynamodb",
    auth: isLocalBackend() ? "local-jwt" : "cognito",
    googleAuth: isGoogleAuthConfigured()
  }),
  "POST /auth/signup": async (event) => {
    const body = parseEventBody(event);
    return ok(await signUp3(body), 201);
  },
  "POST /auth/login": async (event) => {
    const body = parseEventBody(event);
    return ok(await login3(body));
  },
  "POST /auth/refresh": async (event) => {
    const body = parseEventBody(event);
    return ok(await refreshTokens3(body));
  },
  "POST /auth/logout": async (event) => {
    const body = parseEventBody(event);
    return ok(await logout3(body));
  },
  "POST /auth/confirm": async (event) => {
    const body = parseEventBody(event);
    return ok(await confirmSignUp3(body));
  },
  "POST /auth/forgot-password": async (event) => {
    const body = parseEventBody(event);
    return ok(await forgotPassword3(body));
  },
  "POST /auth/confirm-forgot-password": async (event) => {
    const body = parseEventBody(event);
    return ok(await confirmForgotPassword3(body));
  },
  "POST /auth/google": async (event) => {
    const body = parseEventBody(event);
    return ok(await loginWithGoogle2(body));
  }
};
async function dispatchProtected(event, path) {
  const auth = getAuthFromApiGatewayEvent(event);
  const method = event.requestContext.http.method;
  const body = parseEventBody(event);
  const query = getQueryParams(event);
  if (method === "GET" && path === "/me") {
    const authorization = event.headers?.authorization ?? event.headers?.Authorization;
    const token = authorization?.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError();
    }
    return ok(await getCurrentUser2(token));
  }
  if (method === "GET" && path === "/flashcards") {
    const pagination = parsePaginationParams(query);
    return ok(await listFlashcards2(auth, pagination));
  }
  if (method === "POST" && path === "/flashcards") {
    return ok(
      await createFlashcard2(auth, body),
      201
    );
  }
  const flashcardMatch = path.match(/^\/flashcards\/([^/]+)$/);
  if (flashcardMatch) {
    const cardId = decodeURIComponent(flashcardMatch[1]);
    if (method === "PUT") {
      return ok(
        await updateFlashcard2(
          auth,
          cardId,
          body
        )
      );
    }
    if (method === "DELETE") {
      return ok(await deleteFlashcard2(auth, cardId));
    }
  }
  if (method === "GET" && path === "/decks") {
    return ok(await listDecks(auth));
  }
  if (method === "GET" && path === "/progress") {
    return ok(await getProgress(auth));
  }
  if (method === "GET" && path === "/bookmarks") {
    return ok(await listBookmarks2(auth, query.get("videoId") ?? void 0));
  }
  if (method === "POST" && path === "/bookmarks") {
    return ok(
      await createBookmark2(auth, body),
      201
    );
  }
  const bookmarkMatch = path.match(/^\/bookmarks\/([^/]+)$/);
  if (bookmarkMatch && method === "DELETE") {
    return ok(
      await deleteBookmark2(
        auth,
        decodeURIComponent(bookmarkMatch[1])
      )
    );
  }
  if (method === "GET" && path === "/quiz-results") {
    return ok(
      await listQuizResults2(auth, query.get("videoId") ?? void 0)
    );
  }
  if (method === "PUT" && path === "/vocabulary-progress") {
    return ok(
      await upsertVocabularyProgress2(
        auth,
        body
      )
    );
  }
  if (method === "GET" && path === "/settings") {
    return ok(await getUserSettings2(auth));
  }
  if (method === "PUT" && path === "/settings") {
    return ok(
      await updateUserSettings2(
        auth,
        body
      )
    );
  }
  if (method === "GET" && path === "/subscription") {
    return ok(await getPremiumAccess(auth));
  }
  if (method === "GET" && path === "/reviews/today") {
    return ok(await listTodayReviews(auth));
  }
  if (method === "GET" && path === "/video-history") {
    return ok(await listVideoHistory(auth));
  }
  if (method === "POST" && path === "/video-history") {
    return ok(
      await recordVideoHistory(
        auth,
        body
      ),
      201
    );
  }
  const videoHistoryMatch = path.match(/^\/video-history\/([^/]+)$/);
  if (videoHistoryMatch && method === "DELETE") {
    return ok(
      await deleteVideoHistory(
        auth,
        decodeURIComponent(videoHistoryMatch[1])
      )
    );
  }
  if (method === "PUT" && path === "/playback-position") {
    return ok(
      await savePlaybackPosition(
        auth,
        body
      )
    );
  }
  const playbackMatch = path.match(/^\/playback-position\/([^/]+)$/);
  if (playbackMatch && method === "GET") {
    return ok(
      await getPlaybackPosition(
        auth,
        decodeURIComponent(playbackMatch[1])
      )
    );
  }
  throw new ApiError("Route not found", 404, "NOT_FOUND");
}
async function dispatchApiRoute(event) {
  const method = event.requestContext.http.method;
  const path = getEventPath(event);
  const requestId = getRequestId(event);
  if (method === "OPTIONS") {
    return {
      statusCode: 204,
      headers: corsHeaders()
    };
  }
  logger.info("API request", { requestId, method, path });
  try {
    const publicKey = `${method} ${path}`;
    const publicHandler = PUBLIC_ROUTES[publicKey];
    if (publicHandler) {
      return await publicHandler(event, path);
    }
    return await dispatchProtected(
      event,
      path
    );
  } catch (error) {
    logger.error("API request failed", {
      requestId,
      method,
      path,
      code: error instanceof ApiError ? error.code : "INTERNAL"
    });
    return toApiGatewayResponse(handleServiceError(error));
  }
}

// src/handlers/api/handler.ts
var handler = dispatchApiRoute;
export {
  handler
};
//# sourceMappingURL=handler.js.map
