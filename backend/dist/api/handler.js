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
  const configured = process.env.LOCAL_AUTH_SECRET?.trim();
  const secret = configured || DEV_ONLY_LOCAL_AUTH_SECRET;
  if (process.env.NODE_ENV === "production" && KNOWN_INSECURE_LOCAL_AUTH_SECRETS.has(secret)) {
    throw new Error(
      "LOCAL_AUTH_SECRET is missing or still set to its placeholder value. JWTs signed with a known secret can be forged by anyone. Set a strong random value (e.g. `openssl rand -hex 32`) in your production environment before starting the server."
    );
  }
  return secret;
}
function isEmailVerificationEnabled() {
  return process.env.EMAIL_VERIFICATION_ENABLED === "true";
}
var DEV_ONLY_LOCAL_AUTH_SECRET, KNOWN_INSECURE_LOCAL_AUTH_SECRETS;
var init_config2 = __esm({
  "../v2-core/storage/config.ts"() {
    "use strict";
    init_config();
    DEV_ONLY_LOCAL_AUTH_SECRET = "yoytube-local-dev-secret-change-me";
    KNOWN_INSECURE_LOCAL_AUTH_SECRETS = /* @__PURE__ */ new Set([
      DEV_ONLY_LOCAL_AUTH_SECRET,
      // The literal placeholder documented in .env.example - if someone copies
      // the file without changing it, this must not silently work in prod.
      "change-me-in-production"
    ]);
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
    exports.exec = function exec2(sql) {
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

// ../node_modules/es-errors/type.js
var require_type = __commonJS({
  "../node_modules/es-errors/type.js"(exports, module) {
    "use strict";
    module.exports = TypeError;
  }
});

// ../node_modules/object-inspect/util.inspect.js
var require_util_inspect = __commonJS({
  "../node_modules/object-inspect/util.inspect.js"(exports, module) {
    module.exports = __require("util").inspect;
  }
});

// ../node_modules/object-inspect/index.js
var require_object_inspect = __commonJS({
  "../node_modules/object-inspect/index.js"(exports, module) {
    var hasMap = typeof Map === "function" && Map.prototype;
    var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, "size") : null;
    var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === "function" ? mapSizeDescriptor.get : null;
    var mapForEach = hasMap && Map.prototype.forEach;
    var hasSet = typeof Set === "function" && Set.prototype;
    var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, "size") : null;
    var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === "function" ? setSizeDescriptor.get : null;
    var setForEach = hasSet && Set.prototype.forEach;
    var hasWeakMap = typeof WeakMap === "function" && WeakMap.prototype;
    var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
    var hasWeakSet = typeof WeakSet === "function" && WeakSet.prototype;
    var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
    var hasWeakRef = typeof WeakRef === "function" && WeakRef.prototype;
    var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
    var booleanValueOf = Boolean.prototype.valueOf;
    var objectToString = Object.prototype.toString;
    var functionToString = Function.prototype.toString;
    var $match = String.prototype.match;
    var $slice = String.prototype.slice;
    var $replace = String.prototype.replace;
    var $toUpperCase = String.prototype.toUpperCase;
    var $toLowerCase = String.prototype.toLowerCase;
    var $test = RegExp.prototype.test;
    var $concat = Array.prototype.concat;
    var $join = Array.prototype.join;
    var $arrSlice = Array.prototype.slice;
    var $floor = Math.floor;
    var bigIntValueOf = typeof BigInt === "function" ? BigInt.prototype.valueOf : null;
    var gOPS = Object.getOwnPropertySymbols;
    var symToString = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? Symbol.prototype.toString : null;
    var hasShammedSymbols = typeof Symbol === "function" && typeof Symbol.iterator === "object";
    var toStringTag = typeof Symbol === "function" && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? "object" : "symbol") ? Symbol.toStringTag : null;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var gPO = (typeof Reflect === "function" ? Reflect.getPrototypeOf : Object.getPrototypeOf) || ([].__proto__ === Array.prototype ? function(O) {
      return O.__proto__;
    } : null);
    function addNumericSeparator(num, str) {
      if (num === Infinity || num === -Infinity || num !== num || num && num > -1e3 && num < 1e3 || $test.call(/e/, str)) {
        return str;
      }
      var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
      if (typeof num === "number") {
        var int = num < 0 ? -$floor(-num) : $floor(num);
        if (int !== num) {
          var intStr = String(int);
          var dec = $slice.call(str, intStr.length + 1);
          return $replace.call(intStr, sepRegex, "$&_") + "." + $replace.call($replace.call(dec, /([0-9]{3})/g, "$&_"), /_$/, "");
        }
      }
      return $replace.call(str, sepRegex, "$&_");
    }
    var utilInspect = require_util_inspect();
    var inspectCustom = utilInspect.custom;
    var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;
    var quotes = {
      __proto__: null,
      "double": '"',
      single: "'"
    };
    var quoteREs = {
      __proto__: null,
      "double": /(["\\])/g,
      single: /(['\\])/g
    };
    module.exports = function inspect_(obj, options, depth, seen) {
      var opts = options || {};
      if (has(opts, "quoteStyle") && !has(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
      }
      if (has(opts, "maxStringLength") && (typeof opts.maxStringLength === "number" ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity : opts.maxStringLength !== null)) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
      }
      var customInspect = has(opts, "customInspect") ? opts.customInspect : true;
      if (typeof customInspect !== "boolean" && customInspect !== "symbol") {
        throw new TypeError("option \"customInspect\", if provided, must be `true`, `false`, or `'symbol'`");
      }
      if (has(opts, "indent") && opts.indent !== null && opts.indent !== "	" && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
      }
      if (has(opts, "numericSeparator") && typeof opts.numericSeparator !== "boolean") {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
      }
      var numericSeparator = opts.numericSeparator;
      if (typeof obj === "undefined") {
        return "undefined";
      }
      if (obj === null) {
        return "null";
      }
      if (typeof obj === "boolean") {
        return obj ? "true" : "false";
      }
      if (typeof obj === "string") {
        return inspectString(obj, opts);
      }
      if (typeof obj === "number") {
        if (obj === 0) {
          return Infinity / obj > 0 ? "0" : "-0";
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
      }
      if (typeof obj === "bigint") {
        var bigIntStr = String(obj) + "n";
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
      }
      var maxDepth = typeof opts.depth === "undefined" ? 5 : opts.depth;
      if (typeof depth === "undefined") {
        depth = 0;
      }
      if (depth >= maxDepth && maxDepth > 0 && typeof obj === "object") {
        return isArray(obj) ? "[Array]" : "[Object]";
      }
      var indent = getIndent(opts, depth);
      if (typeof seen === "undefined") {
        seen = [];
      } else if (indexOf(seen, obj) >= 0) {
        return "[Circular]";
      }
      function inspect(value, from, noIndent) {
        if (from) {
          seen = $arrSlice.call(seen);
          seen.push(from);
        }
        if (noIndent) {
          var newOpts = {
            depth: opts.depth
          };
          if (has(opts, "quoteStyle")) {
            newOpts.quoteStyle = opts.quoteStyle;
          }
          return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
      }
      if (typeof obj === "function" && !isRegExp(obj)) {
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return "[Function" + (name ? ": " + name : " (anonymous)") + "]" + (keys.length > 0 ? " { " + $join.call(keys, ", ") + " }" : "");
      }
      if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, "$1") : symToString.call(obj);
        return typeof obj === "object" && !hasShammedSymbols ? markBoxed(symString) : symString;
      }
      if (isElement(obj)) {
        var s = "<" + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
          s += " " + attrs[i].name + "=" + wrapQuotes(quote(attrs[i].value), "double", opts);
        }
        s += ">";
        if (obj.childNodes && obj.childNodes.length) {
          s += "...";
        }
        s += "</" + $toLowerCase.call(String(obj.nodeName)) + ">";
        return s;
      }
      if (isArray(obj)) {
        if (obj.length === 0) {
          return "[]";
        }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
          return "[" + indentedJoin(xs, indent) + "]";
        }
        return "[ " + $join.call(xs, ", ") + " ]";
      }
      if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!("cause" in Error.prototype) && "cause" in obj && !isEnumerable.call(obj, "cause")) {
          return "{ [" + String(obj) + "] " + $join.call($concat.call("[cause]: " + inspect(obj.cause), parts), ", ") + " }";
        }
        if (parts.length === 0) {
          return "[" + String(obj) + "]";
        }
        return "{ [" + String(obj) + "] " + $join.call(parts, ", ") + " }";
      }
      if (typeof obj === "object" && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === "function" && utilInspect) {
          return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== "symbol" && typeof obj.inspect === "function") {
          return obj.inspect();
        }
      }
      if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
          mapForEach.call(obj, function(value, key) {
            mapParts.push(inspect(key, obj, true) + " => " + inspect(value, obj));
          });
        }
        return collectionOf("Map", mapSize.call(obj), mapParts, indent);
      }
      if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
          setForEach.call(obj, function(value) {
            setParts.push(inspect(value, obj));
          });
        }
        return collectionOf("Set", setSize.call(obj), setParts, indent);
      }
      if (isWeakMap(obj)) {
        return weakCollectionOf("WeakMap");
      }
      if (isWeakSet(obj)) {
        return weakCollectionOf("WeakSet");
      }
      if (isWeakRef(obj)) {
        return weakCollectionOf("WeakRef");
      }
      if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
      }
      if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
      }
      if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
      }
      if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
      }
      if (typeof window !== "undefined" && obj === window) {
        return "{ [object Window] }";
      }
      if (typeof globalThis !== "undefined" && obj === globalThis || typeof global !== "undefined" && obj === global) {
        return "{ [object globalThis] }";
      }
      if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? "" : "null prototype";
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? "Object" : "";
        var constructorTag = isPlainObject || typeof obj.constructor !== "function" ? "" : obj.constructor.name ? obj.constructor.name + " " : "";
        var tag2 = constructorTag + (stringTag || protoTag ? "[" + $join.call($concat.call([], stringTag || [], protoTag || []), ": ") + "] " : "");
        if (ys.length === 0) {
          return tag2 + "{}";
        }
        if (indent) {
          return tag2 + "{" + indentedJoin(ys, indent) + "}";
        }
        return tag2 + "{ " + $join.call(ys, ", ") + " }";
      }
      return String(obj);
    };
    function wrapQuotes(s, defaultStyle, opts) {
      var style = opts.quoteStyle || defaultStyle;
      var quoteChar = quotes[style];
      return quoteChar + s + quoteChar;
    }
    function quote(s) {
      return $replace.call(String(s), /"/g, "&quot;");
    }
    function canTrustToString(obj) {
      return !toStringTag || !(typeof obj === "object" && (toStringTag in obj || typeof obj[toStringTag] !== "undefined"));
    }
    function isArray(obj) {
      return toStr(obj) === "[object Array]" && canTrustToString(obj);
    }
    function isDate(obj) {
      return toStr(obj) === "[object Date]" && canTrustToString(obj);
    }
    function isRegExp(obj) {
      return toStr(obj) === "[object RegExp]" && canTrustToString(obj);
    }
    function isError(obj) {
      return toStr(obj) === "[object Error]" && canTrustToString(obj);
    }
    function isString(obj) {
      return toStr(obj) === "[object String]" && canTrustToString(obj);
    }
    function isNumber(obj) {
      return toStr(obj) === "[object Number]" && canTrustToString(obj);
    }
    function isBoolean(obj) {
      return toStr(obj) === "[object Boolean]" && canTrustToString(obj);
    }
    function isSymbol(obj) {
      if (hasShammedSymbols) {
        return obj && typeof obj === "object" && obj instanceof Symbol;
      }
      if (typeof obj === "symbol") {
        return true;
      }
      if (!obj || typeof obj !== "object" || !symToString) {
        return false;
      }
      try {
        symToString.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    function isBigInt(obj) {
      if (!obj || typeof obj !== "object" || !bigIntValueOf) {
        return false;
      }
      try {
        bigIntValueOf.call(obj);
        return true;
      } catch (e) {
      }
      return false;
    }
    var hasOwn = Object.prototype.hasOwnProperty || function(key) {
      return key in this;
    };
    function has(obj, key) {
      return hasOwn.call(obj, key);
    }
    function toStr(obj) {
      return objectToString.call(obj);
    }
    function nameOf(f) {
      if (f.name) {
        return f.name;
      }
      var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
      if (m) {
        return m[1];
      }
      return null;
    }
    function indexOf(xs, x) {
      if (xs.indexOf) {
        return xs.indexOf(x);
      }
      for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) {
          return i;
        }
      }
      return -1;
    }
    function isMap(x) {
      if (!mapSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        mapSize.call(x);
        try {
          setSize.call(x);
        } catch (s) {
          return true;
        }
        return x instanceof Map;
      } catch (e) {
      }
      return false;
    }
    function isWeakMap(x) {
      if (!weakMapHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakMapHas.call(x, weakMapHas);
        try {
          weakSetHas.call(x, weakSetHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakMap;
      } catch (e) {
      }
      return false;
    }
    function isWeakRef(x) {
      if (!weakRefDeref || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakRefDeref.call(x);
        return true;
      } catch (e) {
      }
      return false;
    }
    function isSet(x) {
      if (!setSize || !x || typeof x !== "object") {
        return false;
      }
      try {
        setSize.call(x);
        try {
          mapSize.call(x);
        } catch (m) {
          return true;
        }
        return x instanceof Set;
      } catch (e) {
      }
      return false;
    }
    function isWeakSet(x) {
      if (!weakSetHas || !x || typeof x !== "object") {
        return false;
      }
      try {
        weakSetHas.call(x, weakSetHas);
        try {
          weakMapHas.call(x, weakMapHas);
        } catch (s) {
          return true;
        }
        return x instanceof WeakSet;
      } catch (e) {
      }
      return false;
    }
    function isElement(x) {
      if (!x || typeof x !== "object") {
        return false;
      }
      if (typeof HTMLElement !== "undefined" && x instanceof HTMLElement) {
        return true;
      }
      return typeof x.nodeName === "string" && typeof x.getAttribute === "function";
    }
    function inspectString(str, opts) {
      if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = "... " + remaining + " more character" + (remaining > 1 ? "s" : "");
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
      }
      var quoteRE = quoteREs[opts.quoteStyle || "single"];
      quoteRE.lastIndex = 0;
      var s = $replace.call($replace.call(str, quoteRE, "\\$1"), /[\x00-\x1f]/g, lowbyte);
      return wrapQuotes(s, "single", opts);
    }
    function lowbyte(c) {
      var n = c.charCodeAt(0);
      var x = {
        8: "b",
        9: "t",
        10: "n",
        12: "f",
        13: "r"
      }[n];
      if (x) {
        return "\\" + x;
      }
      return "\\x" + (n < 16 ? "0" : "") + $toUpperCase.call(n.toString(16));
    }
    function markBoxed(str) {
      return "Object(" + str + ")";
    }
    function weakCollectionOf(type) {
      return type + " { ? }";
    }
    function collectionOf(type, size, entries, indent) {
      var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ", ");
      return type + " (" + size + ") {" + joinedEntries + "}";
    }
    function singleLineValues(xs) {
      for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], "\n") >= 0) {
          return false;
        }
      }
      return true;
    }
    function getIndent(opts, depth) {
      var baseIndent;
      if (opts.indent === "	") {
        baseIndent = "	";
      } else if (typeof opts.indent === "number" && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), " ");
      } else {
        return null;
      }
      return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
      };
    }
    function indentedJoin(xs, indent) {
      if (xs.length === 0) {
        return "";
      }
      var lineJoiner = "\n" + indent.prev + indent.base;
      return lineJoiner + $join.call(xs, "," + lineJoiner) + "\n" + indent.prev;
    }
    function arrObjKeys(obj, inspect) {
      var isArr = isArray(obj);
      var xs = [];
      if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
          xs[i] = has(obj, i) ? inspect(obj[i], obj) : "";
        }
      }
      var syms = typeof gOPS === "function" ? gOPS(obj) : [];
      var symMap;
      if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
          symMap["$" + syms[k]] = syms[k];
        }
      }
      for (var key in obj) {
        if (!has(obj, key)) {
          continue;
        }
        if (isArr && String(Number(key)) === key && key < obj.length) {
          continue;
        }
        if (hasShammedSymbols && symMap["$" + key] instanceof Symbol) {
          continue;
        } else if ($test.call(/[^\w$]/, key)) {
          xs.push(inspect(key, obj) + ": " + inspect(obj[key], obj));
        } else {
          xs.push(key + ": " + inspect(obj[key], obj));
        }
      }
      if (typeof gOPS === "function") {
        for (var j = 0; j < syms.length; j++) {
          if (isEnumerable.call(obj, syms[j])) {
            xs.push("[" + inspect(syms[j]) + "]: " + inspect(obj[syms[j]], obj));
          }
        }
      }
      return xs;
    }
  }
});

// ../node_modules/side-channel-list/index.js
var require_side_channel_list = __commonJS({
  "../node_modules/side-channel-list/index.js"(exports, module) {
    "use strict";
    var inspect = require_object_inspect();
    var $TypeError = require_type();
    var listGetNode = function(list, key, isDelete) {
      var prev = list;
      var curr;
      for (; (curr = prev.next) != null; prev = curr) {
        if (curr.key === key) {
          prev.next = curr.next;
          if (!isDelete) {
            curr.next = /** @type {NonNullable<typeof list.next>} */
            list.next;
            list.next = curr;
          }
          return curr;
        }
      }
    };
    var listGet = function(objects, key) {
      if (!objects) {
        return void 0;
      }
      var node = listGetNode(objects, key);
      return node && node.value;
    };
    var listSet = function(objects, key, value) {
      var node = listGetNode(objects, key);
      if (node) {
        node.value = value;
      } else {
        objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */
        {
          // eslint-disable-line no-param-reassign, no-extra-parens
          key,
          next: objects.next,
          value
        };
      }
    };
    var listHas = function(objects, key) {
      if (!objects) {
        return false;
      }
      return !!listGetNode(objects, key);
    };
    var listDelete = function(objects, key) {
      if (objects) {
        return listGetNode(objects, key, true);
      }
    };
    module.exports = function getSideChannelList() {
      var $o;
      var channel = {
        assert: function(key) {
          if (!channel.has(key)) {
            throw new $TypeError("Side channel does not contain " + inspect(key));
          }
        },
        "delete": function(key) {
          var deletedNode = listDelete($o, key);
          if (deletedNode && $o && !$o.next) {
            $o = void 0;
          }
          return !!deletedNode;
        },
        get: function(key) {
          return listGet($o, key);
        },
        has: function(key) {
          return listHas($o, key);
        },
        set: function(key, value) {
          if (!$o) {
            $o = {
              next: void 0
            };
          }
          listSet(
            /** @type {NonNullable<typeof $o>} */
            $o,
            key,
            value
          );
        }
      };
      return channel;
    };
  }
});

// ../node_modules/es-object-atoms/index.js
var require_es_object_atoms = __commonJS({
  "../node_modules/es-object-atoms/index.js"(exports, module) {
    "use strict";
    module.exports = Object;
  }
});

// ../node_modules/es-errors/index.js
var require_es_errors = __commonJS({
  "../node_modules/es-errors/index.js"(exports, module) {
    "use strict";
    module.exports = Error;
  }
});

// ../node_modules/es-errors/eval.js
var require_eval = __commonJS({
  "../node_modules/es-errors/eval.js"(exports, module) {
    "use strict";
    module.exports = EvalError;
  }
});

// ../node_modules/es-errors/range.js
var require_range = __commonJS({
  "../node_modules/es-errors/range.js"(exports, module) {
    "use strict";
    module.exports = RangeError;
  }
});

// ../node_modules/es-errors/ref.js
var require_ref = __commonJS({
  "../node_modules/es-errors/ref.js"(exports, module) {
    "use strict";
    module.exports = ReferenceError;
  }
});

// ../node_modules/es-errors/syntax.js
var require_syntax = __commonJS({
  "../node_modules/es-errors/syntax.js"(exports, module) {
    "use strict";
    module.exports = SyntaxError;
  }
});

// ../node_modules/es-errors/uri.js
var require_uri = __commonJS({
  "../node_modules/es-errors/uri.js"(exports, module) {
    "use strict";
    module.exports = URIError;
  }
});

// ../node_modules/math-intrinsics/abs.js
var require_abs = __commonJS({
  "../node_modules/math-intrinsics/abs.js"(exports, module) {
    "use strict";
    module.exports = Math.abs;
  }
});

// ../node_modules/math-intrinsics/floor.js
var require_floor = __commonJS({
  "../node_modules/math-intrinsics/floor.js"(exports, module) {
    "use strict";
    module.exports = Math.floor;
  }
});

// ../node_modules/math-intrinsics/max.js
var require_max = __commonJS({
  "../node_modules/math-intrinsics/max.js"(exports, module) {
    "use strict";
    module.exports = Math.max;
  }
});

// ../node_modules/math-intrinsics/min.js
var require_min = __commonJS({
  "../node_modules/math-intrinsics/min.js"(exports, module) {
    "use strict";
    module.exports = Math.min;
  }
});

// ../node_modules/math-intrinsics/pow.js
var require_pow = __commonJS({
  "../node_modules/math-intrinsics/pow.js"(exports, module) {
    "use strict";
    module.exports = Math.pow;
  }
});

// ../node_modules/math-intrinsics/round.js
var require_round = __commonJS({
  "../node_modules/math-intrinsics/round.js"(exports, module) {
    "use strict";
    module.exports = Math.round;
  }
});

// ../node_modules/math-intrinsics/isNaN.js
var require_isNaN = __commonJS({
  "../node_modules/math-intrinsics/isNaN.js"(exports, module) {
    "use strict";
    module.exports = Number.isNaN || function isNaN2(a) {
      return a !== a;
    };
  }
});

// ../node_modules/math-intrinsics/sign.js
var require_sign = __commonJS({
  "../node_modules/math-intrinsics/sign.js"(exports, module) {
    "use strict";
    var $isNaN = require_isNaN();
    module.exports = function sign2(number) {
      if ($isNaN(number) || number === 0) {
        return number;
      }
      return number < 0 ? -1 : 1;
    };
  }
});

// ../node_modules/gopd/gOPD.js
var require_gOPD = __commonJS({
  "../node_modules/gopd/gOPD.js"(exports, module) {
    "use strict";
    module.exports = Object.getOwnPropertyDescriptor;
  }
});

// ../node_modules/gopd/index.js
var require_gopd = __commonJS({
  "../node_modules/gopd/index.js"(exports, module) {
    "use strict";
    var $gOPD = require_gOPD();
    if ($gOPD) {
      try {
        $gOPD([], "length");
      } catch (e) {
        $gOPD = null;
      }
    }
    module.exports = $gOPD;
  }
});

// ../node_modules/es-define-property/index.js
var require_es_define_property = __commonJS({
  "../node_modules/es-define-property/index.js"(exports, module) {
    "use strict";
    var $defineProperty = Object.defineProperty || false;
    if ($defineProperty) {
      try {
        $defineProperty({}, "a", { value: 1 });
      } catch (e) {
        $defineProperty = false;
      }
    }
    module.exports = $defineProperty;
  }
});

// ../node_modules/has-symbols/shams.js
var require_shams = __commonJS({
  "../node_modules/has-symbols/shams.js"(exports, module) {
    "use strict";
    module.exports = function hasSymbols() {
      if (typeof Symbol !== "function" || typeof Object.getOwnPropertySymbols !== "function") {
        return false;
      }
      if (typeof Symbol.iterator === "symbol") {
        return true;
      }
      var obj = {};
      var sym = Symbol("test");
      var symObj = Object(sym);
      if (typeof sym === "string") {
        return false;
      }
      if (Object.prototype.toString.call(sym) !== "[object Symbol]") {
        return false;
      }
      if (Object.prototype.toString.call(symObj) !== "[object Symbol]") {
        return false;
      }
      var symVal = 42;
      obj[sym] = symVal;
      for (var _ in obj) {
        return false;
      }
      if (typeof Object.keys === "function" && Object.keys(obj).length !== 0) {
        return false;
      }
      if (typeof Object.getOwnPropertyNames === "function" && Object.getOwnPropertyNames(obj).length !== 0) {
        return false;
      }
      var syms = Object.getOwnPropertySymbols(obj);
      if (syms.length !== 1 || syms[0] !== sym) {
        return false;
      }
      if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) {
        return false;
      }
      if (typeof Object.getOwnPropertyDescriptor === "function") {
        var descriptor = (
          /** @type {PropertyDescriptor} */
          Object.getOwnPropertyDescriptor(obj, sym)
        );
        if (descriptor.value !== symVal || descriptor.enumerable !== true) {
          return false;
        }
      }
      return true;
    };
  }
});

// ../node_modules/has-symbols/index.js
var require_has_symbols = __commonJS({
  "../node_modules/has-symbols/index.js"(exports, module) {
    "use strict";
    var origSymbol = typeof Symbol !== "undefined" && Symbol;
    var hasSymbolSham = require_shams();
    module.exports = function hasNativeSymbols() {
      if (typeof origSymbol !== "function") {
        return false;
      }
      if (typeof Symbol !== "function") {
        return false;
      }
      if (typeof origSymbol("foo") !== "symbol") {
        return false;
      }
      if (typeof Symbol("bar") !== "symbol") {
        return false;
      }
      return hasSymbolSham();
    };
  }
});

// ../node_modules/get-proto/Reflect.getPrototypeOf.js
var require_Reflect_getPrototypeOf = __commonJS({
  "../node_modules/get-proto/Reflect.getPrototypeOf.js"(exports, module) {
    "use strict";
    module.exports = typeof Reflect !== "undefined" && Reflect.getPrototypeOf || null;
  }
});

// ../node_modules/get-proto/Object.getPrototypeOf.js
var require_Object_getPrototypeOf = __commonJS({
  "../node_modules/get-proto/Object.getPrototypeOf.js"(exports, module) {
    "use strict";
    var $Object = require_es_object_atoms();
    module.exports = $Object.getPrototypeOf || null;
  }
});

// ../node_modules/function-bind/implementation.js
var require_implementation = __commonJS({
  "../node_modules/function-bind/implementation.js"(exports, module) {
    "use strict";
    var ERROR_MESSAGE = "Function.prototype.bind called on incompatible ";
    var toStr = Object.prototype.toString;
    var max = Math.max;
    var funcType = "[object Function]";
    var concatty = function concatty2(a, b) {
      var arr = [];
      for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
      }
      for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
      }
      return arr;
    };
    var slicy = function slicy2(arrLike, offset) {
      var arr = [];
      for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
      }
      return arr;
    };
    var joiny = function(arr, joiner) {
      var str = "";
      for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
          str += joiner;
        }
      }
      return str;
    };
    module.exports = function bind(that) {
      var target = this;
      if (typeof target !== "function" || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
      }
      var args = slicy(arguments, 1);
      var bound;
      var binder = function() {
        if (this instanceof bound) {
          var result = target.apply(
            this,
            concatty(args, arguments)
          );
          if (Object(result) === result) {
            return result;
          }
          return this;
        }
        return target.apply(
          that,
          concatty(args, arguments)
        );
      };
      var boundLength = max(0, target.length - args.length);
      var boundArgs = [];
      for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = "$" + i;
      }
      bound = Function("binder", "return function (" + joiny(boundArgs, ",") + "){ return binder.apply(this,arguments); }")(binder);
      if (target.prototype) {
        var Empty = function Empty2() {
        };
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
      }
      return bound;
    };
  }
});

// ../node_modules/function-bind/index.js
var require_function_bind = __commonJS({
  "../node_modules/function-bind/index.js"(exports, module) {
    "use strict";
    var implementation = require_implementation();
    module.exports = Function.prototype.bind || implementation;
  }
});

// ../node_modules/call-bind-apply-helpers/functionCall.js
var require_functionCall = __commonJS({
  "../node_modules/call-bind-apply-helpers/functionCall.js"(exports, module) {
    "use strict";
    module.exports = Function.prototype.call;
  }
});

// ../node_modules/call-bind-apply-helpers/functionApply.js
var require_functionApply = __commonJS({
  "../node_modules/call-bind-apply-helpers/functionApply.js"(exports, module) {
    "use strict";
    module.exports = Function.prototype.apply;
  }
});

// ../node_modules/call-bind-apply-helpers/reflectApply.js
var require_reflectApply = __commonJS({
  "../node_modules/call-bind-apply-helpers/reflectApply.js"(exports, module) {
    "use strict";
    module.exports = typeof Reflect !== "undefined" && Reflect && Reflect.apply;
  }
});

// ../node_modules/call-bind-apply-helpers/actualApply.js
var require_actualApply = __commonJS({
  "../node_modules/call-bind-apply-helpers/actualApply.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var $reflectApply = require_reflectApply();
    module.exports = $reflectApply || bind.call($call, $apply);
  }
});

// ../node_modules/call-bind-apply-helpers/index.js
var require_call_bind_apply_helpers = __commonJS({
  "../node_modules/call-bind-apply-helpers/index.js"(exports, module) {
    "use strict";
    var bind = require_function_bind();
    var $TypeError = require_type();
    var $call = require_functionCall();
    var $actualApply = require_actualApply();
    module.exports = function callBindBasic(args) {
      if (args.length < 1 || typeof args[0] !== "function") {
        throw new $TypeError("a function is required");
      }
      return $actualApply(bind, $call, args);
    };
  }
});

// ../node_modules/dunder-proto/get.js
var require_get = __commonJS({
  "../node_modules/dunder-proto/get.js"(exports, module) {
    "use strict";
    var callBind = require_call_bind_apply_helpers();
    var gOPD = require_gopd();
    var hasProtoAccessor;
    try {
      hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */
      [].__proto__ === Array.prototype;
    } catch (e) {
      if (!e || typeof e !== "object" || !("code" in e) || e.code !== "ERR_PROTO_ACCESS") {
        throw e;
      }
    }
    var desc = !!hasProtoAccessor && gOPD && gOPD(
      Object.prototype,
      /** @type {keyof typeof Object.prototype} */
      "__proto__"
    );
    var $Object = Object;
    var $getPrototypeOf = $Object.getPrototypeOf;
    module.exports = desc && typeof desc.get === "function" ? callBind([desc.get]) : typeof $getPrototypeOf === "function" ? (
      /** @type {import('./get')} */
      function getDunder(value) {
        return $getPrototypeOf(value == null ? value : $Object(value));
      }
    ) : false;
  }
});

// ../node_modules/get-proto/index.js
var require_get_proto = __commonJS({
  "../node_modules/get-proto/index.js"(exports, module) {
    "use strict";
    var reflectGetProto = require_Reflect_getPrototypeOf();
    var originalGetProto = require_Object_getPrototypeOf();
    var getDunderProto = require_get();
    module.exports = reflectGetProto ? function getProto(O) {
      return reflectGetProto(O);
    } : originalGetProto ? function getProto(O) {
      if (!O || typeof O !== "object" && typeof O !== "function") {
        throw new TypeError("getProto: not an object");
      }
      return originalGetProto(O);
    } : getDunderProto ? function getProto(O) {
      return getDunderProto(O);
    } : null;
  }
});

// ../node_modules/hasown/index.js
var require_hasown = __commonJS({
  "../node_modules/hasown/index.js"(exports, module) {
    "use strict";
    var call = Function.prototype.call;
    var $hasOwn = Object.prototype.hasOwnProperty;
    var bind = require_function_bind();
    module.exports = bind.call(call, $hasOwn);
  }
});

