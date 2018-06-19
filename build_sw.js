!function i(u,s,c){function a(e,t){if(!s[e]){if(!u[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(f)return f(e,!0);var r=new Error("Cannot find module '"+e+"'");throw r.code="MODULE_NOT_FOUND",r}var o=s[e]={exports:{}};u[e][0].call(o.exports,function(t){return a(u[e][1][t]||t)},o,o.exports,i,u,s,c)}return s[e].exports}for(var f="function"==typeof require&&require,t=0;t<c.length;t++)a(c[t]);return a}({1:[function(t,h,e){"use strict";!function(){function u(n){return new Promise(function(t,e){n.onsuccess=function(){t(n.result)},n.onerror=function(){e(n.error)}})}function i(n,r,o){var i,t=new Promise(function(t,e){u(i=n[r].apply(n,o)).then(t,e)});return t.request=i,t}function t(t,n,e){e.forEach(function(e){Object.defineProperty(t.prototype,e,{get:function(){return this[n][e]},set:function(t){this[n][e]=t}})})}function e(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return i(this[n],t,arguments)})})}function n(e,n,r,t){t.forEach(function(t){t in r.prototype&&(e.prototype[t]=function(){return this[n][t].apply(this[n],arguments)})})}function r(t,r,e,n){n.forEach(function(n){n in e.prototype&&(t.prototype[n]=function(){return t=this[r],(e=i(t,n,arguments)).then(function(t){if(t)return new s(t,e.request)});var t,e})})}function o(t){this._index=t}function s(t,e){this._cursor=t,this._request=e}function c(t){this._store=t}function a(n){this._tx=n,this.complete=new Promise(function(t,e){n.oncomplete=function(){t()},n.onerror=function(){e(n.error)},n.onabort=function(){e(n.error)}})}function f(t,e,n){this._db=t,this.oldVersion=e,this.transaction=new a(n)}function p(t){this._db=t}t(o,"_index",["name","keyPath","multiEntry","unique"]),e(o,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),r(o,"_index",IDBIndex,["openCursor","openKeyCursor"]),t(s,"_cursor",["direction","key","primaryKey","value"]),e(s,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(n){n in IDBCursor.prototype&&(s.prototype[n]=function(){var e=this,t=arguments;return Promise.resolve().then(function(){return e._cursor[n].apply(e._cursor,t),u(e._request).then(function(t){if(t)return new s(t,e._request)})})})}),c.prototype.createIndex=function(){return new o(this._store.createIndex.apply(this._store,arguments))},c.prototype.index=function(){return new o(this._store.index.apply(this._store,arguments))},t(c,"_store",["name","keyPath","indexNames","autoIncrement"]),e(c,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),r(c,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),n(c,"_store",IDBObjectStore,["deleteIndex"]),a.prototype.objectStore=function(){return new c(this._tx.objectStore.apply(this._tx,arguments))},t(a,"_tx",["objectStoreNames","mode"]),n(a,"_tx",IDBTransaction,["abort"]),f.prototype.createObjectStore=function(){return new c(this._db.createObjectStore.apply(this._db,arguments))},t(f,"_db",["name","version","objectStoreNames"]),n(f,"_db",IDBDatabase,["deleteObjectStore","close"]),p.prototype.transaction=function(){return new a(this._db.transaction.apply(this._db,arguments))},t(p,"_db",["name","version","objectStoreNames"]),n(p,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(i){[c,o].forEach(function(t){i in t.prototype&&(t.prototype[i.replace("open","iterate")]=function(){var t,e=(t=arguments,Array.prototype.slice.call(t)),n=e[e.length-1],r=this._store||this._index,o=r[i].apply(r,e.slice(0,-1));o.onsuccess=function(){n(o.result)}})})}),[o,c].forEach(function(t){t.prototype.getAll||(t.prototype.getAll=function(t,n){var r=this,o=[];return new Promise(function(e){r.iterateCursor(t,function(t){t?(o.push(t.value),void 0===n||o.length!=n?t.continue():e(o)):e(o)})})})});var l={open:function(t,e,n){var r=i(indexedDB,"open",[t,e]),o=r.request;return o.onupgradeneeded=function(t){n&&n(new f(o.result,t.oldVersion,o.transaction))},r.then(function(t){return new p(t)})},delete:function(t){return i(indexedDB,"deleteDatabase",[t])}};void 0!==h?(h.exports=l,h.exports.default=h.exports):self.idb=l}()},{}],2:[function(t,e,n){"use strict";var r,o=t("idb"),i=(r=o)&&r.__esModule?r:{default:r};var u="mws-restaurant-static-v1",s=[u,"mws-restaurant-imgs"],c=i.default.open("restaurants-db",3,function(t){switch(t.oldVersion){case 0:t.createObjectStore("restaurants",{keypath:"name"})}});self.addEventListener("install",function(t){t.waitUntil(caches.open(u).then(function(t){return t.addAll(["/","/dist/build.js","/dist/build_restaurant.js","/css/styles.css"])}))}),self.addEventListener("activate",function(t){t.waitUntil(caches.keys().then(function(t){return Promise.all(t.filter(function(t){return t.startsWith("mws-restaurant-")&&!s.includes(t)}).map(function(t){return caches.delete(t)}))}))}),self.addEventListener("fetch",function(e){var t=new URL(e.request.url);"http://localhost:1337"===t.origin?"/restaurants"===t.pathname&&(navigator.onLine?e.respondWith(fetch(e.request).then(function(t){var e=t.clone();return t.json().then(function(t){return a(t)}).then(function(){return e})})):e.respondWith(c.then(function(t){return t.transaction("restaurants").objectStore("restaurants").getAll().then(function(t){var e=new Blob([JSON.stringify(t,null,2)],{type:"application/json"});return new Response(e,{status:200,statusText:"SuperSmashingGreat!"})})}))):e.respondWith(caches.match(e.request).then(function(t){return t||fetch(e.request)}))});var a=function(r){return c.then(function(t){var e=t.transaction("restaurants","readwrite"),n=e.objectStore("restaurants");return r.forEach(function(t){n.put(t,t.name)}),e.complete})}},{idb:1}]},{},[2]);//# sourceMappingURL=build_sw.js.map
