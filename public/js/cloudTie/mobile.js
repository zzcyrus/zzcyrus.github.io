var Tie = window.Tie || {};
!function (t) {
    function e(t, e) {
        var i, o, r, a, s, c, l, u, d, h, p, f, m = [], g = t.split(L), y = [e];
        for (r = 0,
            a = g.length; r < a; r++) {
            for (i = g[r],
                o = i.replace(D, ""),
                s = 0,
                c = y.length; s < c; s++)
                e = y[s],
                    N.test(i) ? (p = N.exec(o),
                        l = p[1],
                        f = document.getElementById(l),
                        f && v.contains(e, f) && m.push(f)) : E.test(i) && (p = E.exec(o),
                            u = p[1],
                            m = m.concat(n(u, e))),
                    D.test(i) && (p = D.exec(i),
                        d = p[1],
                        h = p[2],
                        m = v.map(m, function (t) {
                            return t[d] === h ? t : null
                        }));
            r !== a - 1 && (y = m,
                m = [])
        }
        return m
    }
    function n(t, e, n) {
        for (var i = [], o = e.getElementsByTagName(n || "*"), r = o.length, a = new RegExp("(^|\\s)" + t + "(\\s|$)"), s = 0, c = 0; s < r; s++)
            a.test(o[s].className) && (i[c] = o[s],
                c++);
        return i
    }
    function i(t) {
        return t.replace(/-(\w+?)/g, function (t) {
            return t.toUpperCase()
        })
    }
    function o(t, e) {
        return window.getComputedStyle ? window.getComputedStyle(t).getPropertyValue(e) : t.currentStyle.getAttribute(i(e))
    }
    function r(t) {
        return M.indexOf(t.nodeName.toLowerCase()) > 0 ? "block" : "inline"
    }
    function a(t) {
        var e = "length" in t && t.length
            , n = typeof t;
        return "function" !== n && !v.isWindow(t) && (!(1 !== t.nodeType || !e) || ("array" === n || 0 === e || "number" == typeof e && e > 0 && e - 1 in t))
    }
    function s(t, e) {
        for (; (t = t[e]) && 1 !== t.nodeType;)
            ;
        return t
    }
    function c(t, e) {
        for (var n, i = 0; i < t.length; i++)
            if (v.contains(t[i], e)) {
                n = t[i];
                break
            }
        return n
    }
    function l(t) {
        var e = "mouseover, mouseout, click, keydown, keypress, touchstart, touchend, touchmove";
        return e.indexOf(t) > -1
    }
    function u(t, e, n, i) {
        z[e] ? z[e](t, n) : document.addEventListener ? t.addEventListener(e, n, i) : (e = H[e] ? H[e].delegateType : e,
            t.attachEvent("on" + e, function () {
                n.call(t, arguments[0])
            }))
    }
    function d(t) {
        return t = t || window.event,
            t.target || (t.target = t.srcElement),
            t.preventDefault || (t.preventDefault = function () {
                t.returnValue = !1
            }
            ),
            t
    }
    function h(t, e, n) {
        var i, o = t.status;
        if (o >= 200 && o < 300) {
            switch (e.dataType) {
                case "text":
                    i = t.responseText;
                    break;
                case "json":
                    i = function (n) {
                        try {
                            return JSON.parse(n)
                        } catch (i) {
                            try {
                                return new Function("return " + n)()
                            } catch (i) {
                                e.failure(t)
                            }
                        }
                    }(t.responseText);
                    break;
                case "xml":
                    i = t.responseXML;
                    break;
                default:
                    i = t
            }
            "undefined" != typeof i && "function" == typeof n && n(i)
        }
        t = null
    }
    function p(t, e, n) {
        var i = new XMLHttpRequest
            , o = t.data
            , r = t.type
            , a = t.url;
        if (o && "object" == typeof o && (o = v.serialize(o)),
            "GET" === r && o && (a += (A.test(a) ? "&" : "?") + o,
                o = null),
            a += (A.test(a) ? "&" : "?") + "_=" + q++ ,
            i.open(r, a, t.async),
            i.timeout = t.timeout,
            "POST" === r && i.setRequestHeader("Content-type", t.contentType),
            n)
            for (var s in n)
                i.setRequestHeader(s, n[s]);
        return void 0 === t.withCredentials ? i.withCredentials = !0 : i.withCredentials = t.withCredentials,
            i.send(o),
            i.onreadystatechange = function () {
                4 === i.readyState && h(i, t, e)
            }
            ,
            i
    }
    function f(t, e) {
        function n() {
            i = void 0,
                a.onload = a.onreadystatechange = null,
                R.removeChild(a),
                a = void 0
        }
        var i, o = t.data, r = t.url, a = document.createElement("script");
        t.jsonpCallback = t.jsonpCallback || v.expando + "_" + q++ ,
            o && (o = "object" == typeof o ? v.serialize(o) : o,
                r += (A.test(r) ? "&" : "?") + o,
                o = null),
            r += (A.test(r) ? "&" : "?") + t.jsonp + "=" + t.jsonpCallback,
            r += (A.test(r) ? "&" : "?") + "_=" + q++ ,
            a.src = r,
            a.setAttribute("async", !0),
            a.charset = t.scriptCharset,
            R.appendChild(a),
            window[t.jsonpCallback] = function () {
                i = arguments
            }
            ,
            a.onload = a.onreadystatechange = function () {
                this.readyState && "loaded" != this.readyState && "complete" != this.readyState || (e && e(i && i[0]),
                    n())
            }
            ,
            a.onerror = function () {
                e(null),
                    n()
            }
    }
    function m(t, e) {
        function n(t) {
            var n, i, o;
            try {
                n = a.contentDocument,
                    i = n.location,
                    o = n.body.innerHTML
            } catch (r) { }
            e && e(o, i, n)
        }
        var i, o, r, a, s = "", c = t.data, l = document.charset;
        0 === v("#tie_sdk_util_frame").length && (r = v(document.body),
            i = '<iframe src="javascript:false;" name="tie_sdk_util_frame" id="tie_sdk_util_frame" border="no" style="display: none;"></iframe>',
            r.append(i),
            o = '<form id="tie_sdk_util_form" method="post" action="" target="tie_sdk_util_frame" accept-charset="' + t.scriptCharset + '" onsubmit="document.charset=\'' + t.scriptCharset + '\';" style="display: none;"></form>',
            r.append(o)),
            i = v("#tie_sdk_util_frame"),
            o = v("#tie_sdk_util_form").empty(),
            a = i[0],
            a.attachEvent ? a.attachEvent("onload", n) : a.onload = n,
            o.attr("action", t.url);
        for (var u in t.data)
            s += '<input type="hidden" name="' + u + '" value="' + c[u] + '">';
        o.append(s);
        try {
            document.charset = t.scriptCharset
        } catch (d) { }
        o[0].submit();
        try {
            document.charset = l
        } catch (d) { }
        t.removeIframe && (i.remove(),
            o.remove())
    }
    function g(t) {
        var e = !1
            , n = []
            , i = /(^http(s)?:\/\/[A-Za-z0-9_\.]+)\/?/;
        if (_.test(t)) {
            try {
                n = _.exec(t.toLowerCase())
            } catch (o) {
                n = i.exec(t.toLowerCase())
            }
            n[0] === O[0] && n[1] === O[0] || (e = !0)
        }
        return e
    }
    var v = function (t, e) {
        return new v.fn.init(t, e)
    }
        , y = "1.0"
        , b = []
        , w = b.splice
        , T = b.slice
        , C = b.concat
        , x = Array.isArray || function (t) {
            return t instanceof Array
        }
        , k = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g
        , S = /checked/gi
        , L = /\s+/
        , I = /[\t\r\n]/g;
    v.fn = v.prototype = {
        tool: y,
        constructor: v,
        length: 0,
        push: b.push,
        sort: b.sort,
        splice: w,
        size: function () {
            return this.length
        },
        pushStack: function (t) {
            var e = v.merge(this.constructor(), t);
            return e.prevObject = this,
                e.context = this.context,
                e
        },
        each: function (t) {
            for (var e = 0; e < this.length; e++)
                t.call(this[e], e, this[e])
        },
        slice: function () {
            return this.pushStack(T.apply(this, arguments))
        },
        first: function () {
            return this.eq(0)
        },
        last: function () {
            return this.eq(-1)
        },
        eq: function (t) {
            var e = this.length
                , n = +t + (t < 0 ? e : 0);
            return this.pushStack(n >= 0 && n < e ? [this[n]] : [])
        },
        find: function (t) {
            var e, n, i = this.length, o = [];
            for (e = 0; e < i; e++)
                n = v(t, this[e]),
                    v.each(n, function (t, e) {
                        o.push(e)
                    });
            return o = this.pushStack(i > 1 ? v.unique(o) : o)
        },
        html: function (t) {
            var e = this[0] || {}
                , n = 0
                , i = this.length;
            if (void 0 === t && 1 === e.nodeType)
                return e.innerHTML;
            for (; n < i; n++)
                e = this[n],
                    1 === e.nodeType && (e.innerHTML = t);
            return this
        },
        val: function (t) {
            var e = this[0] || {}
                , n = 0
                , i = this.length;
            if (void 0 === t && 1 === e.nodeType)
                return e.value;
            for (; n < i; n++)
                e = this[n],
                    1 === e.nodeType && (e.value = t);
            return this
        },
        attr: function (t, e) {
            var n = this[0] || {}
                , i = 0
                , o = this.length;
            if (void 0 === e && 1 === n.nodeType)
                return S.test(t) ? n[t] : n.getAttribute(t);
            if ("string" == typeof e) {
                for (; i < o; i++)
                    n = this[i],
                        1 === n.nodeType && (S.test(t) ? n[t] = e : n.setAttribute(t, e));
                return this
            }
        },
        addCls: function (t) {
            var e, n, i = 0, o = this.length;
            if (t)
                for (; i < o; i++)
                    e = this[i],
                        1 === e.nodeType && (e.classList ? e.classList.add(t) : (n = " " + e.className + " ",
                            n.indexOf(" " + t + " ") < 0 && (n += t + " ",
                                e.className = v.trim(n))));
            return this
        },
        delCls: function (t) {
            var e, n, i = 0, o = this.length;
            if (t)
                for (; i < o; i++)
                    e = this[i],
                        1 === e.nodeType && (e.classList ? e.classList.remove(t) : (n = (" " + e.className + " ").replace(I, " "),
                            n.indexOf(" " + t + " ") >= 0 && (n = n.replace(" " + t + " ", " ")),
                            e.className = v.trim(n)));
            return this
        },
        tglCls: function (t) {
            var e, n, i = 0, o = this.length;
            if (t)
                for (; i < o; i++)
                    e = this[i],
                        1 === e.nodeType && (e.classList ? e.classList.toggle(t) : (n = this.eq(i),
                            n.hasCls(t) ? n.delCls(t) : n.addCls(t)));
            return this
        },
        hasCls: function (t) {
            var e, n = 0, i = this.length;
            if (t)
                for (; n < i; n++)
                    if (e = this[n],
                        1 === e.nodeType)
                        if (e.classList) {
                            if (e.classList.contains(t))
                                return !0
                        } else if ((" " + e.className + " ").replace(I, " ").indexOf(t) >= 0)
                            return !0;
            return !1
        },
        show: function () {
            for (var t, e, n, i = 0, a = this.length; i < a; i++)
                t = this[i],
                    e = t.getAttribute("data-display"),
                    e && "none" !== e ? n = e : "none" !== (n = o(t, "display")) || (n = r(t)),
                    t.style.display = n;
            return this
        },
        hide: function () {
            for (var t, e = 0, n = this.length; e < n; e++)
                t = this[e],
                    t.setAttribute("data-display", o(t, "display")),
                    t.style.display = "none";
            return this
        },
        position: function () {
            var t = this[0]
                , e = t.getBoundingClientRect()
                , n = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft)
                , i = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
            return {
                left: e.left + n,
                top: e.top + i
            }
        },
        offset: function () {
            var t = this[0]
                , e = t.getBoundingClientRect();
            return {
                left: e.left,
                top: e.top
            }
        },
        css: function () {
            var t, e, n = 0, i = arguments[0];
            if (arguments.length > 1 || "object" == typeof i) {
                for (; null != (t = this[n]); n++)
                    if (1 === t.nodeType || 11 === t.nodeType || 9 === t.nodeType)
                        for (e in i)
                            t.style[e] = i[e];
                return this
            }
            return t = this[0],
                o(t, i)
        },
        width: function (t) {
            var e, n, i, o = 0;
            if (t && "number" == typeof t) {
                for (; null != (e = this[o]); o++)
                    1 === e.nodeType && (e.style.width = t + "px");
                return this
            }
            return e = this[0],
                v.isWindow(e) ? n = e.document.documentElement.clientWidth : 9 === e.nodeType ? (i = e.documentElement,
                    n = Math.max(e.body.scrollWidth, i.scrollWidth, e.body.offsetWidth, i.offsetWidth, i.clientWidth)) : n = e.offsetWidth,
                n
        },
        height: function (t) {
            var e, n, i, o = 0;
            if (t && "number" == typeof t) {
                for (; null != (e = this[o]); o++)
                    1 === e.nodeType && (e.style.height = t + "px");
                return this
            }
            return e = this[0],
                v.isWindow(e) ? n = window.innerHeight || e.document.documentElement.clientHeight : 9 === e.nodeType ? (i = e.documentElement,
                    n = Math.max(e.body.scrollHeight, i.scrollHeight, e.body.offsetHeight, i.offsetHeight, i.clientHeight)) : n = e.offsetHeight,
                n
        },
        empty: function () {
            for (var t, e = 0; null != (t = this[e]); e++)
                1 === t.nodeType && (t.textContent = "");
            return this
        },
        remove: function () {
            for (var t, e = 0; null != (t = this[e]); e++)
                t.parentNode && t.parentNode.removeChild(t);
            return this
        },
        append: function () {
            for (var t, e = 0, n = v.parseDom(arguments[0]); null != (t = this[e]); e++)
                1 !== t.nodeType && 11 !== t.nodeType && 9 !== t.nodeType || t.appendChild(n.cloneNode(!0));
            return this
        },
        prepend: function () {
            for (var t, e = 0, n = v.parseDom(arguments[0]); null != (t = this[e]); e++)
                1 !== t.nodeType && 11 !== t.nodeType && 9 !== t.nodeType || t.insertBefore(n.cloneNode(!0), t.firstChild);
            return this
        },
        before: function () {
            for (var t, e = 0, n = v.parseDom(arguments[0]); null != (t = this[e]); e++)
                t.parentNode && t.parentNode.insertBefore(n.cloneNode(!0), t);
            return this
        },
        after: function () {
            for (var t, e = 0, n = v.parseDom(arguments[0]); null != (t = this[e]); e++)
                t.parentNode && t.parentNode.insertBefore(n.cloneNode(!0), t.nextSibling);
            return this
        }
    };
    var j = v.fn.init = function (t, n) {
        var i, n = n || document;
        if (!t)
            return this;
        if ("string" == typeof t) {
            t = v.trim(t),
                i = document.querySelectorAll ? n.querySelectorAll(t) : e(t, n);
            for (var o = 0; o < i.length; o++)
                this[o] = i[o];
            this.length = i.length
        } else
            (t.nodeType || t.window) && (this[0] = t,
                this.length = 1);
        return this.context = n,
            this.selector = t,
            this
    }
        ;
    j.prototype = v.fn;
    var N = /^#(\S+)/
        , E = /^\.(\S+)/
        , D = /\[(\S+)=(\S+)\]$/
        , M = "body|div|h1|h2|h3|h4|h5|h6|ul|li|p|dl|ol|form|table|hr|dir|center|menu|pre|address|blockquote";
    v.extend = v.fn.extend = function () {
        var t, e, n, i = arguments[0] || {}, o = 1, r = arguments.length;
        for (o === r && (i = this,
            o--); o < r; o++)
            if (null != (t = arguments[o]))
                for (e in t)
                    n = t[e],
                        i !== n && void 0 !== n && (i[e] = n);
        return i
    }
        ,
        v.extend({
            expando: "tool" + (y + Math.random()).replace(/\D/g, ""),
            isArray: x,
            isWindow: function (t) {
                return null != t && t === t.window
            },
            contains: function (t, e) {
                return t !== document || document.contains || (t = document.documentElement || document.body),
                    t.contains(e)
            },
            trim: function (t) {
                return null == t ? "" : (t + "").replace(k, "")
            },
            parseDom: function (t) {
                var e, n, i, o = document.createDocumentFragment(), r = 0, a = [];
                if ("string" == typeof t) {
                    for (e = document.createElement("div"),
                        e.innerHTML = t,
                        i = e.childNodes,
                        n = i.length; r < n; ++r)
                        a.push(i[r]);
                    for (r = 0; r < n; r++)
                        o.appendChild(a[r])
                } else if ("object" == typeof t && t.nodeType)
                    o.appendChild(t);
                else if (t instanceof v)
                    for (r = 0; r < t.length; r++)
                        o.appendChild(t[r]);
                else
                    v.log("\u4f20\u9012\u7684\u53c2\u6570\u975e\u6cd5!");
                return o
            },
            each: function (t, e) {
                var n, i = 0, o = t.length, r = a(t);
                if (r)
                    for (; i < o && (n = e.call(t[i], i, t[i]),
                        n !== !1); i++)
                        ;
                else
                    for (i in t)
                        if (n = e.call(t[i], i, t[i]),
                            n === !1)
                            break
            },
            map: function (t, e) {
                var n, i = 0, o = t.length, r = a(t), s = [];
                if (r)
                    for (; i < o; i++)
                        n = e(t[i], i),
                            null != n && s.push(n);
                else
                    for (i in t)
                        n = e(t[i], i),
                            null != n && s.push(n);
                return C.apply([], s)
            },
            proxy: function (t, e) {
                var n, i;
                return n = T.call(arguments, 2),
                    i = function () {
                        return t.apply(e || this, n.concat(T.call(arguments)))
                    }
            },
            merge: function (t, e) {
                for (var n = +e.length, i = 0, o = t.length; i < n; i++)
                    t[o++] = e[i];
                return t.length = o,
                    t
            },
            unique: function (t) {
                if (document.documentElement.compareDocumentPosition) {
                    var e = function (t, e) {
                        return t === e ? 0 : t.compareDocumentPosition && e.compareDocumentPosition ? 4 & t.compareDocumentPosition(e) ? -1 : 1 : t.compareDocumentPosition ? -1 : 1
                    };
                    t.sort(e);
                    for (var n = 1; n < t.length; n++)
                        t[n] === t[n - 1] && t.splice(n--, 1)
                }
                return t
            },
            dir: function (t, e, n) {
                for (var i = [], o = void 0 !== n; (t = t[e]) && 9 !== t.nodeType;)
                    if (1 === t.nodeType) {
                        if (o)
                            break;
                        i.push(t)
                    }
                return i
            },
            sibling: function (t, e) {
                for (var n = []; t; t = t.nextSibling)
                    1 === t.nodeType && t !== e && n.push(t);
                return n
            },
            now: Date.now ? Date.now : function () {
                return (new Date).getTime()
            }
        }),
        v.each({
            parent: function (t) {
                var e = t.parentNode;
                return e && 11 !== e.nodeType ? e : null
            },
            parents: function (t) {
                return v.dir(t, "parentNode")
            },
            children: function (t) {
                return v.sibling(t.firstChild)
            },
            siblings: function (t) {
                return v.sibling((t.parentNode || {}).firstChild, t)
            },
            next: function (t) {
                return s(t, "nextSibling")
            },
            prev: function (t) {
                return s(t, "previousSibling")
            }
        }, function (t, e) {
            v.fn[t] = function () {
                var t = v.map(this, e);
                return this.length > 1 && v.unique(t),
                    this.pushStack(t)
            }
        }),
        v.fn.extend({
            parentToLevel: function (t) {
                var e = t || 1
                    , n = 0
                    , i = v.map(this, function (t) {
                        for (var i = t; (i = i.parentNode) && 11 !== i.nodeType && ++n < e;)
                            ;
                        return i
                    });
                return this.length > 1 && v.unique(i),
                    this.pushStack(i)
            },
            child: function (t) {
                return this.children().eq(t)
            }
        });
    var H = {
        focus: {
            delegateType: "focusin"
        },
        blur: {
            delegateType: "focusout"
        }
    }
        , z = {
            tap: function (t, e) {
                var n = "touchstart"
                    , i = "touchend";
                u(t, n, function (t) {
                    var e = v(t.target);
                    e.attr("data-start-X", t.changedTouches[0].screenX + ""),
                        e.attr("data-start-Y", t.changedTouches[0].screenY + "")
                }, !l(n)),
                    u(t, i, function (t) {
                        var n = v(t.target)
                            , i = v.event.set.tapRange
                            , o = t.changedTouches[0].screenX
                            , r = parseInt(n.attr("data-start-X"))
                            , a = t.changedTouches[0].screenY
                            , s = parseInt(n.attr("data-start-Y"));
                        n.attr("data-end-X", o + ""),
                            n.attr("data-end-Y", a + ""),
                            Math.abs(o - r) <= i && Math.abs(a - s) <= i && e(t)
                    }, !l(i))
            }
        };
    v.event = {
        add: function (t, e, n, i) {
            var o = t.events || []
                , i = i || t;
            i = a(i) ? i : [i],
                o.push({
                    type: e,
                    target: i,
                    handler: n
                }),
                t.events = o,
                t.events[e] || (u(t, e, function (n) {
                    var i, n = d(n);
                    v.each(t.events, function (o, r) {
                        var a, s;
                        r.type === e && (i = r.target,
                            v.each(i, function (e, i) {
                                "string" == typeof i && (a = v(i, t),
                                    s = c(a, n.target),
                                    s && r.handler.call(s, n)),
                                    "object" == typeof i && v.contains(i, n.target) && r.handler.call(i, n)
                            }))
                    })
                }, !l(e)),
                    t.events[e] = !0)
        },
        del: function (t, e, n, i) {
            var o = arguments
                , r = t.events;
            r && r.length > 0 && (r = 1 === o.length ? [] : 2 === o.length ? v.map(r, function (t) {
                return t.type === e ? null : t
            }) : 3 === o.length ? v.map(r, function (t) {
                return t.type === e && t.handler === n ? null : t
            }) : v.map(r, function (t) {
                var o = t;
                return t.type === e && t.handler === n && i && (o.target = v.map(t.target, function (t) {
                    var e = !1;
                    for (var n in i)
                        if (i[n] === t) {
                            e = !0;
                            break
                        }
                    return e ? null : t
                })),
                    o
            })),
                t.events = r
        },
        trigger: function (t, e) { },
        set: {
            tapRange: 10
        }
    },
        v.fn.extend({
            on: function (t, e, n) {
                for (var i, o = arguments, r = t.split(/\s+/), a = 0; a < r.length; a++)
                    t = r[a],
                        v.each(this, function (r, a) {
                            2 === o.length ? (i = o[1],
                                v.event.add(a, t, i)) : (i = n,
                                    v.event.add(a, t, i, [e]))
                        });
                return this
            },
            off: function (t, e, n) {
                var i, o = arguments;
                return v.each(this, function (r, a) {
                    var s;
                    0 === o.length ? v.event.del(a) : 1 === o.length ? v.event.del(a, t) : 2 === o.length ? (i = o[1],
                        v.event.del(a, t, i)) : (i = n,
                            s = v(e, a),
                            s = 0 === s.length ? [e] : s,
                            v.event.del(a, t, i, v(e)))
                }),
                    this
            },
            trigger: function (t) {
                v.each(this, function (e, n) {
                    v.event.trigger(n, t)
                })
            },
            bind: function (t, e) {
                v.each(this, function (n, i) {
                    u(i, t, e, !l(t))
                })
            },
            unBind: function (t, e) {
                v.each(this, function (n, i) {
                    i.removeEventListener ? i.removeEventListener(t, e, !l(t)) : i.detachEvent("on" + t, e)
                })
            }
        });
    var q = v.now()
        , A = /\?/
        , R = document.head || document.getElementsByTagName("head")[0]
        , _ = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/
        , O = []
        , P = window.location.href.toLowerCase();
    try {
        O = _.exec(P),
            0 === O.length && (O = P.match(_))
    } catch (U) {
        0 === O.length && (O = [location.protocol + "//" + location.host])
    }
    var B = {
        url: "",
        type: "GET",
        async: !0,
        data: null,
        dataType: "text",
        jsonp: "callback",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        timeout: 0,
        scriptCharset: "UTF-8",
        crossDomain: null,
        supportCORS: "withCredentials" in new XMLHttpRequest,
        removeIframe: !0
    };
    v.extend({
        serialize: function (t) {
            var e = [];
            for (var n in t) {
                var i = t[n];
                if (null !== i && void 0 !== i || (i = ""),
                    i.constructor == Array)
                    for (var o = 0, r = i.length; o < r; o++)
                        e.push(n + "=" + encodeURIComponent(i[o]));
                else
                    e.push(n + "=" + encodeURIComponent(i))
            }
            return e.join("&")
        },
        getData: function (t, e, n) {
            var t = v.extend({}, B, t);
            t.type = t.type.toUpperCase(),
                null === t.crossDomain && (t.crossDomain = g(t.url)),
                t.crossDomain ? ("GET" === t.type && f(t, e),
                    "POST" === t.type && (t.supportCORS ? p(t, e, n) : m(t, e))) : p(t, e, n)
        },
        getFormData: function (t) {
            var e, n, i, o, r = t.find("input, textarea"), a = {}, s = [];
            if (0 === r.length) {
                for (i = t[0].getElementsByTagName("input"),
                    o = t[0].getElementsByTagName("textarea"),
                    e = 0,
                    n = i.length; e < n; e++)
                    s.push(i[e]);
                for (e = 0,
                    n = o.length; e < n; e++)
                    s.push(o[e]);
                r = s
            }
            return v.each(r, function (t, e) {
                e = v(e),
                    ("checkbox" !== e.attr("type") || "checkbox" === e.attr("type") && e.attr("checked")) && (a[e.attr("name")] = e.val())
            }),
                a
        },
        parseJSON: function (t) {
            var e = {};
            return e = window.JSON ? JSON.parse(t) : new Function("return " + t)()
        },
        stringify: function (t) {
            var e = "";
            return window.JSON ? e = JSON.stringify(t) : !function () {
                return v.each(t, function (t, n) {
                    e += "," + t + ":" + n
                }),
                    "" != e && (e = e.substring(1)),
                    "{" + e + "}"
            }(),
                e
        },
        loadCSS: function (t) {
            var e = document.createElement("link");
            e.rel = "stylesheet",
                e.type = "text/css",
                e.href = t,
                R.appendChild(e)
        }
    }),
        Tie.tool = v
}(),
    function (t) {
        function e(e, n) {
            t.isNative(window.scrollTo) ? window.scrollTo(e, n) : document.documentElement && document.documentElement.scrollTop ? (document.documentElement.scrollLeft = e,
                document.documentElement.scrollTop = n) : document.body && (document.body.scrollLeft = e,
                    document.body.scrollTop = n)
        }
        var n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
            , i = new Array((-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), (-1), 62, (-1), (-1), (-1), 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, (-1), (-1), (-1), (-1), (-1), (-1), (-1), 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, (-1), (-1), (-1), (-1), (-1), (-1), 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, (-1), (-1), (-1), (-1), (-1));
        t.extend({
            log: function (t) {
                "undefined" != typeof console && console.log && console.log(t)
            },
            render: function (t, e) {
                t = t || "",
                    e = e || [""];
                for (var n, i = /<%((?:(?!%>).)+)?%>/g, o = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, r = "var r=[];\n", a = 0, s = function (t, e) {
                    return r += e ? t.match(o) ? t : "r.push(" + t + ");\n" : "" !== t ? 'r.push("' + t.replace(/"/g, '\\"') + '");\n' : "",
                        s
                }; n = i.exec(t);)
                    s(t.slice(a, n.index))(n[1], !0),
                        a = n.index + n[0].length;
                s(t.substr(a, t.length - a)),
                    r += 'return r.join("");',
                    e = isNaN(e.length) ? [e] : e;
                for (var c = "", l = 0, u = e.length; l < u; l++)
                    c += new Function(r.replace(/[\r\t\n]/g, "")).apply(e[l]);
                return c
            },
            dataReplace: function (t, e) {
                t = t || "",
                    e = e || [""];
                for (var n, i = /{{((?:(?!}}).)+)?}}/g, o = "return ", r = 0, a = function (t, e) {
                    return o += e ? "+this." + t + "+" : '"' + t + '"',
                        a
                }; n = i.exec(t);)
                    a(t.slice(r, n.index))(n[1], !0),
                        r = n.index + n[0].length;
                return a(t.substr(r, t.length - r)),
                    new Function(o).apply(e)
            },
            cookie: {
                EXPIRESWITHUNIT: /[smhdMy]$/,
                TIMEUNITS: {
                    s: 1,
                    m: 60,
                    h: 3600,
                    d: 86400,
                    M: 2592e3,
                    y: 31536e3
                },
                encoder: window.encodeURIComponent,
                decoder: window.decodeURIComponent,
                get: function (t, e) {
                    var n = this;
                    t = n.encoder(t) + "=";
                    var i, o = document.cookie, r = o.indexOf(t);
                    return -1 === r ? e ? void 0 : "" : (r += t.length,
                        i = o.indexOf(";", r),
                        i === -1 && (i = o.length),
                        n.decoder(o.substring(r, i)))
                },
                set: function (t, e, n, i, o, r) {
                    var a = this
                        , s = [a.encoder(t) + "=" + a.encoder(e)];
                    if (n) {
                        var c, l;
                        n instanceof Date ? c = n : ("string" == typeof n && this.EXPIRESWITHUNIT.test(n) && (n = n.substring(0, n.length - 1),
                            l = RegExp.lastMatch),
                            isNaN(n) || (c = new Date,
                                c.setTime(c.getTime() + n * this.TIMEUNITS[l || "m"] * 1e3))),
                            c && s.push("expires=" + c.toUTCString())
                    }
                    o && s.push("path=" + o),
                        i && s.push("domain=" + i),
                        r && s.push("secure"),
                        document.cookie = s.join(";")
                },
                del: function (t, e, n) {
                    document.cookie = this.encoder(t) + "=" + (n ? ";path=" + n : "") + (e ? ";domain=" + e : "") + ";expires=Thu, 01-Jan-1970 00:00:01 GMT"
                }
            },
            formatDate: function (t, e) {
                var e = e || "yyyy-MM-dd hh:mm:ss"
                    , t = t || new Date;
                return Date.prototype.formatDt = Date.prototype.formatDt || function (t) {
                    var e = {
                        "M+": this.getMonth() + 1,
                        "d+": this.getDate(),
                        "h+": this.getHours(),
                        "m+": this.getMinutes(),
                        "s+": this.getSeconds(),
                        "q+": Math.floor((this.getMonth() + 3) / 3),
                        S: this.getMilliseconds()
                    };
                    /(y+)/.test(t) && (t = t.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length)));
                    for (var n in e)
                        new RegExp("(" + n + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[n] : ("00" + e[n]).substr(("" + e[n]).length)));
                    return t
                }
                    ,
                    t.formatDt(e)
            },
            subChineseStr: function (t, e, n) {
                e = 2 * e;
                for (var i = "", o = 0, r = 0; r < t.length; r++) {
                    if (t.charCodeAt(r) > 255 ? o += 2 : o++ ,
                        o >= e)
                        return n ? i + "..." : i;
                    i += t.charAt(r)
                }
                return t
            },
            scrollY: function (t, e) {
                var e = e || 0;
                window.scrollTo(0, t.position().top + e)
            },
            scrollTo: function (t, n, i) {
                var o, r, a, s, c, l = 50;
                i ? (o = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft),
                    r = Math.max(document.documentElement.scrollTop, document.body.scrollTop),
                    s = (t - o) / (i / l),
                    c = (n - r) / (i / l),
                    a = setInterval(function () {
                        o += s,
                            r += c,
                            s > 0 && o > t || c > 0 && r > n || s < 0 && o < t || c < 0 && r < n ? clearInterval(a) : e(o, r)
                    }, l),
                    setTimeout(function () {
                        e(t, n)
                    }, i)) : e(t, n)
            },
            isNative: function (t) {
                return !!t && (/\{\s*\[native code\]\s*\}/.test(t + "") || /\{\s*\/\* source code not available \*\/\s*\}/.test(t + ""))
            },
            base64Encode: function (t) {
                var e, i, o, r, a, s;
                for (o = t.length,
                    i = 0,
                    e = ""; i < o;) {
                    if (r = 255 & t.charCodeAt(i++),
                        i == o) {
                        e += n.charAt(r >> 2),
                            e += n.charAt((3 & r) << 4),
                            e += "==";
                        break
                    }
                    if (a = t.charCodeAt(i++),
                        i == o) {
                        e += n.charAt(r >> 2),
                            e += n.charAt((3 & r) << 4 | (240 & a) >> 4),
                            e += n.charAt((15 & a) << 2),
                            e += "=";
                        break
                    }
                    s = t.charCodeAt(i++),
                        e += n.charAt(r >> 2),
                        e += n.charAt((3 & r) << 4 | (240 & a) >> 4),
                        e += n.charAt((15 & a) << 2 | (192 & s) >> 6),
                        e += n.charAt(63 & s)
                }
                return e
            },
            base64Decode: function (t) {
                var e, n, o, r, a, s, c;
                for (s = t.length,
                    a = 0,
                    c = ""; a < s;) {
                    do
                        e = i[255 & t.charCodeAt(a++)];
                    while (a < s && e == -1); if (e == -1)
                        break;
                    do
                        n = i[255 & t.charCodeAt(a++)];
                    while (a < s && n == -1); if (n == -1)
                        break;
                    c += String.fromCharCode(e << 2 | (48 & n) >> 4);
                    do {
                        if (o = 255 & t.charCodeAt(a++),
                            61 == o)
                            return c;
                        o = i[o]
                    } while (a < s && o == -1); if (o == -1)
                        break;
                    c += String.fromCharCode((15 & n) << 4 | (60 & o) >> 2);
                    do {
                        if (r = 255 & t.charCodeAt(a++),
                            61 == r)
                            return c;
                        r = i[r]
                    } while (a < s && r == -1); if (r == -1)
                        break;
                    c += String.fromCharCode((3 & o) << 6 | r)
                }
                return c
            },
            isMobileDevice: function () {
                var t = navigator.userAgent.toLowerCase()
                    , e = "ipad" == t.match(/ipad/i)
                    , n = "iphone os" == t.match(/iphone os/i)
                    , i = "midp" == t.match(/midp/i)
                    , o = "rv:1.2.3.4" == t.match(/rv:1.2.3.4/i)
                    , r = "ucweb" == t.match(/ucweb/i)
                    , a = "android" == t.match(/android/i)
                    , s = "windows ce" == t.match(/windows ce/i)
                    , c = "windows mobile" == t.match(/windows mobile/i);
                return e || n || i || o || r || a || s || c
            },
            isIE: function () {
                var t = navigator.userAgent;
                return t.indexOf("MSIE") >= 0 && t.indexOf("Opera") < 0
            },
            clone: function (e) {
                return t.parseJSON(t.stringify(e))
            },
            refresh: function (e, n) {
                var n = n || Tie.view.wrapper;
                n.find("[ne-id='" + e + "']").each(function (e) {
                    var n, i = t(this), o = i.attr("ne-tmpl"), r = i.attr("ne-data");
                    r && (n = Tie.getByUID(r)),
                        o && (/^\>/.test(o) ? i.html(t.render(Tie.tpl[o.substring(1)], n)) : (i.after(t.render(Tie.tpl[o], n)),
                            i.remove()))
                })
            }
        })
    }(Tie.tool),
    function (t) {
        function e() { }
        var n = t.tool
            , i = /<(iframe|script|form|embed|video|h1)[\s\S]*?<\/\1>|<(link|embed) .*?>/gi
            , o = /end\-?text|content\-?text/i
            , r = /copyright|siteinfo|biaoti|shmbody|head|foot|about|more|^wen$/i
            , a = function (t) {
                return t && t.tagName ? t.tagName.toLowerCase() : ""
            };
        e.prototype = {
            parse: function (t, e, i) {
                this.maxP = 0,
                    this.maxH = 0,
                    "function" == typeof t && (i = e,
                        e = t,
                        t = null),
                    t = t || document.body;
                var o = n(location.host.indexOf("blog.") == -1 ? "h1" : "h2");
                o[0] || (o = n(".title,h1,h2"));
                var r, a = document.title.replace(/\s/g, "");
                o.each(function (t, e) {
                    var n = e.innerHTML.replace(/<.*?>/g, "").replace(/\s|&nbsp;?/gi, "");
                    n && n.length < 90 && (!a || ~a.indexOf(n.substr(0, 5))) && (r = e)
                }),
                    r || n("h3").each(function (t, e) {
                        var n = e.innerHTML.replace(/<.*?>/g, "").replace(/\s|&nbsp;?/gi, "");
                        n && n.length < 90 && ~a.indexOf(n.substr(0, 6)) && (r = e)
                    });
                var s = r ? r.innerHTML.replace(/<.*?>/g, "").trim() : "";
                /\u52a0\u8f7d\u4e2d|loading|^\s+$/i.test(s) && (s = ""),
                    this.state = {
                        title: s || document.title
                    },
                    this.detectByHost(t) || this.detectByP(t),
                    "function" == typeof e && (i || (this.state.content = this.state.content.replace(/<img .*?>/gi, "")),
                        e(this.state))
            },
            detectByHost: function (t) {
                var e = !1
                    , o = location.host.replace(/.*?\.([^\s\.]+\.[^\s\.]+)$/, "$1")
                    , r = location.host.replace(/.*?\.([^\s\.]+\.[^\s\.]+\.[^\s\.]+)$/, "$1")
                    , a = {
                        "cfi.cn": function () {
                            var e = "";
                            return n("#tdcontent", t).each(function (t, n) {
                                var o = n.innerHTML.replace(i, "").replace(/<table[\s\S]*?<\/table>/gi, "");
                                e += o
                            }),
                                e
                        },
                        "sohu.com": function () {
                            var e = "";
                            return n("[itemprop=articleBody],#contentText", t).each(function (t, n) {
                                var o = n.innerHTML.replace(i, "");
                                e += o
                            }),
                                e
                        },
                        "blog.sina.com.cn": function () {
                            var e = "";
                            return n(".articalContent", t).each(function (t, n) {
                                var o = n.innerHTML.replace(i, "");
                                e += o
                            }),
                                e
                        },
                        "blog.163.com": function () {
                            var e = "";
                            return n(".nbw-blog", t).each(function (t, n) {
                                var o = n.innerHTML.replace(i, "");
                                e += o
                            }),
                                e
                        },
                        "k618.cn": function () {
                            var e = "";
                            return n("#photoContainer .fenshuwz", t).each(function (t) {
                                var n = t.innerHTML ? t.innerHTML.replace(i, "") : "";
                                e += n
                            }),
                                e
                        }
                    }
                    , s = a[location.host] || a[r] || a[o];
                return s && (e = s()) && (this.state.content = e),
                    e
            },
            detectByP: function (t) {
                var e = ""
                    , i = this
                    , o = []
                    , s = document.body.offsetHeight;
                n("p,div>br", t).each(function (t, c) {
                    if (!r.test(c.className) && ("p" != a(c) || c.innerHTML.replace(/\s|&nbsp;/gi, ""))) {
                        var l = c.parentNode;
                        i.query = "",
                            /^(i|font|b|em|strong|center)$/i.test(l.tagName) && (i.query = RegExp.$1,
                                l = l.parentNode),
                            o.indexOf(l) == -1 && (!i.detect(l) && n(c).position().top < .8 * s && (e += c.outerHTML),
                                o.push(l))
                    }
                }),
                    this.state.content || (this.state.content = e)
            },
            getContent: function (t) {
                var e = ""
                    , i = ".rdtj";
                if (n("li a", t).length < 3)
                    if (n(i, t)[0]) {
                        var o = t.cloneNode(!0);
                        n(i, o).remove(),
                            e = o.innerHTML
                    } else
                        e = t.innerHTML;
                else
                    n("p", t).each(function (t, n) {
                        e += n.outerHTML
                    });
                return e
            },
            detect: function (t) {
                var e = t.className || ""
                    , a = t.id || "";
                if (t == document.body || r.test(e) || r.test(a))
                    return !1;
                var s = Math.min(document.body.offsetWidth, 980)
                    , c = this.getContent(t).replace(i, "");
                if ((t.offsetWidth > s / 2 || /allContent/i.test(a)) && n(t).position().top < .6 * document.body.offsetHeight && (o.test(e) || o.test(a) || c.replace(/<(?!img).*?>/g, "").replace(/\s/g, "").length > 60)) {
                    var l = n(this.query + " p", t).length
                        , u = t.offsetHeight;
                    if (l > this.maxP || u > this.maxH)
                        return this.maxP = l,
                            this.maxH = u,
                            this.state.contentNode = t,
                            this.state.content = c,
                            !0
                }
                return !1
            }
        };
        var s = new e;
        t.third = t.third || {},
            t.third.extractor = s
    }(window.Tie);