// ../node_modules/get-intrinsic/index.js
var require_get_intrinsic = __commonJS({
  "../node_modules/get-intrinsic/index.js"(exports, module) {
    "use strict";
    var undefined2;
    var $Object = require_es_object_atoms();
    var $Error = require_es_errors();
    var $EvalError = require_eval();
    var $RangeError = require_range();
    var $ReferenceError = require_ref();
    var $SyntaxError = require_syntax();
    var $TypeError = require_type();
    var $URIError = require_uri();
    var abs = require_abs();
    var floor = require_floor();
    var max = require_max();
    var min = require_min();
    var pow = require_pow();
    var round = require_round();
    var sign2 = require_sign();
    var $Function = Function;
    var getEvalledConstructor = function(expressionSyntax) {
      try {
        return $Function('"use strict"; return (' + expressionSyntax + ").constructor;")();
      } catch (e) {
      }
    };
    var $gOPD = require_gopd();
    var $defineProperty = require_es_define_property();
    var throwTypeError = function() {
      throw new $TypeError();
    };
    var ThrowTypeError = $gOPD ? (function() {
      try {
        arguments.callee;
        return throwTypeError;
      } catch (calleeThrows) {
        try {
          return $gOPD(arguments, "callee").get;
        } catch (gOPDthrows) {
          return throwTypeError;
        }
      }
    })() : throwTypeError;
    var hasSymbols = require_has_symbols()();
    var getProto = require_get_proto();
    var $ObjectGPO = require_Object_getPrototypeOf();
    var $ReflectGPO = require_Reflect_getPrototypeOf();
    var $apply = require_functionApply();
    var $call = require_functionCall();
    var needsEval = {};
    var TypedArray = typeof Uint8Array === "undefined" || !getProto ? undefined2 : getProto(Uint8Array);
    var INTRINSICS = {
      __proto__: null,
      "%AggregateError%": typeof AggregateError === "undefined" ? undefined2 : AggregateError,
      "%Array%": Array,
      "%ArrayBuffer%": typeof ArrayBuffer === "undefined" ? undefined2 : ArrayBuffer,
      "%ArrayIteratorPrototype%": hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined2,
      "%AsyncFromSyncIteratorPrototype%": undefined2,
      "%AsyncFunction%": needsEval,
      "%AsyncGenerator%": needsEval,
      "%AsyncGeneratorFunction%": needsEval,
      "%AsyncIteratorPrototype%": needsEval,
      "%Atomics%": typeof Atomics === "undefined" ? undefined2 : Atomics,
      "%BigInt%": typeof BigInt === "undefined" ? undefined2 : BigInt,
      "%BigInt64Array%": typeof BigInt64Array === "undefined" ? undefined2 : BigInt64Array,
      "%BigUint64Array%": typeof BigUint64Array === "undefined" ? undefined2 : BigUint64Array,
      "%Boolean%": Boolean,
      "%DataView%": typeof DataView === "undefined" ? undefined2 : DataView,
      "%Date%": Date,
      "%decodeURI%": decodeURI,
      "%decodeURIComponent%": decodeURIComponent,
      "%encodeURI%": encodeURI,
      "%encodeURIComponent%": encodeURIComponent,
      "%Error%": $Error,
      "%eval%": eval,
      // eslint-disable-line no-eval
      "%EvalError%": $EvalError,
      "%Float16Array%": typeof Float16Array === "undefined" ? undefined2 : Float16Array,
      "%Float32Array%": typeof Float32Array === "undefined" ? undefined2 : Float32Array,
      "%Float64Array%": typeof Float64Array === "undefined" ? undefined2 : Float64Array,
      "%FinalizationRegistry%": typeof FinalizationRegistry === "undefined" ? undefined2 : FinalizationRegistry,
      "%Function%": $Function,
      "%GeneratorFunction%": needsEval,
      "%Int8Array%": typeof Int8Array === "undefined" ? undefined2 : Int8Array,
      "%Int16Array%": typeof Int16Array === "undefined" ? undefined2 : Int16Array,
      "%Int32Array%": typeof Int32Array === "undefined" ? undefined2 : Int32Array,
      "%isFinite%": isFinite,
      "%isNaN%": isNaN,
      "%IteratorPrototype%": hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined2,
      "%JSON%": typeof JSON === "object" ? JSON : undefined2,
      "%Map%": typeof Map === "undefined" ? undefined2 : Map,
      "%MapIteratorPrototype%": typeof Map === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Map())[Symbol.iterator]()),
      "%Math%": Math,
      "%Number%": Number,
      "%Object%": $Object,
      "%Object.getOwnPropertyDescriptor%": $gOPD,
      "%parseFloat%": parseFloat,
      "%parseInt%": parseInt,
      "%Promise%": typeof Promise === "undefined" ? undefined2 : Promise,
      "%Proxy%": typeof Proxy === "undefined" ? undefined2 : Proxy,
      "%RangeError%": $RangeError,
      "%ReferenceError%": $ReferenceError,
      "%Reflect%": typeof Reflect === "undefined" ? undefined2 : Reflect,
      "%RegExp%": RegExp,
      "%Set%": typeof Set === "undefined" ? undefined2 : Set,
      "%SetIteratorPrototype%": typeof Set === "undefined" || !hasSymbols || !getProto ? undefined2 : getProto((/* @__PURE__ */ new Set())[Symbol.iterator]()),
      "%SharedArrayBuffer%": typeof SharedArrayBuffer === "undefined" ? undefined2 : SharedArrayBuffer,
      "%String%": String,
      "%StringIteratorPrototype%": hasSymbols && getProto ? getProto(""[Symbol.iterator]()) : undefined2,
      "%Symbol%": hasSymbols ? Symbol : undefined2,
      "%SyntaxError%": $SyntaxError,
      "%ThrowTypeError%": ThrowTypeError,
      "%TypedArray%": TypedArray,
      "%TypeError%": $TypeError,
      "%Uint8Array%": typeof Uint8Array === "undefined" ? undefined2 : Uint8Array,
      "%Uint8ClampedArray%": typeof Uint8ClampedArray === "undefined" ? undefined2 : Uint8ClampedArray,
      "%Uint16Array%": typeof Uint16Array === "undefined" ? undefined2 : Uint16Array,
      "%Uint32Array%": typeof Uint32Array === "undefined" ? undefined2 : Uint32Array,
      "%URIError%": $URIError,
      "%WeakMap%": typeof WeakMap === "undefined" ? undefined2 : WeakMap,
      "%WeakRef%": typeof WeakRef === "undefined" ? undefined2 : WeakRef,
      "%WeakSet%": typeof WeakSet === "undefined" ? undefined2 : WeakSet,
      "%Function.prototype.call%": $call,
      "%Function.prototype.apply%": $apply,
      "%Object.defineProperty%": $defineProperty,
      "%Object.getPrototypeOf%": $ObjectGPO,
      "%Math.abs%": abs,
      "%Math.floor%": floor,
      "%Math.max%": max,
      "%Math.min%": min,
      "%Math.pow%": pow,
      "%Math.round%": round,
      "%Math.sign%": sign2,
      "%Reflect.getPrototypeOf%": $ReflectGPO
    };
    if (getProto) {
      try {
        null.error;
      } catch (e) {
        errorProto = getProto(getProto(e));
        INTRINSICS["%Error.prototype%"] = errorProto;
      }
    }
    var errorProto;
    var doEval = function doEval2(name) {
      var value;
      if (name === "%AsyncFunction%") {
        value = getEvalledConstructor("async function () {}");
      } else if (name === "%GeneratorFunction%") {
        value = getEvalledConstructor("function* () {}");
      } else if (name === "%AsyncGeneratorFunction%") {
        value = getEvalledConstructor("async function* () {}");
      } else if (name === "%AsyncGenerator%") {
        var fn = doEval2("%AsyncGeneratorFunction%");
        if (fn) {
          value = fn.prototype;
        }
      } else if (name === "%AsyncIteratorPrototype%") {
        var gen = doEval2("%AsyncGenerator%");
        if (gen && getProto) {
          value = getProto(gen.prototype);
        }
      }
      INTRINSICS[name] = value;
      return value;
    };
    var LEGACY_ALIASES = {
      __proto__: null,
      "%ArrayBufferPrototype%": ["ArrayBuffer", "prototype"],
      "%ArrayPrototype%": ["Array", "prototype"],
      "%ArrayProto_entries%": ["Array", "prototype", "entries"],
      "%ArrayProto_forEach%": ["Array", "prototype", "forEach"],
      "%ArrayProto_keys%": ["Array", "prototype", "keys"],
      "%ArrayProto_values%": ["Array", "prototype", "values"],
      "%AsyncFunctionPrototype%": ["AsyncFunction", "prototype"],
      "%AsyncGenerator%": ["AsyncGeneratorFunction", "prototype"],
      "%AsyncGeneratorPrototype%": ["AsyncGeneratorFunction", "prototype", "prototype"],
      "%BooleanPrototype%": ["Boolean", "prototype"],
      "%DataViewPrototype%": ["DataView", "prototype"],
      "%DatePrototype%": ["Date", "prototype"],
      "%ErrorPrototype%": ["Error", "prototype"],
      "%EvalErrorPrototype%": ["EvalError", "prototype"],
      "%Float32ArrayPrototype%": ["Float32Array", "prototype"],
      "%Float64ArrayPrototype%": ["Float64Array", "prototype"],
      "%FunctionPrototype%": ["Function", "prototype"],
      "%Generator%": ["GeneratorFunction", "prototype"],
      "%GeneratorPrototype%": ["GeneratorFunction", "prototype", "prototype"],
      "%Int8ArrayPrototype%": ["Int8Array", "prototype"],
      "%Int16ArrayPrototype%": ["Int16Array", "prototype"],
      "%Int32ArrayPrototype%": ["Int32Array", "prototype"],
      "%JSONParse%": ["JSON", "parse"],
      "%JSONStringify%": ["JSON", "stringify"],
      "%MapPrototype%": ["Map", "prototype"],
      "%NumberPrototype%": ["Number", "prototype"],
      "%ObjectPrototype%": ["Object", "prototype"],
      "%ObjProto_toString%": ["Object", "prototype", "toString"],
      "%ObjProto_valueOf%": ["Object", "prototype", "valueOf"],
      "%PromisePrototype%": ["Promise", "prototype"],
      "%PromiseProto_then%": ["Promise", "prototype", "then"],
      "%Promise_all%": ["Promise", "all"],
      "%Promise_reject%": ["Promise", "reject"],
      "%Promise_resolve%": ["Promise", "resolve"],
      "%RangeErrorPrototype%": ["RangeError", "prototype"],
      "%ReferenceErrorPrototype%": ["ReferenceError", "prototype"],
      "%RegExpPrototype%": ["RegExp", "prototype"],
      "%SetPrototype%": ["Set", "prototype"],
      "%SharedArrayBufferPrototype%": ["SharedArrayBuffer", "prototype"],
      "%StringPrototype%": ["String", "prototype"],
      "%SymbolPrototype%": ["Symbol", "prototype"],
      "%SyntaxErrorPrototype%": ["SyntaxError", "prototype"],
      "%TypedArrayPrototype%": ["TypedArray", "prototype"],
      "%TypeErrorPrototype%": ["TypeError", "prototype"],
      "%Uint8ArrayPrototype%": ["Uint8Array", "prototype"],
      "%Uint8ClampedArrayPrototype%": ["Uint8ClampedArray", "prototype"],
      "%Uint16ArrayPrototype%": ["Uint16Array", "prototype"],
      "%Uint32ArrayPrototype%": ["Uint32Array", "prototype"],
      "%URIErrorPrototype%": ["URIError", "prototype"],
      "%WeakMapPrototype%": ["WeakMap", "prototype"],
      "%WeakSetPrototype%": ["WeakSet", "prototype"]
    };
    var bind = require_function_bind();
    var hasOwn = require_hasown();
    var $concat = bind.call($call, Array.prototype.concat);
    var $spliceApply = bind.call($apply, Array.prototype.splice);
    var $replace = bind.call($call, String.prototype.replace);
    var $strSlice = bind.call($call, String.prototype.slice);
    var $exec = bind.call($call, RegExp.prototype.exec);
    var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = function stringToPath2(string) {
      var first = $strSlice(string, 0, 1);
      var last = $strSlice(string, -1);
      if (first === "%" && last !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected closing `%`");
      } else if (last === "%" && first !== "%") {
        throw new $SyntaxError("invalid intrinsic syntax, expected opening `%`");
      }
      var result = [];
      $replace(string, rePropName, function(match, number, quote, subString) {
        result[result.length] = quote ? $replace(subString, reEscapeChar, "$1") : number || match;
      });
      return result;
    };
    var getBaseIntrinsic = function getBaseIntrinsic2(name, allowMissing) {
      var intrinsicName = name;
      var alias;
      if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
        alias = LEGACY_ALIASES[intrinsicName];
        intrinsicName = "%" + alias[0] + "%";
      }
      if (hasOwn(INTRINSICS, intrinsicName)) {
        var value = INTRINSICS[intrinsicName];
        if (value === needsEval) {
          value = doEval(intrinsicName);
        }
        if (typeof value === "undefined" && !allowMissing) {
          throw new $TypeError("intrinsic " + name + " exists, but is not available. Please file an issue!");
        }
        return {
          alias,
          name: intrinsicName,
          value
        };
      }
      throw new $SyntaxError("intrinsic " + name + " does not exist!");
    };
    module.exports = function GetIntrinsic(name, allowMissing) {
      if (typeof name !== "string" || name.length === 0) {
        throw new $TypeError("intrinsic name must be a non-empty string");
      }
      if (arguments.length > 1 && typeof allowMissing !== "boolean") {
        throw new $TypeError('"allowMissing" argument must be a boolean');
      }
      if ($exec(/^%?[^%]*%?$/, name) === null) {
        throw new $SyntaxError("`%` may not be present anywhere but at the beginning and end of the intrinsic name");
      }
      var parts = stringToPath(name);
      var intrinsicBaseName = parts.length > 0 ? parts[0] : "";
      var intrinsic = getBaseIntrinsic("%" + intrinsicBaseName + "%", allowMissing);
      var intrinsicRealName = intrinsic.name;
      var value = intrinsic.value;
      var skipFurtherCaching = false;
      var alias = intrinsic.alias;
      if (alias) {
        intrinsicBaseName = alias[0];
        $spliceApply(parts, $concat([0, 1], alias));
      }
      for (var i = 1, isOwn = true; i < parts.length; i += 1) {
        var part = parts[i];
        var first = $strSlice(part, 0, 1);
        var last = $strSlice(part, -1);
        if ((first === '"' || first === "'" || first === "`" || (last === '"' || last === "'" || last === "`")) && first !== last) {
          throw new $SyntaxError("property names with quotes must have matching quotes");
        }
        if (part === "constructor" || !isOwn) {
          skipFurtherCaching = true;
        }
        intrinsicBaseName += "." + part;
        intrinsicRealName = "%" + intrinsicBaseName + "%";
        if (hasOwn(INTRINSICS, intrinsicRealName)) {
          value = INTRINSICS[intrinsicRealName];
        } else if (value != null) {
          if (!(part in value)) {
            if (!allowMissing) {
              throw new $TypeError("base intrinsic for " + name + " exists, but the property is not available.");
            }
            return void undefined2;
          }
          if ($gOPD && i + 1 >= parts.length) {
            var desc = $gOPD(value, part);
            isOwn = !!desc;
            if (isOwn && "get" in desc && !("originalValue" in desc.get)) {
              value = desc.get;
            } else {
              value = value[part];
            }
          } else {
            isOwn = hasOwn(value, part);
            value = value[part];
          }
          if (isOwn && !skipFurtherCaching) {
            INTRINSICS[intrinsicRealName] = value;
          }
        }
      }
      return value;
    };
  }
});

// ../node_modules/call-bound/index.js
var require_call_bound = __commonJS({
  "../node_modules/call-bound/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBindBasic = require_call_bind_apply_helpers();
    var $indexOf = callBindBasic([GetIntrinsic("%String.prototype.indexOf%")]);
    module.exports = function callBoundIntrinsic(name, allowMissing) {
      var intrinsic = (
        /** @type {(this: unknown, ...args: unknown[]) => unknown} */
        GetIntrinsic(name, !!allowMissing)
      );
      if (typeof intrinsic === "function" && $indexOf(name, ".prototype.") > -1) {
        return callBindBasic(
          /** @type {const} */
          [intrinsic]
        );
      }
      return intrinsic;
    };
  }
});

// ../node_modules/side-channel-map/index.js
var require_side_channel_map = __commonJS({
  "../node_modules/side-channel-map/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBound = require_call_bound();
    var inspect = require_object_inspect();
    var $TypeError = require_type();
    var $Map = GetIntrinsic("%Map%", true);
    var $mapGet = callBound("Map.prototype.get", true);
    var $mapSet = callBound("Map.prototype.set", true);
    var $mapHas = callBound("Map.prototype.has", true);
    var $mapDelete = callBound("Map.prototype.delete", true);
    var $mapSize = callBound("Map.prototype.size", true);
    module.exports = !!$Map && /** @type {Exclude<import('.'), false>} */
    function getSideChannelMap() {
      var $m;
      var channel = {
        assert: function(key) {
          if (!channel.has(key)) {
            throw new $TypeError("Side channel does not contain " + inspect(key));
          }
        },
        "delete": function(key) {
          if ($m) {
            var result = $mapDelete($m, key);
            if ($mapSize($m) === 0) {
              $m = void 0;
            }
            return result;
          }
          return false;
        },
        get: function(key) {
          if ($m) {
            return $mapGet($m, key);
          }
        },
        has: function(key) {
          if ($m) {
            return $mapHas($m, key);
          }
          return false;
        },
        set: function(key, value) {
          if (!$m) {
            $m = new $Map();
          }
          $mapSet($m, key, value);
        }
      };
      return channel;
    };
  }
});

// ../node_modules/side-channel-weakmap/index.js
var require_side_channel_weakmap = __commonJS({
  "../node_modules/side-channel-weakmap/index.js"(exports, module) {
    "use strict";
    var GetIntrinsic = require_get_intrinsic();
    var callBound = require_call_bound();
    var inspect = require_object_inspect();
    var getSideChannelMap = require_side_channel_map();
    var $TypeError = require_type();
    var $WeakMap = GetIntrinsic("%WeakMap%", true);
    var $weakMapGet = callBound("WeakMap.prototype.get", true);
    var $weakMapSet = callBound("WeakMap.prototype.set", true);
    var $weakMapHas = callBound("WeakMap.prototype.has", true);
    var $weakMapDelete = callBound("WeakMap.prototype.delete", true);
    module.exports = $WeakMap ? (
      /** @type {Exclude<import('.'), false>} */
      function getSideChannelWeakMap() {
        var $wm;
        var $m;
        var channel = {
          assert: function(key) {
            if (!channel.has(key)) {
              throw new $TypeError("Side channel does not contain " + inspect(key));
            }
          },
          "delete": function(key) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if ($wm) {
                return $weakMapDelete($wm, key);
              }
            } else if (getSideChannelMap) {
              if ($m) {
                return $m["delete"](key);
              }
            }
            return false;
          },
          get: function(key) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if ($wm) {
                return $weakMapGet($wm, key);
              }
            }
            return $m && $m.get(key);
          },
          has: function(key) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if ($wm) {
                return $weakMapHas($wm, key);
              }
            }
            return !!$m && $m.has(key);
          },
          set: function(key, value) {
            if ($WeakMap && key && (typeof key === "object" || typeof key === "function")) {
              if (!$wm) {
                $wm = new $WeakMap();
              }
              $weakMapSet($wm, key, value);
            } else if (getSideChannelMap) {
              if (!$m) {
                $m = getSideChannelMap();
              }
              $m.set(key, value);
            }
          }
        };
        return channel;
      }
    ) : getSideChannelMap;
  }
});

// ../node_modules/side-channel/index.js
var require_side_channel = __commonJS({
  "../node_modules/side-channel/index.js"(exports, module) {
    "use strict";
    var $TypeError = require_type();
    var inspect = require_object_inspect();
    var getSideChannelList = require_side_channel_list();
    var getSideChannelMap = require_side_channel_map();
    var getSideChannelWeakMap = require_side_channel_weakmap();
    var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;
    module.exports = function getSideChannel() {
      var $channelData;
      var channel = {
        assert: function(key) {
          if (!channel.has(key)) {
            throw new $TypeError("Side channel does not contain " + inspect(key));
          }
        },
        "delete": function(key) {
          return !!$channelData && $channelData["delete"](key);
        },
        get: function(key) {
          return $channelData && $channelData.get(key);
        },
        has: function(key) {
          return !!$channelData && $channelData.has(key);
        },
        set: function(key, value) {
          if (!$channelData) {
            $channelData = makeChannel();
          }
          $channelData.set(key, value);
        }
      };
      return channel;
    };
  }
});

// ../node_modules/qs/lib/formats.js
var require_formats = __commonJS({
  "../node_modules/qs/lib/formats.js"(exports, module) {
    "use strict";
    var replace = String.prototype.replace;
    var percentTwenties = /%20/g;
    var Format = {
      RFC1738: "RFC1738",
      RFC3986: "RFC3986"
    };
    module.exports = {
      "default": Format.RFC3986,
      formatters: {
        RFC1738: function(value) {
          return replace.call(value, percentTwenties, "+");
        },
        RFC3986: function(value) {
          return String(value);
        }
      },
      RFC1738: Format.RFC1738,
      RFC3986: Format.RFC3986
    };
  }
});

// ../node_modules/qs/lib/utils.js
var require_utils = __commonJS({
  "../node_modules/qs/lib/utils.js"(exports, module) {
    "use strict";
    var formats = require_formats();
    var getSideChannel = require_side_channel();
    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;
    var overflowChannel = getSideChannel();
    var markOverflow = function markOverflow2(obj, maxIndex) {
      overflowChannel.set(obj, maxIndex);
      return obj;
    };
    var isOverflow = function isOverflow2(obj) {
      return overflowChannel.has(obj);
    };
    var getMaxIndex = function getMaxIndex2(obj) {
      return overflowChannel.get(obj);
    };
    var setMaxIndex = function setMaxIndex2(obj, maxIndex) {
      overflowChannel.set(obj, maxIndex);
    };
    var hexTable = (function() {
      var array = [];
      for (var i = 0; i < 256; ++i) {
        array[array.length] = "%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase();
      }
      return array;
    })();
    var compactQueue = function compactQueue2(queue) {
      while (queue.length > 1) {
        var item = queue.pop();
        var obj = item.obj[item.prop];
        if (isArray(obj)) {
          var compacted = [];
          for (var j = 0; j < obj.length; ++j) {
            if (typeof obj[j] !== "undefined") {
              compacted[compacted.length] = obj[j];
            }
          }
          item.obj[item.prop] = compacted;
        }
      }
    };
    var arrayToObject = function arrayToObject2(source, options) {
      var obj = options && options.plainObjects ? { __proto__: null } : {};
      for (var i = 0; i < source.length; ++i) {
        if (typeof source[i] !== "undefined") {
          obj[i] = source[i];
        }
      }
      return obj;
    };
    var merge = function merge2(target, source, options) {
      if (!source) {
        return target;
      }
      if (typeof source !== "object" && typeof source !== "function") {
        if (isArray(target)) {
          var nextIndex = target.length;
          if (options && typeof options.arrayLimit === "number" && nextIndex > options.arrayLimit) {
            return markOverflow(arrayToObject(target.concat(source), options), nextIndex);
          }
          target[nextIndex] = source;
        } else if (target && typeof target === "object") {
          if (isOverflow(target)) {
            var newIndex = getMaxIndex(target) + 1;
            target[newIndex] = source;
            setMaxIndex(target, newIndex);
          } else if (options && options.strictMerge) {
            return [target, source];
          } else if (options && (options.plainObjects || options.allowPrototypes) || !has.call(Object.prototype, source)) {
            target[source] = true;
          }
        } else {
          return [target, source];
        }
        return target;
      }
      if (!target || typeof target !== "object") {
        if (isOverflow(source)) {
          var sourceKeys = Object.keys(source);
          var result = options && options.plainObjects ? { __proto__: null, 0: target } : { 0: target };
          for (var m = 0; m < sourceKeys.length; m++) {
            var oldKey = parseInt(sourceKeys[m], 10);
            result[oldKey + 1] = source[sourceKeys[m]];
          }
          return markOverflow(result, getMaxIndex(source) + 1);
        }
        var combined = [target].concat(source);
        if (options && typeof options.arrayLimit === "number" && combined.length > options.arrayLimit) {
          return markOverflow(arrayToObject(combined, options), combined.length - 1);
        }
        return combined;
      }
      var mergeTarget = target;
      if (isArray(target) && !isArray(source)) {
        mergeTarget = arrayToObject(target, options);
      }
      if (isArray(target) && isArray(source)) {
        source.forEach(function(item, i) {
          if (has.call(target, i)) {
            var targetItem = target[i];
            if (targetItem && typeof targetItem === "object" && item && typeof item === "object") {
              target[i] = merge2(targetItem, item, options);
            } else {
              target[target.length] = item;
            }
          } else {
            target[i] = item;
          }
        });
        return target;
      }
      return Object.keys(source).reduce(function(acc, key) {
        var value = source[key];
        if (has.call(acc, key)) {
          acc[key] = merge2(acc[key], value, options);
        } else {
          acc[key] = value;
        }
        if (isOverflow(source) && !isOverflow(acc)) {
          markOverflow(acc, getMaxIndex(source));
        }
        if (isOverflow(acc)) {
          var keyNum = parseInt(key, 10);
          if (String(keyNum) === key && keyNum >= 0 && keyNum > getMaxIndex(acc)) {
            setMaxIndex(acc, keyNum);
          }
        }
        return acc;
      }, mergeTarget);
    };
    var assign = function assignSingleSource(target, source) {
      return Object.keys(source).reduce(function(acc, key) {
        acc[key] = source[key];
        return acc;
      }, target);
    };
    var decode2 = function(str, defaultDecoder, charset) {
      var strWithoutPlus = str.replace(/\+/g, " ");
      if (charset === "iso-8859-1") {
        return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
      }
      try {
        return decodeURIComponent(strWithoutPlus);
      } catch (e) {
        return strWithoutPlus;
      }
    };
    var limit = 1024;
    var encode3 = function encode4(str, defaultEncoder, charset, kind, format) {
      if (str.length === 0) {
        return str;
      }
      var string = str;
      if (typeof str === "symbol") {
        string = Symbol.prototype.toString.call(str);
      } else if (typeof str !== "string") {
        string = String(str);
      }
      if (charset === "iso-8859-1") {
        return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
          return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
        });
      }
      var out = "";
      for (var j = 0; j < string.length; j += limit) {
        var segment = string.length >= limit ? string.slice(j, j + limit) : string;
        var arr = [];
        for (var i = 0; i < segment.length; ++i) {
          var c = segment.charCodeAt(i);
          if (c === 45 || c === 46 || c === 95 || c === 126 || c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || format === formats.RFC1738 && (c === 40 || c === 41)) {
            arr[arr.length] = segment.charAt(i);
            continue;
          }
          if (c < 128) {
            arr[arr.length] = hexTable[c];
            continue;
          }
          if (c < 2048) {
            arr[arr.length] = hexTable[192 | c >> 6] + hexTable[128 | c & 63];
            continue;
          }
          if (c < 55296 || c >= 57344) {
            arr[arr.length] = hexTable[224 | c >> 12] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
            continue;
          }
          i += 1;
          c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
          arr[arr.length] = hexTable[240 | c >> 18] + hexTable[128 | c >> 12 & 63] + hexTable[128 | c >> 6 & 63] + hexTable[128 | c & 63];
        }
        out += arr.join("");
      }
      return out;
    };
    var compact = function compact2(value) {
      var queue = [{ obj: { o: value }, prop: "o" }];
      var refs = [];
      for (var i = 0; i < queue.length; ++i) {
        var item = queue[i];
        var obj = item.obj[item.prop];
        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; ++j) {
          var key = keys[j];
          var val = obj[key];
          if (typeof val === "object" && val !== null && refs.indexOf(val) === -1) {
            queue[queue.length] = { obj, prop: key };
            refs[refs.length] = val;
          }
        }
      }
      compactQueue(queue);
      return value;
    };
    var isRegExp = function isRegExp2(obj) {
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    };
    var isBuffer = function isBuffer2(obj) {
      if (!obj || typeof obj !== "object") {
        return false;
      }
      return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    };
    var combine = function combine2(a, b, arrayLimit, plainObjects) {
      if (isOverflow(a)) {
        var newIndex = getMaxIndex(a) + 1;
        a[newIndex] = b;
        setMaxIndex(a, newIndex);
        return a;
      }
      var result = [].concat(a, b);
      if (result.length > arrayLimit) {
        return markOverflow(arrayToObject(result, { plainObjects }), result.length - 1);
      }
      return result;
    };
    var maybeMap = function maybeMap2(val, fn) {
      if (isArray(val)) {
        var mapped = [];
        for (var i = 0; i < val.length; i += 1) {
          mapped[mapped.length] = fn(val[i]);
        }
        return mapped;
      }
      return fn(val);
    };
    module.exports = {
      arrayToObject,
      assign,
      combine,
      compact,
      decode: decode2,
      encode: encode3,
      isBuffer,
      isOverflow,
      isRegExp,
      markOverflow,
      maybeMap,
      merge
    };
  }
});

// ../node_modules/qs/lib/stringify.js
var require_stringify = __commonJS({
  "../node_modules/qs/lib/stringify.js"(exports, module) {
    "use strict";
    var getSideChannel = require_side_channel();
    var utils = require_utils();
    var formats = require_formats();
    var has = Object.prototype.hasOwnProperty;
    var arrayPrefixGenerators = {
      brackets: function brackets(prefix) {
        return prefix + "[]";
      },
      comma: "comma",
      indices: function indices(prefix, key) {
        return prefix + "[" + key + "]";
      },
      repeat: function repeat(prefix) {
        return prefix;
      }
    };
    var isArray = Array.isArray;
    var push = Array.prototype.push;
    var pushToArray = function(arr, valueOrArray) {
      push.apply(arr, isArray(valueOrArray) ? valueOrArray : [valueOrArray]);
    };
    var toISO = Date.prototype.toISOString;
    var defaultFormat = formats["default"];
    var defaults = {
      addQueryPrefix: false,
      allowDots: false,
      allowEmptyArrays: false,
      arrayFormat: "indices",
      charset: "utf-8",
      charsetSentinel: false,
      commaRoundTrip: false,
      delimiter: "&",
      encode: true,
      encodeDotInKeys: false,
      encoder: utils.encode,
      encodeValuesOnly: false,
      filter: void 0,
      format: defaultFormat,
      formatter: formats.formatters[defaultFormat],
      // deprecated
      indices: false,
      serializeDate: function serializeDate(date) {
        return toISO.call(date);
      },
      skipNulls: false,
      strictNullHandling: false
    };
    var isNonNullishPrimitive = function isNonNullishPrimitive2(v) {
      return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
    };
    var sentinel = {};
    var stringify2 = function stringify3(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder2, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
      var obj = object;
      var tmpSc = sideChannel;
      var step = 0;
      var findFlag = false;
      while ((tmpSc = tmpSc.get(sentinel)) !== void 0 && !findFlag) {
        var pos = tmpSc.get(object);
        step += 1;
        if (typeof pos !== "undefined") {
          if (pos === step) {
            throw new RangeError("Cyclic object value");
          } else {
            findFlag = true;
          }
        }
        if (typeof tmpSc.get(sentinel) === "undefined") {
          step = 0;
        }
      }
      if (typeof filter === "function") {
        obj = filter(prefix, obj);
      } else if (obj instanceof Date) {
        obj = serializeDate(obj);
      } else if (generateArrayPrefix === "comma" && isArray(obj)) {
        obj = utils.maybeMap(obj, function(value2) {
          if (value2 instanceof Date) {
            return serializeDate(value2);
          }
          return value2;
        });
      }
      if (obj === null) {
        if (strictNullHandling) {
          return formatter(encoder2 && !encodeValuesOnly ? encoder2(prefix, defaults.encoder, charset, "key", format) : prefix);
        }
        obj = "";
      }
      if (isNonNullishPrimitive(obj) || utils.isBuffer(obj)) {
        if (encoder2) {
          var keyValue = encodeValuesOnly ? prefix : encoder2(prefix, defaults.encoder, charset, "key", format);
          return [formatter(keyValue) + "=" + formatter(encoder2(obj, defaults.encoder, charset, "value", format))];
        }
        return [formatter(prefix) + "=" + formatter(String(obj))];
      }
      var values = [];
      if (typeof obj === "undefined") {
        return values;
      }
      var objKeys;
      if (generateArrayPrefix === "comma" && isArray(obj)) {
        if (encodeValuesOnly && encoder2) {
          obj = utils.maybeMap(obj, function(v) {
            return v == null ? v : encoder2(v);
          });
        }
        objKeys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
      } else if (isArray(filter)) {
        objKeys = filter;
      } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
      }
      var encodedPrefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
      var adjustedPrefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encodedPrefix + "[]" : encodedPrefix;
      if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
        return adjustedPrefix + "[]";
      }
      for (var j = 0; j < objKeys.length; ++j) {
        var key = objKeys[j];
        var value = typeof key === "object" && key && typeof key.value !== "undefined" ? key.value : obj[key];
        if (skipNulls && value === null) {
          continue;
        }
        var encodedKey = allowDots && encodeDotInKeys ? String(key).replace(/\./g, "%2E") : String(key);
        var keyPrefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjustedPrefix, encodedKey) : adjustedPrefix : adjustedPrefix + (allowDots ? "." + encodedKey : "[" + encodedKey + "]");
        sideChannel.set(object, step);
        var valueSideChannel = getSideChannel();
        valueSideChannel.set(sentinel, sideChannel);
        pushToArray(values, stringify3(
          value,
          keyPrefix,
          generateArrayPrefix,
          commaRoundTrip,
          allowEmptyArrays,
          strictNullHandling,
          skipNulls,
          encodeDotInKeys,
          generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder2,
          filter,
          sort,
          allowDots,
          serializeDate,
          format,
          formatter,
          encodeValuesOnly,
          charset,
          valueSideChannel
        ));
      }
      return values;
    };
    var normalizeStringifyOptions = function normalizeStringifyOptions2(opts) {
      if (!opts) {
        return defaults;
      }
      if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
        throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
      }
      if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
        throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
      }
      if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
        throw new TypeError("Encoder has to be a function.");
      }
      var charset = opts.charset || defaults.charset;
      if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
        throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
      }
      var format = formats["default"];
      if (typeof opts.format !== "undefined") {
        if (!has.call(formats.formatters, opts.format)) {
          throw new TypeError("Unknown format option provided.");
        }
        format = opts.format;
      }
      var formatter = formats.formatters[format];
      var filter = defaults.filter;
      if (typeof opts.filter === "function" || isArray(opts.filter)) {
        filter = opts.filter;
      }
      var arrayFormat;
      if (opts.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = opts.arrayFormat;
      } else if ("indices" in opts) {
        arrayFormat = opts.indices ? "indices" : "repeat";
      } else {
        arrayFormat = defaults.arrayFormat;
      }
      if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
        throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
      }
      var allowDots = typeof opts.allowDots === "undefined" ? opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
      return {
        addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
        allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        arrayFormat,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
        commaRoundTrip: !!opts.commaRoundTrip,
        delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
        encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
        encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
        encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
        encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
        filter,
        format,
        formatter,
        serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
        skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
        sort: typeof opts.sort === "function" ? opts.sort : null,
        strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
      };
    };
    module.exports = function(object, opts) {
      var obj = object;
      var options = normalizeStringifyOptions(opts);
      var objKeys;
      var filter;
      if (typeof options.filter === "function") {
        filter = options.filter;
        obj = filter("", obj);
      } else if (isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
      }
      var keys = [];
      if (typeof obj !== "object" || obj === null) {
        return "";
      }
      var generateArrayPrefix = arrayPrefixGenerators[options.arrayFormat];
      var commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
      if (!objKeys) {
        objKeys = Object.keys(obj);
      }
      if (options.sort) {
        objKeys.sort(options.sort);
      }
      var sideChannel = getSideChannel();
      for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];
        if (typeof key === "undefined" || key === null) {
          continue;
        }
        var value = obj[key];
        if (options.skipNulls && value === null) {
          continue;
        }
        pushToArray(keys, stringify2(
          value,
          key,
          generateArrayPrefix,
          commaRoundTrip,
          options.allowEmptyArrays,
          options.strictNullHandling,
          options.skipNulls,
          options.encodeDotInKeys,
          options.encode ? options.encoder : null,
          options.filter,
          options.sort,
          options.allowDots,
          options.serializeDate,
          options.format,
          options.formatter,
          options.encodeValuesOnly,
          options.charset,
          sideChannel
        ));
      }
      var joined = keys.join(options.delimiter);
      var prefix = options.addQueryPrefix === true ? "?" : "";
      if (options.charsetSentinel) {
        if (options.charset === "iso-8859-1") {
          prefix += "utf8=%26%2310003%3B" + options.delimiter;
        } else {
          prefix += "utf8=%E2%9C%93" + options.delimiter;
        }
      }
      return joined.length > 0 ? prefix + joined : "";
    };
  }
});

