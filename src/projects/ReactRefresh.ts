import {
  RspackOptions,
  BrowserHttpImportEsmPlugin,
  BrowserRequirePlugin,
} from "@rspack/browser";

import ReactRefreshRspackPlugin from "../rspack-plugin-react-refresh";

const REACT_REFRESH_RUNTIME = {
  "/react-refresh/refreshUtils.js": `
var RefreshRuntime = require("react-refresh/runtime");
var safeThis = (function () {
  // copied from core-js-pure/features/global-this
  "use strict";

  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  // eslint-disable-next-line es/no-global-this -- safe
  return (
    check(typeof globalThis == "object" && globalThis) ||
    check(typeof window == "object" && window) ||
    // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == "object" && self) ||
    check(typeof __webpack_require__.g == "object" && __webpack_require__.g) ||
    // eslint-disable-next-line no-new-func -- fallback
    (function () {
      return this;
    })() ||
    this ||
    Function("return this")()
  );
})();

if (process.env.NODE_ENV !== "production") {
  if (typeof safeThis !== "undefined") {
    var $RefreshInjected$ = "__reactRefreshInjected";
    // Namespace the injected flag (if necessary) for monorepo compatibility
    if (
      typeof __react_refresh_library__ !== "undefined" &&
      __react_refresh_library__
    ) {
      $RefreshInjected$ += "_" + __react_refresh_library__;
    }

    // Only inject the runtime if it hasn't been injected
    if (!safeThis[$RefreshInjected$]) {
      RefreshRuntime.injectIntoGlobalHook(safeThis);

      // Empty implementation to avoid "ReferenceError: variable is not defined" in module which didn't pass builtin:react-refresh-loader
      safeThis.$RefreshSig$ = () => (type) => type;
      safeThis.$RefreshReg$ = () => {};

      // Mark the runtime as injected to prevent double-injection
      safeThis[$RefreshInjected$] = true;
    }
  }
}
/* global __webpack_require__ */
var Refresh = require("react-refresh/runtime");

/**
 * Extracts exports from a webpack module object.
 * @param {string} moduleId A Webpack module ID.
 * @returns {*} An exports object from the module.
 */
function getModuleExports(moduleId) {
  if (typeof moduleId === "undefined") {
    return {};
  }

  var maybeModule = __webpack_require__.c[moduleId];
  if (typeof maybeModule === "undefined") {
    console.warn(
      "[React Refresh] Failed to get exports for module: " + moduleId + "."
    );
    return {};
  }

  var exportsOrPromise = maybeModule.exports;
  if (typeof Promise !== "undefined" && exportsOrPromise instanceof Promise) {
    return exportsOrPromise.then(function (exports) {
      return exports;
    });
  }
  return exportsOrPromise;
}

/**
 * Calculates the signature of a React refresh boundary.
 * If this signature changes, it's unsafe to accept the boundary.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/907d6af22ac6ebe58572be418e9253a90665ecbd/packages/metro/src/lib/polyfills/require.js#L795-L816).
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {string[]} A React refresh boundary signature array.
 */
function getReactRefreshBoundarySignature(moduleExports) {
  var signature = [];
  signature.push(Refresh.getFamilyByType(moduleExports));

  if (moduleExports == null || typeof moduleExports !== "object") {
    // Exit if we can't iterate over exports.
    return signature;
  }

  for (var key in moduleExports) {
    if (key === "__esModule") {
      continue;
    }

    signature.push(key);
    signature.push(Refresh.getFamilyByType(moduleExports[key]));
  }

  return signature;
}

/**
 * Creates a helper that performs a delayed React refresh.
 * @returns {function(function(): void): void} A debounced React refresh function.
 */
function createDebounceUpdate() {
  /**
   * A cached setTimeout handler.
   * @type {number | undefined}
   */
  var refreshTimeout;

  /**
   * Performs react refresh on a delay and clears the error overlay.
   * @param {function(): void} callback
   * @returns {void}
   */
  function enqueueUpdate(callback) {
    if (typeof refreshTimeout === "undefined") {
      refreshTimeout = setTimeout(function () {
        refreshTimeout = undefined;
        Refresh.performReactRefresh();
        callback();
      }, 30);
    }
  }

  return enqueueUpdate;
}

/**
 * Checks if all exports are likely a React component.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/febdba2383113c88296c61e28e4ef6a7f4939fda/packages/metro/src/lib/polyfills/require.js#L748-L774).
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {boolean} Whether the exports are React component like.
 */
function isReactRefreshBoundary(moduleExports) {
  if (Refresh.isLikelyComponentType(moduleExports)) {
    return true;
  }
  if (
    moduleExports === undefined ||
    moduleExports === null ||
    typeof moduleExports !== "object"
  ) {
    // Exit if we can't iterate over exports.
    return false;
  }

  var hasExports = false;
  var areAllExportsComponents = true;
  for (var key in moduleExports) {
    hasExports = true;

    // This is the ES Module indicator flag
    if (key === "__esModule") {
      continue;
    }

    // We can (and have to) safely execute getters here,
    // as Webpack manually assigns harmony exports to getters,
    // without any side-effects attached.
    // Ref: https://github.com/webpack/webpack/blob/b93048643fe74de2a6931755911da1212df55897/lib/MainTemplate.js#L281
    var exportValue = moduleExports[key];
    if (!Refresh.isLikelyComponentType(exportValue)) {
      areAllExportsComponents = false;
    }
  }

  return hasExports && areAllExportsComponents;
}

/**
 * Checks if exports are likely a React component and registers them.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/febdba2383113c88296c61e28e4ef6a7f4939fda/packages/metro/src/lib/polyfills/require.js#L818-L835).
 * @param {*} moduleExports A Webpack module exports object.
 * @param {string} moduleId A Webpack module ID.
 * @returns {void}
 */
function registerExportsForReactRefresh(moduleExports, moduleId) {
  if (Refresh.isLikelyComponentType(moduleExports)) {
    // Register module.exports if it is likely a component
    Refresh.register(moduleExports, moduleId + " %exports%");
  }

  if (
    moduleExports === undefined ||
    moduleExports === null ||
    typeof moduleExports !== "object"
  ) {
    // Exit if we can't iterate over the exports.
    return;
  }

  for (var key in moduleExports) {
    // Skip registering the ES Module indicator
    if (key === "__esModule") {
      continue;
    }

    var exportValue = moduleExports[key];
    if (Refresh.isLikelyComponentType(exportValue)) {
      var typeID = moduleId + " %exports% " + key;
      Refresh.register(exportValue, typeID);
    }
  }
}

/**
 * Compares previous and next module objects to check for mutated boundaries.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/907d6af22ac6ebe58572be418e9253a90665ecbd/packages/metro/src/lib/polyfills/require.js#L776-L792).
 * @param {*} prevExports The current Webpack module exports object.
 * @param {*} nextExports The next Webpack module exports object.
 * @returns {boolean} Whether the React refresh boundary should be invalidated.
 */
function shouldInvalidateReactRefreshBoundary(prevExports, nextExports) {
  var prevSignature = getReactRefreshBoundarySignature(prevExports);
  var nextSignature = getReactRefreshBoundarySignature(nextExports);

  if (prevSignature.length !== nextSignature.length) {
    return true;
  }

  for (var i = 0; i < nextSignature.length; i += 1) {
    if (prevSignature[i] !== nextSignature[i]) {
      return true;
    }
  }

  return false;
}

var enqueueUpdate = createDebounceUpdate();

function executeRuntime(
  moduleExports,
  moduleId,
  webpackHot,
  refreshOverlay,
  isTest
) {
  registerExportsForReactRefresh(moduleExports, moduleId);

  if (webpackHot) {
    var isHotUpdate = !!webpackHot.data;
    var prevExports;
    if (isHotUpdate) {
      prevExports = webpackHot.data.prevExports;
    }

    if (isReactRefreshBoundary(moduleExports)) {
      webpackHot.dispose(
        /**
         * A callback to performs a full refresh if React has unrecoverable errors,
         * and also caches the to-be-disposed module.
         * @param {*} data A hot module data object from Webpack HMR.
         * @returns {void}
         */
        function hotDisposeCallback(data) {
          // We have to mutate the data object to get data registered and cached
          data.prevExports = moduleExports;
        }
      );
      webpackHot.accept(
        /**
         * An error handler to allow self-recovering behaviours.
         * @param {Error} error An error occurred during evaluation of a module.
         * @returns {void}
         */
        function hotErrorHandler(error) {
          console.error(error);
          if (
            __reload_on_runtime_errors__ &&
            isUnrecoverableRuntimeError(error)
          ) {
            location.reload();
            return;
          }

          if (typeof refreshOverlay !== "undefined" && refreshOverlay) {
            refreshOverlay.handleRuntimeError(error);
          }

          if (typeof isTest !== "undefined" && isTest) {
            if (window.onHotAcceptError) {
              window.onHotAcceptError(error.message);
            }
          }

          __webpack_require__.c[moduleId].hot.accept(hotErrorHandler);
        }
      );

      if (isHotUpdate) {
        if (
          isReactRefreshBoundary(prevExports) &&
          shouldInvalidateReactRefreshBoundary(prevExports, moduleExports)
        ) {
          webpackHot.invalidate();
        } else {
          enqueueUpdate(
            /**
             * A function to dismiss the error overlay after performing React refresh.
             * @returns {void}
             */
            function updateCallback() {
              if (typeof refreshOverlay !== "undefined" && refreshOverlay) {
                refreshOverlay.clearRuntimeErrors();
              }
            }
          );
        }
      }
    } else {
      if (isHotUpdate && typeof prevExports !== "undefined") {
        webpackHot.invalidate();
      }
    }
  }
}

function isUnrecoverableRuntimeError(error) {
  return error.message.startsWith("RuntimeError: factory is undefined");
}

module.exports = Object.freeze({
  enqueueUpdate: enqueueUpdate,
  executeRuntime: executeRuntime,
  getModuleExports: getModuleExports,
  isReactRefreshBoundary: isReactRefreshBoundary,
  shouldInvalidateReactRefreshBoundary: shouldInvalidateReactRefreshBoundary,
  registerExportsForReactRefresh: registerExportsForReactRefresh,
});`,
  "/react-refresh/reactRefresh.js": `
/* global __webpack_require__ */
var Refresh = require("react-refresh/runtime");

/**
 * Extracts exports from a webpack module object.
 * @param {string} moduleId A Webpack module ID.
 * @returns {*} An exports object from the module.
 */
function getModuleExports(moduleId) {
  if (typeof moduleId === "undefined") {
    return {};
  }

  var maybeModule = __webpack_require__.c[moduleId];
  if (typeof maybeModule === "undefined") {
    console.warn(
      "[React Refresh] Failed to get exports for module: " + moduleId + "."
    );
    return {};
  }

  var exportsOrPromise = maybeModule.exports;
  if (typeof Promise !== "undefined" && exportsOrPromise instanceof Promise) {
    return exportsOrPromise.then(function (exports) {
      return exports;
    });
  }
  return exportsOrPromise;
}

/**
 * Calculates the signature of a React refresh boundary.
 * If this signature changes, it's unsafe to accept the boundary.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/907d6af22ac6ebe58572be418e9253a90665ecbd/packages/metro/src/lib/polyfills/require.js#L795-L816).
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {string[]} A React refresh boundary signature array.
 */
function getReactRefreshBoundarySignature(moduleExports) {
  var signature = [];
  signature.push(Refresh.getFamilyByType(moduleExports));

  if (moduleExports == null || typeof moduleExports !== "object") {
    // Exit if we can't iterate over exports.
    return signature;
  }

  for (var key in moduleExports) {
    if (key === "__esModule") {
      continue;
    }

    signature.push(key);
    signature.push(Refresh.getFamilyByType(moduleExports[key]));
  }

  return signature;
}

/**
 * Creates a helper that performs a delayed React refresh.
 * @returns {function(function(): void): void} A debounced React refresh function.
 */
function createDebounceUpdate() {
  /**
   * A cached setTimeout handler.
   * @type {number | undefined}
   */
  var refreshTimeout;

  /**
   * Performs react refresh on a delay and clears the error overlay.
   * @param {function(): void} callback
   * @returns {void}
   */
  function enqueueUpdate(callback) {
    if (typeof refreshTimeout === "undefined") {
      refreshTimeout = setTimeout(function () {
        refreshTimeout = undefined;
        Refresh.performReactRefresh();
        callback();
      }, 30);
    }
  }

  return enqueueUpdate;
}

/**
 * Checks if all exports are likely a React component.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/febdba2383113c88296c61e28e4ef6a7f4939fda/packages/metro/src/lib/polyfills/require.js#L748-L774).
 * @param {*} moduleExports A Webpack module exports object.
 * @returns {boolean} Whether the exports are React component like.
 */
function isReactRefreshBoundary(moduleExports) {
  if (Refresh.isLikelyComponentType(moduleExports)) {
    return true;
  }
  if (
    moduleExports === undefined ||
    moduleExports === null ||
    typeof moduleExports !== "object"
  ) {
    // Exit if we can't iterate over exports.
    return false;
  }

  var hasExports = false;
  var areAllExportsComponents = true;
  for (var key in moduleExports) {
    hasExports = true;

    // This is the ES Module indicator flag
    if (key === "__esModule") {
      continue;
    }

    // We can (and have to) safely execute getters here,
    // as Webpack manually assigns harmony exports to getters,
    // without any side-effects attached.
    // Ref: https://github.com/webpack/webpack/blob/b93048643fe74de2a6931755911da1212df55897/lib/MainTemplate.js#L281
    var exportValue = moduleExports[key];
    if (!Refresh.isLikelyComponentType(exportValue)) {
      areAllExportsComponents = false;
    }
  }

  return hasExports && areAllExportsComponents;
}

/**
 * Checks if exports are likely a React component and registers them.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/febdba2383113c88296c61e28e4ef6a7f4939fda/packages/metro/src/lib/polyfills/require.js#L818-L835).
 * @param {*} moduleExports A Webpack module exports object.
 * @param {string} moduleId A Webpack module ID.
 * @returns {void}
 */
function registerExportsForReactRefresh(moduleExports, moduleId) {
  if (Refresh.isLikelyComponentType(moduleExports)) {
    // Register module.exports if it is likely a component
    Refresh.register(moduleExports, moduleId + " %exports%");
  }

  if (
    moduleExports === undefined ||
    moduleExports === null ||
    typeof moduleExports !== "object"
  ) {
    // Exit if we can't iterate over the exports.
    return;
  }

  for (var key in moduleExports) {
    // Skip registering the ES Module indicator
    if (key === "__esModule") {
      continue;
    }

    var exportValue = moduleExports[key];
    if (Refresh.isLikelyComponentType(exportValue)) {
      var typeID = moduleId + " %exports% " + key;
      Refresh.register(exportValue, typeID);
    }
  }
}

/**
 * Compares previous and next module objects to check for mutated boundaries.
 *
 * This implementation is based on the one in [Metro](https://github.com/facebook/metro/blob/907d6af22ac6ebe58572be418e9253a90665ecbd/packages/metro/src/lib/polyfills/require.js#L776-L792).
 * @param {*} prevExports The current Webpack module exports object.
 * @param {*} nextExports The next Webpack module exports object.
 * @returns {boolean} Whether the React refresh boundary should be invalidated.
 */
function shouldInvalidateReactRefreshBoundary(prevExports, nextExports) {
  var prevSignature = getReactRefreshBoundarySignature(prevExports);
  var nextSignature = getReactRefreshBoundarySignature(nextExports);

  if (prevSignature.length !== nextSignature.length) {
    return true;
  }

  for (var i = 0; i < nextSignature.length; i += 1) {
    if (prevSignature[i] !== nextSignature[i]) {
      return true;
    }
  }

  return false;
}

var enqueueUpdate = createDebounceUpdate();

function executeRuntime(
  moduleExports,
  moduleId,
  webpackHot,
  refreshOverlay,
  isTest
) {
  registerExportsForReactRefresh(moduleExports, moduleId);

  if (webpackHot) {
    var isHotUpdate = !!webpackHot.data;
    var prevExports;
    if (isHotUpdate) {
      prevExports = webpackHot.data.prevExports;
    }

    if (isReactRefreshBoundary(moduleExports)) {
      webpackHot.dispose(
        /**
         * A callback to performs a full refresh if React has unrecoverable errors,
         * and also caches the to-be-disposed module.
         * @param {*} data A hot module data object from Webpack HMR.
         * @returns {void}
         */
        function hotDisposeCallback(data) {
          // We have to mutate the data object to get data registered and cached
          data.prevExports = moduleExports;
        }
      );
      webpackHot.accept(
        /**
         * An error handler to allow self-recovering behaviours.
         * @param {Error} error An error occurred during evaluation of a module.
         * @returns {void}
         */
        function hotErrorHandler(error) {
          console.error(error);
          if (
            __reload_on_runtime_errors__ &&
            isUnrecoverableRuntimeError(error)
          ) {
            location.reload();
            return;
          }

          if (typeof refreshOverlay !== "undefined" && refreshOverlay) {
            refreshOverlay.handleRuntimeError(error);
          }

          if (typeof isTest !== "undefined" && isTest) {
            if (window.onHotAcceptError) {
              window.onHotAcceptError(error.message);
            }
          }

          __webpack_require__.c[moduleId].hot.accept(hotErrorHandler);
        }
      );

      if (isHotUpdate) {
        if (
          isReactRefreshBoundary(prevExports) &&
          shouldInvalidateReactRefreshBoundary(prevExports, moduleExports)
        ) {
          webpackHot.invalidate();
        } else {
          enqueueUpdate(
            /**
             * A function to dismiss the error overlay after performing React refresh.
             * @returns {void}
             */
            function updateCallback() {
              if (typeof refreshOverlay !== "undefined" && refreshOverlay) {
                refreshOverlay.clearRuntimeErrors();
              }
            }
          );
        }
      }
    } else {
      if (isHotUpdate && typeof prevExports !== "undefined") {
        webpackHot.invalidate();
      }
    }
  }
}

function isUnrecoverableRuntimeError(error) {
  return error.message.startsWith("RuntimeError: factory is undefined");
}

module.exports = Object.freeze({
  enqueueUpdate: enqueueUpdate,
  executeRuntime: executeRuntime,
  getModuleExports: getModuleExports,
  isReactRefreshBoundary: isReactRefreshBoundary,
  shouldInvalidateReactRefreshBoundary: shouldInvalidateReactRefreshBoundary,
  registerExportsForReactRefresh: registerExportsForReactRefresh,
});
`,
  "/react-refresh/reactRefreshEntry.js": `
var RefreshRuntime = require("react-refresh/runtime");
var safeThis = (function () {
  // copied from core-js-pure/features/global-this
  "use strict";

  var check = function (it) {
    return it && it.Math == Math && it;
  };

  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  // eslint-disable-next-line es/no-global-this -- safe
  return (
    check(typeof globalThis == "object" && globalThis) ||
    check(typeof window == "object" && window) ||
    // eslint-disable-next-line no-restricted-globals -- safe
    check(typeof self == "object" && self) ||
    check(typeof __webpack_require__.g == "object" && __webpack_require__.g) ||
    // eslint-disable-next-line no-new-func -- fallback
    (function () {
      return this;
    })() ||
    this ||
    Function("return this")()
  );
})();

if (process.env.NODE_ENV !== "production") {
  if (typeof safeThis !== "undefined") {
    var $RefreshInjected$ = "__reactRefreshInjected";
    // Namespace the injected flag (if necessary) for monorepo compatibility
    if (
      typeof __react_refresh_library__ !== "undefined" &&
      __react_refresh_library__
    ) {
      $RefreshInjected$ += "_" + __react_refresh_library__;
    }

    // Only inject the runtime if it hasn't been injected
    if (!safeThis[$RefreshInjected$]) {
      RefreshRuntime.injectIntoGlobalHook(safeThis);

      // Empty implementation to avoid "ReferenceError: variable is not defined" in module which didn't pass builtin:react-refresh-loader
      safeThis.$RefreshSig$ = () => (type) => type;
      safeThis.$RefreshReg$ = () => {};

      // Mark the runtime as injected to prevent double-injection
      safeThis[$RefreshInjected$] = true;
    }
  }
}`,
  "/react-refresh/runtime.js": `
/**
 * @license React
 * react-refresh-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

"use strict";
"production" !== process.env.NODE_ENV &&
  (function () {
    function computeFullKey(signature) {
      if (null !== signature.fullKey) return signature.fullKey;
      var fullKey = signature.ownKey;
      try {
        var hooks = signature.getCustomHooks();
      } catch (err) {
        return (signature.forceReset = !0), (signature.fullKey = fullKey);
      }
      for (var i = 0; i < hooks.length; i++) {
        var hook = hooks[i];
        if ("function" !== typeof hook)
          return (signature.forceReset = !0), (signature.fullKey = fullKey);
        hook = allSignaturesByType.get(hook);
        if (void 0 !== hook) {
          var nestedHookKey = computeFullKey(hook);
          hook.forceReset && (signature.forceReset = !0);
          fullKey += "\n---\n" + nestedHookKey;
        }
      }
      return (signature.fullKey = fullKey);
    }
    function resolveFamily(type) {
      return updatedFamiliesByType.get(type);
    }
    function cloneMap(map) {
      var clone = new Map();
      map.forEach(function (value, key) {
        clone.set(key, value);
      });
      return clone;
    }
    function cloneSet(set) {
      var clone = new Set();
      set.forEach(function (value) {
        clone.add(value);
      });
      return clone;
    }
    function getProperty(object, property) {
      try {
        return object[property];
      } catch (err) {}
    }
    function register(type, id) {
      if (
        !(
          null === type ||
          ("function" !== typeof type && "object" !== typeof type) ||
          allFamiliesByType.has(type)
        )
      ) {
        var family = allFamiliesByID.get(id);
        void 0 === family
          ? ((family = { current: type }), allFamiliesByID.set(id, family))
          : pendingUpdates.push([family, type]);
        allFamiliesByType.set(type, family);
        if ("object" === typeof type && null !== type)
          switch (getProperty(type, "$$typeof")) {
            case REACT_FORWARD_REF_TYPE:
              register(type.render, id + "$render");
              break;
            case REACT_MEMO_TYPE:
              register(type.type, id + "$type");
          }
      }
    }
    function setSignature(type, key) {
      var forceReset =
          2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : !1,
        getCustomHooks = 3 < arguments.length ? arguments[3] : void 0;
      allSignaturesByType.has(type) ||
        allSignaturesByType.set(type, {
          forceReset: forceReset,
          ownKey: key,
          fullKey: null,
          getCustomHooks:
            getCustomHooks ||
            function () {
              return [];
            }
        });
      if ("object" === typeof type && null !== type)
        switch (getProperty(type, "$$typeof")) {
          case REACT_FORWARD_REF_TYPE:
            setSignature(type.render, key, forceReset, getCustomHooks);
            break;
          case REACT_MEMO_TYPE:
            setSignature(type.type, key, forceReset, getCustomHooks);
        }
    }
    function collectCustomHooksForSignature(type) {
      type = allSignaturesByType.get(type);
      void 0 !== type && computeFullKey(type);
    }
    var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"),
      REACT_MEMO_TYPE = Symbol.for("react.memo"),
      PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map,
      allFamiliesByID = new Map(),
      allFamiliesByType = new PossiblyWeakMap(),
      allSignaturesByType = new PossiblyWeakMap(),
      updatedFamiliesByType = new PossiblyWeakMap(),
      pendingUpdates = [],
      helpersByRendererID = new Map(),
      helpersByRoot = new Map(),
      mountedRoots = new Set(),
      failedRoots = new Set(),
      rootElements = "function" === typeof WeakMap ? new WeakMap() : null,
      isPerformingRefresh = !1;
    exports._getMountedRootCount = function () {
      return mountedRoots.size;
    };
    exports.collectCustomHooksForSignature = collectCustomHooksForSignature;
    exports.createSignatureFunctionForTransform = function () {
      var savedType,
        hasCustomHooks,
        didCollectHooks = !1;
      return function (type, key, forceReset, getCustomHooks) {
        if ("string" === typeof key)
          return (
            savedType ||
              ((savedType = type),
              (hasCustomHooks = "function" === typeof getCustomHooks)),
            null == type ||
              ("function" !== typeof type && "object" !== typeof type) ||
              setSignature(type, key, forceReset, getCustomHooks),
            type
          );
        !didCollectHooks &&
          hasCustomHooks &&
          ((didCollectHooks = !0), collectCustomHooksForSignature(savedType));
      };
    };
    exports.getFamilyByID = function (id) {
      return allFamiliesByID.get(id);
    };
    exports.getFamilyByType = function (type) {
      return allFamiliesByType.get(type);
    };
    exports.hasUnrecoverableErrors = function () {
      return !1;
    };
    exports.injectIntoGlobalHook = function (globalObject) {
      var hook = globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (void 0 === hook) {
        var nextID = 0;
        globalObject.__REACT_DEVTOOLS_GLOBAL_HOOK__ = hook = {
          renderers: new Map(),
          supportsFiber: !0,
          inject: function () {
            return nextID++;
          },
          onScheduleFiberRoot: function () {},
          onCommitFiberRoot: function () {},
          onCommitFiberUnmount: function () {}
        };
      }
      if (hook.isDisabled)
        console.warn(
          "Something has shimmed the React DevTools global hook (__REACT_DEVTOOLS_GLOBAL_HOOK__). Fast Refresh is not compatible with this shim and will be disabled."
        );
      else {
        var oldInject = hook.inject;
        hook.inject = function (injected) {
          var id = oldInject.apply(this, arguments);
          "function" === typeof injected.scheduleRefresh &&
            "function" === typeof injected.setRefreshHandler &&
            helpersByRendererID.set(id, injected);
          return id;
        };
        hook.renderers.forEach(function (injected, id) {
          "function" === typeof injected.scheduleRefresh &&
            "function" === typeof injected.setRefreshHandler &&
            helpersByRendererID.set(id, injected);
        });
        var oldOnCommitFiberRoot = hook.onCommitFiberRoot,
          oldOnScheduleFiberRoot = hook.onScheduleFiberRoot || function () {};
        hook.onScheduleFiberRoot = function (id, root, children) {
          isPerformingRefresh ||
            (failedRoots.delete(root),
            null !== rootElements && rootElements.set(root, children));
          return oldOnScheduleFiberRoot.apply(this, arguments);
        };
        hook.onCommitFiberRoot = function (
          id,
          root,
          maybePriorityLevel,
          didError
        ) {
          var helpers = helpersByRendererID.get(id);
          if (void 0 !== helpers) {
            helpersByRoot.set(root, helpers);
            helpers = root.current;
            var alternate = helpers.alternate;
            null !== alternate
              ? ((alternate =
                  null != alternate.memoizedState &&
                  null != alternate.memoizedState.element &&
                  mountedRoots.has(root)),
                (helpers =
                  null != helpers.memoizedState &&
                  null != helpers.memoizedState.element),
                !alternate && helpers
                  ? (mountedRoots.add(root), failedRoots.delete(root))
                  : (alternate && helpers) ||
                    (alternate && !helpers
                      ? (mountedRoots.delete(root),
                        didError
                          ? failedRoots.add(root)
                          : helpersByRoot.delete(root))
                      : alternate ||
                        helpers ||
                        (didError && failedRoots.add(root))))
              : mountedRoots.add(root);
          }
          return oldOnCommitFiberRoot.apply(this, arguments);
        };
      }
    };
    exports.isLikelyComponentType = function (type) {
      switch (typeof type) {
        case "function":
          if (null != type.prototype) {
            if (type.prototype.isReactComponent) return !0;
            var ownNames = Object.getOwnPropertyNames(type.prototype);
            if (
              1 < ownNames.length ||
              "constructor" !== ownNames[0] ||
              type.prototype.__proto__ !== Object.prototype
            )
              return !1;
          }
          type = type.name || type.displayName;
          return "string" === typeof type && /^[A-Z]/.test(type);
        case "object":
          if (null != type)
            switch (getProperty(type, "$$typeof")) {
              case REACT_FORWARD_REF_TYPE:
              case REACT_MEMO_TYPE:
                return !0;
            }
          return !1;
        default:
          return !1;
      }
    };
    exports.performReactRefresh = function () {
      if (0 === pendingUpdates.length || isPerformingRefresh) return null;
      isPerformingRefresh = !0;
      try {
        var staleFamilies = new Set(),
          updatedFamilies = new Set(),
          updates = pendingUpdates;
        pendingUpdates = [];
        updates.forEach(function (_ref) {
          var family = _ref[0];
          _ref = _ref[1];
          var prevType = family.current;
          updatedFamiliesByType.set(prevType, family);
          updatedFamiliesByType.set(_ref, family);
          family.current = _ref;
          (prevType.prototype && prevType.prototype.isReactComponent) ||
          (_ref.prototype && _ref.prototype.isReactComponent)
            ? (_ref = !1)
            : ((prevType = allSignaturesByType.get(prevType)),
              (_ref = allSignaturesByType.get(_ref)),
              (_ref =
                (void 0 === prevType && void 0 === _ref) ||
                (void 0 !== prevType &&
                  void 0 !== _ref &&
                  computeFullKey(prevType) === computeFullKey(_ref) &&
                  !_ref.forceReset)
                  ? !0
                  : !1));
          _ref ? updatedFamilies.add(family) : staleFamilies.add(family);
        });
        var update = {
          updatedFamilies: updatedFamilies,
          staleFamilies: staleFamilies
        };
        helpersByRendererID.forEach(function (helpers) {
          helpers.setRefreshHandler(resolveFamily);
        });
        var didError = !1,
          firstError = null,
          failedRootsSnapshot = cloneSet(failedRoots),
          mountedRootsSnapshot = cloneSet(mountedRoots),
          helpersByRootSnapshot = cloneMap(helpersByRoot);
        failedRootsSnapshot.forEach(function (root) {
          var helpers = helpersByRootSnapshot.get(root);
          if (void 0 === helpers)
            throw Error(
              "Could not find helpers for a root. This is a bug in React Refresh."
            );
          failedRoots.has(root);
          if (null !== rootElements && rootElements.has(root)) {
            var element = rootElements.get(root);
            try {
              helpers.scheduleRoot(root, element);
            } catch (err) {
              didError || ((didError = !0), (firstError = err));
            }
          }
        });
        mountedRootsSnapshot.forEach(function (root) {
          var helpers = helpersByRootSnapshot.get(root);
          if (void 0 === helpers)
            throw Error(
              "Could not find helpers for a root. This is a bug in React Refresh."
            );
          mountedRoots.has(root);
          try {
            helpers.scheduleRefresh(root, update);
          } catch (err) {
            didError || ((didError = !0), (firstError = err));
          }
        });
        if (didError) throw firstError;
        return update;
      } finally {
        isPerformingRefresh = !1;
      }
    };
    exports.register = register;
    exports.setSignature = setSignature;
  })();`,
};