var Tie = window.Tie || {};
Tie.convertPath = function (t) {
    var e;
    return "~" === t[0] ? (e = location.href.indexOf(/mobile/),
        location.href.substring(0, e) + t.substring(1)) : t
}
    ,
    Tie.set = {
        cntRowH: .48,
        limitCntH: 0,
        tabItemCls: "js-tab-item-index",
        wrapperId: "js-tie-sdk-wrapper",
        loginBtnCls: {
            mail: "js-mail-login",
            weibo: "js-weibo-login",
            qq: "js-qq-login"
        },
        floorCls: {
            trunk: "js-single-tie",
            middle: "js-expand-floor",
            operateRow: "js-operate-row",
            arrow: "arrow",
            foldFlr: " z-fold-floor",
            cnt: "js-tie-cnt"
        },
        barCls: {
            title: "js-tie-title-bar",
            panel: "js-tie-panel-bar",
            input: "js-tie-input-bar",
            login: "js-tie-login-bar"
        },
        maskCls: "js-tie-mask",
        panelCls: {
            list: "js-tie-list",
            empty: "js-tie-empty-tip",
            load: "js-tie-load-more",
            hotList: "js-hot-list",
            newList: "js-new-list",
            noMore: "js-tie-no-more"
        },
        barId: {
            shareWin: "shareListWin"
        },
        stateCls: {
            visited: "z-visited",
            parallelFlr: " z-parallel-floor",
            visible: "z-visible",
            hidden: "z-hidden",
            visibleShare: "z-visible-share",
            inputR: "z-read",
            inputW: "z-write",
            enabled: "z-enabled",
            lock: "z-lock",
            hideTpl: "z-hide-lower"
        },
        inputCls: {
            submitBtn: "js-tie-submit-btn",
            parentPostIdInpt: "js-tie-parent-id",
            boxWrapper: "js-postinput",
            userBox: "js-username",
            pwdBox: "js-password",
            cntInput: "js-tie-content-input",
            parentIdInput: "js-quote-tie-id",
            joinNumLabel: "js-tie-join-count",
            tipTxt: "js-tip-txt"
        },
        dataAtr: {
            postId: "data-post-id",
            postUp: "data-post-up",
            tab: "data-tab",
            loginType: "data-login-type",
            "\u6700\u70ed": "hot",
            "\u6700\u65b0": "new"
        },
        iconBasePath: Tie.convertPath("https://img1.cache.netease.com/f2e/tie/yun/sdk/mobile/icons"),
        baseDataHost: /^http:\/\/(dev\.f2e|qa\.developer)\./.test(document.location.href) ? "http://qaapi.gentie.163.com" : "https://" + window.location.hostname,
        baseDataURL: "/products/<% this.productKey %>",
        thumbnailURL: "/webshot/cloudgentie",
        defaultUserTitleLink: "http://tie.163.com/gt/14/0226/12/9M0QKRDU00304IK1.html",
        cookie: {
            toCommentPage: "toMain",
            domain: ".163.com"
        },
        storage: {
            unloginInput: "UNloginInput",
            prevLoginURL: "prevLoginURL"
        },
        thirdOauth: {
            base: "https://reg.163.com/outerLogin/oauth2/connect.do",
            target: {
                qzone: 1,
                weibo: 3
            },
            product: "gentie",
            url: Tie.convertPath("https://api.gentie.163.com/mobile/refresh.html"),
            mail: Tie.convertPath("https://api.gentie.163.com/mobile/login.html")
        },
        refreshIframeInterval: 100,
        defaultConfig: {
            nestedHierarchy: 6,
            startHideMdl: 7,
            maxFloor: 70,
            operators: ["up", "reply", "share"],
            domContainer: "#cloud-tie-area"
        }
    },
    function (t) {
        var e = t.tool;
        t.controller = {
            create: function (t) {
                var n = function () {
                    this.init.apply(this, arguments)
                };
                return n.fn = n.prototype,
                    n.fn.init = function () { }
                    ,
                    n.fn.eventSplitter = /^(\w+)\s*(.*)$/,
                    n.fn.delegateEvents = function (t) {
                        function n(t) {
                            var n = [];
                            return t && e.each(t.split(/,/), function (t, e) {
                                a.test(e) && (e = new Function("return " + e.replace(a, "this.") + ";").call(o)),
                                    n.push(e)
                            }),
                                n
                        }
                        function i(t) {
                            var n = e(this).attr("ne-model");
                            o.temp = e.trim(e(this).val()),
                                new Function("this." + n + "= this.temp;").call(o)
                        }
                        var o = this
                            , r = {
                                stat: "click"
                            }
                            , a = /^scope\./;
                        e.each(t, function (t, i) {
                            var a, s, c = "ne-" + i;
                            i = r[i] || i,
                                o.el.on(i, "[" + c + "]", function (t) {
                                    for (var i = e(this).attr(c).split(/\s+/), r = 0; r < i.length; r++)
                                        a = i[r].match(/(\S+)\((\S+)?\)/),
                                            s = [t, o].concat(n(a[2])),
                                            o[a[1]].apply(this, s)
                                })
                        }),
                            this.el.on("keyup blur", "input,textarea", i)
                    }
                    ,
                    n.fn.$ = function (t) {
                        return e(t, this.el[0])
                    }
                    ,
                    n.include = function (t) {
                        e.extend(this.fn, t)
                    }
                    ,
                    t && n.include(t),
                    n
            }
        }
    }(window.Tie),
    function (t) {
        function e(t) {
            M.postMessage(t, "*")
        }
        function n(t) {
            return t && t.toString().split("").reverse().join("").replace(/(\d{3})/g, "$1,").replace(/\,$/, "").split("").reverse().join("") || 0
        }
        function i() {
            var t = k.position().top;
            b.scrollTo(0, t, 200)
        }
        function o(t) {
            var e = t.activeNum;
            e > 1e4 && (e = (e / 1e4).toFixed(1),
                "0" === e[e.length - 1] && (e = e.substring(0, e.length - 2)),
                e += "W"),
                O.html(e),
                !t.enterSwitch && z.remove(),
                b(".cloud-tie-join-count .join-count").html(n(t.activeNum)),
                b(".cloud-tie-join-count .icon-comment").html("&#xe614;"),
                b(".cloud-tie-join-count").bind("tap", function (t) {
                    i()
                }),
                1 === t.wapCFSId && z.delCls("z-hidden").addCls("z-visible"),
                S.append(b.render(T.loginPopup))
        }
        function r() {
            i()
        }
        function a() {
            U.delCls("z-load").addCls("z-fcs").addCls("z-ok").child(1).html("\u53d1\u5e03\u6210\u529f"),
                setTimeout(function () {
                    U.delCls("z-fcs").delCls("z-ok"),
                        A.val(""),
                        R.val(""),
                        d(),
                        r(),
                        sessionStorage.removeItem(w.storage.unloginInput),
                        m(),
                        A[0].blur()
                }, 2e3)
        }
        function s() {
            e({
                action: "loadData"
            }),
                B = !0
        }
        function c(t) {
            A[0].blur();
            var e, n = !1, t = b.trim(t);
            return t.length < 2 ? e = "\u6587\u5b57\u4e0d\u80fd\u5c11\u4e8e2\u4e2a\u5b57" : t.length > 1e3 ? e = "\u6587\u5b57\u4e0d\u80fd\u8d85\u8fc71000\u4e2a\u5b57" : n = !0,
                n || (U.addCls("z-fcs").child(1).html(e),
                    setTimeout(function () {
                        U.delCls("z-fcs")
                    }, 2e3)),
                n
        }
        function l(t) {
            e({
                action: "stat",
                ext: t
            })
        }
        function u(t) {
            F || (F = b(document.head).find("meta[name='viewport']"),
                0 === F.length && F.append('<meta name="viewport" content="">'),
                $ = F.attr("content")),
                t ? F.attr("content", t) : F.attr("content", $)
        }
        function d() {
            var e = w.stateCls
                , n = e.inputR
                , i = e.inputW;
            e.visible;
            A[0].blur(),
                z.addCls(n).delCls(i),
                1 !== t.config.wapCFSId && z.delCls("z-visible").addCls("z-hidden"),
                setTimeout(function () {
                    q.hide()
                }, 500),
                J && clearInterval(J),
                C.unBind("touchmove", g),
                x.delCls("z-ygt-lock")
        }
        function h(t) {
            var e = w.stateCls
                , n = e.inputR
                , i = e.inputW
                , o = e.visible
                , r = e.hidden;
            z.delCls(n).addCls(i).delCls(r).addCls(o),
                _.html(t ? "\u56de\u590d\u8ddf\u8d34" : "\u5199\u8ddf\u8d34"),
                R.val(t || ""),
                q.show(),
                J = setInterval(function () {
                    b.scrollTo(0, 0)
                }, 300),
                C.bind("touchmove", g),
                x.addCls("z-ygt-lock"),
                A[0].focus()
        }
        function p() {
            E || (E = b("#ygt-login-popup-1415")),
                H.show(),
                E.addCls("z-show"),
                C.bind("touchmove", g),
                z.addCls("z-hidden")
        }
        function f() {
            E.delCls("z-show"),
                C.unBind("touchmove", g),
                setTimeout(function () {
                    H.hide(),
                        1 !== t.config.wapCFSId ? z.addCls("z-hidden") : z.delCls("z-hidden")
                }, 500)
        }
        function m() {
            var t = b.trim(A.val());
            t ? P.html(b.subChineseStr(t, 12, !0)) : P.html("\u5199\u8ddf\u8d34")
        }
        function g(t) {
            return t.preventDefault(),
                !1
        }
        var v, y, b = t.tool, w = t.set, T = {
            indexpage: '<iframe src="<% this.src %>" id="tie-js-sdk-ifr" scrolling="yes" frameborder="0"></iframe>',
            inputBar: ['<div id="ygt-input-mask-1415" class="tie-input-mask"></div>', '<div id="ygt-input-bar-1415" class="tie-input-bar z-read <% Tie.set.barCls.input %> z-hidden">', '<div class="input-read">', '<div class="read-box">', '<div class="box-shape" ne-touchend="changeInput()" ne-stat="stat(type-input|area-3)">', '<img src="<% Tie.set.iconBasePath %>/write_tie_27.png" class="i-write-tie"><span class="<% Tie.set.inputCls.tipTxt %>">\u5199\u8ddf\u8d34</span>', "</div>", "</div>", '<div class="read-total" ne-touchend="toTop()">', '<div class="total-box">', '<span class="total-num <% Tie.set.inputCls.joinNumLabel %>"></span>', '<span class="total-txt">\u4eba\u53c2\u4e0e</span>', "</div>", "</div>", "</div>", '<div class="input-write">', '<div class="submit-row">', '<span class="row-title">\u5199\u8ddf\u8d34</span>', '<span class="submit-cancel" ne-touchend="cancelSubmit()">\u53d6\u6d88</span>', '<span class="submit-ok <% Tie.set.inputCls.submitBtn %>" ne-touchend="doSubmit()">\u53d1\u5e03</span>', "</div>", '<div class="input-row">', '<textarea name="content" class="input-txt <% Tie.set.inputCls.cntInput %>" placeholder=""></textarea>', '<input type="hidden" name="parentId" class="<% Tie.set.inputCls.parentIdInput %>">', "</div>", "</div>", "</div>", '<div id="ygt-tip-box" class="tip-box"><i class="icon"></i><span></span></div>'].join(""),
            loginPopup: ['<div id="ygt-login-popup-1415" class="login-popup <% Tie.set.barCls.login %>">', '<div class="login-wrap">', '<div class="login-title">\u5feb\u901f\u767b\u5f55</div>', "<% if (Tie.config.ssoIcon) { %>", '<div class="login-item" ne-touchend="toLoginPage(SSO)" ne-stat="stat(type-singleLogin|area-2)">', '<div class="item item-sso" style="background-image: url(<% Tie.config.sso.wapIcon %>);">', '<span class="item-txt"><% Tie.config.sso.wapShowTitle %></span>', "</div>", "</div>", "<% } %>", '<div class="login-item item-mail" ne-touchstart="toLoginPage(mail)" ne-stat="stat(type-163Login|area-2)">', '<div class="item item-mail">', '<span class="item-txt">\u7f51\u6613\u901a\u884c\u8bc1\u767b\u5f55</span>', "</div>", "</div>", '<div class="login-item" ne-touchstart="toLoginPage(qq)" ne-stat="stat(type-qqLogin|area-2)">', '<div class="item item-qq">', '<span class="item-txt">QQ\u767b\u5f55</span>', "</div>", "</div>", '<div class="login-item" ne-touchstart="toLoginPage(weibo)" ne-stat="stat(type-sinaLogin|area-2)">', '<div class="item item-weibo">', '<span class="item-txt">\u65b0\u6d6a\u5fae\u535a\u8d26\u53f7\u767b\u5f55</span>', "</div>", "</div>", "</div>", '<div class="login-item item-close-btn" ne-touchstart="closeLoginPop()">\u53d6\u6d88</div>', "</div>"].join(""),
            mask: '<div id="ygt-g-mask-1415" class="g-mask <% Tie.set.maskCls %>" style="display:none;"></div>'
        }, C = b(document.documentElement), x = b(document.body).append('<div id="ygt-fix-wrap-1415"></div>'), k = b("#" + window.cloudTieConfig.target), S = b("#ygt-fix-wrap-1415");
        S.append(b.render(T.inputBar + T.mask));
        var L = /(\?|&)debug=([a-zA-Z0-9]+)(&)?/
            , I = ""
            , j = window.location.href
            , N = "https://api.gentie.163.com/mobile/index.html";
        L.test(j) && (I = j.match(L)[2],
            "qa" === I && (I = "qaapi"),
            N = "https://" + I + ".gentie.163.com/mobile/index.html",
            "local" === I && (N = "https://qaapi.gentie.163.com/mobile/index.html")),
            cloudTieConfig.dataApi && (N = cloudTieConfig.dataApi + "/mobile/inner.html"),
            k.append(b.render(T.indexpage, {
                src: N
            }));
        var E, D = b("#tie-js-sdk-ifr"), M = D[0].contentWindow, H = b("#ygt-g-mask-1415"), z = b("#ygt-input-bar-1415"), q = b("#ygt-input-mask-1415"), A = z.find("." + w.inputCls.cntInput), R = z.find("." + w.inputCls.parentIdInput), _ = (z.find("." + w.inputCls.submitBtn),
            z.find(".row-title")), O = z.find("." + w.inputCls.joinNumLabel), P = z.find("." + w.inputCls.tipTxt), U = b("#ygt-tip-box");
        D.bind("load", function (t) {
            e({
                action: "initTiePage",
                url: window.location.href,
                title: document.title,
                config: window.cloudTieConfig
            })
        }),
            H.bind("touchend", f),
            b(window).bind("message", function (n) {
                var i = n.data
                    , r = i.action;
                n.source === M && ("refreshIframeHeight" === r && D.height() !== i.ifrmHeight && D.height(i.ifrmHeight),
                    "exitUser" === r && (v = void 0),
                    "replyTie" === r && (B = !1,
                        v || y.anonymousSwitch ? h(i.parentId) : p()),
                    "writeTie" === r && (B = !1,
                        v || y.anonymousSwitch ? h() : p()),
                    "submitOK" === r && a(),
                    "showLoginPopup" === r && (p(),
                        i.postData && sessionStorage.setItem(w.storage.unloginInput, i.postData)),
                    "getUserInfo" === r && (v = t.user = i.userData),
                    "getGlobalConfig" === r && (y = t.config = i.config,
                        o(y)),
                    "showSharePopup" === r && t.share.show(i.post),
                    "extractEssayContent" === r && t.third.extractor.parse(function (t) {
                        e({
                            action: "getEssayContent",
                            title: t.title,
                            content: t.content
                        }, "*")
                    }),
                    "exitSSOUser" === r && b.getData({
                        url: i.url,
                        jsonpCallback: "callback"
                    }, function (t) {
                        e({
                            action: "exitAllUser"
                        })
                    }))
            }),
            history.pushState({
                yunTie: 1
            }, "page 2", ""),
            b(window).bind("popstate", function (t) {
                t.state.yunTie && window.location.reload()
            });
        var B = !0;
        window.onscroll = function (t) {
            w.stateCls;
            (window.scrollY + b(window).height() + 10 >= b(document.body).height() || k.offset().top < 0) && B ? (s(),
                B = !1) : setTimeout(function () {
                    B = !0
                }, 1e3)
        }
            ,
            t.stat = l;
        var W = {};
        W.indexCtrl = t.controller.create({
            init: function (t) {
                this.el = t,
                    this.delegateEvents(["touchstart", "touchend", "tap", "stat"])
            },
            changeInput: function (e) {
                B = !1,
                    v || y.anonymousSwitch ? h() : p(),
                    t.stat({
                        type: "input",
                        area: 3
                    }),
                    e.preventDefault()
            },
            cancelSubmit: function (t) {
                A[0].blur(),
                    d(),
                    m()
            },
            toLoginPage: function (t, n, i) {
                "local" === I && (w.thirdOauth.url = "http://dev.f2e.gentie.163.com/tie/yun/sdk_dev/mobile/refresh.html");
                var o, r = w.thirdOauth, a = r.url, s = r.base + "?product=" + r.product + "&url=" + a + "&url2=" + a + "&target=", c = s + r.target.qzone, l = s + r.target.weibo, u = r.mail + "?frompage=" + window.location.href;
                e({
                    action: "setPrevLoginURL",
                    prevLoginUrl: encodeURI(window.location.href)
                }),
                    "qq" === i ? o = c : "weibo" === i ? o = l : "mail" === i ? o = u : "SSO" === i && (o = y.sso.wapStyle),
                    setTimeout(function () {
                        window.location.href = o
                    }, 500)
            },
            doSubmit: function (t) {
                t.preventDefault(),
                    c(A.val()) && (e({
                        action: "doSubmit",
                        postData: {
                            content: A.val(),
                            parentId: R.val()
                        }
                    }),
                        U.addCls("z-load").child(1).html("\u6b63\u5728\u63d0\u4ea4"))
            },
            toTop: function (e) {
                r(),
                    t.stat({
                        type: "jcount",
                        area: 3
                    })
            },
            closeLoginPop: function (t) {
                f()
            },
            stat: function (e, n, i) {
                i && t.stat(i)
            }
        }),
            new W.indexCtrl(C);
        var F, $, X = "width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no";
        u(X);
        var J;
        t.view = {
            wrapper: k,
            rootNode: C
        }
    }(window.Tie),
    function (t) {
        function e(t, e) {
            var n, i = document.location.href, o = i, r = e.content, a = {};
            return r = r.replace(/<[^>]+>/g, "").replace(/"/g, "\u201c"),
                n = r,
                r.length > 32 && (r = r.substr(0, 32) + "..."),
                n.length > 16 && (n = n.substr(0, 16) + "..."),
                a.url = encodeURIComponent(i),
                a.title = encodeURIComponent("\u300e" + n + "\u300f-- \u6765\u81ea\u6587\u7ae0\u300a" + document.title + "\u300b"),
                a.digest = encodeURIComponent(r),
                a.image = "",
                a.url3g = encodeURIComponent(o),
                a
        }
        var n, i = t.tool, o = (t.set,
            [{
                id: "yixin",
                name: "\u6613\u4fe1",
                url: "https://open.yixin.im/share?appkey=yxbf8731c27ff84214994b25be3a4ef1ac&type=image&title=<% this.title %>&pic=<% this.image %>&desc=<% this.digest %>&url=",
                icon: "share_yixin_74.png",
                stat: "type-shareYixin,area-2,commentId-"
            }, {
                id: "qzone",
                name: "QQ\u7a7a\u95f4",
                url: "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=<% this.image %>&title=<% this.title %>&pics=<% this.image %>&summary=<% this.digest %>",
                icon: "share_qzone_74.png",
                stat: "type-shareQzone,area-2,commentId-"
            }, {
                id: "weibo",
                name: "\u65b0\u6d6a\u5fae\u535a",
                url: "http://service.weibo.com/share/share.php?appkey=1755601839&title=<% this.title %>&url=<% this.url %>&pic=<% this.image %>&searchPic=false&source=" + encodeURIComponent("\u7f51\u6613\u4e91\u8ddf\u8d34") + "sourceUrlhttp://tie.163.com/plaza/recommend.html",
                icon: "share_weibo_74.png",
                stat: "type-shareWeibo,area-2,commentId-"
            }]), r = ['<div id="sharePopup" class="share-popup">', '<h3 class="share-title">\u5206\u4eab\u5230</h3>', '<div class="share-links">', "<% for (var i = 0, l = Tie.share.types.length; i < l; i++) { %>", '<a href="" class="link" target="_blank" data-share="<% Tie.share.types[i].id %>" stat="<% Tie.share.types[i].stat %><% this.commentId %>">', '<img src="<% Tie.set.iconBasePath %>/<% Tie.share.types[i].icon %>" class="link-icon">', '<span class="link-txt"><% Tie.share.types[i].name %></span>', "</a>", "<% } %>", "</div>", '<div class="share-close"><img src="<% Tie.set.iconBasePath %>/share_cls_70.png" class="cls-btn"></div>', "</div>"].join("");
        t.share = {
            types: o,
            template: r,
            show: function (a) {
                var s, c = t.config;
                n || (t.view.wrapper.append(i.render(r, i.extend({}, c, a))),
                    n = i("#sharePopup"),
                    n.find(".cls-btn").bind("click", function (e) {
                        t.share.hide()
                    }),
                    n.on("click", "a", function (e) {
                        t.stat(i(this).attr("stat"))
                    }));
                var s = e(c, a);
                s.image = a.thumbnailImage,
                    i.each(n.child(1).children(), function (t, e) {
                        var n = i(e).attr("data-share");
                        n && i(e).attr("href", i.render(o[t].url, s))
                    }),
                    n.show(),
                    t.view.mask.show()
            },
            hide: function () {
                t.view.mask.hide(),
                    n.hide()
            }
        }
    }(window.Tie),
    function (t) {
        function e() {
            c ? c = !0 : (r || (r = t.view.wrapper.child(-1),
                r = r && r[0].contentWindow),
                r || (r = t.view.wrapper.child(0),
                    r = r && r[0].contentWindow),
                r = r || a("#yun-tie-data-ifrm-923")[0].contentWindow)
        }
        function n(t) {
            e(),
                r.postMessage(a.stringify(t), "*")
        }
        function i() {
            n({
                action: "SSO_login"
            })
        }
        function o() {
            n({
                action: "SSO_exit"
            })
        }
        var r, a = t.tool, s = !0, c = !1;
        a(window).bind("message", function (t) {
            var i;
            e(),
                t.source === r && (i = t.data,
                    "string" == typeof i && (i = a.parseJSON(i)),
                    "getSSOUserInfo" === i.action && a.getData({
                        url: i.url,
                        jsonpCallback: "callback",
                        crossDomain: s
                    }, function (t) {
                        n({
                            action: "SSO_check",
                            result: t
                        })
                    }),
                    "wakeupSSOStatus" === i.action && a.getData({
                        url: i.url,
                        data: i.param,
                        jsonpCallback: "callback",
                        crossDomain: s
                    }, function (t) {
                        n({
                            action: "SSO_wakeup",
                            result: t
                        })
                    }))
        }),
            t.open = {
                ssoLogined: i,
                ssoExited: o
            }
    }(window.Tie);