// ../node_modules/qs/lib/parse.js
var require_parse = __commonJS({
  "../node_modules/qs/lib/parse.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var has = Object.prototype.hasOwnProperty;
    var isArray = Array.isArray;
    var defaults = {
      allowDots: false,
      allowEmptyArrays: false,
      allowPrototypes: false,
      allowSparse: false,
      arrayLimit: 20,
      charset: "utf-8",
      charsetSentinel: false,
      comma: false,
      decodeDotInKeys: false,
      decoder: utils.decode,
      delimiter: "&",
      depth: 5,
      duplicates: "combine",
      ignoreQueryPrefix: false,
      interpretNumericEntities: false,
      parameterLimit: 1e3,
      parseArrays: true,
      plainObjects: false,
      strictDepth: false,
      strictMerge: true,
      strictNullHandling: false,
      throwOnLimitExceeded: false
    };
    var interpretNumericEntities = function(str) {
      return str.replace(/&#(\d+);/g, function($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
      });
    };
    var parseArrayValue = function(val, options, currentArrayLength) {
      if (val && typeof val === "string" && options.comma && val.indexOf(",") > -1) {
        return val.split(",");
      }
      if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
      }
      return val;
    };
    var isoSentinel = "utf8=%26%2310003%3B";
    var charsetSentinel = "utf8=%E2%9C%93";
    var parseValues = function parseQueryStringValues(str, options) {
      var obj = { __proto__: null };
      var cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, "") : str;
      cleanStr = cleanStr.replace(/%5B/gi, "[").replace(/%5D/gi, "]");
      var limit = options.parameterLimit === Infinity ? void 0 : options.parameterLimit;
      var parts = cleanStr.split(
        options.delimiter,
        options.throwOnLimitExceeded && typeof limit !== "undefined" ? limit + 1 : limit
      );
      if (options.throwOnLimitExceeded && typeof limit !== "undefined" && parts.length > limit) {
        throw new RangeError("Parameter limit exceeded. Only " + limit + " parameter" + (limit === 1 ? "" : "s") + " allowed.");
      }
      var skipIndex = -1;
      var i;
      var charset = options.charset;
      if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
          if (parts[i].indexOf("utf8=") === 0) {
            if (parts[i] === charsetSentinel) {
              charset = "utf-8";
            } else if (parts[i] === isoSentinel) {
              charset = "iso-8859-1";
            }
            skipIndex = i;
            i = parts.length;
          }
        }
      }
      for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
          continue;
        }
        var part = parts[i];
        var bracketEqualsPos = part.indexOf("]=");
        var pos = bracketEqualsPos === -1 ? part.indexOf("=") : bracketEqualsPos + 1;
        var key;
        var val;
        if (pos === -1) {
          key = options.decoder(part, defaults.decoder, charset, "key");
          val = options.strictNullHandling ? null : "";
        } else {
          key = options.decoder(part.slice(0, pos), defaults.decoder, charset, "key");
          if (key !== null) {
            val = utils.maybeMap(
              parseArrayValue(
                part.slice(pos + 1),
                options,
                isArray(obj[key]) ? obj[key].length : 0
              ),
              function(encodedVal) {
                return options.decoder(encodedVal, defaults.decoder, charset, "value");
              }
            );
          }
        }
        if (val && options.interpretNumericEntities && charset === "iso-8859-1") {
          val = interpretNumericEntities(String(val));
        }
        if (part.indexOf("[]=") > -1) {
          val = isArray(val) ? [val] : val;
        }
        if (options.comma && isArray(val) && val.length > options.arrayLimit) {
          if (options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          }
          val = utils.combine([], val, options.arrayLimit, options.plainObjects);
        }
        if (key !== null) {
          var existing = has.call(obj, key);
          if (existing && (options.duplicates === "combine" || part.indexOf("[]=") > -1)) {
            obj[key] = utils.combine(
              obj[key],
              val,
              options.arrayLimit,
              options.plainObjects
            );
          } else if (!existing || options.duplicates === "last") {
            obj[key] = val;
          }
        }
      }
      return obj;
    };
    var parseObject = function(chain, val, options, valuesParsed) {
      var currentArrayLength = 0;
      if (chain.length > 0 && chain[chain.length - 1] === "[]") {
        var parentKey = chain.slice(0, -1).join("");
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
      }
      var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);
      for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];
        if (root === "[]" && options.parseArrays) {
          if (utils.isOverflow(leaf)) {
            obj = leaf;
          } else {
            obj = options.allowEmptyArrays && (leaf === "" || options.strictNullHandling && leaf === null) ? [] : utils.combine(
              [],
              leaf,
              options.arrayLimit,
              options.plainObjects
            );
          }
        } else {
          obj = options.plainObjects ? { __proto__: null } : {};
          var cleanRoot = root.charAt(0) === "[" && root.charAt(root.length - 1) === "]" ? root.slice(1, -1) : root;
          var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, ".") : cleanRoot;
          var index = parseInt(decodedRoot, 10);
          var isValidArrayIndex = !isNaN(index) && root !== decodedRoot && String(index) === decodedRoot && index >= 0 && options.parseArrays;
          if (!options.parseArrays && decodedRoot === "") {
            obj = { 0: leaf };
          } else if (isValidArrayIndex && index < options.arrayLimit) {
            obj = [];
            obj[index] = leaf;
          } else if (isValidArrayIndex && options.throwOnLimitExceeded) {
            throw new RangeError("Array limit exceeded. Only " + options.arrayLimit + " element" + (options.arrayLimit === 1 ? "" : "s") + " allowed in an array.");
          } else if (isValidArrayIndex) {
            obj[index] = leaf;
            utils.markOverflow(obj, index);
          } else if (decodedRoot !== "__proto__") {
            obj[decodedRoot] = leaf;
          }
        }
        leaf = obj;
      }
      return leaf;
    };
    var splitKeyIntoSegments = function splitKeyIntoSegments2(originalKey, options) {
      var key = options.allowDots ? originalKey.replace(/\.([^.[]+)/g, "[$1]") : originalKey;
      if (options.depth <= 0) {
        if (!options.plainObjects && has.call(Object.prototype, key)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        return [key];
      }
      var segments = [];
      var first = key.indexOf("[");
      var parent = first >= 0 ? key.slice(0, first) : key;
      if (parent) {
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
          if (!options.allowPrototypes) {
            return;
          }
        }
        segments[segments.length] = parent;
      }
      var n = key.length;
      var open = first;
      var collected = 0;
      while (open >= 0 && collected < options.depth) {
        var level = 1;
        var i = open + 1;
        var close = -1;
        while (i < n && close < 0) {
          var cu = key.charCodeAt(i);
          if (cu === 91) {
            level += 1;
          } else if (cu === 93) {
            level -= 1;
            if (level === 0) {
              close = i;
            }
          }
          i += 1;
        }
        if (close < 0) {
          segments[segments.length] = "[" + key.slice(open) + "]";
          return segments;
        }
        var seg = key.slice(open, close + 1);
        var content = seg.slice(1, -1);
        if (!options.plainObjects && has.call(Object.prototype, content) && !options.allowPrototypes) {
          return;
        }
        segments[segments.length] = seg;
        collected += 1;
        open = key.indexOf("[", close + 1);
      }
      if (open >= 0) {
        if (options.strictDepth === true) {
          throw new RangeError("Input depth exceeded depth option of " + options.depth + " and strictDepth is true");
        }
        segments[segments.length] = "[" + key.slice(open) + "]";
      }
      return segments;
    };
    var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
      if (!givenKey) {
        return;
      }
      var keys = splitKeyIntoSegments(givenKey, options);
      if (!keys) {
        return;
      }
      return parseObject(keys, val, options, valuesParsed);
    };
    var normalizeParseOptions = function normalizeParseOptions2(opts) {
      if (!opts) {
        return defaults;
      }
      if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
        throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
      }
      if (typeof opts.decodeDotInKeys !== "undefined" && typeof opts.decodeDotInKeys !== "boolean") {
        throw new TypeError("`decodeDotInKeys` option can only be `true` or `false`, when provided");
      }
      if (opts.decoder !== null && typeof opts.decoder !== "undefined" && typeof opts.decoder !== "function") {
        throw new TypeError("Decoder has to be a function.");
      }
      if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
        throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
      }
      if (typeof opts.throwOnLimitExceeded !== "undefined" && typeof opts.throwOnLimitExceeded !== "boolean") {
        throw new TypeError("`throwOnLimitExceeded` option must be a boolean");
      }
      var charset = typeof opts.charset === "undefined" ? defaults.charset : opts.charset;
      var duplicates = typeof opts.duplicates === "undefined" ? defaults.duplicates : opts.duplicates;
      if (duplicates !== "combine" && duplicates !== "first" && duplicates !== "last") {
        throw new TypeError("The duplicates option must be either combine, first, or last");
      }
      var allowDots = typeof opts.allowDots === "undefined" ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
      return {
        allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === "boolean" ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === "boolean" ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === "number" ? opts.arrayLimit : defaults.arrayLimit,
        charset,
        charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === "boolean" ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === "boolean" ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === "function" ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === "string" || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: typeof opts.depth === "number" || opts.depth === false ? +opts.depth : defaults.depth,
        duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === "boolean" ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === "number" ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === "boolean" ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === "boolean" ? !!opts.strictDepth : defaults.strictDepth,
        strictMerge: typeof opts.strictMerge === "boolean" ? !!opts.strictMerge : defaults.strictMerge,
        strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === "boolean" ? opts.throwOnLimitExceeded : false
      };
    };
    module.exports = function(str, opts) {
      var options = normalizeParseOptions(opts);
      if (str === "" || str === null || typeof str === "undefined") {
        return options.plainObjects ? { __proto__: null } : {};
      }
      var tempObj = typeof str === "string" ? parseValues(str, options) : str;
      var obj = options.plainObjects ? { __proto__: null } : {};
      var keys = Object.keys(tempObj);
      for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options, typeof str === "string");
        obj = utils.merge(obj, newObj, options);
      }
      if (options.allowSparse === true) {
        return obj;
      }
      return utils.compact(obj);
    };
  }
});

// ../node_modules/qs/lib/index.js
var require_lib2 = __commonJS({
  "../node_modules/qs/lib/index.js"(exports, module) {
    "use strict";
    var stringify2 = require_stringify();
    var parse = require_parse();
    var formats = require_formats();
    module.exports = {
      formats,
      parse,
      stringify: stringify2
    };
  }
});

// ../v2-core/dynamodb/keys.ts
function userPk(userId) {
  return `${ENTITY.USER}#${userId}`;
}
function cardSk(cardId) {
  return `${ENTITY.CARD}#${cardId}`;
}
function deckSk(deckId) {
  return `${ENTITY.DECK}#${deckId}`;
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
function quizResultSk(resultId) {
  return `${ENTITY.QUIZ_RESULT}#${resultId}`;
}
function dailyStudySk(date) {
  return `${ENTITY.DAILY_STUDY}#${date}`;
}
function pronunciationAttemptSk(attemptId) {
  return `${ENTITY.PRONUNCIATION}#${attemptId}`;
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

// ../node_modules/stripe/esm/platform/NodePlatformFunctions.js
import * as crypto3 from "crypto";
import { EventEmitter } from "events";

// ../node_modules/stripe/esm/crypto/NodeCryptoProvider.js
import * as crypto2 from "crypto";

// ../node_modules/stripe/esm/crypto/CryptoProvider.js
var CryptoProvider = class {
  /**
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignature(payload, secret) {
    throw new Error("computeHMACSignature not implemented.");
  }
  /**
   * Asynchronous version of `computeHMACSignature`. Some implementations may
   * only allow support async signature computation.
   *
   * Computes a SHA-256 HMAC given a secret and a payload (encoded in UTF-8).
   * The output HMAC should be encoded in hexadecimal.
   *
   * Sample values for implementations:
   * - computeHMACSignature('', 'test_secret') => 'f7f9bd47fb987337b5796fdc1fdb9ba221d0d5396814bfcaf9521f43fd8927fd'
   * - computeHMACSignature('\ud83d\ude00', 'test_secret') => '837da296d05c4fe31f61d5d7ead035099d9585a5bcde87de952012a78f0b0c43
   */
  computeHMACSignatureAsync(payload, secret) {
    throw new Error("computeHMACSignatureAsync not implemented.");
  }
  /**
   * Computes a SHA-256 hash of the data.
   */
  computeSHA256Async(data) {
    throw new Error("computeSHA256 not implemented.");
  }
};
var CryptoProviderOnlySupportsAsyncError = class extends Error {
};

// ../node_modules/stripe/esm/crypto/NodeCryptoProvider.js
var NodeCryptoProvider = class extends CryptoProvider {
  /** @override */
  computeHMACSignature(payload, secret) {
    return crypto2.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  }
  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const signature = await this.computeHMACSignature(payload, secret);
    return signature;
  }
  /** @override */
  async computeSHA256Async(data) {
    return new Uint8Array(await crypto2.createHash("sha256").update(data).digest());
  }
};

// ../node_modules/stripe/esm/net/NodeHttpClient.js
import * as http_ from "http";
import * as https_ from "https";

// ../node_modules/stripe/esm/net/HttpClient.js
var HttpClient = class _HttpClient {
  /** The client name used for diagnostics. */
  getClientName() {
    throw new Error("getClientName not implemented.");
  }
  makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    throw new Error("makeRequest not implemented.");
  }
  /** Helper to make a consistent timeout error across implementations. */
  static makeTimeoutError() {
    const timeoutErr = new TypeError(_HttpClient.TIMEOUT_ERROR_CODE);
    timeoutErr.code = _HttpClient.TIMEOUT_ERROR_CODE;
    return timeoutErr;
  }
};
HttpClient.CONNECTION_CLOSED_ERROR_CODES = ["ECONNRESET", "EPIPE"];
HttpClient.TIMEOUT_ERROR_CODE = "ETIMEDOUT";
var HttpClientResponse = class {
  constructor(statusCode, headers) {
    this._statusCode = statusCode;
    this._headers = headers;
  }
  getStatusCode() {
    return this._statusCode;
  }
  getHeaders() {
    return this._headers;
  }
  getRawResponse() {
    throw new Error("getRawResponse not implemented.");
  }
  toStream(streamCompleteCallback) {
    throw new Error("toStream not implemented.");
  }
  toJSON() {
    throw new Error("toJSON not implemented.");
  }
};

// ../node_modules/stripe/esm/net/NodeHttpClient.js
var http = http_.default || http_;
var https = https_.default || https_;
var defaultHttpAgent = new http.Agent({ keepAlive: true });
var defaultHttpsAgent = new https.Agent({ keepAlive: true });
var NodeHttpClient = class extends HttpClient {
  constructor(agent) {
    super();
    this._agent = agent;
  }
  /** @override. */
  getClientName() {
    return "node";
  }
  makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    const isInsecureConnection = protocol === "http";
    let agent = this._agent;
    if (!agent) {
      agent = isInsecureConnection ? defaultHttpAgent : defaultHttpsAgent;
    }
    const requestPromise = new Promise((resolve2, reject) => {
      const req = (isInsecureConnection ? http : https).request({
        host,
        port,
        path,
        method,
        agent,
        headers,
        ciphers: "DEFAULT:!aNULL:!eNULL:!LOW:!EXPORT:!SSLv2:!MD5"
      });
      req.setTimeout(timeout, () => {
        req.destroy(HttpClient.makeTimeoutError());
      });
      req.on("response", (res) => {
        resolve2(new NodeHttpClientResponse(res));
      });
      req.on("error", (error) => {
        reject(error);
      });
      req.once("socket", (socket) => {
        if (socket.connecting) {
          socket.once(isInsecureConnection ? "connect" : "secureConnect", () => {
            req.write(requestData);
            req.end();
          });
        } else {
          req.write(requestData);
          req.end();
        }
      });
    });
    return requestPromise;
  }
};
var NodeHttpClientResponse = class extends HttpClientResponse {
  constructor(res) {
    super(res.statusCode, res.headers || {});
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    this._res.once("end", () => streamCompleteCallback());
    return this._res;
  }
  toJSON() {
    return new Promise((resolve2, reject) => {
      let response = "";
      this._res.setEncoding("utf8");
      this._res.on("data", (chunk) => {
        response += chunk;
      });
      this._res.once("end", () => {
        try {
          resolve2(JSON.parse(response));
        } catch (e) {
          reject(e);
        }
      });
    });
  }
};

// ../node_modules/stripe/esm/utils.js
var qs = __toESM(require_lib2(), 1);
var OPTIONS_KEYS = [
  "apiKey",
  "idempotencyKey",
  "stripeAccount",
  "apiVersion",
  "maxNetworkRetries",
  "timeout",
  "host",
  "authenticator",
  "stripeContext",
  "additionalHeaders",
  "streaming"
];
function isOptionsHash(o) {
  return o && typeof o === "object" && OPTIONS_KEYS.some((prop) => Object.prototype.hasOwnProperty.call(o, prop));
}
function queryStringifyRequestData(data, apiMode) {
  return qs.stringify(data, {
    serializeDate: (d) => Math.floor(d.getTime() / 1e3).toString(),
    arrayFormat: apiMode == "v2" ? "repeat" : "indices"
  }).replace(/%5B/g, "[").replace(/%5D/g, "]");
}
var makeURLInterpolator = /* @__PURE__ */ (() => {
  const rc = {
    "\n": "\\n",
    '"': '\\"',
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  return (str) => {
    const cleanString = str.replace(/["\n\r\u2028\u2029]/g, ($0) => rc[$0]);
    return (outputs) => {
      return cleanString.replace(/\{([\s\S]+?)\}/g, ($0, $1) => {
        const output = outputs[$1];
        if (isValidEncodeUriComponentType(output))
          return encodeURIComponent(output);
        return "";
      });
    };
  };
})();
function isValidEncodeUriComponentType(value) {
  return ["number", "string", "boolean"].includes(typeof value);
}
function extractUrlParams(path) {
  const params = path.match(/\{\w+\}/g);
  if (!params) {
    return [];
  }
  return params.map((param) => param.replace(/[{}]/g, ""));
}
function getDataFromArgs(args) {
  if (!Array.isArray(args) || !args[0] || typeof args[0] !== "object") {
    return {};
  }
  if (!isOptionsHash(args[0])) {
    return args.shift();
  }
  const argKeys = Object.keys(args[0]);
  const optionKeysInArgs = argKeys.filter((key) => OPTIONS_KEYS.includes(key));
  if (optionKeysInArgs.length > 0 && optionKeysInArgs.length !== argKeys.length) {
    emitWarning(`Options found in arguments (${optionKeysInArgs.join(", ")}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options.`);
  }
  return {};
}
function getOptionsFromArgs(args) {
  const opts = {
    host: null,
    headers: {},
    settings: {},
    streaming: false
  };
  if (args.length > 0) {
    const arg = args[args.length - 1];
    if (typeof arg === "string") {
      opts.authenticator = createApiKeyAuthenticator(args.pop());
    } else if (isOptionsHash(arg)) {
      const params = Object.assign({}, args.pop());
      const extraKeys = Object.keys(params).filter((key) => !OPTIONS_KEYS.includes(key));
      if (extraKeys.length) {
        emitWarning(`Invalid options found (${extraKeys.join(", ")}); ignoring.`);
      }
      if (params.apiKey) {
        opts.authenticator = createApiKeyAuthenticator(params.apiKey);
      }
      if (params.idempotencyKey) {
        opts.headers["Idempotency-Key"] = params.idempotencyKey;
      }
      if (params.stripeAccount) {
        opts.headers["Stripe-Account"] = params.stripeAccount;
      }
      if (params.stripeContext) {
        if (opts.headers["Stripe-Account"]) {
          throw new Error("Can't specify both stripeAccount and stripeContext.");
        }
        opts.headers["Stripe-Context"] = params.stripeContext;
      }
      if (params.apiVersion) {
        opts.headers["Stripe-Version"] = params.apiVersion;
      }
      if (Number.isInteger(params.maxNetworkRetries)) {
        opts.settings.maxNetworkRetries = params.maxNetworkRetries;
      }
      if (Number.isInteger(params.timeout)) {
        opts.settings.timeout = params.timeout;
      }
      if (params.host) {
        opts.host = params.host;
      }
      if (params.authenticator) {
        if (params.apiKey) {
          throw new Error("Can't specify both apiKey and authenticator.");
        }
        if (typeof params.authenticator !== "function") {
          throw new Error("The authenticator must be a function receiving a request as the first parameter.");
        }
        opts.authenticator = params.authenticator;
      }
      if (params.additionalHeaders) {
        opts.headers = params.additionalHeaders;
      }
      if (params.streaming) {
        opts.streaming = true;
      }
    }
  }
  return opts;
}
function protoExtend(sub) {
  const Super = this;
  const Constructor = Object.prototype.hasOwnProperty.call(sub, "constructor") ? sub.constructor : function(...args) {
    Super.apply(this, args);
  };
  Object.assign(Constructor, Super);
  Constructor.prototype = Object.create(Super.prototype);
  Object.assign(Constructor.prototype, sub);
  return Constructor;
}
function removeNullish(obj) {
  if (typeof obj !== "object") {
    throw new Error("Argument must be an object");
  }
  return Object.keys(obj).reduce((result, key) => {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}
function normalizeHeaders(obj) {
  if (!(obj && typeof obj === "object")) {
    return obj;
  }
  return Object.keys(obj).reduce((result, header) => {
    result[normalizeHeader(header)] = obj[header];
    return result;
  }, {});
}
function normalizeHeader(header) {
  return header.split("-").map((text) => text.charAt(0).toUpperCase() + text.substr(1).toLowerCase()).join("-");
}
function callbackifyPromiseWithTimeout(promise, callback) {
  if (callback) {
    return promise.then((res) => {
      setTimeout(() => {
        callback(null, res);
      }, 0);
    }, (err) => {
      setTimeout(() => {
        callback(err, null);
      }, 0);
    });
  }
  return promise;
}
function pascalToCamelCase(name) {
  if (name === "OAuth") {
    return "oauth";
  } else {
    return name[0].toLowerCase() + name.substring(1);
  }
}
function emitWarning(warning) {
  if (typeof process.emitWarning !== "function") {
    return console.warn(`Stripe: ${warning}`);
  }
  return process.emitWarning(warning, "Stripe");
}
function isObject2(obj) {
  const type = typeof obj;
  return (type === "function" || type === "object") && !!obj;
}
function flattenAndStringify(data) {
  const result = {};
  const step = (obj, prevKey) => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prevKey ? `${prevKey}[${key}]` : key;
      if (isObject2(value)) {
        if (!(value instanceof Uint8Array) && !Object.prototype.hasOwnProperty.call(value, "data")) {
          return step(value, newKey);
        } else {
          result[newKey] = value;
        }
      } else {
        result[newKey] = String(value);
      }
    });
  };
  step(data, null);
  return result;
}
function validateInteger(name, n, defaultVal) {
  if (!Number.isInteger(n)) {
    if (defaultVal !== void 0) {
      return defaultVal;
    } else {
      throw new Error(`${name} must be an integer`);
    }
  }
  return n;
}
function determineProcessUserAgentProperties() {
  return typeof process === "undefined" ? {} : {
    lang_version: process.version,
    platform: process.platform
  };
}
function createApiKeyAuthenticator(apiKey) {
  const authenticator = (request) => {
    request.headers.Authorization = "Bearer " + apiKey;
    return Promise.resolve();
  };
  authenticator._apiKey = apiKey;
  return authenticator;
}
function concat2(arrays) {
  const totalLength = arrays.reduce((len, array) => len + array.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  arrays.forEach((array) => {
    merged.set(array, offset);
    offset += array.length;
  });
  return merged;
}
function dateTimeReplacer(key, value) {
  if (this[key] instanceof Date) {
    return Math.floor(this[key].getTime() / 1e3).toString();
  }
  return value;
}
function jsonStringifyRequestData(data) {
  return JSON.stringify(data, dateTimeReplacer);
}
function getAPIMode(path) {
  if (!path) {
    return "v1";
  }
  return path.startsWith("/v2") ? "v2" : "v1";
}
function parseHttpHeaderAsString(header) {
  if (Array.isArray(header)) {
    return header.join(", ");
  }
  return String(header);
}
function parseHttpHeaderAsNumber(header) {
  const number = Array.isArray(header) ? header[0] : header;
  return Number(number);
}
function parseHeadersForFetch(headers) {
  return Object.entries(headers).map(([key, value]) => {
    return [key, parseHttpHeaderAsString(value)];
  });
}

// ../node_modules/stripe/esm/net/FetchHttpClient.js
var FetchHttpClient = class _FetchHttpClient extends HttpClient {
  constructor(fetchFn) {
    super();
    if (!fetchFn) {
      if (!globalThis.fetch) {
        throw new Error("fetch() function not provided and is not defined in the global scope. You must provide a fetch implementation.");
      }
      fetchFn = globalThis.fetch;
    }
    if (globalThis.AbortController) {
      this._fetchFn = _FetchHttpClient.makeFetchWithAbortTimeout(fetchFn);
    } else {
      this._fetchFn = _FetchHttpClient.makeFetchWithRaceTimeout(fetchFn);
    }
  }
  static makeFetchWithRaceTimeout(fetchFn) {
    return (url, init, timeout) => {
      let pendingTimeoutId;
      const timeoutPromise = new Promise((_, reject) => {
        pendingTimeoutId = setTimeout(() => {
          pendingTimeoutId = null;
          reject(HttpClient.makeTimeoutError());
        }, timeout);
      });
      const fetchPromise = fetchFn(url, init);
      return Promise.race([fetchPromise, timeoutPromise]).finally(() => {
        if (pendingTimeoutId) {
          clearTimeout(pendingTimeoutId);
        }
      });
    };
  }
  static makeFetchWithAbortTimeout(fetchFn) {
    return async (url, init, timeout) => {
      const abort = new AbortController();
      let timeoutId = setTimeout(() => {
        timeoutId = null;
        abort.abort(HttpClient.makeTimeoutError());
      }, timeout);
      try {
        return await fetchFn(url, Object.assign(Object.assign({}, init), { signal: abort.signal }));
      } catch (err) {
        if (err.name === "AbortError") {
          throw HttpClient.makeTimeoutError();
        } else {
          throw err;
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };
  }
  /** @override. */
  getClientName() {
    return "fetch";
  }
  async makeRequest(host, port, path, method, headers, requestData, protocol, timeout) {
    const isInsecureConnection = protocol === "http";
    const url = new URL(path, `${isInsecureConnection ? "http" : "https"}://${host}`);
    url.port = port;
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    const body = requestData || (methodHasPayload ? "" : void 0);
    const res = await this._fetchFn(url.toString(), {
      method,
      headers: parseHeadersForFetch(headers),
      body: typeof body === "object" ? JSON.stringify(body) : body
    }, timeout);
    return new FetchHttpClientResponse(res);
  }
};
var FetchHttpClientResponse = class _FetchHttpClientResponse extends HttpClientResponse {
  constructor(res) {
    super(res.status, _FetchHttpClientResponse._transformHeadersToObject(res.headers));
    this._res = res;
  }
  getRawResponse() {
    return this._res;
  }
  toStream(streamCompleteCallback) {
    streamCompleteCallback();
    return this._res.body;
  }
  toJSON() {
    return this._res.json();
  }
  static _transformHeadersToObject(headers) {
    const headersObj = {};
    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length != 2) {
        throw new Error("Response objects produced by the fetch function given to FetchHttpClient do not have an iterable headers map. Response#headers should be an iterable object.");
      }
      headersObj[entry[0]] = entry[1];
    }
    return headersObj;
  }
};

// ../node_modules/stripe/esm/crypto/SubtleCryptoProvider.js
var SubtleCryptoProvider = class extends CryptoProvider {
  constructor(subtleCrypto) {
    super();
    this.subtleCrypto = subtleCrypto || crypto.subtle;
  }
  /** @override */
  computeHMACSignature(payload, secret) {
    throw new CryptoProviderOnlySupportsAsyncError("SubtleCryptoProvider cannot be used in a synchronous context.");
  }
  /** @override */
  async computeHMACSignatureAsync(payload, secret) {
    const encoder2 = new TextEncoder();
    const key = await this.subtleCrypto.importKey("raw", encoder2.encode(secret), {
      name: "HMAC",
      hash: { name: "SHA-256" }
    }, false, ["sign"]);
    const signatureBuffer = await this.subtleCrypto.sign("hmac", key, encoder2.encode(payload));
    const signatureBytes = new Uint8Array(signatureBuffer);
    const signatureHexCodes = new Array(signatureBytes.length);
    for (let i = 0; i < signatureBytes.length; i++) {
      signatureHexCodes[i] = byteHexMapping[signatureBytes[i]];
    }
    return signatureHexCodes.join("");
  }
  /** @override */
  async computeSHA256Async(data) {
    return new Uint8Array(await this.subtleCrypto.digest("SHA-256", data));
  }
};
var byteHexMapping = new Array(256);
for (let i = 0; i < byteHexMapping.length; i++) {
  byteHexMapping[i] = i.toString(16).padStart(2, "0");
}

// ../node_modules/stripe/esm/platform/PlatformFunctions.js
var PlatformFunctions = class {
  constructor() {
    this._fetchFn = null;
    this._agent = null;
  }
  /**
   * Gets uname with Node's built-in `exec` function, if available.
   */
  getUname() {
    throw new Error("getUname not implemented.");
  }
  /**
   * Generates a v4 UUID. See https://stackoverflow.com/a/2117523
   */
  uuid4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  /**
   * Compares strings in constant time.
   */
  secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    const len = a.length;
    let result = 0;
    for (let i = 0; i < len; ++i) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  /**
   * Creates an event emitter.
   */
  createEmitter() {
    throw new Error("createEmitter not implemented.");
  }
  /**
   * Checks if the request data is a stream. If so, read the entire stream
   * to a buffer and return the buffer.
   */
  tryBufferData(data) {
    throw new Error("tryBufferData not implemented.");
  }
  /**
   * Creates an HTTP client which uses the Node `http` and `https` packages
   * to issue requests.
   */
  createNodeHttpClient(agent) {
    throw new Error("createNodeHttpClient not implemented.");
  }
  /**
   * Creates an HTTP client for issuing Stripe API requests which uses the Web
   * Fetch API.
   *
   * A fetch function can optionally be passed in as a parameter. If none is
   * passed, will default to the default `fetch` function in the global scope.
   */
  createFetchHttpClient(fetchFn) {
    return new FetchHttpClient(fetchFn);
  }
  /**
   * Creates an HTTP client using runtime-specific APIs.
   */
  createDefaultHttpClient() {
    throw new Error("createDefaultHttpClient not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the Node `crypto` package for its computations.
   */
  createNodeCryptoProvider() {
    throw new Error("createNodeCryptoProvider not implemented.");
  }
  /**
   * Creates a CryptoProvider which uses the SubtleCrypto interface of the Web Crypto API.
   */
  createSubtleCryptoProvider(subtleCrypto) {
    return new SubtleCryptoProvider(subtleCrypto);
  }
  createDefaultCryptoProvider() {
    throw new Error("createDefaultCryptoProvider not implemented.");
  }
};

// ../node_modules/stripe/esm/Error.js
var Error_exports = {};
__export(Error_exports, {
  StripeAPIError: () => StripeAPIError,
  StripeAuthenticationError: () => StripeAuthenticationError,
  StripeCardError: () => StripeCardError,
  StripeConnectionError: () => StripeConnectionError,
  StripeError: () => StripeError,
  StripeIdempotencyError: () => StripeIdempotencyError,
  StripeInvalidGrantError: () => StripeInvalidGrantError,
  StripeInvalidRequestError: () => StripeInvalidRequestError,
  StripePermissionError: () => StripePermissionError,
  StripeRateLimitError: () => StripeRateLimitError,
  StripeSignatureVerificationError: () => StripeSignatureVerificationError,
  StripeUnknownError: () => StripeUnknownError,
  TemporarySessionExpiredError: () => TemporarySessionExpiredError,
  generateV1Error: () => generateV1Error,
  generateV2Error: () => generateV2Error
});
var generateV1Error = (rawStripeError) => {
  switch (rawStripeError.type) {
    case "card_error":
      return new StripeCardError(rawStripeError);
    case "invalid_request_error":
      return new StripeInvalidRequestError(rawStripeError);
    case "api_error":
      return new StripeAPIError(rawStripeError);
    case "authentication_error":
      return new StripeAuthenticationError(rawStripeError);
    case "rate_limit_error":
      return new StripeRateLimitError(rawStripeError);
    case "idempotency_error":
      return new StripeIdempotencyError(rawStripeError);
    case "invalid_grant":
      return new StripeInvalidGrantError(rawStripeError);
    default:
      return new StripeUnknownError(rawStripeError);
  }
};
var generateV2Error = (rawStripeError) => {
  switch (rawStripeError.type) {
    // switchCases: The beginning of the section generated from our OpenAPI spec
    case "temporary_session_expired":
      return new TemporarySessionExpiredError(rawStripeError);
  }
  switch (rawStripeError.code) {
    case "invalid_fields":
      return new StripeInvalidRequestError(rawStripeError);
  }
  return generateV1Error(rawStripeError);
};
var StripeError = class extends Error {
  constructor(raw = {}, type = null) {
    var _a;
    super(raw.message);
    this.type = type || this.constructor.name;
    this.raw = raw;
    this.rawType = raw.type;
    this.code = raw.code;
    this.doc_url = raw.doc_url;
    this.param = raw.param;
    this.detail = raw.detail;
    this.headers = raw.headers;
    this.requestId = raw.requestId;
    this.statusCode = raw.statusCode;
    this.message = (_a = raw.message) !== null && _a !== void 0 ? _a : "";
    this.userMessage = raw.user_message;
    this.charge = raw.charge;
    this.decline_code = raw.decline_code;
    this.payment_intent = raw.payment_intent;
    this.payment_method = raw.payment_method;
    this.payment_method_type = raw.payment_method_type;
    this.setup_intent = raw.setup_intent;
    this.source = raw.source;
  }
};
StripeError.generate = generateV1Error;
var StripeCardError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeCardError");
  }
};
var StripeInvalidRequestError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeInvalidRequestError");
  }
};
var StripeAPIError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeAPIError");
  }
};
var StripeAuthenticationError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeAuthenticationError");
  }
};
var StripePermissionError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripePermissionError");
  }
};
var StripeRateLimitError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeRateLimitError");
  }
};
var StripeConnectionError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeConnectionError");
  }
};
var StripeSignatureVerificationError = class extends StripeError {
  constructor(header, payload, raw = {}) {
    super(raw, "StripeSignatureVerificationError");
    this.header = header;
    this.payload = payload;
  }
};
var StripeIdempotencyError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeIdempotencyError");
  }
};
var StripeInvalidGrantError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeInvalidGrantError");
  }
};
var StripeUnknownError = class extends StripeError {
  constructor(raw = {}) {
    super(raw, "StripeUnknownError");
  }
};
var TemporarySessionExpiredError = class extends StripeError {
  constructor(rawStripeError = {}) {
    super(rawStripeError, "TemporarySessionExpiredError");
  }
};