const DUMMY_REACT_REFRESH_RUNTIME = Object.keys(REACT_REFRESH_RUNTIME).reduce(
  (acc, key) => {
    acc[key] = "";
    return acc;
  },
  {} as any
);

export const files = {
  ...DUMMY_REACT_REFRESH_RUNTIME,
  "./src/assets/react.svg": `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>`,
  "./src/main.jsx": `import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
`,
  "./src/index.css": `:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}
a:hover {
  color: #535bf2;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

h1 {
  font-size: 3.2em;
  line-height: 1.1;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

@media (prefers-color-scheme: light) {
  :root {
    color: #213547;
    background-color: #ffffff;
  }
  a:hover {
    color: #747bff;
  }
  button {
    background-color: #f9f9f9;
  }
}
`,
  "./src/App.jsx": `import React from "react";
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);

	return (
		<div className="App">
			<div>
				<a href="https://reactjs.org" target="_blank" rel="noreferrer">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Rspack + React</h1>
			<div className="card">
				<button type="button" onClick={() => setCount(count => count + 1)}>
					count is {count}
				</button>
				<p>
					Edit <code>src/App.jsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Rspack and React logos to learn more
			</p>
		</div>
	);
}

export default App;
`,
  "./src/App.css": `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a > .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}`,
};

export const config: RspackOptions = {
  mode: "development",
  devtool: false,
  entry: "./src/main.jsx",
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "ecmascript",
                jsx: true,
              },
              transform: {
                react: {
                  pragma: "React.createElement",
                  pragmaFrag: "React.Fragment",
                  throwIfNamespace: true,
                  development: true,
                  refresh: true,
                },
              },
            },
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.(png|svg|jpg)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new ReactRefreshRspackPlugin(),
    new BrowserRequirePlugin({
      modules: REACT_REFRESH_RUNTIME,
    }),
    new BrowserHttpImportEsmPlugin({
      domain: "https://esm.sh",
      dependencyUrl(resolvedRequest) {
        if (resolvedRequest.request.includes("react-refresh")) {
          return resolvedRequest.request;
        }
      },
    }),
  ],
  experiments: {
    css: true,
    buildHttp: {
      allowedUris: ["https://"],
    },
  },
};