// ../node_modules/stripe/esm/platform/NodePlatformFunctions.js
import { exec } from "child_process";
var StreamProcessingError = class extends StripeError {
};
var NodePlatformFunctions = class extends PlatformFunctions {
  constructor() {
    super();
    this._exec = exec;
    this._UNAME_CACHE = null;
  }
  /** @override */
  uuid4() {
    if (crypto3.randomUUID) {
      return crypto3.randomUUID();
    }
    return super.uuid4();
  }
  /**
   * @override
   * Node's built in `exec` function sometimes throws outright,
   * and sometimes has a callback with an error,
   * depending on the type of error.
   *
   * This unifies that interface by resolving with a null uname
   * if an error is encountered.
   */
  getUname() {
    if (!this._UNAME_CACHE) {
      this._UNAME_CACHE = new Promise((resolve2, reject) => {
        try {
          this._exec("uname -a", (err, uname) => {
            if (err) {
              return resolve2(null);
            }
            resolve2(uname);
          });
        } catch (e) {
          resolve2(null);
        }
      });
    }
    return this._UNAME_CACHE;
  }
  /**
   * @override
   * Secure compare, from https://github.com/freewil/scmp
   */
  secureCompare(a, b) {
    if (!a || !b) {
      throw new Error("secureCompare must receive two arguments");
    }
    if (a.length !== b.length) {
      return false;
    }
    if (crypto3.timingSafeEqual) {
      const textEncoder = new TextEncoder();
      const aEncoded = textEncoder.encode(a);
      const bEncoded = textEncoder.encode(b);
      return crypto3.timingSafeEqual(aEncoded, bEncoded);
    }
    return super.secureCompare(a, b);
  }
  createEmitter() {
    return new EventEmitter();
  }
  /** @override */
  tryBufferData(data) {
    if (!(data.file.data instanceof EventEmitter)) {
      return Promise.resolve(data);
    }
    const bufferArray = [];
    return new Promise((resolve2, reject) => {
      data.file.data.on("data", (line) => {
        bufferArray.push(line);
      }).once("end", () => {
        const bufferData = Object.assign({}, data);
        bufferData.file.data = concat2(bufferArray);
        resolve2(bufferData);
      }).on("error", (err) => {
        reject(new StreamProcessingError({
          message: "An error occurred while attempting to process the file for upload.",
          detail: err
        }));
      });
    });
  }
  /** @override */
  createNodeHttpClient(agent) {
    return new NodeHttpClient(agent);
  }
  /** @override */
  createDefaultHttpClient() {
    return new NodeHttpClient();
  }
  /** @override */
  createNodeCryptoProvider() {
    return new NodeCryptoProvider();
  }
  /** @override */
  createDefaultCryptoProvider() {
    return this.createNodeCryptoProvider();
  }
};

// ../node_modules/stripe/esm/RequestSender.js
var MAX_RETRY_AFTER_WAIT = 60;
var RequestSender = class _RequestSender {
  constructor(stripe, maxBufferedRequestMetric) {
    this._stripe = stripe;
    this._maxBufferedRequestMetric = maxBufferedRequestMetric;
  }
  _addHeadersDirectlyToObject(obj, headers) {
    obj.requestId = headers["request-id"];
    obj.stripeAccount = obj.stripeAccount || headers["stripe-account"];
    obj.apiVersion = obj.apiVersion || headers["stripe-version"];
    obj.idempotencyKey = obj.idempotencyKey || headers["idempotency-key"];
  }
  _makeResponseEvent(requestEvent, statusCode, headers) {
    const requestEndTime = Date.now();
    const requestDurationMs = requestEndTime - requestEvent.request_start_time;
    return removeNullish({
      api_version: headers["stripe-version"],
      account: headers["stripe-account"],
      idempotency_key: headers["idempotency-key"],
      method: requestEvent.method,
      path: requestEvent.path,
      status: statusCode,
      request_id: this._getRequestId(headers),
      elapsed: requestDurationMs,
      request_start_time: requestEvent.request_start_time,
      request_end_time: requestEndTime
    });
  }
  _getRequestId(headers) {
    return headers["request-id"];
  }
  /**
   * Used by methods with spec.streaming === true. For these methods, we do not
   * buffer successful responses into memory or do parse them into stripe
   * objects, we delegate that all of that to the user and pass back the raw
   * http.Response object to the callback.
   *
   * (Unsuccessful responses shouldn't make it here, they should
   * still be buffered/parsed and handled by _jsonResponseHandler -- see
   * makeRequest)
   */
  _streamingResponseHandler(requestEvent, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const streamCompleteCallback = () => {
        const responseEvent = this._makeResponseEvent(requestEvent, res.getStatusCode(), headers);
        this._stripe._emitter.emit("response", responseEvent);
        this._recordRequestMetrics(this._getRequestId(headers), responseEvent.elapsed, usage);
      };
      const stream = res.toStream(streamCompleteCallback);
      this._addHeadersDirectlyToObject(stream, headers);
      return callback(null, stream);
    };
  }
  /**
   * Default handler for Stripe responses. Buffers the response into memory,
   * parses the JSON and returns it (i.e. passes it to the callback) if there
   * is no "error" field. Otherwise constructs/passes an appropriate Error.
   */
  _jsonResponseHandler(requestEvent, apiMode, usage, callback) {
    return (res) => {
      const headers = res.getHeaders();
      const requestId = this._getRequestId(headers);
      const statusCode = res.getStatusCode();
      const responseEvent = this._makeResponseEvent(requestEvent, statusCode, headers);
      this._stripe._emitter.emit("response", responseEvent);
      res.toJSON().then((jsonResponse2) => {
        if (jsonResponse2.error) {
          let err;
          if (typeof jsonResponse2.error === "string") {
            jsonResponse2.error = {
              type: jsonResponse2.error,
              message: jsonResponse2.error_description
            };
          }
          jsonResponse2.error.headers = headers;
          jsonResponse2.error.statusCode = statusCode;
          jsonResponse2.error.requestId = requestId;
          if (statusCode === 401) {
            err = new StripeAuthenticationError(jsonResponse2.error);
          } else if (statusCode === 403) {
            err = new StripePermissionError(jsonResponse2.error);
          } else if (statusCode === 429) {
            err = new StripeRateLimitError(jsonResponse2.error);
          } else if (apiMode === "v2") {
            err = generateV2Error(jsonResponse2.error);
          } else {
            err = generateV1Error(jsonResponse2.error);
          }
          throw err;
        }
        return jsonResponse2;
      }, (e) => {
        throw new StripeAPIError({
          message: "Invalid JSON received from the Stripe API",
          exception: e,
          requestId: headers["request-id"]
        });
      }).then((jsonResponse2) => {
        this._recordRequestMetrics(requestId, responseEvent.elapsed, usage);
        const rawResponse = res.getRawResponse();
        this._addHeadersDirectlyToObject(rawResponse, headers);
        Object.defineProperty(jsonResponse2, "lastResponse", {
          enumerable: false,
          writable: false,
          value: rawResponse
        });
        callback(null, jsonResponse2);
      }, (e) => callback(e, null));
    };
  }
  static _generateConnectionErrorMessage(requestRetries) {
    return `An error occurred with our connection to Stripe.${requestRetries > 0 ? ` Request was retried ${requestRetries} times.` : ""}`;
  }
  // For more on when and how to retry API requests, see https://stripe.com/docs/error-handling#safely-retrying-requests-with-idempotency
  static _shouldRetry(res, numRetries, maxRetries, error) {
    if (error && numRetries === 0 && HttpClient.CONNECTION_CLOSED_ERROR_CODES.includes(error.code)) {
      return true;
    }
    if (numRetries >= maxRetries) {
      return false;
    }
    if (!res) {
      return true;
    }
    if (res.getHeaders()["stripe-should-retry"] === "false") {
      return false;
    }
    if (res.getHeaders()["stripe-should-retry"] === "true") {
      return true;
    }
    if (res.getStatusCode() === 409) {
      return true;
    }
    if (res.getStatusCode() >= 500) {
      return true;
    }
    return false;
  }
  _getSleepTimeInMS(numRetries, retryAfter = null) {
    const initialNetworkRetryDelay = this._stripe.getInitialNetworkRetryDelay();
    const maxNetworkRetryDelay = this._stripe.getMaxNetworkRetryDelay();
    let sleepSeconds = Math.min(initialNetworkRetryDelay * Math.pow(2, numRetries - 1), maxNetworkRetryDelay);
    sleepSeconds *= 0.5 * (1 + Math.random());
    sleepSeconds = Math.max(initialNetworkRetryDelay, sleepSeconds);
    if (Number.isInteger(retryAfter) && retryAfter <= MAX_RETRY_AFTER_WAIT) {
      sleepSeconds = Math.max(sleepSeconds, retryAfter);
    }
    return sleepSeconds * 1e3;
  }
  // Max retries can be set on a per request basis. Favor those over the global setting
  _getMaxNetworkRetries(settings = {}) {
    return settings.maxNetworkRetries !== void 0 && Number.isInteger(settings.maxNetworkRetries) ? settings.maxNetworkRetries : this._stripe.getMaxNetworkRetries();
  }
  _defaultIdempotencyKey(method, settings, apiMode) {
    const maxRetries = this._getMaxNetworkRetries(settings);
    const genKey = () => `stripe-node-retry-${this._stripe._platformFunctions.uuid4()}`;
    if (apiMode === "v2") {
      if (method === "POST" || method === "DELETE") {
        return genKey();
      }
    } else if (apiMode === "v1") {
      if (method === "POST" && maxRetries > 0) {
        return genKey();
      }
    }
    return null;
  }
  _makeHeaders({ contentType, contentLength, apiVersion, clientUserAgent, method, userSuppliedHeaders, userSuppliedSettings, stripeAccount, stripeContext, apiMode }) {
    const defaultHeaders = {
      Accept: "application/json",
      "Content-Type": contentType,
      "User-Agent": this._getUserAgentString(apiMode),
      "X-Stripe-Client-User-Agent": clientUserAgent,
      "X-Stripe-Client-Telemetry": this._getTelemetryHeader(),
      "Stripe-Version": apiVersion,
      "Stripe-Account": stripeAccount,
      "Stripe-Context": stripeContext,
      "Idempotency-Key": this._defaultIdempotencyKey(method, userSuppliedSettings, apiMode)
    };
    const methodHasPayload = method == "POST" || method == "PUT" || method == "PATCH";
    if (methodHasPayload || contentLength) {
      if (!methodHasPayload) {
        emitWarning(`${method} method had non-zero contentLength but no payload is expected for this verb`);
      }
      defaultHeaders["Content-Length"] = contentLength;
    }
    return Object.assign(
      removeNullish(defaultHeaders),
      // If the user supplied, say 'idempotency-key', override instead of appending by ensuring caps are the same.
      normalizeHeaders(userSuppliedHeaders)
    );
  }
  _getUserAgentString(apiMode) {
    const packageVersion = this._stripe.getConstant("PACKAGE_VERSION");
    const appInfo = this._stripe._appInfo ? this._stripe.getAppInfoAsString() : "";
    return `Stripe/${apiMode} NodeBindings/${packageVersion} ${appInfo}`.trim();
  }
  _getTelemetryHeader() {
    if (this._stripe.getTelemetryEnabled() && this._stripe._prevRequestMetrics.length > 0) {
      const metrics = this._stripe._prevRequestMetrics.shift();
      return JSON.stringify({
        last_request_metrics: metrics
      });
    }
  }
  _recordRequestMetrics(requestId, requestDurationMs, usage) {
    if (this._stripe.getTelemetryEnabled() && requestId) {
      if (this._stripe._prevRequestMetrics.length > this._maxBufferedRequestMetric) {
        emitWarning("Request metrics buffer is full, dropping telemetry message.");
      } else {
        const m = {
          request_id: requestId,
          request_duration_ms: requestDurationMs
        };
        if (usage && usage.length > 0) {
          m.usage = usage;
        }
        this._stripe._prevRequestMetrics.push(m);
      }
    }
  }
  _rawRequest(method, path, params, options) {
    const requestPromise = new Promise((resolve2, reject) => {
      let opts;
      try {
        const requestMethod = method.toUpperCase();
        if (requestMethod !== "POST" && params && Object.keys(params).length !== 0) {
          throw new Error("rawRequest only supports params on POST requests. Please pass null and add your parameters to path.");
        }
        const args = [].slice.call([params, options]);
        const dataFromArgs = getDataFromArgs(args);
        const data = requestMethod === "POST" ? Object.assign({}, dataFromArgs) : null;
        const calculatedOptions = getOptionsFromArgs(args);
        const headers2 = calculatedOptions.headers;
        const authenticator2 = calculatedOptions.authenticator;
        opts = {
          requestMethod,
          requestPath: path,
          bodyData: data,
          queryData: {},
          authenticator: authenticator2,
          headers: headers2,
          host: calculatedOptions.host,
          streaming: !!calculatedOptions.streaming,
          settings: {},
          usage: ["raw_request"]
        };
      } catch (err) {
        reject(err);
        return;
      }
      function requestCallback(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve2(response);
        }
      }
      const { headers, settings } = opts;
      const authenticator = opts.authenticator;
      this._request(opts.requestMethod, opts.host, path, opts.bodyData, authenticator, { headers, settings, streaming: opts.streaming }, opts.usage, requestCallback);
    });
    return requestPromise;
  }
  _request(method, host, path, data, authenticator, options, usage = [], callback, requestDataProcessor = null) {
    var _a;
    let requestData;
    authenticator = (_a = authenticator !== null && authenticator !== void 0 ? authenticator : this._stripe._authenticator) !== null && _a !== void 0 ? _a : null;
    const apiMode = getAPIMode(path);
    const retryRequest = (requestFn, apiVersion, headers, requestRetries, retryAfter) => {
      return setTimeout(requestFn, this._getSleepTimeInMS(requestRetries, retryAfter), apiVersion, headers, requestRetries + 1);
    };
    const makeRequest = (apiVersion, headers, numRetries) => {
      const timeout = options.settings && options.settings.timeout && Number.isInteger(options.settings.timeout) && options.settings.timeout >= 0 ? options.settings.timeout : this._stripe.getApiField("timeout");
      const request = {
        host: host || this._stripe.getApiField("host"),
        port: this._stripe.getApiField("port"),
        path,
        method,
        headers: Object.assign({}, headers),
        body: requestData,
        protocol: this._stripe.getApiField("protocol")
      };
      authenticator(request).then(() => {
        const req = this._stripe.getApiField("httpClient").makeRequest(request.host, request.port, request.path, request.method, request.headers, request.body, request.protocol, timeout);
        const requestStartTime = Date.now();
        const requestEvent = removeNullish({
          api_version: apiVersion,
          account: parseHttpHeaderAsString(headers["Stripe-Account"]),
          idempotency_key: parseHttpHeaderAsString(headers["Idempotency-Key"]),
          method,
          path,
          request_start_time: requestStartTime
        });
        const requestRetries = numRetries || 0;
        const maxRetries = this._getMaxNetworkRetries(options.settings || {});
        this._stripe._emitter.emit("request", requestEvent);
        req.then((res) => {
          if (_RequestSender._shouldRetry(res, requestRetries, maxRetries)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, parseHttpHeaderAsNumber(res.getHeaders()["retry-after"]));
          } else if (options.streaming && res.getStatusCode() < 400) {
            return this._streamingResponseHandler(requestEvent, usage, callback)(res);
          } else {
            return this._jsonResponseHandler(requestEvent, apiMode, usage, callback)(res);
          }
        }).catch((error) => {
          if (_RequestSender._shouldRetry(null, requestRetries, maxRetries, error)) {
            return retryRequest(makeRequest, apiVersion, headers, requestRetries, null);
          } else {
            const isTimeoutError = error.code && error.code === HttpClient.TIMEOUT_ERROR_CODE;
            return callback(new StripeConnectionError({
              message: isTimeoutError ? `Request aborted due to timeout being reached (${timeout}ms)` : _RequestSender._generateConnectionErrorMessage(requestRetries),
              detail: error
            }));
          }
        });
      }).catch((e) => {
        throw new StripeError({
          message: "Unable to authenticate the request",
          exception: e
        });
      });
    };
    const prepareAndMakeRequest = (error, data2) => {
      if (error) {
        return callback(error);
      }
      requestData = data2;
      this._stripe.getClientUserAgent((clientUserAgent) => {
        const apiVersion = this._stripe.getApiField("version");
        const headers = this._makeHeaders({
          contentType: apiMode == "v2" ? "application/json" : "application/x-www-form-urlencoded",
          contentLength: requestData.length,
          apiVersion,
          clientUserAgent,
          method,
          userSuppliedHeaders: options.headers,
          userSuppliedSettings: options.settings,
          stripeAccount: apiMode == "v2" ? null : this._stripe.getApiField("stripeAccount"),
          stripeContext: apiMode == "v2" ? this._stripe.getApiField("stripeContext") : null,
          apiMode
        });
        makeRequest(apiVersion, headers, 0);
      });
    };
    if (requestDataProcessor) {
      requestDataProcessor(method, data, options.headers, prepareAndMakeRequest);
    } else {
      let stringifiedData;
      if (apiMode == "v2") {
        stringifiedData = data ? jsonStringifyRequestData(data) : "";
      } else {
        stringifiedData = queryStringifyRequestData(data || {}, apiMode);
      }
      prepareAndMakeRequest(null, stringifiedData);
    }
  }
};

// ../node_modules/stripe/esm/autoPagination.js
var V1Iterator = class {
  constructor(firstPagePromise, requestArgs, spec, stripeResource) {
    this.index = 0;
    this.pagePromise = firstPagePromise;
    this.promiseCache = { currentPromise: null };
    this.requestArgs = requestArgs;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async iterate(pageResult) {
    if (!(pageResult && pageResult.data && typeof pageResult.data.length === "number")) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `data` array.");
    }
    const reverseIteration = isReverseIteration(this.requestArgs);
    if (this.index < pageResult.data.length) {
      const idx = reverseIteration ? pageResult.data.length - 1 - this.index : this.index;
      const value = pageResult.data[idx];
      this.index += 1;
      return { value, done: false };
    } else if (pageResult.has_more) {
      this.index = 0;
      this.pagePromise = this.getNextPage(pageResult);
      const nextPageResult = await this.pagePromise;
      return this.iterate(nextPageResult);
    }
    return { done: true, value: void 0 };
  }
  /** @abstract */
  getNextPage(_pageResult) {
    throw new Error("Unimplemented");
  }
  async _next() {
    return this.iterate(await this.pagePromise);
  }
  next() {
    if (this.promiseCache.currentPromise) {
      return this.promiseCache.currentPromise;
    }
    const nextPromise = (async () => {
      const ret = await this._next();
      this.promiseCache.currentPromise = null;
      return ret;
    })();
    this.promiseCache.currentPromise = nextPromise;
    return nextPromise;
  }
};
var V1ListIterator = class extends V1Iterator {
  getNextPage(pageResult) {
    const reverseIteration = isReverseIteration(this.requestArgs);
    const lastId = getLastId(pageResult, reverseIteration);
    return this.stripeResource._makeRequest(this.requestArgs, this.spec, {
      [reverseIteration ? "ending_before" : "starting_after"]: lastId
    });
  }
};
var V1SearchIterator = class extends V1Iterator {
  getNextPage(pageResult) {
    if (!pageResult.next_page) {
      throw Error("Unexpected: Stripe API response does not have a well-formed `next_page` field, but `has_more` was true.");
    }
    return this.stripeResource._makeRequest(this.requestArgs, this.spec, {
      page: pageResult.next_page
    });
  }
};
var V2ListIterator = class {
  constructor(firstPagePromise, requestArgs, spec, stripeResource) {
    this.currentPageIterator = (async () => {
      const page = await firstPagePromise;
      return page.data[Symbol.iterator]();
    })();
    this.nextPageUrl = (async () => {
      const page = await firstPagePromise;
      return page.next_page_url || null;
    })();
    this.requestArgs = requestArgs;
    this.spec = spec;
    this.stripeResource = stripeResource;
  }
  async turnPage() {
    const nextPageUrl = await this.nextPageUrl;
    if (!nextPageUrl)
      return null;
    this.spec.fullPath = nextPageUrl;
    const page = await this.stripeResource._makeRequest([], this.spec, {});
    this.nextPageUrl = Promise.resolve(page.next_page_url);
    this.currentPageIterator = Promise.resolve(page.data[Symbol.iterator]());
    return this.currentPageIterator;
  }
  async next() {
    {
      const result2 = (await this.currentPageIterator).next();
      if (!result2.done)
        return { done: false, value: result2.value };
    }
    const nextPageIterator = await this.turnPage();
    if (!nextPageIterator) {
      return { done: true, value: void 0 };
    }
    const result = nextPageIterator.next();
    if (!result.done)
      return { done: false, value: result.value };
    return { done: true, value: void 0 };
  }
};
var makeAutoPaginationMethods = (stripeResource, requestArgs, spec, firstPagePromise) => {
  const apiMode = getAPIMode(spec.fullPath || spec.path);
  if (apiMode !== "v2" && spec.methodType === "search") {
    return makeAutoPaginationMethodsFromIterator(new V1SearchIterator(firstPagePromise, requestArgs, spec, stripeResource));
  }
  if (apiMode !== "v2" && spec.methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V1ListIterator(firstPagePromise, requestArgs, spec, stripeResource));
  }
  if (apiMode === "v2" && spec.methodType === "list") {
    return makeAutoPaginationMethodsFromIterator(new V2ListIterator(firstPagePromise, requestArgs, spec, stripeResource));
  }
  return null;
};
var makeAutoPaginationMethodsFromIterator = (iterator) => {
  const autoPagingEach = makeAutoPagingEach((...args) => iterator.next(...args));
  const autoPagingToArray = makeAutoPagingToArray(autoPagingEach);
  const autoPaginationMethods = {
    autoPagingEach,
    autoPagingToArray,
    // Async iterator functions:
    next: () => iterator.next(),
    return: () => {
      return {};
    },
    [getAsyncIteratorSymbol()]: () => {
      return autoPaginationMethods;
    }
  };
  return autoPaginationMethods;
};
function getAsyncIteratorSymbol() {
  if (typeof Symbol !== "undefined" && Symbol.asyncIterator) {
    return Symbol.asyncIterator;
  }
  return "@@asyncIterator";
}
function getDoneCallback(args) {
  if (args.length < 2) {
    return null;
  }
  const onDone = args[1];
  if (typeof onDone !== "function") {
    throw Error(`The second argument to autoPagingEach, if present, must be a callback function; received ${typeof onDone}`);
  }
  return onDone;
}
function getItemCallback(args) {
  if (args.length === 0) {
    return void 0;
  }
  const onItem = args[0];
  if (typeof onItem !== "function") {
    throw Error(`The first argument to autoPagingEach, if present, must be a callback function; received ${typeof onItem}`);
  }
  if (onItem.length === 2) {
    return onItem;
  }
  if (onItem.length > 2) {
    throw Error(`The \`onItem\` callback function passed to autoPagingEach must accept at most two arguments; got ${onItem}`);
  }
  return function _onItem(item, next) {
    const shouldContinue = onItem(item);
    next(shouldContinue);
  };
}
function getLastId(listResult, reverseIteration) {
  const lastIdx = reverseIteration ? 0 : listResult.data.length - 1;
  const lastItem = listResult.data[lastIdx];
  const lastId = lastItem && lastItem.id;
  if (!lastId) {
    throw Error("Unexpected: No `id` found on the last item while auto-paging a list.");
  }
  return lastId;
}
function makeAutoPagingEach(asyncIteratorNext) {
  return function autoPagingEach() {
    const args = [].slice.call(arguments);
    const onItem = getItemCallback(args);
    const onDone = getDoneCallback(args);
    if (args.length > 2) {
      throw Error(`autoPagingEach takes up to two arguments; received ${args}`);
    }
    const autoPagePromise = wrapAsyncIteratorWithCallback(
      asyncIteratorNext,
      // @ts-ignore we might need a null check
      onItem
    );
    return callbackifyPromiseWithTimeout(autoPagePromise, onDone);
  };
}
function makeAutoPagingToArray(autoPagingEach) {
  return function autoPagingToArray(opts, onDone) {
    const limit = opts && opts.limit;
    if (!limit) {
      throw Error("You must pass a `limit` option to autoPagingToArray, e.g., `autoPagingToArray({limit: 1000});`.");
    }
    if (limit > 1e4) {
      throw Error("You cannot specify a limit of more than 10,000 items to fetch in `autoPagingToArray`; use `autoPagingEach` to iterate through longer lists.");
    }
    const promise = new Promise((resolve2, reject) => {
      const items = [];
      autoPagingEach((item) => {
        items.push(item);
        if (items.length >= limit) {
          return false;
        }
      }).then(() => {
        resolve2(items);
      }).catch(reject);
    });
    return callbackifyPromiseWithTimeout(promise, onDone);
  };
}
function wrapAsyncIteratorWithCallback(asyncIteratorNext, onItem) {
  return new Promise((resolve2, reject) => {
    function handleIteration(iterResult) {
      if (iterResult.done) {
        resolve2();
        return;
      }
      const item = iterResult.value;
      return new Promise((next) => {
        onItem(item, next);
      }).then((shouldContinue) => {
        if (shouldContinue === false) {
          return handleIteration({ done: true, value: void 0 });
        } else {
          return asyncIteratorNext().then(handleIteration);
        }
      });
    }
    asyncIteratorNext().then(handleIteration).catch(reject);
  });
}
function isReverseIteration(requestArgs) {
  const args = [].slice.call(requestArgs);
  const dataFromArgs = getDataFromArgs(args);
  return !!dataFromArgs.ending_before;
}

// ../node_modules/stripe/esm/StripeMethod.js
function stripeMethod(spec) {
  if (spec.path !== void 0 && spec.fullPath !== void 0) {
    throw new Error(`Method spec specified both a 'path' (${spec.path}) and a 'fullPath' (${spec.fullPath}).`);
  }
  return function(...args) {
    const callback = typeof args[args.length - 1] == "function" && args.pop();
    spec.urlParams = extractUrlParams(spec.fullPath || this.createResourcePathWithSymbols(spec.path || ""));
    const requestPromise = callbackifyPromiseWithTimeout(this._makeRequest(args, spec, {}), callback);
    Object.assign(requestPromise, makeAutoPaginationMethods(this, args, spec, requestPromise));
    return requestPromise;
  };
}

// ../node_modules/stripe/esm/StripeResource.js
StripeResource.extend = protoExtend;
StripeResource.method = stripeMethod;
StripeResource.MAX_BUFFERED_REQUEST_METRICS = 100;
function StripeResource(stripe, deprecatedUrlData) {
  this._stripe = stripe;
  if (deprecatedUrlData) {
    throw new Error("Support for curried url params was dropped in stripe-node v7.0.0. Instead, pass two ids.");
  }
  this.basePath = makeURLInterpolator(
    // @ts-ignore changing type of basePath
    this.basePath || stripe.getApiField("basePath")
  );
  this.resourcePath = this.path;
  this.path = makeURLInterpolator(this.path);
  this.initialize(...arguments);
}
StripeResource.prototype = {
  _stripe: null,
  // @ts-ignore the type of path changes in ctor
  path: "",
  resourcePath: "",
  // Methods that don't use the API's default '/v1' path can override it with this setting.
  basePath: null,
  initialize() {
  },
  // Function to override the default data processor. This allows full control
  // over how a StripeResource's request data will get converted into an HTTP
  // body. This is useful for non-standard HTTP requests. The function should
  // take method name, data, and headers as arguments.
  requestDataProcessor: null,
  // Function to add a validation checks before sending the request, errors should
  // be thrown, and they will be passed to the callback/promise.
  validateRequest: null,
  createFullPath(commandPath, urlData) {
    const urlParts = [this.basePath(urlData), this.path(urlData)];
    if (typeof commandPath === "function") {
      const computedCommandPath = commandPath(urlData);
      if (computedCommandPath) {
        urlParts.push(computedCommandPath);
      }
    } else {
      urlParts.push(commandPath);
    }
    return this._joinUrlParts(urlParts);
  },
  // Creates a relative resource path with symbols left in (unlike
  // createFullPath which takes some data to replace them with). For example it
  // might produce: /invoices/{id}
  createResourcePathWithSymbols(pathWithSymbols) {
    if (pathWithSymbols) {
      return `/${this._joinUrlParts([this.resourcePath, pathWithSymbols])}`;
    } else {
      return `/${this.resourcePath}`;
    }
  },
  _joinUrlParts(parts) {
    return parts.join("/").replace(/\/{2,}/g, "/");
  },
  _getRequestOpts(requestArgs, spec, overrideData) {
    var _a;
    const requestMethod = (spec.method || "GET").toUpperCase();
    const usage = spec.usage || [];
    const urlParams = spec.urlParams || [];
    const encode3 = spec.encode || ((data2) => data2);
    const isUsingFullPath = !!spec.fullPath;
    const commandPath = makeURLInterpolator(isUsingFullPath ? spec.fullPath : spec.path || "");
    const path = isUsingFullPath ? spec.fullPath : this.createResourcePathWithSymbols(spec.path);
    const args = [].slice.call(requestArgs);
    const urlData = urlParams.reduce((urlData2, param) => {
      const arg = args.shift();
      if (typeof arg !== "string") {
        throw new Error(`Stripe: Argument "${param}" must be a string, but got: ${arg} (on API request to \`${requestMethod} ${path}\`)`);
      }
      urlData2[param] = arg;
      return urlData2;
    }, {});
    const dataFromArgs = getDataFromArgs(args);
    const data = encode3(Object.assign({}, dataFromArgs, overrideData));
    const options = getOptionsFromArgs(args);
    const host = options.host || spec.host;
    const streaming = !!spec.streaming || !!options.streaming;
    if (args.filter((x) => x != null).length) {
      throw new Error(`Stripe: Unknown arguments (${args}). Did you mean to pass an options object? See https://github.com/stripe/stripe-node/wiki/Passing-Options. (on API request to ${requestMethod} \`${path}\`)`);
    }
    const requestPath = isUsingFullPath ? commandPath(urlData) : this.createFullPath(commandPath, urlData);
    const headers = Object.assign(options.headers, spec.headers);
    if (spec.validator) {
      spec.validator(data, { headers });
    }
    const dataInQuery = spec.method === "GET" || spec.method === "DELETE";
    const bodyData = dataInQuery ? null : data;
    const queryData = dataInQuery ? data : {};
    return {
      requestMethod,
      requestPath,
      bodyData,
      queryData,
      authenticator: (_a = options.authenticator) !== null && _a !== void 0 ? _a : null,
      headers,
      host: host !== null && host !== void 0 ? host : null,
      streaming,
      settings: options.settings,
      usage
    };
  },
  _makeRequest(requestArgs, spec, overrideData) {
    return new Promise((resolve2, reject) => {
      var _a;
      let opts;
      try {
        opts = this._getRequestOpts(requestArgs, spec, overrideData);
      } catch (err) {
        reject(err);
        return;
      }
      function requestCallback(err, response) {
        if (err) {
          reject(err);
        } else {
          resolve2(spec.transformResponseData ? spec.transformResponseData(response) : response);
        }
      }
      const emptyQuery = Object.keys(opts.queryData).length === 0;
      const path = [
        opts.requestPath,
        emptyQuery ? "" : "?",
        queryStringifyRequestData(opts.queryData, getAPIMode(opts.requestPath))
      ].join("");
      const { headers, settings } = opts;
      this._stripe._requestSender._request(opts.requestMethod, opts.host, path, opts.bodyData, opts.authenticator, {
        headers,
        settings,
        streaming: opts.streaming
      }, opts.usage, requestCallback, (_a = this.requestDataProcessor) === null || _a === void 0 ? void 0 : _a.bind(this));
    });
  }
};

// ../node_modules/stripe/esm/Webhooks.js
function createWebhooks(platformFunctions) {
  const Webhook = {
    DEFAULT_TOLERANCE: 300,
    signature: null,
    constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      try {
        if (!this.signature) {
          throw new Error("ERR: missing signature helper, unable to verify");
        }
        this.signature.verifyHeader(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      } catch (e) {
        if (e instanceof CryptoProviderOnlySupportsAsyncError) {
          e.message += "\nUse `await constructEventAsync(...)` instead of `constructEvent(...)`";
        }
        throw e;
      }
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      return jsonPayload;
    },
    async constructEventAsync(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      if (!this.signature) {
        throw new Error("ERR: missing signature helper, unable to verify");
      }
      await this.signature.verifyHeaderAsync(payload, header, secret, tolerance || Webhook.DEFAULT_TOLERANCE, cryptoProvider, receivedAt);
      const jsonPayload = payload instanceof Uint8Array ? JSON.parse(new TextDecoder("utf8").decode(payload)) : JSON.parse(payload);
      return jsonPayload;
    },
    /**
     * Generates a header to be used for webhook mocking
     *
     * @typedef {object} opts
     * @property {number} timestamp - Timestamp of the header. Defaults to Date.now()
     * @property {string} payload - JSON stringified payload object, containing the 'id' and 'object' parameters
     * @property {string} secret - Stripe webhook secret 'whsec_...'
     * @property {string} scheme - Version of API to hit. Defaults to 'v1'.
     * @property {string} signature - Computed webhook signature
     * @property {CryptoProvider} cryptoProvider - Crypto provider to use for computing the signature if none was provided. Defaults to NodeCryptoProvider.
     */
    generateTestHeaderString: function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || preparedOpts.cryptoProvider.computeHMACSignature(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    },
    generateTestHeaderStringAsync: async function(opts) {
      const preparedOpts = prepareOptions(opts);
      const signature2 = preparedOpts.signature || await preparedOpts.cryptoProvider.computeHMACSignatureAsync(preparedOpts.payloadString, preparedOpts.secret);
      return preparedOpts.generateHeaderString(signature2);
    }
  };
  const signature = {
    EXPECTED_SCHEME: "v1",
    verifyHeader(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = cryptoProvider.computeHMACSignature(makeHMACContent(payload, details), secret);
      validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt);
      return true;
    },
    async verifyHeaderAsync(encodedPayload, encodedHeader, secret, tolerance, cryptoProvider, receivedAt) {
      const { decodedHeader: header, decodedPayload: payload, details, suspectPayloadType } = parseEventDetails(encodedPayload, encodedHeader, this.EXPECTED_SCHEME);
      const secretContainsWhitespace = /\s/.test(secret);
      cryptoProvider = cryptoProvider || getCryptoProvider();
      const expectedSignature = await cryptoProvider.computeHMACSignatureAsync(makeHMACContent(payload, details), secret);
      return validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt);
    }
  };
  function makeHMACContent(payload, details) {
    return `${details.timestamp}.${payload}`;
  }
  function parseEventDetails(encodedPayload, encodedHeader, expectedScheme) {
    if (!encodedPayload) {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No webhook payload was provided."
      });
    }
    const suspectPayloadType = typeof encodedPayload != "string" && !(encodedPayload instanceof Uint8Array);
    const textDecoder = new TextDecoder("utf8");
    const decodedPayload = encodedPayload instanceof Uint8Array ? textDecoder.decode(encodedPayload) : encodedPayload;
    if (Array.isArray(encodedHeader)) {
      throw new Error("Unexpected: An array was passed as a header, which should not be possible for the stripe-signature header.");
    }
    if (encodedHeader == null || encodedHeader == "") {
      throw new StripeSignatureVerificationError(encodedHeader, encodedPayload, {
        message: "No stripe-signature header value was provided."
      });
    }
    const decodedHeader = encodedHeader instanceof Uint8Array ? textDecoder.decode(encodedHeader) : encodedHeader;
    const details = parseHeader(decodedHeader, expectedScheme);
    if (!details || details.timestamp === -1) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "Unable to extract timestamp and signatures from header"
      });
    }
    if (!details.signatures.length) {
      throw new StripeSignatureVerificationError(decodedHeader, decodedPayload, {
        message: "No signatures found with expected scheme"
      });
    }
    return {
      decodedPayload,
      decodedHeader,
      details,
      suspectPayloadType
    };
  }
  function validateComputedSignature(payload, header, details, expectedSignature, tolerance, suspectPayloadType, secretContainsWhitespace, receivedAt) {
    const signatureFound = !!details.signatures.filter(platformFunctions.secureCompare.bind(platformFunctions, expectedSignature)).length;
    const docsLocation = "\nLearn more about webhook signing and explore webhook integration examples for various frameworks at https://docs.stripe.com/webhooks/signature";
    const whitespaceMessage = secretContainsWhitespace ? "\n\nNote: The provided signing secret contains whitespace. This often indicates an extra newline or space is in the value" : "";
    if (!signatureFound) {
      if (suspectPayloadType) {
        throw new StripeSignatureVerificationError(header, payload, {
          message: "Webhook payload must be provided as a string or a Buffer (https://nodejs.org/api/buffer.html) instance representing the _raw_ request body.Payload was provided as a parsed JavaScript object instead. \nSignature verification is impossible without access to the original signed material. \n" + docsLocation + "\n" + whitespaceMessage
        });
      }
      throw new StripeSignatureVerificationError(header, payload, {
        message: "No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe? \n If a webhook request is being forwarded by a third-party tool, ensure that the exact request body, including JSON formatting and new line style, is preserved.\n" + docsLocation + "\n" + whitespaceMessage
      });
    }
    const timestampAge = Math.floor((typeof receivedAt === "number" ? receivedAt : Date.now()) / 1e3) - details.timestamp;
    if (tolerance > 0 && timestampAge > tolerance) {
      throw new StripeSignatureVerificationError(header, payload, {
        message: "Timestamp outside the tolerance zone"
      });
    }
    return true;
  }
  function parseHeader(header, scheme) {
    if (typeof header !== "string") {
      return null;
    }
    return header.split(",").reduce((accum, item) => {
      const kv = item.split("=");
      if (kv[0] === "t") {
        accum.timestamp = parseInt(kv[1], 10);
      }
      if (kv[0] === scheme) {
        accum.signatures.push(kv[1]);
      }
      return accum;
    }, {
      timestamp: -1,
      signatures: []
    });
  }
  let webhooksCryptoProviderInstance = null;
  function getCryptoProvider() {
    if (!webhooksCryptoProviderInstance) {
      webhooksCryptoProviderInstance = platformFunctions.createDefaultCryptoProvider();
    }
    return webhooksCryptoProviderInstance;
  }
  function prepareOptions(opts) {
    if (!opts) {
      throw new StripeError({
        message: "Options are required"
      });
    }
    const timestamp = Math.floor(opts.timestamp) || Math.floor(Date.now() / 1e3);
    const scheme = opts.scheme || signature.EXPECTED_SCHEME;
    const cryptoProvider = opts.cryptoProvider || getCryptoProvider();
    const payloadString = `${timestamp}.${opts.payload}`;
    const generateHeaderString = (signature2) => {
      return `t=${timestamp},${scheme}=${signature2}`;
    };
    return Object.assign(Object.assign({}, opts), {
      timestamp,
      scheme,
      cryptoProvider,
      payloadString,
      generateHeaderString
    });
  }
  Webhook.signature = signature;
  return Webhook;
}

// ../node_modules/stripe/esm/apiVersion.js
var ApiVersion = "2025-08-27.basil";

// ../node_modules/stripe/esm/resources.js
var resources_exports = {};
__export(resources_exports, {
  Account: () => Accounts2,
  AccountLinks: () => AccountLinks,
  AccountSessions: () => AccountSessions,
  Accounts: () => Accounts2,
  ApplePayDomains: () => ApplePayDomains,
  ApplicationFees: () => ApplicationFees,
  Apps: () => Apps,
  Balance: () => Balance,
  BalanceTransactions: () => BalanceTransactions,
  Billing: () => Billing,
  BillingPortal: () => BillingPortal,
  Charges: () => Charges,
  Checkout: () => Checkout,
  Climate: () => Climate,
  ConfirmationTokens: () => ConfirmationTokens2,
  CountrySpecs: () => CountrySpecs,
  Coupons: () => Coupons,
  CreditNotes: () => CreditNotes,
  CustomerSessions: () => CustomerSessions,
  Customers: () => Customers2,
  Disputes: () => Disputes2,
  Entitlements: () => Entitlements,
  EphemeralKeys: () => EphemeralKeys,
  Events: () => Events2,
  ExchangeRates: () => ExchangeRates,
  FileLinks: () => FileLinks,
  Files: () => Files,
  FinancialConnections: () => FinancialConnections,
  Forwarding: () => Forwarding,
  Identity: () => Identity,
  InvoiceItems: () => InvoiceItems,
  InvoicePayments: () => InvoicePayments,
  InvoiceRenderingTemplates: () => InvoiceRenderingTemplates,
  Invoices: () => Invoices,
  Issuing: () => Issuing,
  Mandates: () => Mandates,
  OAuth: () => OAuth,
  PaymentIntents: () => PaymentIntents,
  PaymentLinks: () => PaymentLinks,
  PaymentMethodConfigurations: () => PaymentMethodConfigurations,
  PaymentMethodDomains: () => PaymentMethodDomains,
  PaymentMethods: () => PaymentMethods,
  Payouts: () => Payouts,
  Plans: () => Plans,
  Prices: () => Prices,
  Products: () => Products2,
  PromotionCodes: () => PromotionCodes,
  Quotes: () => Quotes,
  Radar: () => Radar,
  Refunds: () => Refunds2,
  Reporting: () => Reporting,
  Reviews: () => Reviews,
  SetupAttempts: () => SetupAttempts,
  SetupIntents: () => SetupIntents,
  ShippingRates: () => ShippingRates,
  Sigma: () => Sigma,
  Sources: () => Sources,
  SubscriptionItems: () => SubscriptionItems,
  SubscriptionSchedules: () => SubscriptionSchedules,
  Subscriptions: () => Subscriptions,
  Tax: () => Tax,
  TaxCodes: () => TaxCodes,
  TaxIds: () => TaxIds,
  TaxRates: () => TaxRates,
  Terminal: () => Terminal,
  TestHelpers: () => TestHelpers,
  Tokens: () => Tokens2,
  Topups: () => Topups,
  Transfers: () => Transfers,
  Treasury: () => Treasury,
  V2: () => V2,
  WebhookEndpoints: () => WebhookEndpoints
});

// ../node_modules/stripe/esm/ResourceNamespace.js
function ResourceNamespace(stripe, resources) {
  for (const name in resources) {
    if (!Object.prototype.hasOwnProperty.call(resources, name)) {
      continue;
    }
    const camelCaseName = name[0].toLowerCase() + name.substring(1);
    const resource = new resources[name](stripe);
    this[camelCaseName] = resource;
  }
}
function resourceNamespace(namespace, resources) {
  return function(stripe) {
    return new ResourceNamespace(stripe, resources);
  };
}

// ../node_modules/stripe/esm/resources/FinancialConnections/Accounts.js
var stripeMethod2 = StripeResource.method;
var Accounts = StripeResource.extend({
  retrieve: stripeMethod2({
    method: "GET",
    fullPath: "/v1/financial_connections/accounts/{account}"
  }),
  list: stripeMethod2({
    method: "GET",
    fullPath: "/v1/financial_connections/accounts",
    methodType: "list"
  }),
  disconnect: stripeMethod2({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/disconnect"
  }),
  listOwners: stripeMethod2({
    method: "GET",
    fullPath: "/v1/financial_connections/accounts/{account}/owners",
    methodType: "list"
  }),
  refresh: stripeMethod2({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/refresh"
  }),
  subscribe: stripeMethod2({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/subscribe"
  }),
  unsubscribe: stripeMethod2({
    method: "POST",
    fullPath: "/v1/financial_connections/accounts/{account}/unsubscribe"
  })
});

// ../node_modules/stripe/esm/resources/Entitlements/ActiveEntitlements.js
var stripeMethod3 = StripeResource.method;
var ActiveEntitlements = StripeResource.extend({
  retrieve: stripeMethod3({
    method: "GET",
    fullPath: "/v1/entitlements/active_entitlements/{id}"
  }),
  list: stripeMethod3({
    method: "GET",
    fullPath: "/v1/entitlements/active_entitlements",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Billing/Alerts.js
var stripeMethod4 = StripeResource.method;
var Alerts = StripeResource.extend({
  create: stripeMethod4({ method: "POST", fullPath: "/v1/billing/alerts" }),
  retrieve: stripeMethod4({ method: "GET", fullPath: "/v1/billing/alerts/{id}" }),
  list: stripeMethod4({
    method: "GET",
    fullPath: "/v1/billing/alerts",
    methodType: "list"
  }),
  activate: stripeMethod4({
    method: "POST",
    fullPath: "/v1/billing/alerts/{id}/activate"
  }),
  archive: stripeMethod4({
    method: "POST",
    fullPath: "/v1/billing/alerts/{id}/archive"
  }),
  deactivate: stripeMethod4({
    method: "POST",
    fullPath: "/v1/billing/alerts/{id}/deactivate"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/Authorizations.js
var stripeMethod5 = StripeResource.method;
var Authorizations = StripeResource.extend({
  retrieve: stripeMethod5({
    method: "GET",
    fullPath: "/v1/issuing/authorizations/{authorization}"
  }),
  update: stripeMethod5({
    method: "POST",
    fullPath: "/v1/issuing/authorizations/{authorization}"
  }),
  list: stripeMethod5({
    method: "GET",
    fullPath: "/v1/issuing/authorizations",
    methodType: "list"
  }),
  approve: stripeMethod5({
    method: "POST",
    fullPath: "/v1/issuing/authorizations/{authorization}/approve"
  }),
  decline: stripeMethod5({
    method: "POST",
    fullPath: "/v1/issuing/authorizations/{authorization}/decline"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Authorizations.js
var stripeMethod6 = StripeResource.method;
var Authorizations2 = StripeResource.extend({
  create: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations"
  }),
  capture: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/capture"
  }),
  expire: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/expire"
  }),
  finalizeAmount: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/finalize_amount"
  }),
  increment: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/increment"
  }),
  respond: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/fraud_challenges/respond"
  }),
  reverse: stripeMethod6({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/authorizations/{authorization}/reverse"
  })
});

// ../node_modules/stripe/esm/resources/Tax/Calculations.js
var stripeMethod7 = StripeResource.method;
var Calculations = StripeResource.extend({
  create: stripeMethod7({ method: "POST", fullPath: "/v1/tax/calculations" }),
  retrieve: stripeMethod7({
    method: "GET",
    fullPath: "/v1/tax/calculations/{calculation}"
  }),
  listLineItems: stripeMethod7({
    method: "GET",
    fullPath: "/v1/tax/calculations/{calculation}/line_items",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/Cardholders.js
var stripeMethod8 = StripeResource.method;
var Cardholders = StripeResource.extend({
  create: stripeMethod8({ method: "POST", fullPath: "/v1/issuing/cardholders" }),
  retrieve: stripeMethod8({
    method: "GET",
    fullPath: "/v1/issuing/cardholders/{cardholder}"
  }),
  update: stripeMethod8({
    method: "POST",
    fullPath: "/v1/issuing/cardholders/{cardholder}"
  }),
  list: stripeMethod8({
    method: "GET",
    fullPath: "/v1/issuing/cardholders",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/Cards.js
var stripeMethod9 = StripeResource.method;
var Cards = StripeResource.extend({
  create: stripeMethod9({ method: "POST", fullPath: "/v1/issuing/cards" }),
  retrieve: stripeMethod9({ method: "GET", fullPath: "/v1/issuing/cards/{card}" }),
  update: stripeMethod9({ method: "POST", fullPath: "/v1/issuing/cards/{card}" }),
  list: stripeMethod9({
    method: "GET",
    fullPath: "/v1/issuing/cards",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Cards.js
var stripeMethod10 = StripeResource.method;
var Cards2 = StripeResource.extend({
  deliverCard: stripeMethod10({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/deliver"
  }),
  failCard: stripeMethod10({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/fail"
  }),
  returnCard: stripeMethod10({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/return"
  }),
  shipCard: stripeMethod10({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/ship"
  }),
  submitCard: stripeMethod10({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/cards/{card}/shipping/submit"
  })
});

// ../node_modules/stripe/esm/resources/BillingPortal/Configurations.js
var stripeMethod11 = StripeResource.method;
var Configurations = StripeResource.extend({
  create: stripeMethod11({
    method: "POST",
    fullPath: "/v1/billing_portal/configurations"
  }),
  retrieve: stripeMethod11({
    method: "GET",
    fullPath: "/v1/billing_portal/configurations/{configuration}"
  }),
  update: stripeMethod11({
    method: "POST",
    fullPath: "/v1/billing_portal/configurations/{configuration}"
  }),
  list: stripeMethod11({
    method: "GET",
    fullPath: "/v1/billing_portal/configurations",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Terminal/Configurations.js
var stripeMethod12 = StripeResource.method;
var Configurations2 = StripeResource.extend({
  create: stripeMethod12({
    method: "POST",
    fullPath: "/v1/terminal/configurations"
  }),
  retrieve: stripeMethod12({
    method: "GET",
    fullPath: "/v1/terminal/configurations/{configuration}"
  }),
  update: stripeMethod12({
    method: "POST",
    fullPath: "/v1/terminal/configurations/{configuration}"
  }),
  list: stripeMethod12({
    method: "GET",
    fullPath: "/v1/terminal/configurations",
    methodType: "list"
  }),
  del: stripeMethod12({
    method: "DELETE",
    fullPath: "/v1/terminal/configurations/{configuration}"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/ConfirmationTokens.js
var stripeMethod13 = StripeResource.method;
var ConfirmationTokens = StripeResource.extend({
  create: stripeMethod13({
    method: "POST",
    fullPath: "/v1/test_helpers/confirmation_tokens"
  })
});

// ../node_modules/stripe/esm/resources/Terminal/ConnectionTokens.js
var stripeMethod14 = StripeResource.method;
var ConnectionTokens = StripeResource.extend({
  create: stripeMethod14({
    method: "POST",
    fullPath: "/v1/terminal/connection_tokens"
  })
});

// ../node_modules/stripe/esm/resources/Billing/CreditBalanceSummary.js
var stripeMethod15 = StripeResource.method;
var CreditBalanceSummary = StripeResource.extend({
  retrieve: stripeMethod15({
    method: "GET",
    fullPath: "/v1/billing/credit_balance_summary"
  })
});

// ../node_modules/stripe/esm/resources/Billing/CreditBalanceTransactions.js
var stripeMethod16 = StripeResource.method;
var CreditBalanceTransactions = StripeResource.extend({
  retrieve: stripeMethod16({
    method: "GET",
    fullPath: "/v1/billing/credit_balance_transactions/{id}"
  }),
  list: stripeMethod16({
    method: "GET",
    fullPath: "/v1/billing/credit_balance_transactions",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Billing/CreditGrants.js
var stripeMethod17 = StripeResource.method;
var CreditGrants = StripeResource.extend({
  create: stripeMethod17({ method: "POST", fullPath: "/v1/billing/credit_grants" }),
  retrieve: stripeMethod17({
    method: "GET",
    fullPath: "/v1/billing/credit_grants/{id}"
  }),
  update: stripeMethod17({
    method: "POST",
    fullPath: "/v1/billing/credit_grants/{id}"
  }),
  list: stripeMethod17({
    method: "GET",
    fullPath: "/v1/billing/credit_grants",
    methodType: "list"
  }),
  expire: stripeMethod17({
    method: "POST",
    fullPath: "/v1/billing/credit_grants/{id}/expire"
  }),
  voidGrant: stripeMethod17({
    method: "POST",
    fullPath: "/v1/billing/credit_grants/{id}/void"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/CreditReversals.js
var stripeMethod18 = StripeResource.method;
var CreditReversals = StripeResource.extend({
  create: stripeMethod18({
    method: "POST",
    fullPath: "/v1/treasury/credit_reversals"
  }),
  retrieve: stripeMethod18({
    method: "GET",
    fullPath: "/v1/treasury/credit_reversals/{credit_reversal}"
  }),
  list: stripeMethod18({
    method: "GET",
    fullPath: "/v1/treasury/credit_reversals",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Customers.js
var stripeMethod19 = StripeResource.method;
var Customers = StripeResource.extend({
  fundCashBalance: stripeMethod19({
    method: "POST",
    fullPath: "/v1/test_helpers/customers/{customer}/fund_cash_balance"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/DebitReversals.js
var stripeMethod20 = StripeResource.method;
var DebitReversals = StripeResource.extend({
  create: stripeMethod20({
    method: "POST",
    fullPath: "/v1/treasury/debit_reversals"
  }),
  retrieve: stripeMethod20({
    method: "GET",
    fullPath: "/v1/treasury/debit_reversals/{debit_reversal}"
  }),
  list: stripeMethod20({
    method: "GET",
    fullPath: "/v1/treasury/debit_reversals",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/Disputes.js
var stripeMethod21 = StripeResource.method;
var Disputes = StripeResource.extend({
  create: stripeMethod21({ method: "POST", fullPath: "/v1/issuing/disputes" }),
  retrieve: stripeMethod21({
    method: "GET",
    fullPath: "/v1/issuing/disputes/{dispute}"
  }),
  update: stripeMethod21({
    method: "POST",
    fullPath: "/v1/issuing/disputes/{dispute}"
  }),
  list: stripeMethod21({
    method: "GET",
    fullPath: "/v1/issuing/disputes",
    methodType: "list"
  }),
  submit: stripeMethod21({
    method: "POST",
    fullPath: "/v1/issuing/disputes/{dispute}/submit"
  })
});

// ../node_modules/stripe/esm/resources/Radar/EarlyFraudWarnings.js
var stripeMethod22 = StripeResource.method;
var EarlyFraudWarnings = StripeResource.extend({
  retrieve: stripeMethod22({
    method: "GET",
    fullPath: "/v1/radar/early_fraud_warnings/{early_fraud_warning}"
  }),
  list: stripeMethod22({
    method: "GET",
    fullPath: "/v1/radar/early_fraud_warnings",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/V2/Core/EventDestinations.js
var stripeMethod23 = StripeResource.method;
var EventDestinations = StripeResource.extend({
  create: stripeMethod23({
    method: "POST",
    fullPath: "/v2/core/event_destinations"
  }),
  retrieve: stripeMethod23({
    method: "GET",
    fullPath: "/v2/core/event_destinations/{id}"
  }),
  update: stripeMethod23({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}"
  }),
  list: stripeMethod23({
    method: "GET",
    fullPath: "/v2/core/event_destinations",
    methodType: "list"
  }),
  del: stripeMethod23({
    method: "DELETE",
    fullPath: "/v2/core/event_destinations/{id}"
  }),
  disable: stripeMethod23({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}/disable"
  }),
  enable: stripeMethod23({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}/enable"
  }),
  ping: stripeMethod23({
    method: "POST",
    fullPath: "/v2/core/event_destinations/{id}/ping"
  })
});

// ../node_modules/stripe/esm/resources/V2/Core/Events.js
var stripeMethod24 = StripeResource.method;
var Events = StripeResource.extend({
  retrieve(...args) {
    const transformResponseData = (response) => {
      return this.addFetchRelatedObjectIfNeeded(response);
    };
    return stripeMethod24({
      method: "GET",
      fullPath: "/v2/core/events/{id}",
      transformResponseData
    }).apply(this, args);
  },
  list(...args) {
    const transformResponseData = (response) => {
      return Object.assign(Object.assign({}, response), { data: response.data.map(this.addFetchRelatedObjectIfNeeded.bind(this)) });
    };
    return stripeMethod24({
      method: "GET",
      fullPath: "/v2/core/events",
      methodType: "list",
      transformResponseData
    }).apply(this, args);
  },
  /**
   * @private
   *
   * For internal use in stripe-node.
   *
   * @param pulledEvent The retrieved event object
   * @returns The retrieved event object with a fetchRelatedObject method,
   * if pulledEvent.related_object is valid (non-null and has a url)
   */
  addFetchRelatedObjectIfNeeded(pulledEvent) {
    if (!pulledEvent.related_object || !pulledEvent.related_object.url) {
      return pulledEvent;
    }
    return Object.assign(Object.assign({}, pulledEvent), { fetchRelatedObject: () => (
      // call stripeMethod with 'this' resource to fetch
      // the related object. 'this' is needed to construct
      // and send the request, but the method spec controls
      // the url endpoint and method, so it doesn't matter
      // that 'this' is an Events resource object here
      stripeMethod24({
        method: "GET",
        fullPath: pulledEvent.related_object.url
      }).apply(this, [
        {
          stripeAccount: pulledEvent.context
        }
      ])
    ) });
  }
});

// ../node_modules/stripe/esm/resources/Entitlements/Features.js
var stripeMethod25 = StripeResource.method;
var Features = StripeResource.extend({
  create: stripeMethod25({ method: "POST", fullPath: "/v1/entitlements/features" }),
  retrieve: stripeMethod25({
    method: "GET",
    fullPath: "/v1/entitlements/features/{id}"
  }),
  update: stripeMethod25({
    method: "POST",
    fullPath: "/v1/entitlements/features/{id}"
  }),
  list: stripeMethod25({
    method: "GET",
    fullPath: "/v1/entitlements/features",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/FinancialAccounts.js
var stripeMethod26 = StripeResource.method;
var FinancialAccounts = StripeResource.extend({
  create: stripeMethod26({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts"
  }),
  retrieve: stripeMethod26({
    method: "GET",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}"
  }),
  update: stripeMethod26({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}"
  }),
  list: stripeMethod26({
    method: "GET",
    fullPath: "/v1/treasury/financial_accounts",
    methodType: "list"
  }),
  close: stripeMethod26({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}/close"
  }),
  retrieveFeatures: stripeMethod26({
    method: "GET",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}/features"
  }),
  updateFeatures: stripeMethod26({
    method: "POST",
    fullPath: "/v1/treasury/financial_accounts/{financial_account}/features"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/InboundTransfers.js
var stripeMethod27 = StripeResource.method;
var InboundTransfers = StripeResource.extend({
  fail: stripeMethod27({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/fail"
  }),
  returnInboundTransfer: stripeMethod27({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/return"
  }),
  succeed: stripeMethod27({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/inbound_transfers/{id}/succeed"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/InboundTransfers.js
var stripeMethod28 = StripeResource.method;
var InboundTransfers2 = StripeResource.extend({
  create: stripeMethod28({
    method: "POST",
    fullPath: "/v1/treasury/inbound_transfers"
  }),
  retrieve: stripeMethod28({
    method: "GET",
    fullPath: "/v1/treasury/inbound_transfers/{id}"
  }),
  list: stripeMethod28({
    method: "GET",
    fullPath: "/v1/treasury/inbound_transfers",
    methodType: "list"
  }),
  cancel: stripeMethod28({
    method: "POST",
    fullPath: "/v1/treasury/inbound_transfers/{inbound_transfer}/cancel"
  })
});

// ../node_modules/stripe/esm/resources/Terminal/Locations.js
var stripeMethod29 = StripeResource.method;
var Locations = StripeResource.extend({
  create: stripeMethod29({ method: "POST", fullPath: "/v1/terminal/locations" }),
  retrieve: stripeMethod29({
    method: "GET",
    fullPath: "/v1/terminal/locations/{location}"
  }),
  update: stripeMethod29({
    method: "POST",
    fullPath: "/v1/terminal/locations/{location}"
  }),
  list: stripeMethod29({
    method: "GET",
    fullPath: "/v1/terminal/locations",
    methodType: "list"
  }),
  del: stripeMethod29({
    method: "DELETE",
    fullPath: "/v1/terminal/locations/{location}"
  })
});

// ../node_modules/stripe/esm/resources/Billing/MeterEventAdjustments.js
var stripeMethod30 = StripeResource.method;
var MeterEventAdjustments = StripeResource.extend({
  create: stripeMethod30({
    method: "POST",
    fullPath: "/v1/billing/meter_event_adjustments"
  })
});

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEventAdjustments.js
var stripeMethod31 = StripeResource.method;
var MeterEventAdjustments2 = StripeResource.extend({
  create: stripeMethod31({
    method: "POST",
    fullPath: "/v2/billing/meter_event_adjustments"
  })
});

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEventSession.js
var stripeMethod32 = StripeResource.method;
var MeterEventSession = StripeResource.extend({
  create: stripeMethod32({
    method: "POST",
    fullPath: "/v2/billing/meter_event_session"
  })
});

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEventStream.js
var stripeMethod33 = StripeResource.method;
var MeterEventStream = StripeResource.extend({
  create: stripeMethod33({
    method: "POST",
    fullPath: "/v2/billing/meter_event_stream",
    host: "meter-events.stripe.com"
  })
});

// ../node_modules/stripe/esm/resources/Billing/MeterEvents.js
var stripeMethod34 = StripeResource.method;
var MeterEvents = StripeResource.extend({
  create: stripeMethod34({ method: "POST", fullPath: "/v1/billing/meter_events" })
});

// ../node_modules/stripe/esm/resources/V2/Billing/MeterEvents.js
var stripeMethod35 = StripeResource.method;
var MeterEvents2 = StripeResource.extend({
  create: stripeMethod35({ method: "POST", fullPath: "/v2/billing/meter_events" })
});

// ../node_modules/stripe/esm/resources/Billing/Meters.js
var stripeMethod36 = StripeResource.method;
var Meters = StripeResource.extend({
  create: stripeMethod36({ method: "POST", fullPath: "/v1/billing/meters" }),
  retrieve: stripeMethod36({ method: "GET", fullPath: "/v1/billing/meters/{id}" }),
  update: stripeMethod36({ method: "POST", fullPath: "/v1/billing/meters/{id}" }),
  list: stripeMethod36({
    method: "GET",
    fullPath: "/v1/billing/meters",
    methodType: "list"
  }),
  deactivate: stripeMethod36({
    method: "POST",
    fullPath: "/v1/billing/meters/{id}/deactivate"
  }),
  listEventSummaries: stripeMethod36({
    method: "GET",
    fullPath: "/v1/billing/meters/{id}/event_summaries",
    methodType: "list"
  }),
  reactivate: stripeMethod36({
    method: "POST",
    fullPath: "/v1/billing/meters/{id}/reactivate"
  })
});

// ../node_modules/stripe/esm/resources/Climate/Orders.js
var stripeMethod37 = StripeResource.method;
var Orders = StripeResource.extend({
  create: stripeMethod37({ method: "POST", fullPath: "/v1/climate/orders" }),
  retrieve: stripeMethod37({
    method: "GET",
    fullPath: "/v1/climate/orders/{order}"
  }),
  update: stripeMethod37({
    method: "POST",
    fullPath: "/v1/climate/orders/{order}"
  }),
  list: stripeMethod37({
    method: "GET",
    fullPath: "/v1/climate/orders",
    methodType: "list"
  }),
  cancel: stripeMethod37({
    method: "POST",
    fullPath: "/v1/climate/orders/{order}/cancel"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundPayments.js
var stripeMethod38 = StripeResource.method;
var OutboundPayments = StripeResource.extend({
  update: stripeMethod38({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}"
  }),
  fail: stripeMethod38({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/fail"
  }),
  post: stripeMethod38({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/post"
  }),
  returnOutboundPayment: stripeMethod38({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_payments/{id}/return"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/OutboundPayments.js
var stripeMethod39 = StripeResource.method;
var OutboundPayments2 = StripeResource.extend({
  create: stripeMethod39({
    method: "POST",
    fullPath: "/v1/treasury/outbound_payments"
  }),
  retrieve: stripeMethod39({
    method: "GET",
    fullPath: "/v1/treasury/outbound_payments/{id}"
  }),
  list: stripeMethod39({
    method: "GET",
    fullPath: "/v1/treasury/outbound_payments",
    methodType: "list"
  }),
  cancel: stripeMethod39({
    method: "POST",
    fullPath: "/v1/treasury/outbound_payments/{id}/cancel"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/OutboundTransfers.js
var stripeMethod40 = StripeResource.method;
var OutboundTransfers = StripeResource.extend({
  update: stripeMethod40({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}"
  }),
  fail: stripeMethod40({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/fail"
  }),
  post: stripeMethod40({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/post"
  }),
  returnOutboundTransfer: stripeMethod40({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/outbound_transfers/{outbound_transfer}/return"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/OutboundTransfers.js
var stripeMethod41 = StripeResource.method;
var OutboundTransfers2 = StripeResource.extend({
  create: stripeMethod41({
    method: "POST",
    fullPath: "/v1/treasury/outbound_transfers"
  }),
  retrieve: stripeMethod41({
    method: "GET",
    fullPath: "/v1/treasury/outbound_transfers/{outbound_transfer}"
  }),
  list: stripeMethod41({
    method: "GET",
    fullPath: "/v1/treasury/outbound_transfers",
    methodType: "list"
  }),
  cancel: stripeMethod41({
    method: "POST",
    fullPath: "/v1/treasury/outbound_transfers/{outbound_transfer}/cancel"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/PersonalizationDesigns.js
var stripeMethod42 = StripeResource.method;
var PersonalizationDesigns = StripeResource.extend({
  create: stripeMethod42({
    method: "POST",
    fullPath: "/v1/issuing/personalization_designs"
  }),
  retrieve: stripeMethod42({
    method: "GET",
    fullPath: "/v1/issuing/personalization_designs/{personalization_design}"
  }),
  update: stripeMethod42({
    method: "POST",
    fullPath: "/v1/issuing/personalization_designs/{personalization_design}"
  }),
  list: stripeMethod42({
    method: "GET",
    fullPath: "/v1/issuing/personalization_designs",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/PersonalizationDesigns.js
var stripeMethod43 = StripeResource.method;
var PersonalizationDesigns2 = StripeResource.extend({
  activate: stripeMethod43({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/activate"
  }),
  deactivate: stripeMethod43({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/deactivate"
  }),
  reject: stripeMethod43({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/personalization_designs/{personalization_design}/reject"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/PhysicalBundles.js
var stripeMethod44 = StripeResource.method;
var PhysicalBundles = StripeResource.extend({
  retrieve: stripeMethod44({
    method: "GET",
    fullPath: "/v1/issuing/physical_bundles/{physical_bundle}"
  }),
  list: stripeMethod44({
    method: "GET",
    fullPath: "/v1/issuing/physical_bundles",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Climate/Products.js
var stripeMethod45 = StripeResource.method;
var Products = StripeResource.extend({
  retrieve: stripeMethod45({
    method: "GET",
    fullPath: "/v1/climate/products/{product}"
  }),
  list: stripeMethod45({
    method: "GET",
    fullPath: "/v1/climate/products",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Terminal/Readers.js
var stripeMethod46 = StripeResource.method;
var Readers = StripeResource.extend({
  create: stripeMethod46({ method: "POST", fullPath: "/v1/terminal/readers" }),
  retrieve: stripeMethod46({
    method: "GET",
    fullPath: "/v1/terminal/readers/{reader}"
  }),
  update: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}"
  }),
  list: stripeMethod46({
    method: "GET",
    fullPath: "/v1/terminal/readers",
    methodType: "list"
  }),
  del: stripeMethod46({
    method: "DELETE",
    fullPath: "/v1/terminal/readers/{reader}"
  }),
  cancelAction: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/cancel_action"
  }),
  collectInputs: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/collect_inputs"
  }),
  collectPaymentMethod: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/collect_payment_method"
  }),
  confirmPaymentIntent: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/confirm_payment_intent"
  }),
  processPaymentIntent: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/process_payment_intent"
  }),
  processSetupIntent: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/process_setup_intent"
  }),
  refundPayment: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/refund_payment"
  }),
  setReaderDisplay: stripeMethod46({
    method: "POST",
    fullPath: "/v1/terminal/readers/{reader}/set_reader_display"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Terminal/Readers.js
var stripeMethod47 = StripeResource.method;
var Readers2 = StripeResource.extend({
  presentPaymentMethod: stripeMethod47({
    method: "POST",
    fullPath: "/v1/test_helpers/terminal/readers/{reader}/present_payment_method"
  }),
  succeedInputCollection: stripeMethod47({
    method: "POST",
    fullPath: "/v1/test_helpers/terminal/readers/{reader}/succeed_input_collection"
  }),
  timeoutInputCollection: stripeMethod47({
    method: "POST",
    fullPath: "/v1/test_helpers/terminal/readers/{reader}/timeout_input_collection"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedCredits.js
var stripeMethod48 = StripeResource.method;
var ReceivedCredits = StripeResource.extend({
  create: stripeMethod48({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/received_credits"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/ReceivedCredits.js
var stripeMethod49 = StripeResource.method;
var ReceivedCredits2 = StripeResource.extend({
  retrieve: stripeMethod49({
    method: "GET",
    fullPath: "/v1/treasury/received_credits/{id}"
  }),
  list: stripeMethod49({
    method: "GET",
    fullPath: "/v1/treasury/received_credits",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Treasury/ReceivedDebits.js
var stripeMethod50 = StripeResource.method;
var ReceivedDebits = StripeResource.extend({
  create: stripeMethod50({
    method: "POST",
    fullPath: "/v1/test_helpers/treasury/received_debits"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/ReceivedDebits.js
var stripeMethod51 = StripeResource.method;
var ReceivedDebits2 = StripeResource.extend({
  retrieve: stripeMethod51({
    method: "GET",
    fullPath: "/v1/treasury/received_debits/{id}"
  }),
  list: stripeMethod51({
    method: "GET",
    fullPath: "/v1/treasury/received_debits",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Refunds.js
var stripeMethod52 = StripeResource.method;
var Refunds = StripeResource.extend({
  expire: stripeMethod52({
    method: "POST",
    fullPath: "/v1/test_helpers/refunds/{refund}/expire"
  })
});

// ../node_modules/stripe/esm/resources/Tax/Registrations.js
var stripeMethod53 = StripeResource.method;
var Registrations = StripeResource.extend({
  create: stripeMethod53({ method: "POST", fullPath: "/v1/tax/registrations" }),
  retrieve: stripeMethod53({
    method: "GET",
    fullPath: "/v1/tax/registrations/{id}"
  }),
  update: stripeMethod53({
    method: "POST",
    fullPath: "/v1/tax/registrations/{id}"
  }),
  list: stripeMethod53({
    method: "GET",
    fullPath: "/v1/tax/registrations",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Reporting/ReportRuns.js
var stripeMethod54 = StripeResource.method;
var ReportRuns = StripeResource.extend({
  create: stripeMethod54({ method: "POST", fullPath: "/v1/reporting/report_runs" }),
  retrieve: stripeMethod54({
    method: "GET",
    fullPath: "/v1/reporting/report_runs/{report_run}"
  }),
  list: stripeMethod54({
    method: "GET",
    fullPath: "/v1/reporting/report_runs",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Reporting/ReportTypes.js
var stripeMethod55 = StripeResource.method;
var ReportTypes = StripeResource.extend({
  retrieve: stripeMethod55({
    method: "GET",
    fullPath: "/v1/reporting/report_types/{report_type}"
  }),
  list: stripeMethod55({
    method: "GET",
    fullPath: "/v1/reporting/report_types",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Forwarding/Requests.js
var stripeMethod56 = StripeResource.method;
var Requests = StripeResource.extend({
  create: stripeMethod56({ method: "POST", fullPath: "/v1/forwarding/requests" }),
  retrieve: stripeMethod56({
    method: "GET",
    fullPath: "/v1/forwarding/requests/{id}"
  }),
  list: stripeMethod56({
    method: "GET",
    fullPath: "/v1/forwarding/requests",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Sigma/ScheduledQueryRuns.js
var stripeMethod57 = StripeResource.method;
var ScheduledQueryRuns = StripeResource.extend({
  retrieve: stripeMethod57({
    method: "GET",
    fullPath: "/v1/sigma/scheduled_query_runs/{scheduled_query_run}"
  }),
  list: stripeMethod57({
    method: "GET",
    fullPath: "/v1/sigma/scheduled_query_runs",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Apps/Secrets.js
var stripeMethod58 = StripeResource.method;
var Secrets = StripeResource.extend({
  create: stripeMethod58({ method: "POST", fullPath: "/v1/apps/secrets" }),
  list: stripeMethod58({
    method: "GET",
    fullPath: "/v1/apps/secrets",
    methodType: "list"
  }),
  deleteWhere: stripeMethod58({
    method: "POST",
    fullPath: "/v1/apps/secrets/delete"
  }),
  find: stripeMethod58({ method: "GET", fullPath: "/v1/apps/secrets/find" })
});

// ../node_modules/stripe/esm/resources/BillingPortal/Sessions.js
var stripeMethod59 = StripeResource.method;
var Sessions = StripeResource.extend({
  create: stripeMethod59({
    method: "POST",
    fullPath: "/v1/billing_portal/sessions"
  })
});

// ../node_modules/stripe/esm/resources/Checkout/Sessions.js
var stripeMethod60 = StripeResource.method;
var Sessions2 = StripeResource.extend({
  create: stripeMethod60({ method: "POST", fullPath: "/v1/checkout/sessions" }),
  retrieve: stripeMethod60({
    method: "GET",
    fullPath: "/v1/checkout/sessions/{session}"
  }),
  update: stripeMethod60({
    method: "POST",
    fullPath: "/v1/checkout/sessions/{session}"
  }),
  list: stripeMethod60({
    method: "GET",
    fullPath: "/v1/checkout/sessions",
    methodType: "list"
  }),
  expire: stripeMethod60({
    method: "POST",
    fullPath: "/v1/checkout/sessions/{session}/expire"
  }),
  listLineItems: stripeMethod60({
    method: "GET",
    fullPath: "/v1/checkout/sessions/{session}/line_items",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/FinancialConnections/Sessions.js
var stripeMethod61 = StripeResource.method;
var Sessions3 = StripeResource.extend({
  create: stripeMethod61({
    method: "POST",
    fullPath: "/v1/financial_connections/sessions"
  }),
  retrieve: stripeMethod61({
    method: "GET",
    fullPath: "/v1/financial_connections/sessions/{session}"
  })
});

// ../node_modules/stripe/esm/resources/Tax/Settings.js
var stripeMethod62 = StripeResource.method;
var Settings = StripeResource.extend({
  retrieve: stripeMethod62({ method: "GET", fullPath: "/v1/tax/settings" }),
  update: stripeMethod62({ method: "POST", fullPath: "/v1/tax/settings" })
});

// ../node_modules/stripe/esm/resources/Climate/Suppliers.js
var stripeMethod63 = StripeResource.method;
var Suppliers = StripeResource.extend({
  retrieve: stripeMethod63({
    method: "GET",
    fullPath: "/v1/climate/suppliers/{supplier}"
  }),
  list: stripeMethod63({
    method: "GET",
    fullPath: "/v1/climate/suppliers",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/TestClocks.js
var stripeMethod64 = StripeResource.method;
var TestClocks = StripeResource.extend({
  create: stripeMethod64({
    method: "POST",
    fullPath: "/v1/test_helpers/test_clocks"
  }),
  retrieve: stripeMethod64({
    method: "GET",
    fullPath: "/v1/test_helpers/test_clocks/{test_clock}"
  }),
  list: stripeMethod64({
    method: "GET",
    fullPath: "/v1/test_helpers/test_clocks",
    methodType: "list"
  }),
  del: stripeMethod64({
    method: "DELETE",
    fullPath: "/v1/test_helpers/test_clocks/{test_clock}"
  }),
  advance: stripeMethod64({
    method: "POST",
    fullPath: "/v1/test_helpers/test_clocks/{test_clock}/advance"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/Tokens.js
var stripeMethod65 = StripeResource.method;
var Tokens = StripeResource.extend({
  retrieve: stripeMethod65({
    method: "GET",
    fullPath: "/v1/issuing/tokens/{token}"
  }),
  update: stripeMethod65({
    method: "POST",
    fullPath: "/v1/issuing/tokens/{token}"
  }),
  list: stripeMethod65({
    method: "GET",
    fullPath: "/v1/issuing/tokens",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/TransactionEntries.js
var stripeMethod66 = StripeResource.method;
var TransactionEntries = StripeResource.extend({
  retrieve: stripeMethod66({
    method: "GET",
    fullPath: "/v1/treasury/transaction_entries/{id}"
  }),
  list: stripeMethod66({
    method: "GET",
    fullPath: "/v1/treasury/transaction_entries",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/FinancialConnections/Transactions.js
var stripeMethod67 = StripeResource.method;
var Transactions = StripeResource.extend({
  retrieve: stripeMethod67({
    method: "GET",
    fullPath: "/v1/financial_connections/transactions/{transaction}"
  }),
  list: stripeMethod67({
    method: "GET",
    fullPath: "/v1/financial_connections/transactions",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Issuing/Transactions.js
var stripeMethod68 = StripeResource.method;
var Transactions2 = StripeResource.extend({
  retrieve: stripeMethod68({
    method: "GET",
    fullPath: "/v1/issuing/transactions/{transaction}"
  }),
  update: stripeMethod68({
    method: "POST",
    fullPath: "/v1/issuing/transactions/{transaction}"
  }),
  list: stripeMethod68({
    method: "GET",
    fullPath: "/v1/issuing/transactions",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Tax/Transactions.js
var stripeMethod69 = StripeResource.method;
var Transactions3 = StripeResource.extend({
  retrieve: stripeMethod69({
    method: "GET",
    fullPath: "/v1/tax/transactions/{transaction}"
  }),
  createFromCalculation: stripeMethod69({
    method: "POST",
    fullPath: "/v1/tax/transactions/create_from_calculation"
  }),
  createReversal: stripeMethod69({
    method: "POST",
    fullPath: "/v1/tax/transactions/create_reversal"
  }),
  listLineItems: stripeMethod69({
    method: "GET",
    fullPath: "/v1/tax/transactions/{transaction}/line_items",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TestHelpers/Issuing/Transactions.js
var stripeMethod70 = StripeResource.method;
var Transactions4 = StripeResource.extend({
  createForceCapture: stripeMethod70({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/transactions/create_force_capture"
  }),
  createUnlinkedRefund: stripeMethod70({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/transactions/create_unlinked_refund"
  }),
  refund: stripeMethod70({
    method: "POST",
    fullPath: "/v1/test_helpers/issuing/transactions/{transaction}/refund"
  })
});

// ../node_modules/stripe/esm/resources/Treasury/Transactions.js
var stripeMethod71 = StripeResource.method;
var Transactions5 = StripeResource.extend({
  retrieve: stripeMethod71({
    method: "GET",
    fullPath: "/v1/treasury/transactions/{id}"
  }),
  list: stripeMethod71({
    method: "GET",
    fullPath: "/v1/treasury/transactions",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Radar/ValueListItems.js
var stripeMethod72 = StripeResource.method;
var ValueListItems = StripeResource.extend({
  create: stripeMethod72({
    method: "POST",
    fullPath: "/v1/radar/value_list_items"
  }),
  retrieve: stripeMethod72({
    method: "GET",
    fullPath: "/v1/radar/value_list_items/{item}"
  }),
  list: stripeMethod72({
    method: "GET",
    fullPath: "/v1/radar/value_list_items",
    methodType: "list"
  }),
  del: stripeMethod72({
    method: "DELETE",
    fullPath: "/v1/radar/value_list_items/{item}"
  })
});

// ../node_modules/stripe/esm/resources/Radar/ValueLists.js
var stripeMethod73 = StripeResource.method;
var ValueLists = StripeResource.extend({
  create: stripeMethod73({ method: "POST", fullPath: "/v1/radar/value_lists" }),
  retrieve: stripeMethod73({
    method: "GET",
    fullPath: "/v1/radar/value_lists/{value_list}"
  }),
  update: stripeMethod73({
    method: "POST",
    fullPath: "/v1/radar/value_lists/{value_list}"
  }),
  list: stripeMethod73({
    method: "GET",
    fullPath: "/v1/radar/value_lists",
    methodType: "list"
  }),
  del: stripeMethod73({
    method: "DELETE",
    fullPath: "/v1/radar/value_lists/{value_list}"
  })
});

// ../node_modules/stripe/esm/resources/Identity/VerificationReports.js
var stripeMethod74 = StripeResource.method;
var VerificationReports = StripeResource.extend({
  retrieve: stripeMethod74({
    method: "GET",
    fullPath: "/v1/identity/verification_reports/{report}"
  }),
  list: stripeMethod74({
    method: "GET",
    fullPath: "/v1/identity/verification_reports",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Identity/VerificationSessions.js
var stripeMethod75 = StripeResource.method;
var VerificationSessions = StripeResource.extend({
  create: stripeMethod75({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions"
  }),
  retrieve: stripeMethod75({
    method: "GET",
    fullPath: "/v1/identity/verification_sessions/{session}"
  }),
  update: stripeMethod75({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions/{session}"
  }),
  list: stripeMethod75({
    method: "GET",
    fullPath: "/v1/identity/verification_sessions",
    methodType: "list"
  }),
  cancel: stripeMethod75({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions/{session}/cancel"
  }),
  redact: stripeMethod75({
    method: "POST",
    fullPath: "/v1/identity/verification_sessions/{session}/redact"
  })
});

// ../node_modules/stripe/esm/resources/Accounts.js
var stripeMethod76 = StripeResource.method;
var Accounts2 = StripeResource.extend({
  create: stripeMethod76({ method: "POST", fullPath: "/v1/accounts" }),
  retrieve(id, ...args) {
    if (typeof id === "string") {
      return stripeMethod76({
        method: "GET",
        fullPath: "/v1/accounts/{id}"
      }).apply(this, [id, ...args]);
    } else {
      if (id === null || id === void 0) {
        [].shift.apply([id, ...args]);
      }
      return stripeMethod76({
        method: "GET",
        fullPath: "/v1/account"
      }).apply(this, [id, ...args]);
    }
  },
  update: stripeMethod76({ method: "POST", fullPath: "/v1/accounts/{account}" }),
  list: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts",
    methodType: "list"
  }),
  del: stripeMethod76({ method: "DELETE", fullPath: "/v1/accounts/{account}" }),
  createExternalAccount: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/external_accounts"
  }),
  createLoginLink: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/login_links"
  }),
  createPerson: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/persons"
  }),
  deleteExternalAccount: stripeMethod76({
    method: "DELETE",
    fullPath: "/v1/accounts/{account}/external_accounts/{id}"
  }),
  deletePerson: stripeMethod76({
    method: "DELETE",
    fullPath: "/v1/accounts/{account}/persons/{person}"
  }),
  listCapabilities: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts/{account}/capabilities",
    methodType: "list"
  }),
  listExternalAccounts: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts/{account}/external_accounts",
    methodType: "list"
  }),
  listPersons: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts/{account}/persons",
    methodType: "list"
  }),
  reject: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/reject"
  }),
  retrieveCurrent: stripeMethod76({ method: "GET", fullPath: "/v1/account" }),
  retrieveCapability: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts/{account}/capabilities/{capability}"
  }),
  retrieveExternalAccount: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts/{account}/external_accounts/{id}"
  }),
  retrievePerson: stripeMethod76({
    method: "GET",
    fullPath: "/v1/accounts/{account}/persons/{person}"
  }),
  updateCapability: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/capabilities/{capability}"
  }),
  updateExternalAccount: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/external_accounts/{id}"
  }),
  updatePerson: stripeMethod76({
    method: "POST",
    fullPath: "/v1/accounts/{account}/persons/{person}"
  })
});

// ../node_modules/stripe/esm/resources/AccountLinks.js
var stripeMethod77 = StripeResource.method;
var AccountLinks = StripeResource.extend({
  create: stripeMethod77({ method: "POST", fullPath: "/v1/account_links" })
});

// ../node_modules/stripe/esm/resources/AccountSessions.js
var stripeMethod78 = StripeResource.method;
var AccountSessions = StripeResource.extend({
  create: stripeMethod78({ method: "POST", fullPath: "/v1/account_sessions" })
});

// ../node_modules/stripe/esm/resources/ApplePayDomains.js
var stripeMethod79 = StripeResource.method;
var ApplePayDomains = StripeResource.extend({
  create: stripeMethod79({ method: "POST", fullPath: "/v1/apple_pay/domains" }),
  retrieve: stripeMethod79({
    method: "GET",
    fullPath: "/v1/apple_pay/domains/{domain}"
  }),
  list: stripeMethod79({
    method: "GET",
    fullPath: "/v1/apple_pay/domains",
    methodType: "list"
  }),
  del: stripeMethod79({
    method: "DELETE",
    fullPath: "/v1/apple_pay/domains/{domain}"
  })
});

// ../node_modules/stripe/esm/resources/ApplicationFees.js
var stripeMethod80 = StripeResource.method;
var ApplicationFees = StripeResource.extend({
  retrieve: stripeMethod80({
    method: "GET",
    fullPath: "/v1/application_fees/{id}"
  }),
  list: stripeMethod80({
    method: "GET",
    fullPath: "/v1/application_fees",
    methodType: "list"
  }),
  createRefund: stripeMethod80({
    method: "POST",
    fullPath: "/v1/application_fees/{id}/refunds"
  }),
  listRefunds: stripeMethod80({
    method: "GET",
    fullPath: "/v1/application_fees/{id}/refunds",
    methodType: "list"
  }),
  retrieveRefund: stripeMethod80({
    method: "GET",
    fullPath: "/v1/application_fees/{fee}/refunds/{id}"
  }),
  updateRefund: stripeMethod80({
    method: "POST",
    fullPath: "/v1/application_fees/{fee}/refunds/{id}"
  })
});

// ../node_modules/stripe/esm/resources/Balance.js
var stripeMethod81 = StripeResource.method;
var Balance = StripeResource.extend({
  retrieve: stripeMethod81({ method: "GET", fullPath: "/v1/balance" })
});

// ../node_modules/stripe/esm/resources/BalanceTransactions.js
var stripeMethod82 = StripeResource.method;
var BalanceTransactions = StripeResource.extend({
  retrieve: stripeMethod82({
    method: "GET",
    fullPath: "/v1/balance_transactions/{id}"
  }),
  list: stripeMethod82({
    method: "GET",
    fullPath: "/v1/balance_transactions",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Charges.js
var stripeMethod83 = StripeResource.method;
var Charges = StripeResource.extend({
  create: stripeMethod83({ method: "POST", fullPath: "/v1/charges" }),
  retrieve: stripeMethod83({ method: "GET", fullPath: "/v1/charges/{charge}" }),
  update: stripeMethod83({ method: "POST", fullPath: "/v1/charges/{charge}" }),
  list: stripeMethod83({
    method: "GET",
    fullPath: "/v1/charges",
    methodType: "list"
  }),
  capture: stripeMethod83({
    method: "POST",
    fullPath: "/v1/charges/{charge}/capture"
  }),
  search: stripeMethod83({
    method: "GET",
    fullPath: "/v1/charges/search",
    methodType: "search"
  })
});

// ../node_modules/stripe/esm/resources/ConfirmationTokens.js
var stripeMethod84 = StripeResource.method;
var ConfirmationTokens2 = StripeResource.extend({
  retrieve: stripeMethod84({
    method: "GET",
    fullPath: "/v1/confirmation_tokens/{confirmation_token}"
  })
});

// ../node_modules/stripe/esm/resources/CountrySpecs.js
var stripeMethod85 = StripeResource.method;
var CountrySpecs = StripeResource.extend({
  retrieve: stripeMethod85({
    method: "GET",
    fullPath: "/v1/country_specs/{country}"
  }),
  list: stripeMethod85({
    method: "GET",
    fullPath: "/v1/country_specs",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Coupons.js
var stripeMethod86 = StripeResource.method;
var Coupons = StripeResource.extend({
  create: stripeMethod86({ method: "POST", fullPath: "/v1/coupons" }),
  retrieve: stripeMethod86({ method: "GET", fullPath: "/v1/coupons/{coupon}" }),
  update: stripeMethod86({ method: "POST", fullPath: "/v1/coupons/{coupon}" }),
  list: stripeMethod86({
    method: "GET",
    fullPath: "/v1/coupons",
    methodType: "list"
  }),
  del: stripeMethod86({ method: "DELETE", fullPath: "/v1/coupons/{coupon}" })
});

// ../node_modules/stripe/esm/resources/CreditNotes.js
var stripeMethod87 = StripeResource.method;
var CreditNotes = StripeResource.extend({
  create: stripeMethod87({ method: "POST", fullPath: "/v1/credit_notes" }),
  retrieve: stripeMethod87({ method: "GET", fullPath: "/v1/credit_notes/{id}" }),
  update: stripeMethod87({ method: "POST", fullPath: "/v1/credit_notes/{id}" }),
  list: stripeMethod87({
    method: "GET",
    fullPath: "/v1/credit_notes",
    methodType: "list"
  }),
  listLineItems: stripeMethod87({
    method: "GET",
    fullPath: "/v1/credit_notes/{credit_note}/lines",
    methodType: "list"
  }),
  listPreviewLineItems: stripeMethod87({
    method: "GET",
    fullPath: "/v1/credit_notes/preview/lines",
    methodType: "list"
  }),
  preview: stripeMethod87({ method: "GET", fullPath: "/v1/credit_notes/preview" }),
  voidCreditNote: stripeMethod87({
    method: "POST",
    fullPath: "/v1/credit_notes/{id}/void"
  })
});

// ../node_modules/stripe/esm/resources/CustomerSessions.js
var stripeMethod88 = StripeResource.method;
var CustomerSessions = StripeResource.extend({
  create: stripeMethod88({ method: "POST", fullPath: "/v1/customer_sessions" })
});

// ../node_modules/stripe/esm/resources/Customers.js
var stripeMethod89 = StripeResource.method;
var Customers2 = StripeResource.extend({
  create: stripeMethod89({ method: "POST", fullPath: "/v1/customers" }),
  retrieve: stripeMethod89({ method: "GET", fullPath: "/v1/customers/{customer}" }),
  update: stripeMethod89({ method: "POST", fullPath: "/v1/customers/{customer}" }),
  list: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers",
    methodType: "list"
  }),
  del: stripeMethod89({ method: "DELETE", fullPath: "/v1/customers/{customer}" }),
  createBalanceTransaction: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/balance_transactions"
  }),
  createFundingInstructions: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/funding_instructions"
  }),
  createSource: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/sources"
  }),
  createTaxId: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/tax_ids"
  }),
  deleteDiscount: stripeMethod89({
    method: "DELETE",
    fullPath: "/v1/customers/{customer}/discount"
  }),
  deleteSource: stripeMethod89({
    method: "DELETE",
    fullPath: "/v1/customers/{customer}/sources/{id}"
  }),
  deleteTaxId: stripeMethod89({
    method: "DELETE",
    fullPath: "/v1/customers/{customer}/tax_ids/{id}"
  }),
  listBalanceTransactions: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/balance_transactions",
    methodType: "list"
  }),
  listCashBalanceTransactions: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/cash_balance_transactions",
    methodType: "list"
  }),
  listPaymentMethods: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/payment_methods",
    methodType: "list"
  }),
  listSources: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/sources",
    methodType: "list"
  }),
  listTaxIds: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/tax_ids",
    methodType: "list"
  }),
  retrieveBalanceTransaction: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/balance_transactions/{transaction}"
  }),
  retrieveCashBalance: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/cash_balance"
  }),
  retrieveCashBalanceTransaction: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/cash_balance_transactions/{transaction}"
  }),
  retrievePaymentMethod: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/payment_methods/{payment_method}"
  }),
  retrieveSource: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/sources/{id}"
  }),
  retrieveTaxId: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/{customer}/tax_ids/{id}"
  }),
  search: stripeMethod89({
    method: "GET",
    fullPath: "/v1/customers/search",
    methodType: "search"
  }),
  updateBalanceTransaction: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/balance_transactions/{transaction}"
  }),
  updateCashBalance: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/cash_balance"
  }),
  updateSource: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/sources/{id}"
  }),
  verifySource: stripeMethod89({
    method: "POST",
    fullPath: "/v1/customers/{customer}/sources/{id}/verify"
  })
});

// ../node_modules/stripe/esm/resources/Disputes.js
var stripeMethod90 = StripeResource.method;
var Disputes2 = StripeResource.extend({
  retrieve: stripeMethod90({ method: "GET", fullPath: "/v1/disputes/{dispute}" }),
  update: stripeMethod90({ method: "POST", fullPath: "/v1/disputes/{dispute}" }),
  list: stripeMethod90({
    method: "GET",
    fullPath: "/v1/disputes",
    methodType: "list"
  }),
  close: stripeMethod90({
    method: "POST",
    fullPath: "/v1/disputes/{dispute}/close"
  })
});

// ../node_modules/stripe/esm/resources/EphemeralKeys.js
var stripeMethod91 = StripeResource.method;
var EphemeralKeys = StripeResource.extend({
  create: stripeMethod91({
    method: "POST",
    fullPath: "/v1/ephemeral_keys",
    validator: (data, options) => {
      if (!options.headers || !options.headers["Stripe-Version"]) {
        throw new Error("Passing apiVersion in a separate options hash is required to create an ephemeral key. See https://stripe.com/docs/api/versioning?lang=node");
      }
    }
  }),
  del: stripeMethod91({ method: "DELETE", fullPath: "/v1/ephemeral_keys/{key}" })
});

// ../node_modules/stripe/esm/resources/Events.js
var stripeMethod92 = StripeResource.method;
var Events2 = StripeResource.extend({
  retrieve: stripeMethod92({ method: "GET", fullPath: "/v1/events/{id}" }),
  list: stripeMethod92({
    method: "GET",
    fullPath: "/v1/events",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/ExchangeRates.js
var stripeMethod93 = StripeResource.method;
var ExchangeRates = StripeResource.extend({
  retrieve: stripeMethod93({
    method: "GET",
    fullPath: "/v1/exchange_rates/{rate_id}"
  }),
  list: stripeMethod93({
    method: "GET",
    fullPath: "/v1/exchange_rates",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/FileLinks.js
var stripeMethod94 = StripeResource.method;
var FileLinks = StripeResource.extend({
  create: stripeMethod94({ method: "POST", fullPath: "/v1/file_links" }),
  retrieve: stripeMethod94({ method: "GET", fullPath: "/v1/file_links/{link}" }),
  update: stripeMethod94({ method: "POST", fullPath: "/v1/file_links/{link}" }),
  list: stripeMethod94({
    method: "GET",
    fullPath: "/v1/file_links",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/multipart.js
var multipartDataGenerator = (method, data, headers) => {
  const segno = (Math.round(Math.random() * 1e16) + Math.round(Math.random() * 1e16)).toString();
  headers["Content-Type"] = `multipart/form-data; boundary=${segno}`;
  const textEncoder = new TextEncoder();
  let buffer = new Uint8Array(0);
  const endBuffer = textEncoder.encode("\r\n");
  function push(l) {
    const prevBuffer = buffer;
    const newBuffer = l instanceof Uint8Array ? l : new Uint8Array(textEncoder.encode(l));
    buffer = new Uint8Array(prevBuffer.length + newBuffer.length + 2);
    buffer.set(prevBuffer);
    buffer.set(newBuffer, prevBuffer.length);
    buffer.set(endBuffer, buffer.length - 2);
  }
  function q(s) {
    return `"${s.replace(/"|"/g, "%22").replace(/\r\n|\r|\n/g, " ")}"`;
  }
  const flattenedData = flattenAndStringify(data);
  for (const k in flattenedData) {
    if (!Object.prototype.hasOwnProperty.call(flattenedData, k)) {
      continue;
    }
    const v = flattenedData[k];
    push(`--${segno}`);
    if (Object.prototype.hasOwnProperty.call(v, "data")) {
      const typedEntry = v;
      push(`Content-Disposition: form-data; name=${q(k)}; filename=${q(typedEntry.name || "blob")}`);
      push(`Content-Type: ${typedEntry.type || "application/octet-stream"}`);
      push("");
      push(typedEntry.data);
    } else {
      push(`Content-Disposition: form-data; name=${q(k)}`);
      push("");
      push(v);
    }
  }
  push(`--${segno}--`);
  return buffer;
};
function multipartRequestDataProcessor(method, data, headers, callback) {
  data = data || {};
  if (method !== "POST") {
    return callback(null, queryStringifyRequestData(data));
  }
  this._stripe._platformFunctions.tryBufferData(data).then((bufferedData) => {
    const buffer = multipartDataGenerator(method, bufferedData, headers);
    return callback(null, buffer);
  }).catch((err) => callback(err, null));
}

// ../node_modules/stripe/esm/resources/Files.js
var stripeMethod95 = StripeResource.method;
var Files = StripeResource.extend({
  create: stripeMethod95({
    method: "POST",
    fullPath: "/v1/files",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    host: "files.stripe.com"
  }),
  retrieve: stripeMethod95({ method: "GET", fullPath: "/v1/files/{file}" }),
  list: stripeMethod95({
    method: "GET",
    fullPath: "/v1/files",
    methodType: "list"
  }),
  requestDataProcessor: multipartRequestDataProcessor
});

// ../node_modules/stripe/esm/resources/InvoiceItems.js
var stripeMethod96 = StripeResource.method;
var InvoiceItems = StripeResource.extend({
  create: stripeMethod96({ method: "POST", fullPath: "/v1/invoiceitems" }),
  retrieve: stripeMethod96({
    method: "GET",
    fullPath: "/v1/invoiceitems/{invoiceitem}"
  }),
  update: stripeMethod96({
    method: "POST",
    fullPath: "/v1/invoiceitems/{invoiceitem}"
  }),
  list: stripeMethod96({
    method: "GET",
    fullPath: "/v1/invoiceitems",
    methodType: "list"
  }),
  del: stripeMethod96({
    method: "DELETE",
    fullPath: "/v1/invoiceitems/{invoiceitem}"
  })
});

// ../node_modules/stripe/esm/resources/InvoicePayments.js
var stripeMethod97 = StripeResource.method;
var InvoicePayments = StripeResource.extend({
  retrieve: stripeMethod97({
    method: "GET",
    fullPath: "/v1/invoice_payments/{invoice_payment}"
  }),
  list: stripeMethod97({
    method: "GET",
    fullPath: "/v1/invoice_payments",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/InvoiceRenderingTemplates.js
var stripeMethod98 = StripeResource.method;
var InvoiceRenderingTemplates = StripeResource.extend({
  retrieve: stripeMethod98({
    method: "GET",
    fullPath: "/v1/invoice_rendering_templates/{template}"
  }),
  list: stripeMethod98({
    method: "GET",
    fullPath: "/v1/invoice_rendering_templates",
    methodType: "list"
  }),
  archive: stripeMethod98({
    method: "POST",
    fullPath: "/v1/invoice_rendering_templates/{template}/archive"
  }),
  unarchive: stripeMethod98({
    method: "POST",
    fullPath: "/v1/invoice_rendering_templates/{template}/unarchive"
  })
});

// ../node_modules/stripe/esm/resources/Invoices.js
var stripeMethod99 = StripeResource.method;
var Invoices = StripeResource.extend({
  create: stripeMethod99({ method: "POST", fullPath: "/v1/invoices" }),
  retrieve: stripeMethod99({ method: "GET", fullPath: "/v1/invoices/{invoice}" }),
  update: stripeMethod99({ method: "POST", fullPath: "/v1/invoices/{invoice}" }),
  list: stripeMethod99({
    method: "GET",
    fullPath: "/v1/invoices",
    methodType: "list"
  }),
  del: stripeMethod99({ method: "DELETE", fullPath: "/v1/invoices/{invoice}" }),
  addLines: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/add_lines"
  }),
  attachPayment: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/attach_payment"
  }),
  createPreview: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/create_preview"
  }),
  finalizeInvoice: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/finalize"
  }),
  listLineItems: stripeMethod99({
    method: "GET",
    fullPath: "/v1/invoices/{invoice}/lines",
    methodType: "list"
  }),
  markUncollectible: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/mark_uncollectible"
  }),
  pay: stripeMethod99({ method: "POST", fullPath: "/v1/invoices/{invoice}/pay" }),
  removeLines: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/remove_lines"
  }),
  search: stripeMethod99({
    method: "GET",
    fullPath: "/v1/invoices/search",
    methodType: "search"
  }),
  sendInvoice: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/send"
  }),
  updateLines: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/update_lines"
  }),
  updateLineItem: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/lines/{line_item_id}"
  }),
  voidInvoice: stripeMethod99({
    method: "POST",
    fullPath: "/v1/invoices/{invoice}/void"
  })
});

// ../node_modules/stripe/esm/resources/Mandates.js
var stripeMethod100 = StripeResource.method;
var Mandates = StripeResource.extend({
  retrieve: stripeMethod100({ method: "GET", fullPath: "/v1/mandates/{mandate}" })
});

// ../node_modules/stripe/esm/resources/OAuth.js
var stripeMethod101 = StripeResource.method;
var oAuthHost = "connect.stripe.com";
var OAuth = StripeResource.extend({
  basePath: "/",
  authorizeUrl(params, options) {
    params = params || {};
    options = options || {};
    let path = "oauth/authorize";
    if (options.express) {
      path = `express/${path}`;
    }
    if (!params.response_type) {
      params.response_type = "code";
    }
    if (!params.client_id) {
      params.client_id = this._stripe.getClientId();
    }
    if (!params.scope) {
      params.scope = "read_write";
    }
    return `https://${oAuthHost}/${path}?${queryStringifyRequestData(params)}`;
  },
  token: stripeMethod101({
    method: "POST",
    path: "oauth/token",
    host: oAuthHost
  }),
  deauthorize(spec, ...args) {
    if (!spec.client_id) {
      spec.client_id = this._stripe.getClientId();
    }
    return stripeMethod101({
      method: "POST",
      path: "oauth/deauthorize",
      host: oAuthHost
    }).apply(this, [spec, ...args]);
  }
});

// ../node_modules/stripe/esm/resources/PaymentIntents.js
var stripeMethod102 = StripeResource.method;
var PaymentIntents = StripeResource.extend({
  create: stripeMethod102({ method: "POST", fullPath: "/v1/payment_intents" }),
  retrieve: stripeMethod102({
    method: "GET",
    fullPath: "/v1/payment_intents/{intent}"
  }),
  update: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}"
  }),
  list: stripeMethod102({
    method: "GET",
    fullPath: "/v1/payment_intents",
    methodType: "list"
  }),
  applyCustomerBalance: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/apply_customer_balance"
  }),
  cancel: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/cancel"
  }),
  capture: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/capture"
  }),
  confirm: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/confirm"
  }),
  incrementAuthorization: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/increment_authorization"
  }),
  search: stripeMethod102({
    method: "GET",
    fullPath: "/v1/payment_intents/search",
    methodType: "search"
  }),
  verifyMicrodeposits: stripeMethod102({
    method: "POST",
    fullPath: "/v1/payment_intents/{intent}/verify_microdeposits"
  })
});

// ../node_modules/stripe/esm/resources/PaymentLinks.js
var stripeMethod103 = StripeResource.method;
var PaymentLinks = StripeResource.extend({
  create: stripeMethod103({ method: "POST", fullPath: "/v1/payment_links" }),
  retrieve: stripeMethod103({
    method: "GET",
    fullPath: "/v1/payment_links/{payment_link}"
  }),
  update: stripeMethod103({
    method: "POST",
    fullPath: "/v1/payment_links/{payment_link}"
  }),
  list: stripeMethod103({
    method: "GET",
    fullPath: "/v1/payment_links",
    methodType: "list"
  }),
  listLineItems: stripeMethod103({
    method: "GET",
    fullPath: "/v1/payment_links/{payment_link}/line_items",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/PaymentMethodConfigurations.js
var stripeMethod104 = StripeResource.method;
var PaymentMethodConfigurations = StripeResource.extend({
  create: stripeMethod104({
    method: "POST",
    fullPath: "/v1/payment_method_configurations"
  }),
  retrieve: stripeMethod104({
    method: "GET",
    fullPath: "/v1/payment_method_configurations/{configuration}"
  }),
  update: stripeMethod104({
    method: "POST",
    fullPath: "/v1/payment_method_configurations/{configuration}"
  }),
  list: stripeMethod104({
    method: "GET",
    fullPath: "/v1/payment_method_configurations",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/PaymentMethodDomains.js
var stripeMethod105 = StripeResource.method;
var PaymentMethodDomains = StripeResource.extend({
  create: stripeMethod105({
    method: "POST",
    fullPath: "/v1/payment_method_domains"
  }),
  retrieve: stripeMethod105({
    method: "GET",
    fullPath: "/v1/payment_method_domains/{payment_method_domain}"
  }),
  update: stripeMethod105({
    method: "POST",
    fullPath: "/v1/payment_method_domains/{payment_method_domain}"
  }),
  list: stripeMethod105({
    method: "GET",
    fullPath: "/v1/payment_method_domains",
    methodType: "list"
  }),
  validate: stripeMethod105({
    method: "POST",
    fullPath: "/v1/payment_method_domains/{payment_method_domain}/validate"
  })
});

// ../node_modules/stripe/esm/resources/PaymentMethods.js
var stripeMethod106 = StripeResource.method;
var PaymentMethods = StripeResource.extend({
  create: stripeMethod106({ method: "POST", fullPath: "/v1/payment_methods" }),
  retrieve: stripeMethod106({
    method: "GET",
    fullPath: "/v1/payment_methods/{payment_method}"
  }),
  update: stripeMethod106({
    method: "POST",
    fullPath: "/v1/payment_methods/{payment_method}"
  }),
  list: stripeMethod106({
    method: "GET",
    fullPath: "/v1/payment_methods",
    methodType: "list"
  }),
  attach: stripeMethod106({
    method: "POST",
    fullPath: "/v1/payment_methods/{payment_method}/attach"
  }),
  detach: stripeMethod106({
    method: "POST",
    fullPath: "/v1/payment_methods/{payment_method}/detach"
  })
});

// ../node_modules/stripe/esm/resources/Payouts.js
var stripeMethod107 = StripeResource.method;
var Payouts = StripeResource.extend({
  create: stripeMethod107({ method: "POST", fullPath: "/v1/payouts" }),
  retrieve: stripeMethod107({ method: "GET", fullPath: "/v1/payouts/{payout}" }),
  update: stripeMethod107({ method: "POST", fullPath: "/v1/payouts/{payout}" }),
  list: stripeMethod107({
    method: "GET",
    fullPath: "/v1/payouts",
    methodType: "list"
  }),
  cancel: stripeMethod107({
    method: "POST",
    fullPath: "/v1/payouts/{payout}/cancel"
  }),
  reverse: stripeMethod107({
    method: "POST",
    fullPath: "/v1/payouts/{payout}/reverse"
  })
});

// ../node_modules/stripe/esm/resources/Plans.js
var stripeMethod108 = StripeResource.method;
var Plans = StripeResource.extend({
  create: stripeMethod108({ method: "POST", fullPath: "/v1/plans" }),
  retrieve: stripeMethod108({ method: "GET", fullPath: "/v1/plans/{plan}" }),
  update: stripeMethod108({ method: "POST", fullPath: "/v1/plans/{plan}" }),
  list: stripeMethod108({
    method: "GET",
    fullPath: "/v1/plans",
    methodType: "list"
  }),
  del: stripeMethod108({ method: "DELETE", fullPath: "/v1/plans/{plan}" })
});

// ../node_modules/stripe/esm/resources/Prices.js
var stripeMethod109 = StripeResource.method;
var Prices = StripeResource.extend({
  create: stripeMethod109({ method: "POST", fullPath: "/v1/prices" }),
  retrieve: stripeMethod109({ method: "GET", fullPath: "/v1/prices/{price}" }),
  update: stripeMethod109({ method: "POST", fullPath: "/v1/prices/{price}" }),
  list: stripeMethod109({
    method: "GET",
    fullPath: "/v1/prices",
    methodType: "list"
  }),
  search: stripeMethod109({
    method: "GET",
    fullPath: "/v1/prices/search",
    methodType: "search"
  })
});

// ../node_modules/stripe/esm/resources/Products.js
var stripeMethod110 = StripeResource.method;
var Products2 = StripeResource.extend({
  create: stripeMethod110({ method: "POST", fullPath: "/v1/products" }),
  retrieve: stripeMethod110({ method: "GET", fullPath: "/v1/products/{id}" }),
  update: stripeMethod110({ method: "POST", fullPath: "/v1/products/{id}" }),
  list: stripeMethod110({
    method: "GET",
    fullPath: "/v1/products",
    methodType: "list"
  }),
  del: stripeMethod110({ method: "DELETE", fullPath: "/v1/products/{id}" }),
  createFeature: stripeMethod110({
    method: "POST",
    fullPath: "/v1/products/{product}/features"
  }),
  deleteFeature: stripeMethod110({
    method: "DELETE",
    fullPath: "/v1/products/{product}/features/{id}"
  }),
  listFeatures: stripeMethod110({
    method: "GET",
    fullPath: "/v1/products/{product}/features",
    methodType: "list"
  }),
  retrieveFeature: stripeMethod110({
    method: "GET",
    fullPath: "/v1/products/{product}/features/{id}"
  }),
  search: stripeMethod110({
    method: "GET",
    fullPath: "/v1/products/search",
    methodType: "search"
  })
});

// ../node_modules/stripe/esm/resources/PromotionCodes.js
var stripeMethod111 = StripeResource.method;
var PromotionCodes = StripeResource.extend({
  create: stripeMethod111({ method: "POST", fullPath: "/v1/promotion_codes" }),
  retrieve: stripeMethod111({
    method: "GET",
    fullPath: "/v1/promotion_codes/{promotion_code}"
  }),
  update: stripeMethod111({
    method: "POST",
    fullPath: "/v1/promotion_codes/{promotion_code}"
  }),
  list: stripeMethod111({
    method: "GET",
    fullPath: "/v1/promotion_codes",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Quotes.js
var stripeMethod112 = StripeResource.method;
var Quotes = StripeResource.extend({
  create: stripeMethod112({ method: "POST", fullPath: "/v1/quotes" }),
  retrieve: stripeMethod112({ method: "GET", fullPath: "/v1/quotes/{quote}" }),
  update: stripeMethod112({ method: "POST", fullPath: "/v1/quotes/{quote}" }),
  list: stripeMethod112({
    method: "GET",
    fullPath: "/v1/quotes",
    methodType: "list"
  }),
  accept: stripeMethod112({ method: "POST", fullPath: "/v1/quotes/{quote}/accept" }),
  cancel: stripeMethod112({ method: "POST", fullPath: "/v1/quotes/{quote}/cancel" }),
  finalizeQuote: stripeMethod112({
    method: "POST",
    fullPath: "/v1/quotes/{quote}/finalize"
  }),
  listComputedUpfrontLineItems: stripeMethod112({
    method: "GET",
    fullPath: "/v1/quotes/{quote}/computed_upfront_line_items",
    methodType: "list"
  }),
  listLineItems: stripeMethod112({
    method: "GET",
    fullPath: "/v1/quotes/{quote}/line_items",
    methodType: "list"
  }),
  pdf: stripeMethod112({
    method: "GET",
    fullPath: "/v1/quotes/{quote}/pdf",
    host: "files.stripe.com",
    streaming: true
  })
});

// ../node_modules/stripe/esm/resources/Refunds.js
var stripeMethod113 = StripeResource.method;
var Refunds2 = StripeResource.extend({
  create: stripeMethod113({ method: "POST", fullPath: "/v1/refunds" }),
  retrieve: stripeMethod113({ method: "GET", fullPath: "/v1/refunds/{refund}" }),
  update: stripeMethod113({ method: "POST", fullPath: "/v1/refunds/{refund}" }),
  list: stripeMethod113({
    method: "GET",
    fullPath: "/v1/refunds",
    methodType: "list"
  }),
  cancel: stripeMethod113({
    method: "POST",
    fullPath: "/v1/refunds/{refund}/cancel"
  })
});

// ../node_modules/stripe/esm/resources/Reviews.js
var stripeMethod114 = StripeResource.method;
var Reviews = StripeResource.extend({
  retrieve: stripeMethod114({ method: "GET", fullPath: "/v1/reviews/{review}" }),
  list: stripeMethod114({
    method: "GET",
    fullPath: "/v1/reviews",
    methodType: "list"
  }),
  approve: stripeMethod114({
    method: "POST",
    fullPath: "/v1/reviews/{review}/approve"
  })
});

// ../node_modules/stripe/esm/resources/SetupAttempts.js
var stripeMethod115 = StripeResource.method;
var SetupAttempts = StripeResource.extend({
  list: stripeMethod115({
    method: "GET",
    fullPath: "/v1/setup_attempts",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/SetupIntents.js
var stripeMethod116 = StripeResource.method;
var SetupIntents = StripeResource.extend({
  create: stripeMethod116({ method: "POST", fullPath: "/v1/setup_intents" }),
  retrieve: stripeMethod116({
    method: "GET",
    fullPath: "/v1/setup_intents/{intent}"
  }),
  update: stripeMethod116({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}"
  }),
  list: stripeMethod116({
    method: "GET",
    fullPath: "/v1/setup_intents",
    methodType: "list"
  }),
  cancel: stripeMethod116({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}/cancel"
  }),
  confirm: stripeMethod116({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}/confirm"
  }),
  verifyMicrodeposits: stripeMethod116({
    method: "POST",
    fullPath: "/v1/setup_intents/{intent}/verify_microdeposits"
  })
});

// ../node_modules/stripe/esm/resources/ShippingRates.js
var stripeMethod117 = StripeResource.method;
var ShippingRates = StripeResource.extend({
  create: stripeMethod117({ method: "POST", fullPath: "/v1/shipping_rates" }),
  retrieve: stripeMethod117({
    method: "GET",
    fullPath: "/v1/shipping_rates/{shipping_rate_token}"
  }),
  update: stripeMethod117({
    method: "POST",
    fullPath: "/v1/shipping_rates/{shipping_rate_token}"
  }),
  list: stripeMethod117({
    method: "GET",
    fullPath: "/v1/shipping_rates",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Sources.js
var stripeMethod118 = StripeResource.method;
var Sources = StripeResource.extend({
  create: stripeMethod118({ method: "POST", fullPath: "/v1/sources" }),
  retrieve: stripeMethod118({ method: "GET", fullPath: "/v1/sources/{source}" }),
  update: stripeMethod118({ method: "POST", fullPath: "/v1/sources/{source}" }),
  listSourceTransactions: stripeMethod118({
    method: "GET",
    fullPath: "/v1/sources/{source}/source_transactions",
    methodType: "list"
  }),
  verify: stripeMethod118({
    method: "POST",
    fullPath: "/v1/sources/{source}/verify"
  })
});

// ../node_modules/stripe/esm/resources/SubscriptionItems.js
var stripeMethod119 = StripeResource.method;
var SubscriptionItems = StripeResource.extend({
  create: stripeMethod119({ method: "POST", fullPath: "/v1/subscription_items" }),
  retrieve: stripeMethod119({
    method: "GET",
    fullPath: "/v1/subscription_items/{item}"
  }),
  update: stripeMethod119({
    method: "POST",
    fullPath: "/v1/subscription_items/{item}"
  }),
  list: stripeMethod119({
    method: "GET",
    fullPath: "/v1/subscription_items",
    methodType: "list"
  }),
  del: stripeMethod119({
    method: "DELETE",
    fullPath: "/v1/subscription_items/{item}"
  })
});

// ../node_modules/stripe/esm/resources/SubscriptionSchedules.js
var stripeMethod120 = StripeResource.method;
var SubscriptionSchedules = StripeResource.extend({
  create: stripeMethod120({
    method: "POST",
    fullPath: "/v1/subscription_schedules"
  }),
  retrieve: stripeMethod120({
    method: "GET",
    fullPath: "/v1/subscription_schedules/{schedule}"
  }),
  update: stripeMethod120({
    method: "POST",
    fullPath: "/v1/subscription_schedules/{schedule}"
  }),
  list: stripeMethod120({
    method: "GET",
    fullPath: "/v1/subscription_schedules",
    methodType: "list"
  }),
  cancel: stripeMethod120({
    method: "POST",
    fullPath: "/v1/subscription_schedules/{schedule}/cancel"
  }),
  release: stripeMethod120({
    method: "POST",
    fullPath: "/v1/subscription_schedules/{schedule}/release"
  })
});

// ../node_modules/stripe/esm/resources/Subscriptions.js
var stripeMethod121 = StripeResource.method;
var Subscriptions = StripeResource.extend({
  create: stripeMethod121({ method: "POST", fullPath: "/v1/subscriptions" }),
  retrieve: stripeMethod121({
    method: "GET",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}"
  }),
  update: stripeMethod121({
    method: "POST",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}"
  }),
  list: stripeMethod121({
    method: "GET",
    fullPath: "/v1/subscriptions",
    methodType: "list"
  }),
  cancel: stripeMethod121({
    method: "DELETE",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}"
  }),
  deleteDiscount: stripeMethod121({
    method: "DELETE",
    fullPath: "/v1/subscriptions/{subscription_exposed_id}/discount"
  }),
  migrate: stripeMethod121({
    method: "POST",
    fullPath: "/v1/subscriptions/{subscription}/migrate"
  }),
  resume: stripeMethod121({
    method: "POST",
    fullPath: "/v1/subscriptions/{subscription}/resume"
  }),
  search: stripeMethod121({
    method: "GET",
    fullPath: "/v1/subscriptions/search",
    methodType: "search"
  })
});

// ../node_modules/stripe/esm/resources/TaxCodes.js
var stripeMethod122 = StripeResource.method;
var TaxCodes = StripeResource.extend({
  retrieve: stripeMethod122({ method: "GET", fullPath: "/v1/tax_codes/{id}" }),
  list: stripeMethod122({
    method: "GET",
    fullPath: "/v1/tax_codes",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/TaxIds.js
var stripeMethod123 = StripeResource.method;
var TaxIds = StripeResource.extend({
  create: stripeMethod123({ method: "POST", fullPath: "/v1/tax_ids" }),
  retrieve: stripeMethod123({ method: "GET", fullPath: "/v1/tax_ids/{id}" }),
  list: stripeMethod123({
    method: "GET",
    fullPath: "/v1/tax_ids",
    methodType: "list"
  }),
  del: stripeMethod123({ method: "DELETE", fullPath: "/v1/tax_ids/{id}" })
});

// ../node_modules/stripe/esm/resources/TaxRates.js
var stripeMethod124 = StripeResource.method;
var TaxRates = StripeResource.extend({
  create: stripeMethod124({ method: "POST", fullPath: "/v1/tax_rates" }),
  retrieve: stripeMethod124({ method: "GET", fullPath: "/v1/tax_rates/{tax_rate}" }),
  update: stripeMethod124({ method: "POST", fullPath: "/v1/tax_rates/{tax_rate}" }),
  list: stripeMethod124({
    method: "GET",
    fullPath: "/v1/tax_rates",
    methodType: "list"
  })
});

// ../node_modules/stripe/esm/resources/Tokens.js
var stripeMethod125 = StripeResource.method;
var Tokens2 = StripeResource.extend({
  create: stripeMethod125({ method: "POST", fullPath: "/v1/tokens" }),
  retrieve: stripeMethod125({ method: "GET", fullPath: "/v1/tokens/{token}" })
});

// ../node_modules/stripe/esm/resources/Topups.js
var stripeMethod126 = StripeResource.method;
var Topups = StripeResource.extend({
  create: stripeMethod126({ method: "POST", fullPath: "/v1/topups" }),
  retrieve: stripeMethod126({ method: "GET", fullPath: "/v1/topups/{topup}" }),
  update: stripeMethod126({ method: "POST", fullPath: "/v1/topups/{topup}" }),
  list: stripeMethod126({
    method: "GET",
    fullPath: "/v1/topups",
    methodType: "list"
  }),
  cancel: stripeMethod126({ method: "POST", fullPath: "/v1/topups/{topup}/cancel" })
});

// ../node_modules/stripe/esm/resources/Transfers.js
var stripeMethod127 = StripeResource.method;
var Transfers = StripeResource.extend({
  create: stripeMethod127({ method: "POST", fullPath: "/v1/transfers" }),
  retrieve: stripeMethod127({ method: "GET", fullPath: "/v1/transfers/{transfer}" }),
  update: stripeMethod127({ method: "POST", fullPath: "/v1/transfers/{transfer}" }),
  list: stripeMethod127({
    method: "GET",
    fullPath: "/v1/transfers",
    methodType: "list"
  }),
  createReversal: stripeMethod127({
    method: "POST",
    fullPath: "/v1/transfers/{id}/reversals"
  }),
  listReversals: stripeMethod127({
    method: "GET",
    fullPath: "/v1/transfers/{id}/reversals",
    methodType: "list"
  }),
  retrieveReversal: stripeMethod127({
    method: "GET",
    fullPath: "/v1/transfers/{transfer}/reversals/{id}"
  }),
  updateReversal: stripeMethod127({
    method: "POST",
    fullPath: "/v1/transfers/{transfer}/reversals/{id}"
  })
});

// ../node_modules/stripe/esm/resources/WebhookEndpoints.js
var stripeMethod128 = StripeResource.method;
var WebhookEndpoints = StripeResource.extend({
  create: stripeMethod128({ method: "POST", fullPath: "/v1/webhook_endpoints" }),
  retrieve: stripeMethod128({
    method: "GET",
    fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
  }),
  update: stripeMethod128({
    method: "POST",
    fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
  }),
  list: stripeMethod128({
    method: "GET",
    fullPath: "/v1/webhook_endpoints",
    methodType: "list"
  }),
  del: stripeMethod128({
    method: "DELETE",
    fullPath: "/v1/webhook_endpoints/{webhook_endpoint}"
  })
});

// ../node_modules/stripe/esm/resources.js
var Apps = resourceNamespace("apps", { Secrets });
var Billing = resourceNamespace("billing", {
  Alerts,
  CreditBalanceSummary,
  CreditBalanceTransactions,
  CreditGrants,
  MeterEventAdjustments,
  MeterEvents,
  Meters
});
var BillingPortal = resourceNamespace("billingPortal", {
  Configurations,
  Sessions
});
var Checkout = resourceNamespace("checkout", {
  Sessions: Sessions2
});
var Climate = resourceNamespace("climate", {
  Orders,
  Products,
  Suppliers
});
var Entitlements = resourceNamespace("entitlements", {
  ActiveEntitlements,
  Features
});
var FinancialConnections = resourceNamespace("financialConnections", {
  Accounts,
  Sessions: Sessions3,
  Transactions
});
var Forwarding = resourceNamespace("forwarding", {
  Requests
});
var Identity = resourceNamespace("identity", {
  VerificationReports,
  VerificationSessions
});
var Issuing = resourceNamespace("issuing", {
  Authorizations,
  Cardholders,
  Cards,
  Disputes,
  PersonalizationDesigns,
  PhysicalBundles,
  Tokens,
  Transactions: Transactions2
});
var Radar = resourceNamespace("radar", {
  EarlyFraudWarnings,
  ValueListItems,
  ValueLists
});
var Reporting = resourceNamespace("reporting", {
  ReportRuns,
  ReportTypes
});
var Sigma = resourceNamespace("sigma", {
  ScheduledQueryRuns
});
var Tax = resourceNamespace("tax", {
  Calculations,
  Registrations,
  Settings,
  Transactions: Transactions3
});
var Terminal = resourceNamespace("terminal", {
  Configurations: Configurations2,
  ConnectionTokens,
  Locations,
  Readers
});
var TestHelpers = resourceNamespace("testHelpers", {
  ConfirmationTokens,
  Customers,
  Refunds,
  TestClocks,
  Issuing: resourceNamespace("issuing", {
    Authorizations: Authorizations2,
    Cards: Cards2,
    PersonalizationDesigns: PersonalizationDesigns2,
    Transactions: Transactions4
  }),
  Terminal: resourceNamespace("terminal", {
    Readers: Readers2
  }),
  Treasury: resourceNamespace("treasury", {
    InboundTransfers,
    OutboundPayments,
    OutboundTransfers,
    ReceivedCredits,
    ReceivedDebits
  })
});
var Treasury = resourceNamespace("treasury", {
  CreditReversals,
  DebitReversals,
  FinancialAccounts,
  InboundTransfers: InboundTransfers2,
  OutboundPayments: OutboundPayments2,
  OutboundTransfers: OutboundTransfers2,
  ReceivedCredits: ReceivedCredits2,
  ReceivedDebits: ReceivedDebits2,
  TransactionEntries,
  Transactions: Transactions5
});
var V2 = resourceNamespace("v2", {
  Billing: resourceNamespace("billing", {
    MeterEventAdjustments: MeterEventAdjustments2,
    MeterEventSession,
    MeterEventStream,
    MeterEvents: MeterEvents2
  }),
  Core: resourceNamespace("core", {
    EventDestinations,
    Events
  })
});

// ../node_modules/stripe/esm/stripe.core.js
var DEFAULT_HOST = "api.stripe.com";
var DEFAULT_PORT = "443";
var DEFAULT_BASE_PATH = "/v1/";
var DEFAULT_API_VERSION = ApiVersion;
var DEFAULT_TIMEOUT = 8e4;
var MAX_NETWORK_RETRY_DELAY_SEC = 5;
var INITIAL_NETWORK_RETRY_DELAY_SEC = 0.5;
var APP_INFO_PROPERTIES = ["name", "version", "url", "partner_id"];
var ALLOWED_CONFIG_PROPERTIES = [
  "authenticator",
  "apiVersion",
  "typescript",
  "maxNetworkRetries",
  "httpAgent",
  "httpClient",
  "timeout",
  "host",
  "port",
  "protocol",
  "telemetry",
  "appInfo",
  "stripeAccount",
  "stripeContext"
];
var defaultRequestSenderFactory = (stripe) => new RequestSender(stripe, StripeResource.MAX_BUFFERED_REQUEST_METRICS);
function createStripe(platformFunctions, requestSender = defaultRequestSenderFactory) {
  Stripe2.PACKAGE_VERSION = "18.5.0";
  Stripe2.API_VERSION = ApiVersion;
  Stripe2.USER_AGENT = Object.assign({ bindings_version: Stripe2.PACKAGE_VERSION, lang: "node", publisher: "stripe", uname: null, typescript: false }, determineProcessUserAgentProperties());
  Stripe2.StripeResource = StripeResource;
  Stripe2.resources = resources_exports;
  Stripe2.HttpClient = HttpClient;
  Stripe2.HttpClientResponse = HttpClientResponse;
  Stripe2.CryptoProvider = CryptoProvider;
  Stripe2.webhooks = createWebhooks(platformFunctions);
  function Stripe2(key, config = {}) {
    if (!(this instanceof Stripe2)) {
      return new Stripe2(key, config);
    }
    const props = this._getPropsFromConfig(config);
    this._platformFunctions = platformFunctions;
    Object.defineProperty(this, "_emitter", {
      value: this._platformFunctions.createEmitter(),
      enumerable: false,
      configurable: false,
      writable: false
    });
    this.VERSION = Stripe2.PACKAGE_VERSION;
    this.on = this._emitter.on.bind(this._emitter);
    this.once = this._emitter.once.bind(this._emitter);
    this.off = this._emitter.removeListener.bind(this._emitter);
    const agent = props.httpAgent || null;
    this._api = {
      host: props.host || DEFAULT_HOST,
      port: props.port || DEFAULT_PORT,
      protocol: props.protocol || "https",
      basePath: DEFAULT_BASE_PATH,
      version: props.apiVersion || DEFAULT_API_VERSION,
      timeout: validateInteger("timeout", props.timeout, DEFAULT_TIMEOUT),
      maxNetworkRetries: validateInteger("maxNetworkRetries", props.maxNetworkRetries, 2),
      agent,
      httpClient: props.httpClient || (agent ? this._platformFunctions.createNodeHttpClient(agent) : this._platformFunctions.createDefaultHttpClient()),
      dev: false,
      stripeAccount: props.stripeAccount || null,
      stripeContext: props.stripeContext || null
    };
    const typescript = props.typescript || false;
    if (typescript !== Stripe2.USER_AGENT.typescript) {
      Stripe2.USER_AGENT.typescript = typescript;
    }
    if (props.appInfo) {
      this._setAppInfo(props.appInfo);
    }
    this._prepResources();
    this._setAuthenticator(key, props.authenticator);
    this.errors = Error_exports;
    this.webhooks = Stripe2.webhooks;
    this._prevRequestMetrics = [];
    this._enableTelemetry = props.telemetry !== false;
    this._requestSender = requestSender(this);
    this.StripeResource = Stripe2.StripeResource;
  }
  Stripe2.errors = Error_exports;
  Stripe2.createNodeHttpClient = platformFunctions.createNodeHttpClient;
  Stripe2.createFetchHttpClient = platformFunctions.createFetchHttpClient;
  Stripe2.createNodeCryptoProvider = platformFunctions.createNodeCryptoProvider;
  Stripe2.createSubtleCryptoProvider = platformFunctions.createSubtleCryptoProvider;
  Stripe2.prototype = {
    // Properties are set in the constructor above
    _appInfo: void 0,
    on: null,
    off: null,
    once: null,
    VERSION: null,
    StripeResource: null,
    webhooks: null,
    errors: null,
    _api: null,
    _prevRequestMetrics: null,
    _emitter: null,
    _enableTelemetry: null,
    _requestSender: null,
    _platformFunctions: null,
    rawRequest(method, path, params, options) {
      return this._requestSender._rawRequest(method, path, params, options);
    },
    /**
     * @private
     */
    _setAuthenticator(key, authenticator) {
      if (key && authenticator) {
        throw new Error("Can't specify both apiKey and authenticator");
      }
      if (!key && !authenticator) {
        throw new Error("Neither apiKey nor config.authenticator provided");
      }
      this._authenticator = key ? createApiKeyAuthenticator(key) : authenticator;
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setAppInfo(info) {
      if (info && typeof info !== "object") {
        throw new Error("AppInfo must be an object.");
      }
      if (info && !info.name) {
        throw new Error("AppInfo.name is required");
      }
      info = info || {};
      this._appInfo = APP_INFO_PROPERTIES.reduce((accum, prop) => {
        if (typeof info[prop] == "string") {
          accum = accum || {};
          accum[prop] = info[prop];
        }
        return accum;
      }, {});
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setApiField(key, value) {
      this._api[key] = value;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getApiField(key) {
      return this._api[key];
    },
    setClientId(clientId) {
      this._clientId = clientId;
    },
    getClientId() {
      return this._clientId;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getConstant: (c) => {
      switch (c) {
        case "DEFAULT_HOST":
          return DEFAULT_HOST;
        case "DEFAULT_PORT":
          return DEFAULT_PORT;
        case "DEFAULT_BASE_PATH":
          return DEFAULT_BASE_PATH;
        case "DEFAULT_API_VERSION":
          return DEFAULT_API_VERSION;
        case "DEFAULT_TIMEOUT":
          return DEFAULT_TIMEOUT;
        case "MAX_NETWORK_RETRY_DELAY_SEC":
          return MAX_NETWORK_RETRY_DELAY_SEC;
        case "INITIAL_NETWORK_RETRY_DELAY_SEC":
          return INITIAL_NETWORK_RETRY_DELAY_SEC;
      }
      return Stripe2[c];
    },
    getMaxNetworkRetries() {
      return this.getApiField("maxNetworkRetries");
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _setApiNumberField(prop, n, defaultVal) {
      const val = validateInteger(prop, n, defaultVal);
      this._setApiField(prop, val);
    },
    getMaxNetworkRetryDelay() {
      return MAX_NETWORK_RETRY_DELAY_SEC;
    },
    getInitialNetworkRetryDelay() {
      return INITIAL_NETWORK_RETRY_DELAY_SEC;
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent and uses a cached version for a slight
     * speed advantage.
     */
    getClientUserAgent(cb) {
      return this.getClientUserAgentSeeded(Stripe2.USER_AGENT, cb);
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     *
     * Gets a JSON version of a User-Agent by encoding a seeded object and
     * fetching a uname from the system.
     */
    getClientUserAgentSeeded(seed, cb) {
      this._platformFunctions.getUname().then((uname) => {
        var _a;
        const userAgent = {};
        for (const field in seed) {
          if (!Object.prototype.hasOwnProperty.call(seed, field)) {
            continue;
          }
          userAgent[field] = encodeURIComponent((_a = seed[field]) !== null && _a !== void 0 ? _a : "null");
        }
        userAgent.uname = encodeURIComponent(uname || "UNKNOWN");
        const client = this.getApiField("httpClient");
        if (client) {
          userAgent.httplib = encodeURIComponent(client.getClientName());
        }
        if (this._appInfo) {
          userAgent.application = this._appInfo;
        }
        cb(JSON.stringify(userAgent));
      });
    },
    /**
     * @private
     * Please open or upvote an issue at github.com/stripe/stripe-node
     * if you use this, detailing your use-case.
     *
     * It may be deprecated and removed in the future.
     */
    getAppInfoAsString() {
      if (!this._appInfo) {
        return "";
      }
      let formatted = this._appInfo.name;
      if (this._appInfo.version) {
        formatted += `/${this._appInfo.version}`;
      }
      if (this._appInfo.url) {
        formatted += ` (${this._appInfo.url})`;
      }
      return formatted;
    },
    getTelemetryEnabled() {
      return this._enableTelemetry;
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _prepResources() {
      for (const name in resources_exports) {
        if (!Object.prototype.hasOwnProperty.call(resources_exports, name)) {
          continue;
        }
        this[pascalToCamelCase(name)] = new resources_exports[name](this);
      }
    },
    /**
     * @private
     * This may be removed in the future.
     */
    _getPropsFromConfig(config) {
      if (!config) {
        return {};
      }
      const isString = typeof config === "string";
      const isObject3 = config === Object(config) && !Array.isArray(config);
      if (!isObject3 && !isString) {
        throw new Error("Config must either be an object or a string");
      }
      if (isString) {
        return {
          apiVersion: config
        };
      }
      const values = Object.keys(config).filter((value) => !ALLOWED_CONFIG_PROPERTIES.includes(value));
      if (values.length > 0) {
        throw new Error(`Config object may only contain the following: ${ALLOWED_CONFIG_PROPERTIES.join(", ")}`);
      }
      return config;
    },
    parseThinEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt) {
      return this.webhooks.constructEvent(payload, header, secret, tolerance, cryptoProvider, receivedAt);
    }
  };
  return Stripe2;
}

// ../node_modules/stripe/esm/stripe.esm.node.js
var Stripe = createStripe(new NodePlatformFunctions());
var stripe_esm_node_default = Stripe;

// ../v2-core/services/billing-service.ts
init_errors();

// ../v2-core/billing/config.ts
function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() && process.env.STRIPE_PRICE_ID?.trim()
  );
}
function getStripeSecretKey() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return key;
}
function getStripePriceId() {
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId) {
    throw new Error("STRIPE_PRICE_ID is not configured");
  }
  return priceId;
}
function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim() || void 0;
}
function getAppBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

// ../v2-core/services/billing-service.ts
init_config2();

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

// ../v2-core/storage/local-subscription-store.ts
init_local_db();
function toRecord(row) {
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
  return toRecord(row);
}
function upsertUserSubscription(record) {
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO user_subscriptions (userId, plan, status, startDate, endDate)
     VALUES (@userId, @plan, @status, @startDate, @endDate)
     ON CONFLICT(userId) DO UPDATE SET
       plan = excluded.plan,
       status = excluded.status,
       startDate = excluded.startDate,
       endDate = excluded.endDate`
  ).run(record);
  return record;
}

// ../v2-core/services/billing-service.ts
init_keys();

// ../v2-core/dynamodb/repository.ts
init_config2();

// ../v2-core/storage/local-repository.ts
init_local_db();
function serializeItem(item) {
  const rest = { ...item };
  for (const key of [
    "PK",
    "SK",
    "entityType",
    "userId",
    "createdAt",
    "updatedAt"
  ]) {
    delete rest[key];
  }
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

// ../v2-core/services/billing-service.ts
async function upsertSubscription(record) {
  if (isLocalBackend()) {
    upsertUserSubscription(record);
    return;
  }
  const now2 = Date.now();
  const item = {
    PK: userPk(record.userId),
    SK: userSubscriptionSk(),
    entityType: "USER_SUBSCRIPTION",
    userId: record.userId,
    plan: record.plan,
    status: record.status,
    startDate: record.startDate,
    endDate: record.endDate,
    createdAt: now2,
    updatedAt: now2
  };
  await putItem3(item);
}
function getStripeClient() {
  return new stripe_esm_node_default(getStripeSecretKey());
}
async function createCheckoutSession(auth) {
  if (!isStripeConfigured()) {
    throw new ApiError("Billing is not configured", 503, "BILLING_NOT_CONFIGURED");
  }
  const stripe = getStripeClient();
  const appUrl = getAppBaseUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: auth.userId,
    customer_email: auth.email,
    line_items: [{ price: getStripePriceId(), quantity: 1 }],
    success_url: `${appUrl}/?premium=success`,
    cancel_url: `${appUrl}/?premium=cancelled`,
    metadata: { userId: auth.userId },
    subscription_data: {
      metadata: { userId: auth.userId }
    }
  });
  if (!session.url) {
    throw new ApiError("Failed to create checkout session", 500, "CHECKOUT_FAILED");
  }
  return { url: session.url };
}
async function activatePremium(userId, endDate) {
  await upsertSubscription({
    userId,
    plan: "premium",
    status: "active",
    startDate: Date.now(),
    endDate
  });
}
async function deactivatePremium(userId) {
  await upsertSubscription({
    userId,
    plan: "free",
    status: "cancelled",
    startDate: null,
    endDate: Date.now()
  });
}
function resolveUserIdFromMetadata(metadata) {
  const userId = metadata?.userId?.trim();
  return userId || null;
}
async function handleCheckoutCompleted(session) {
  const userId = resolveUserIdFromMetadata(session.metadata) ?? session.client_reference_id?.trim() ?? null;
  if (!userId) return;
  await activatePremium(userId, null);
}
function getSubscriptionPeriodEndMs(subscription) {
  if (subscription.cancel_at) {
    return subscription.cancel_at * 1e3;
  }
  const itemEnds = subscription.items?.data?.map((item) => item.current_period_end).filter((value) => typeof value === "number");
  if (!itemEnds?.length) {
    return null;
  }
  return Math.max(...itemEnds) * 1e3;
}
async function handleSubscriptionUpdated(subscription) {
  const userId = resolveUserIdFromMetadata(subscription.metadata);
  if (!userId) return;
  const endDate = getSubscriptionPeriodEndMs(subscription);
  if (subscription.status === "active" || subscription.status === "trialing") {
    await activatePremium(userId, endDate);
    return;
  }
  if (subscription.status === "canceled" || subscription.status === "unpaid" || subscription.status === "incomplete_expired") {
    await deactivatePremium(userId);
  }
}
async function handleStripeWebhook(payload, signature) {
  if (!isStripeConfigured()) {
    throw new ApiError("Billing is not configured", 503, "BILLING_NOT_CONFIGURED");
  }
  const webhookSecret = getStripeWebhookSecret();
  if (!webhookSecret) {
    throw new ApiError("Webhook secret is not configured", 503, "WEBHOOK_NOT_CONFIGURED");
  }
  if (!signature) {
    throw new ApiError("Missing Stripe signature", 400, "INVALID_WEBHOOK");
  }
  const stripe = getStripeClient();
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionUpdated(event.data.object);
      break;
    default:
      break;
  }
}

// ../v2-core/services/bookmark-service.ts
init_errors();
init_config2();

// ../v2-core/storage/local-bookmark-store.ts
init_errors();
import { randomUUID as randomUUID4 } from "node:crypto";

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
function toRecord2(row) {
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
  return rows.map(toRecord2);
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
  const id = randomUUID4();
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
  return toRecord2(row);
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
import { randomUUID as randomUUID5 } from "node:crypto";
function toRecord3(item) {
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
  const records = items.map(toRecord3);
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
  const id = randomUUID5();
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
  return toRecord3(item);
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
init_errors();
import { randomUUID as randomUUID6 } from "node:crypto";

// ../v2-core/validation/deck-input.ts
init_errors();
var MAX_NAME_LENGTH = 120;
function validateCreateDeckInput(input) {
  const name = input.name?.trim() ?? "";
  if (!name) {
    throw new ApiError("name is required", 400, "INVALID_DECK");
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new ApiError(
      `name must be at most ${MAX_NAME_LENGTH} characters`,
      400,
      "INVALID_DECK"
    );
  }
  return { name };
}
function normalizeDeckId(deckId) {
  const normalized = deckId.trim();
  if (!normalized) {
    throw new ApiError("deckId is required", 400, "INVALID_DECK");
  }
  return normalized;
}

// ../v2-core/services/deck-service.ts
init_keys();
function toRecord4(item) {
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
  return items.map(toRecord4).sort((left, right) => left.name.localeCompare(right.name));
}
async function createDeck(auth, input) {
  const validated = validateCreateDeckInput(input);
  const existing = await queryByUser3(auth.userId, "DECK#");
  const duplicate = existing.find(
    (deck) => deck.name.toLowerCase() === validated.name.toLowerCase()
  );
  if (duplicate) {
    return toRecord4(duplicate);
  }
  const now2 = Date.now();
  const id = randomUUID6();
  const item = {
    PK: userPk(auth.userId),
    SK: deckSk(id),
    entityType: "DECK",
    userId: auth.userId,
    id,
    name: validated.name,
    createdAt: now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord4(item);
}
async function deleteDeck(auth, deckId) {
  const normalizedId = normalizeDeckId(deckId);
  const pk = userPk(auth.userId);
  const sk = deckSk(normalizedId);
  const existing = await getItem3(pk, sk);
  if (!existing || existing.userId !== auth.userId) {
    throw new NotFoundError("Deck not found");
  }
  await deleteItem3(pk, sk);
  return { success: true };
}

// ../v2-core/services/flashcard-service.ts
init_errors();
init_config2();

// ../v2-core/storage/local-flashcard-store.ts
init_errors();
import { randomUUID as randomUUID7 } from "node:crypto";

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
    unknownCount: readOptionalNonNegativeNumber(input.unknownCount, "unknownCount"),
    againCount: readOptionalNonNegativeNumber(input.againCount, "againCount"),
    hardCount: readOptionalNonNegativeNumber(input.hardCount, "hardCount"),
    goodCount: readOptionalNonNegativeNumber(input.goodCount, "goodCount"),
    easyCount: readOptionalNonNegativeNumber(input.easyCount, "easyCount")
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
function toRecord5(row) {
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
    againCount: meta.againCount,
    hardCount: meta.hardCount,
    goodCount: meta.goodCount,
    easyCount: meta.easyCount,
    updatedAt: meta.updatedAt
  };
}
function listFlashcards(userId) {
  const db = getLocalDatabase();
  const rows = db.prepare(
    `SELECT * FROM flashcards WHERE userId = ? ORDER BY createdAt ASC`
  ).all(userId);
  return rows.map(toRecord5);
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
    items: rows.map(toRecord5),
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
  const id = randomUUID7();
  const meta = {
    tags: validated.tags ?? [],
    deckIds: validated.deckIds ?? [],
    repetitions: validated.repetitions ?? 0,
    ease: validated.ease ?? 2.5,
    interval: validated.interval ?? 0,
    nextReview: validated.nextReview,
    knownCount: validated.knownCount ?? 0,
    unknownCount: validated.unknownCount ?? 0,
    againCount: validated.againCount ?? 0,
    hardCount: validated.hardCount ?? 0,
    goodCount: validated.goodCount ?? 0,
    easyCount: validated.easyCount ?? 0,
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
  return toRecord5(row);
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
    againCount: input.againCount ?? meta.againCount,
    hardCount: input.hardCount ?? meta.hardCount,
    goodCount: input.goodCount ?? meta.goodCount,
    easyCount: input.easyCount ?? meta.easyCount,
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
  return toRecord5(row);
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
import { randomUUID as randomUUID8 } from "node:crypto";
function toRecord6(item) {
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
    againCount: item.againCount,
    hardCount: item.hardCount,
    goodCount: item.goodCount,
    easyCount: item.easyCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
}
async function listAllFlashcards(auth) {
  if (isLocalBackend()) {
    return listFlashcards(auth.userId);
  }
  const items = await queryByUser3(auth.userId, "CARD#");
  return items.map(toRecord6);
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
  const records = items.map(toRecord6).sort((left, right) => left.createdAt - right.createdAt);
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
  const id = randomUUID8();
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
    againCount: validated.againCount ?? 0,
    hardCount: validated.hardCount ?? 0,
    goodCount: validated.goodCount ?? 0,
    easyCount: validated.easyCount ?? 0,
    createdAt: now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord6(item);
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
  return toRecord6(updated);
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

// ../v2-core/services/daily-study-log-service.ts
init_config2();

// ../v2-core/validation/daily-study-log-input.ts
init_errors();
var DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
function validateDate(value) {
  if (typeof value !== "string" || !DATE_PATTERN.test(value.trim())) {
    throw new ApiError("date must be YYYY-MM-DD", 400, "INVALID_DAILY_STUDY_LOG");
  }
  return value.trim();
}
function validateCount(value, field) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0 || !Number.isInteger(numeric)) {
    throw new ApiError(
      `${field} must be a non-negative integer`,
      400,
      "INVALID_DAILY_STUDY_LOG"
    );
  }
  return numeric;
}
function validateUpsertDailyStudyLogInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_DAILY_STUDY_LOG");
  }
  const date = validateDate(input.date);
  const cardsReviewed = validateCount(input.cardsReviewed, "cardsReviewed");
  const correctReviews = input.correctReviews === void 0 ? void 0 : validateCount(input.correctReviews, "correctReviews");
  const incorrectReviews = input.incorrectReviews === void 0 ? void 0 : validateCount(input.incorrectReviews, "incorrectReviews");
  if (cardsReviewed === 0) {
    throw new ApiError(
      "cardsReviewed must be greater than 0",
      400,
      "INVALID_DAILY_STUDY_LOG"
    );
  }
  return {
    date,
    cardsReviewed,
    ...correctReviews !== void 0 ? { correctReviews } : {},
    ...incorrectReviews !== void 0 ? { incorrectReviews } : {}
  };
}
function mergeDailyStudyCounts(left, right) {
  return {
    cardsReviewed: Math.max(left.cardsReviewed, right.cardsReviewed),
    correctReviews: Math.max(left.correctReviews ?? 0, right.correctReviews ?? 0),
    incorrectReviews: Math.max(
      left.incorrectReviews ?? 0,
      right.incorrectReviews ?? 0
    )
  };
}

// ../v2-core/storage/local-daily-study-log-store.ts
init_local_db();
function toRecord9(row) {
  return {
    userId: row.userId,
    date: row.date,
    cardsReviewed: row.cardsReviewed,
    correctReviews: row.correctReviews,
    incorrectReviews: row.incorrectReviews,
    updatedAt: row.updatedAt
  };
}
function listDailyStudyLog(userId) {
  const db = getLocalDatabase();
  const rows = db.prepare(
    `SELECT * FROM daily_study_log
       WHERE userId = ?
       ORDER BY date DESC`
  ).all(userId);
  return rows.map(toRecord9);
}
function upsertDailyStudyLog(userId, input) {
  const validated = validateUpsertDailyStudyLogInput(input);
  const db = getLocalDatabase();
  const existing = db.prepare(`SELECT * FROM daily_study_log WHERE userId = ? AND date = ?`).get(userId, validated.date);
  const now2 = Date.now();
  const mergedCounts = existing ? mergeDailyStudyCounts(existing, validated) : {
    cardsReviewed: validated.cardsReviewed,
    correctReviews: validated.correctReviews ?? 0,
    incorrectReviews: validated.incorrectReviews ?? 0
  };
  db.prepare(
    `INSERT INTO daily_study_log (
      userId, date, cardsReviewed, correctReviews, incorrectReviews, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId, date) DO UPDATE SET
      cardsReviewed = excluded.cardsReviewed,
      correctReviews = excluded.correctReviews,
      incorrectReviews = excluded.incorrectReviews,
      updatedAt = excluded.updatedAt`
  ).run(
    userId,
    validated.date,
    mergedCounts.cardsReviewed,
    mergedCounts.correctReviews ?? 0,
    mergedCounts.incorrectReviews ?? 0,
    now2
  );
  const row = db.prepare(`SELECT * FROM daily_study_log WHERE userId = ? AND date = ?`).get(userId, validated.date);
  return toRecord9(row);
}

// ../v2-core/services/daily-study-log-service.ts
init_keys();
function toRecord10(item) {
  return {
    userId: item.userId,
    date: item.date,
    cardsReviewed: item.cardsReviewed,
    correctReviews: item.correctReviews,
    incorrectReviews: item.incorrectReviews,
    updatedAt: item.updatedAt ?? item.createdAt
  };
}
async function listDailyStudyLog2(auth) {
  if (isLocalBackend()) {
    return listDailyStudyLog(auth.userId);
  }
  const items = await queryByUser3(auth.userId, "DAILY_STUDY#");
  return items.map(toRecord10).sort((left, right) => right.date.localeCompare(left.date));
}
async function upsertDailyStudyLog2(auth, input) {
  const validated = validateUpsertDailyStudyLogInput(input);
  if (isLocalBackend()) {
    return upsertDailyStudyLog(auth.userId, validated);
  }
  const pk = userPk(auth.userId);
  const sk = dailyStudySk(validated.date);
  const existing = await getItem3(pk, sk);
  const now2 = Date.now();
  const mergedCounts = existing ? mergeDailyStudyCounts(existing, validated) : {
    cardsReviewed: validated.cardsReviewed,
    correctReviews: validated.correctReviews ?? 0,
    incorrectReviews: validated.incorrectReviews ?? 0
  };
  const item = {
    PK: pk,
    SK: sk,
    entityType: "DAILY_STUDY",
    userId: auth.userId,
    date: validated.date,
    cardsReviewed: mergedCounts.cardsReviewed,
    correctReviews: mergedCounts.correctReviews ?? 0,
    incorrectReviews: mergedCounts.incorrectReviews ?? 0,
    createdAt: existing?.createdAt ?? now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord10(item);
}

// ../v2-core/services/pronunciation-attempt-service.ts
init_config2();
import { randomUUID as randomUUID10 } from "crypto";

// ../v2-core/storage/local-pronunciation-attempt-store.ts
import { randomUUID as randomUUID9 } from "crypto";

// ../v2-core/validation/pronunciation-attempt-input.ts
init_errors();
var MAX_VIDEO_ID_LENGTH2 = 20;
var VIDEO_ID_PATTERN2 = /^[a-zA-Z0-9_-]+$/;
function validateVideoId2(videoId) {
  if (!videoId) {
    throw new ApiError("videoId is required", 400, "INVALID_PRONUNCIATION_ATTEMPT");
  }
  if (videoId.length > MAX_VIDEO_ID_LENGTH2) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH2} characters`,
      400,
      "INVALID_PRONUNCIATION_ATTEMPT"
    );
  }
  if (!VIDEO_ID_PATTERN2.test(videoId)) {
    throw new ApiError(
      "videoId has an invalid format",
      400,
      "INVALID_PRONUNCIATION_ATTEMPT"
    );
  }
  return videoId;
}
function validateStringArray(value, field) {
  if (value === void 0 || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new ApiError(`${field} must be an array`, 400, "INVALID_PRONUNCIATION_ATTEMPT");
  }
  return value.map((item) => {
    if (typeof item !== "string") {
      throw new ApiError(
        `${field} items must be strings`,
        400,
        "INVALID_PRONUNCIATION_ATTEMPT"
      );
    }
    return item;
  });
}
function validateCreatePronunciationAttemptInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_PRONUNCIATION_ATTEMPT");
  }
  const videoId = validateVideoId2(String(input.videoId ?? "").trim());
  const expectedText = String(input.expectedText ?? "").trim();
  const recognizedText = String(input.recognizedText ?? "").trim();
  if (!expectedText) {
    throw new ApiError("expectedText is required", 400, "INVALID_PRONUNCIATION_ATTEMPT");
  }
  const score = input.score;
  if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) {
    throw new ApiError(
      "score must be a number between 0 and 100",
      400,
      "INVALID_PRONUNCIATION_ATTEMPT"
    );
  }
  const durationMs = input.durationMs;
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0) {
    throw new ApiError(
      "durationMs must be a non-negative number",
      400,
      "INVALID_PRONUNCIATION_ATTEMPT"
    );
  }
  const sentenceId = typeof input.sentenceId === "string" && input.sentenceId.trim() ? input.sentenceId.trim() : void 0;
  const phraseId = typeof input.phraseId === "string" && input.phraseId.trim() ? input.phraseId.trim() : void 0;
  const id = typeof input.id === "string" && input.id.trim() ? input.id.trim() : void 0;
  const createdAt = typeof input.createdAt === "number" && Number.isFinite(input.createdAt) ? input.createdAt : void 0;
  return {
    ...id ? { id } : {},
    videoId,
    ...sentenceId ? { sentenceId } : {},
    ...phraseId ? { phraseId } : {},
    expectedText,
    recognizedText,
    score: Math.round(score),
    missedWords: validateStringArray(input.missedWords, "missedWords"),
    extraWords: validateStringArray(input.extraWords, "extraWords"),
    durationMs: Math.round(durationMs),
    ...createdAt !== void 0 ? { createdAt } : {}
  };
}

// ../v2-core/storage/local-pronunciation-attempt-store.ts
init_local_db();
function parseStringArray(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}
function toRecord11(row) {
  return {
    id: row.id,
    userId: row.userId,
    videoId: row.videoId,
    sentenceId: row.sentenceId ?? void 0,
    phraseId: row.phraseId ?? void 0,
    expectedText: row.expectedText,
    recognizedText: row.recognizedText,
    score: row.score,
    missedWords: parseStringArray(row.missedWords),
    extraWords: parseStringArray(row.extraWords),
    durationMs: row.durationMs,
    createdAt: row.createdAt
  };
}
function listPronunciationAttempts(userId) {
  const db = getLocalDatabase();
  const rows = db.prepare(
    `SELECT * FROM pronunciation_attempts
       WHERE userId = ?
       ORDER BY createdAt DESC`
  ).all(userId);
  return rows.map(toRecord11);
}
function createPronunciationAttempt(userId, input) {
  const validated = validateCreatePronunciationAttemptInput(input);
  const id = validated.id ?? randomUUID9();
  const createdAt = validated.createdAt ?? Date.now();
  const db = getLocalDatabase();
  const existing = db.prepare(`SELECT * FROM pronunciation_attempts WHERE id = ? AND userId = ?`).get(id, userId);
  if (existing) {
    return toRecord11(existing);
  }
  db.prepare(
    `INSERT INTO pronunciation_attempts (
      id, userId, videoId, sentenceId, phraseId, expectedText, recognizedText,
      score, missedWords, extraWords, durationMs, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    validated.videoId,
    validated.sentenceId ?? null,
    validated.phraseId ?? null,
    validated.expectedText,
    validated.recognizedText,
    validated.score,
    JSON.stringify(validated.missedWords ?? []),
    JSON.stringify(validated.extraWords ?? []),
    validated.durationMs,
    createdAt
  );
  const row = db.prepare(`SELECT * FROM pronunciation_attempts WHERE id = ? AND userId = ?`).get(id, userId);
  return toRecord11(row);
}

// ../v2-core/services/pronunciation-attempt-service.ts
init_keys();
function toRecord12(item) {
  return {
    id: item.id,
    userId: item.userId,
    videoId: item.videoId,
    sentenceId: item.sentenceId,
    phraseId: item.phraseId,
    expectedText: item.expectedText,
    recognizedText: item.recognizedText,
    score: item.score,
    missedWords: item.missedWords,
    extraWords: item.extraWords,
    durationMs: item.durationMs,
    createdAt: item.createdAt
  };
}
async function listPronunciationAttempts2(auth) {
  if (isLocalBackend()) {
    return listPronunciationAttempts(auth.userId);
  }
  const items = await queryByUser3(
    auth.userId,
    "PRONUNCIATION#"
  );
  return items.map(toRecord12).sort((left, right) => right.createdAt - left.createdAt);
}
async function createPronunciationAttempt2(auth, input) {
  const validated = validateCreatePronunciationAttemptInput(input);
  if (isLocalBackend()) {
    return createPronunciationAttempt(
      auth.userId,
      validated
    );
  }
  const now2 = Date.now();
  const id = validated.id ?? randomUUID10();
  const item = {
    PK: userPk(auth.userId),
    SK: pronunciationAttemptSk(id),
    entityType: "PRONUNCIATION",
    userId: auth.userId,
    id,
    videoId: validated.videoId,
    sentenceId: validated.sentenceId,
    phraseId: validated.phraseId,
    expectedText: validated.expectedText,
    recognizedText: validated.recognizedText,
    score: validated.score,
    missedWords: validated.missedWords ?? [],
    extraWords: validated.extraWords ?? [],
    durationMs: validated.durationMs,
    createdAt: validated.createdAt ?? now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord12(item);
}

// ../v2-core/services/quiz-result-service.ts
init_config2();
import { randomUUID as randomUUID12 } from "crypto";

// ../v2-core/storage/local-quiz-result-store.ts
init_local_db();
import { randomUUID as randomUUID11 } from "crypto";
function toRecord13(row) {
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
  return rows.map(toRecord13);
}
function createQuizResult(userId, input) {
  const id = randomUUID11();
  const createdAt = Date.now();
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO quiz_results (
      id, userId, videoId, score, totalQuestions, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    input.videoId,
    input.score,
    input.totalQuestions,
    createdAt
  );
  return {
    id,
    userId,
    videoId: input.videoId,
    score: input.score,
    totalQuestions: input.totalQuestions,
    createdAt
  };
}

// ../v2-core/validation/quiz-result-input.ts
init_errors();
var MAX_VIDEO_ID_LENGTH3 = 20;
var VIDEO_ID_PATTERN3 = /^[a-zA-Z0-9_-]+$/;
function validateVideoId3(videoId) {
  if (!videoId) {
    throw new ApiError("videoId is required", 400, "INVALID_QUIZ_RESULT");
  }
  if (videoId.length > MAX_VIDEO_ID_LENGTH3) {
    throw new ApiError(
      `videoId must be at most ${MAX_VIDEO_ID_LENGTH3} characters`,
      400,
      "INVALID_QUIZ_RESULT"
    );
  }
  if (!VIDEO_ID_PATTERN3.test(videoId)) {
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
  return validateVideoId3(trimmed);
}
function validateCreateQuizResultInput(input) {
  if (!input || typeof input !== "object") {
    throw new ApiError("Request body is required", 400, "INVALID_QUIZ_RESULT");
  }
  const videoId = validateVideoId3(String(input.videoId ?? "").trim());
  const score = input.score;
  if (typeof score !== "number" || !Number.isInteger(score) || score < 0) {
    throw new ApiError(
      "score must be a non-negative integer",
      400,
      "INVALID_QUIZ_RESULT"
    );
  }
  const totalQuestions = input.totalQuestions;
  if (typeof totalQuestions !== "number" || !Number.isInteger(totalQuestions) || totalQuestions < 1) {
    throw new ApiError(
      "totalQuestions must be a positive integer",
      400,
      "INVALID_QUIZ_RESULT"
    );
  }
  if (score > totalQuestions) {
    throw new ApiError(
      "score cannot exceed totalQuestions",
      400,
      "INVALID_QUIZ_RESULT"
    );
  }
  return { videoId, score, totalQuestions };
}

// ../v2-core/services/quiz-result-service.ts
init_keys();
function toRecord14(item) {
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
  const records = items.map(toRecord14);
  if (!filter) {
    return records.sort((left, right) => right.createdAt - left.createdAt);
  }
  return records.filter((result) => result.videoId === filter).sort((left, right) => right.createdAt - left.createdAt);
}
async function createQuizResult2(auth, input) {
  const validated = validateCreateQuizResultInput(input);
  if (isLocalBackend()) {
    return createQuizResult(auth.userId, validated);
  }
  const now2 = Date.now();
  const id = randomUUID12();
  const item = {
    PK: userPk(auth.userId),
    SK: quizResultSk(id),
    entityType: "QUIZ_RESULT",
    userId: auth.userId,
    id,
    videoId: validated.videoId,
    score: validated.score,
    totalQuestions: validated.totalQuestions,
    createdAt: now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord14(item);
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
var DEFAULT_DAILY_CARD_GOAL = 30;
var DEFAULT_VOCABULARY_GOAL = 1e3;
var DEFAULT_LEARNING_LEVEL = "intermediate";
var VALID_LEARNING_LEVELS = /* @__PURE__ */ new Set(["beginner", "intermediate", "advanced"]);
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
    bilingualMode: false,
    dailyCardGoal: DEFAULT_DAILY_CARD_GOAL,
    vocabularyGoal: DEFAULT_VOCABULARY_GOAL,
    learningLevel: DEFAULT_LEARNING_LEVEL
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
function validatePositiveInteger(value, field) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new ApiError(
      `${field} must be a positive number`,
      400,
      "INVALID_USER_SETTINGS"
    );
  }
  return Math.round(numeric);
}
function validateLearningLevel(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value !== "string") {
    throw new ApiError(
      "learningLevel must be a string",
      400,
      "INVALID_USER_SETTINGS"
    );
  }
  const level = value.trim().toLowerCase();
  if (!VALID_LEARNING_LEVELS.has(level)) {
    throw new ApiError(
      "learningLevel has an invalid value",
      400,
      "INVALID_USER_SETTINGS"
    );
  }
  return level;
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
  const dailyCardGoal = validatePositiveInteger(
    input.dailyCardGoal,
    "dailyCardGoal"
  );
  const vocabularyGoal = validatePositiveInteger(
    input.vocabularyGoal,
    "vocabularyGoal"
  );
  const learningLevel = validateLearningLevel(input.learningLevel);
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
  if (interfaceLanguage === void 0 && translationLanguage === void 0 && theme === void 0 && autoPause === void 0 && bilingualMode === void 0 && dailyCardGoal === void 0 && vocabularyGoal === void 0 && learningLevel === void 0) {
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
    ...bilingualMode !== void 0 ? { bilingualMode } : {},
    ...dailyCardGoal !== void 0 ? { dailyCardGoal } : {},
    ...vocabularyGoal !== void 0 ? { vocabularyGoal } : {},
    ...learningLevel !== void 0 ? { learningLevel } : {}
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
    bilingualMode: patch.bilingualMode ?? current.bilingualMode,
    dailyCardGoal: patch.dailyCardGoal ?? current.dailyCardGoal,
    vocabularyGoal: patch.vocabularyGoal ?? current.vocabularyGoal,
    learningLevel: patch.learningLevel ?? current.learningLevel
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
function toRecord15(row) {
  return {
    userId: row.userId,
    interfaceLanguage: row.interfaceLanguage,
    translationLanguage: row.translationLanguage,
    theme: row.theme,
    autoPause: parseStoredAutoPause(row.autoPause),
    bilingualMode: row.bilingualMode === 1,
    dailyCardGoal: row.dailyCardGoal ?? DEFAULT_DAILY_CARD_GOAL,
    vocabularyGoal: row.vocabularyGoal ?? DEFAULT_VOCABULARY_GOAL,
    learningLevel: row.learningLevel === "beginner" || row.learningLevel === "advanced" || row.learningLevel === "intermediate" ? row.learningLevel : DEFAULT_LEARNING_LEVEL
  };
}
function getUserSettings(userId) {
  const db = getLocalDatabase();
  const row = db.prepare(`SELECT * FROM user_settings WHERE userId = ?`).get(userId);
  if (!row) {
    return defaultUserSettings(userId);
  }
  return toRecord15(row);
}
function updateUserSettings(userId, input) {
  const validated = validateUpdateUserSettingsInput(input);
  const current = getUserSettings(userId);
  const merged = mergeUserSettings(current, validated);
  const db = getLocalDatabase();
  db.prepare(
    `INSERT INTO user_settings (
      userId, interfaceLanguage, translationLanguage, theme, autoPause, bilingualMode,
      dailyCardGoal, vocabularyGoal, learningLevel
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(userId) DO UPDATE SET
      interfaceLanguage = excluded.interfaceLanguage,
      translationLanguage = excluded.translationLanguage,
      theme = excluded.theme,
      autoPause = excluded.autoPause,
      bilingualMode = excluded.bilingualMode,
      dailyCardGoal = excluded.dailyCardGoal,
      vocabularyGoal = excluded.vocabularyGoal,
      learningLevel = excluded.learningLevel`
  ).run(
    userId,
    merged.interfaceLanguage,
    merged.translationLanguage,
    merged.theme,
    JSON.stringify(merged.autoPause),
    merged.bilingualMode ? 1 : 0,
    merged.dailyCardGoal,
    merged.vocabularyGoal,
    merged.learningLevel
  );
  const row = db.prepare(`SELECT * FROM user_settings WHERE userId = ?`).get(userId);
  if (!row) {
    throw new ApiError(
      "Failed to save user settings",
      500,
      "USER_SETTINGS_SAVE_FAILED"
    );
  }
  return toRecord15(row);
}

// ../v2-core/services/user-settings-service.ts
init_keys();
function toRecord16(item) {
  const autoPause = typeof item.autoPause === "string" ? parseStoredAutoPause(item.autoPause) : parseAutoPause(item.autoPause);
  const learningLevel = item.learningLevel;
  const normalizedLevel = learningLevel === "beginner" || learningLevel === "advanced" || learningLevel === "intermediate" ? learningLevel : DEFAULT_LEARNING_LEVEL;
  return {
    userId: item.userId,
    interfaceLanguage: item.interfaceLanguage,
    translationLanguage: item.translationLanguage,
    theme: item.theme,
    autoPause,
    bilingualMode: Boolean(item.bilingualMode),
    dailyCardGoal: item.dailyCardGoal ?? DEFAULT_DAILY_CARD_GOAL,
    vocabularyGoal: item.vocabularyGoal ?? DEFAULT_VOCABULARY_GOAL,
    learningLevel: normalizedLevel
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
  return toRecord16(item);
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
  const current = existing && existing.userId === auth.userId ? toRecord16(existing) : defaultUserSettings(auth.userId);
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
    dailyCardGoal: merged.dailyCardGoal,
    vocabularyGoal: merged.vocabularyGoal,
    learningLevel: merged.learningLevel,
    createdAt: existing?.createdAt ?? now2,
    updatedAt: now2
  };
  await putItem3(item);
  return toRecord16(item);
}

// ../v2-core/services/vocabulary-progress-service.ts
init_config2();

// ../v2-core/storage/local-vocabulary-progress-store.ts
init_errors();
import { randomUUID as randomUUID13 } from "node:crypto";

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
function toRecord17(row) {
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
  const id = existing?.id ?? randomUUID13();
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
  return toRecord17(row);
}

// ../v2-core/services/vocabulary-progress-service.ts
init_keys();
import { randomUUID as randomUUID14 } from "node:crypto";
function toRecord18(item) {
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
  const id = existing?.id ?? randomUUID14();
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
  return toRecord18(item);
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
function toRecord19(item) {
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
  return toRecord19(existing);
}
async function listPlaybackPositions(auth) {
  const items = await queryByUser3(auth.userId, "PLAYBACK#");
  return items.map(toRecord19).filter((record) => record.lastPosition >= MIN_POSITION_SECONDS).sort((left, right) => right.updatedAt - left.updatedAt);
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
  return toRecord19(item);
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
function toRecord20(item) {
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
  return items.map(toRecord20).sort((left, right) => right.createdAt - left.createdAt);
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
  return toRecord20(item);
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
function getRawBody(event) {
  if (!event.body) return "";
  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}
function getHeader(event, name) {
  const headers = event.headers ?? {};
  const lowerName = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lowerName) return headers[key];
  }
  return void 0;
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
  },
  // Stripe calls this directly (no Cognito JWT) — must also be marked
  // `Auth: Authorizer: NONE` on the API Gateway route in infra/template.yaml,
  // otherwise the gateway rejects it with 401 before Lambda ever runs.
  "POST /billing/webhook": async (event) => {
    const payload = getRawBody(event);
    const signature = getHeader(event, "stripe-signature") ?? null;
    await handleStripeWebhook(payload, signature);
    return ok({ received: true });
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
  if (method === "POST" && path === "/decks") {
    return ok(
      await createDeck(auth, body),
      201
    );
  }
  const deckMatch = path.match(/^\/decks\/([^/]+)$/);
  if (deckMatch && method === "DELETE") {
    return ok(
      await deleteDeck(auth, decodeURIComponent(deckMatch[1]))
    );
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
  if (method === "POST" && path === "/quiz-results") {
    return ok(
      await createQuizResult2(
        auth,
        body
      ),
      201
    );
  }
  if (method === "GET" && path === "/daily-study-log") {
    return ok(await listDailyStudyLog2(auth));
  }
  if (method === "PUT" && path === "/daily-study-log") {
    return ok(
      await upsertDailyStudyLog2(
        auth,
        body
      )
    );
  }
  if (method === "GET" && path === "/pronunciation-attempts") {
    return ok(await listPronunciationAttempts2(auth));
  }
  if (method === "POST" && path === "/pronunciation-attempts") {
    return ok(
      await createPronunciationAttempt2(
        auth,
        body
      ),
      201
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
  if (method === "POST" && path === "/billing/checkout") {
    return ok(await createCheckoutSession(auth));
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
  if (method === "GET" && path === "/playback-positions") {
    return ok(await listPlaybackPositions(auth));
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
