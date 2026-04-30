(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const l of o)if(l.type==="childList")for(const h of l.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&s(h)}).observe(document,{childList:!0,subtree:!0});function t(o){const l={};return o.integrity&&(l.integrity=o.integrity),o.referrerPolicy&&(l.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?l.credentials="include":o.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(o){if(o.ep)return;o.ep=!0;const l=t(o);fetch(o.href,l)}})();function yy(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var fd={exports:{}},ba={},pd={exports:{}},Pe={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var wg;function sT(){if(wg)return Pe;wg=1;var r=Symbol.for("react.element"),e=Symbol.for("react.portal"),t=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),o=Symbol.for("react.profiler"),l=Symbol.for("react.provider"),h=Symbol.for("react.context"),f=Symbol.for("react.forward_ref"),g=Symbol.for("react.suspense"),y=Symbol.for("react.memo"),w=Symbol.for("react.lazy"),A=Symbol.iterator;function R(x){return x===null||typeof x!="object"?null:(x=A&&x[A]||x["@@iterator"],typeof x=="function"?x:null)}var F={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},B=Object.assign,K={};function z(x,H,ce){this.props=x,this.context=H,this.refs=K,this.updater=ce||F}z.prototype.isReactComponent={},z.prototype.setState=function(x,H){if(typeof x!="object"&&typeof x!="function"&&x!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,x,H,"setState")},z.prototype.forceUpdate=function(x){this.updater.enqueueForceUpdate(this,x,"forceUpdate")};function pe(){}pe.prototype=z.prototype;function ae(x,H,ce){this.props=x,this.context=H,this.refs=K,this.updater=ce||F}var le=ae.prototype=new pe;le.constructor=ae,B(le,z.prototype),le.isPureReactComponent=!0;var de=Array.isArray,je=Object.prototype.hasOwnProperty,we={current:null},N={key:!0,ref:!0,__self:!0,__source:!0};function T(x,H,ce){var Ie,Re={},ke=null,Ue=null;if(H!=null)for(Ie in H.ref!==void 0&&(Ue=H.ref),H.key!==void 0&&(ke=""+H.key),H)je.call(H,Ie)&&!N.hasOwnProperty(Ie)&&(Re[Ie]=H[Ie]);var Le=arguments.length-2;if(Le===1)Re.children=ce;else if(1<Le){for(var qe=Array(Le),ft=0;ft<Le;ft++)qe[ft]=arguments[ft+2];Re.children=qe}if(x&&x.defaultProps)for(Ie in Le=x.defaultProps,Le)Re[Ie]===void 0&&(Re[Ie]=Le[Ie]);return{$$typeof:r,type:x,key:ke,ref:Ue,props:Re,_owner:we.current}}function C(x,H){return{$$typeof:r,type:x.type,key:H,ref:x.ref,props:x.props,_owner:x._owner}}function k(x){return typeof x=="object"&&x!==null&&x.$$typeof===r}function O(x){var H={"=":"=0",":":"=2"};return"$"+x.replace(/[=:]/g,function(ce){return H[ce]})}var V=/\/+/g;function S(x,H){return typeof x=="object"&&x!==null&&x.key!=null?O(""+x.key):H.toString(36)}function nt(x,H,ce,Ie,Re){var ke=typeof x;(ke==="undefined"||ke==="boolean")&&(x=null);var Ue=!1;if(x===null)Ue=!0;else switch(ke){case"string":case"number":Ue=!0;break;case"object":switch(x.$$typeof){case r:case e:Ue=!0}}if(Ue)return Ue=x,Re=Re(Ue),x=Ie===""?"."+S(Ue,0):Ie,de(Re)?(ce="",x!=null&&(ce=x.replace(V,"$&/")+"/"),nt(Re,H,ce,"",function(ft){return ft})):Re!=null&&(k(Re)&&(Re=C(Re,ce+(!Re.key||Ue&&Ue.key===Re.key?"":(""+Re.key).replace(V,"$&/")+"/")+x)),H.push(Re)),1;if(Ue=0,Ie=Ie===""?".":Ie+":",de(x))for(var Le=0;Le<x.length;Le++){ke=x[Le];var qe=Ie+S(ke,Le);Ue+=nt(ke,H,ce,qe,Re)}else if(qe=R(x),typeof qe=="function")for(x=qe.call(x),Le=0;!(ke=x.next()).done;)ke=ke.value,qe=Ie+S(ke,Le++),Ue+=nt(ke,H,ce,qe,Re);else if(ke==="object")throw H=String(x),Error("Objects are not valid as a React child (found: "+(H==="[object Object]"?"object with keys {"+Object.keys(x).join(", ")+"}":H)+"). If you meant to render a collection of children, use an array instead.");return Ue}function yt(x,H,ce){if(x==null)return x;var Ie=[],Re=0;return nt(x,Ie,"","",function(ke){return H.call(ce,ke,Re++)}),Ie}function Ye(x){if(x._status===-1){var H=x._result;H=H(),H.then(function(ce){(x._status===0||x._status===-1)&&(x._status=1,x._result=ce)},function(ce){(x._status===0||x._status===-1)&&(x._status=2,x._result=ce)}),x._status===-1&&(x._status=0,x._result=H)}if(x._status===1)return x._result.default;throw x._result}var Ne={current:null},ee={transition:null},fe={ReactCurrentDispatcher:Ne,ReactCurrentBatchConfig:ee,ReactCurrentOwner:we};function te(){throw Error("act(...) is not supported in production builds of React.")}return Pe.Children={map:yt,forEach:function(x,H,ce){yt(x,function(){H.apply(this,arguments)},ce)},count:function(x){var H=0;return yt(x,function(){H++}),H},toArray:function(x){return yt(x,function(H){return H})||[]},only:function(x){if(!k(x))throw Error("React.Children.only expected to receive a single React element child.");return x}},Pe.Component=z,Pe.Fragment=t,Pe.Profiler=o,Pe.PureComponent=ae,Pe.StrictMode=s,Pe.Suspense=g,Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=fe,Pe.act=te,Pe.cloneElement=function(x,H,ce){if(x==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+x+".");var Ie=B({},x.props),Re=x.key,ke=x.ref,Ue=x._owner;if(H!=null){if(H.ref!==void 0&&(ke=H.ref,Ue=we.current),H.key!==void 0&&(Re=""+H.key),x.type&&x.type.defaultProps)var Le=x.type.defaultProps;for(qe in H)je.call(H,qe)&&!N.hasOwnProperty(qe)&&(Ie[qe]=H[qe]===void 0&&Le!==void 0?Le[qe]:H[qe])}var qe=arguments.length-2;if(qe===1)Ie.children=ce;else if(1<qe){Le=Array(qe);for(var ft=0;ft<qe;ft++)Le[ft]=arguments[ft+2];Ie.children=Le}return{$$typeof:r,type:x.type,key:Re,ref:ke,props:Ie,_owner:Ue}},Pe.createContext=function(x){return x={$$typeof:h,_currentValue:x,_currentValue2:x,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},x.Provider={$$typeof:l,_context:x},x.Consumer=x},Pe.createElement=T,Pe.createFactory=function(x){var H=T.bind(null,x);return H.type=x,H},Pe.createRef=function(){return{current:null}},Pe.forwardRef=function(x){return{$$typeof:f,render:x}},Pe.isValidElement=k,Pe.lazy=function(x){return{$$typeof:w,_payload:{_status:-1,_result:x},_init:Ye}},Pe.memo=function(x,H){return{$$typeof:y,type:x,compare:H===void 0?null:H}},Pe.startTransition=function(x){var H=ee.transition;ee.transition={};try{x()}finally{ee.transition=H}},Pe.unstable_act=te,Pe.useCallback=function(x,H){return Ne.current.useCallback(x,H)},Pe.useContext=function(x){return Ne.current.useContext(x)},Pe.useDebugValue=function(){},Pe.useDeferredValue=function(x){return Ne.current.useDeferredValue(x)},Pe.useEffect=function(x,H){return Ne.current.useEffect(x,H)},Pe.useId=function(){return Ne.current.useId()},Pe.useImperativeHandle=function(x,H,ce){return Ne.current.useImperativeHandle(x,H,ce)},Pe.useInsertionEffect=function(x,H){return Ne.current.useInsertionEffect(x,H)},Pe.useLayoutEffect=function(x,H){return Ne.current.useLayoutEffect(x,H)},Pe.useMemo=function(x,H){return Ne.current.useMemo(x,H)},Pe.useReducer=function(x,H,ce){return Ne.current.useReducer(x,H,ce)},Pe.useRef=function(x){return Ne.current.useRef(x)},Pe.useState=function(x){return Ne.current.useState(x)},Pe.useSyncExternalStore=function(x,H,ce){return Ne.current.useSyncExternalStore(x,H,ce)},Pe.useTransition=function(){return Ne.current.useTransition()},Pe.version="18.3.1",Pe}var Tg;function hf(){return Tg||(Tg=1,pd.exports=sT()),pd.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ig;function oT(){if(Ig)return ba;Ig=1;var r=hf(),e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),s=Object.prototype.hasOwnProperty,o=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,l={key:!0,ref:!0,__self:!0,__source:!0};function h(f,g,y){var w,A={},R=null,F=null;y!==void 0&&(R=""+y),g.key!==void 0&&(R=""+g.key),g.ref!==void 0&&(F=g.ref);for(w in g)s.call(g,w)&&!l.hasOwnProperty(w)&&(A[w]=g[w]);if(f&&f.defaultProps)for(w in g=f.defaultProps,g)A[w]===void 0&&(A[w]=g[w]);return{$$typeof:e,type:f,key:R,ref:F,props:A,_owner:o.current}}return ba.Fragment=t,ba.jsx=h,ba.jsxs=h,ba}var Sg;function aT(){return Sg||(Sg=1,fd.exports=oT()),fd.exports}var X=aT(),Ge=hf();const lT=yy(Ge);var Vu={},md={exports:{}},ln={},gd={exports:{}},_d={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ag;function uT(){return Ag||(Ag=1,(function(r){function e(ee,fe){var te=ee.length;ee.push(fe);e:for(;0<te;){var x=te-1>>>1,H=ee[x];if(0<o(H,fe))ee[x]=fe,ee[te]=H,te=x;else break e}}function t(ee){return ee.length===0?null:ee[0]}function s(ee){if(ee.length===0)return null;var fe=ee[0],te=ee.pop();if(te!==fe){ee[0]=te;e:for(var x=0,H=ee.length,ce=H>>>1;x<ce;){var Ie=2*(x+1)-1,Re=ee[Ie],ke=Ie+1,Ue=ee[ke];if(0>o(Re,te))ke<H&&0>o(Ue,Re)?(ee[x]=Ue,ee[ke]=te,x=ke):(ee[x]=Re,ee[Ie]=te,x=Ie);else if(ke<H&&0>o(Ue,te))ee[x]=Ue,ee[ke]=te,x=ke;else break e}}return fe}function o(ee,fe){var te=ee.sortIndex-fe.sortIndex;return te!==0?te:ee.id-fe.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;r.unstable_now=function(){return l.now()}}else{var h=Date,f=h.now();r.unstable_now=function(){return h.now()-f}}var g=[],y=[],w=1,A=null,R=3,F=!1,B=!1,K=!1,z=typeof setTimeout=="function"?setTimeout:null,pe=typeof clearTimeout=="function"?clearTimeout:null,ae=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function le(ee){for(var fe=t(y);fe!==null;){if(fe.callback===null)s(y);else if(fe.startTime<=ee)s(y),fe.sortIndex=fe.expirationTime,e(g,fe);else break;fe=t(y)}}function de(ee){if(K=!1,le(ee),!B)if(t(g)!==null)B=!0,Ye(je);else{var fe=t(y);fe!==null&&Ne(de,fe.startTime-ee)}}function je(ee,fe){B=!1,K&&(K=!1,pe(T),T=-1),F=!0;var te=R;try{for(le(fe),A=t(g);A!==null&&(!(A.expirationTime>fe)||ee&&!O());){var x=A.callback;if(typeof x=="function"){A.callback=null,R=A.priorityLevel;var H=x(A.expirationTime<=fe);fe=r.unstable_now(),typeof H=="function"?A.callback=H:A===t(g)&&s(g),le(fe)}else s(g);A=t(g)}if(A!==null)var ce=!0;else{var Ie=t(y);Ie!==null&&Ne(de,Ie.startTime-fe),ce=!1}return ce}finally{A=null,R=te,F=!1}}var we=!1,N=null,T=-1,C=5,k=-1;function O(){return!(r.unstable_now()-k<C)}function V(){if(N!==null){var ee=r.unstable_now();k=ee;var fe=!0;try{fe=N(!0,ee)}finally{fe?S():(we=!1,N=null)}}else we=!1}var S;if(typeof ae=="function")S=function(){ae(V)};else if(typeof MessageChannel<"u"){var nt=new MessageChannel,yt=nt.port2;nt.port1.onmessage=V,S=function(){yt.postMessage(null)}}else S=function(){z(V,0)};function Ye(ee){N=ee,we||(we=!0,S())}function Ne(ee,fe){T=z(function(){ee(r.unstable_now())},fe)}r.unstable_IdlePriority=5,r.unstable_ImmediatePriority=1,r.unstable_LowPriority=4,r.unstable_NormalPriority=3,r.unstable_Profiling=null,r.unstable_UserBlockingPriority=2,r.unstable_cancelCallback=function(ee){ee.callback=null},r.unstable_continueExecution=function(){B||F||(B=!0,Ye(je))},r.unstable_forceFrameRate=function(ee){0>ee||125<ee?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):C=0<ee?Math.floor(1e3/ee):5},r.unstable_getCurrentPriorityLevel=function(){return R},r.unstable_getFirstCallbackNode=function(){return t(g)},r.unstable_next=function(ee){switch(R){case 1:case 2:case 3:var fe=3;break;default:fe=R}var te=R;R=fe;try{return ee()}finally{R=te}},r.unstable_pauseExecution=function(){},r.unstable_requestPaint=function(){},r.unstable_runWithPriority=function(ee,fe){switch(ee){case 1:case 2:case 3:case 4:case 5:break;default:ee=3}var te=R;R=ee;try{return fe()}finally{R=te}},r.unstable_scheduleCallback=function(ee,fe,te){var x=r.unstable_now();switch(typeof te=="object"&&te!==null?(te=te.delay,te=typeof te=="number"&&0<te?x+te:x):te=x,ee){case 1:var H=-1;break;case 2:H=250;break;case 5:H=1073741823;break;case 4:H=1e4;break;default:H=5e3}return H=te+H,ee={id:w++,callback:fe,priorityLevel:ee,startTime:te,expirationTime:H,sortIndex:-1},te>x?(ee.sortIndex=te,e(y,ee),t(g)===null&&ee===t(y)&&(K?(pe(T),T=-1):K=!0,Ne(de,te-x))):(ee.sortIndex=H,e(g,ee),B||F||(B=!0,Ye(je))),ee},r.unstable_shouldYield=O,r.unstable_wrapCallback=function(ee){var fe=R;return function(){var te=R;R=fe;try{return ee.apply(this,arguments)}finally{R=te}}}})(_d)),_d}var Rg;function cT(){return Rg||(Rg=1,gd.exports=uT()),gd.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Cg;function hT(){if(Cg)return ln;Cg=1;var r=hf(),e=cT();function t(n){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+n,a=1;a<arguments.length;a++)i+="&args[]="+encodeURIComponent(arguments[a]);return"Minified React error #"+n+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var s=new Set,o={};function l(n,i){h(n,i),h(n+"Capture",i)}function h(n,i){for(o[n]=i,n=0;n<i.length;n++)s.add(i[n])}var f=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),g=Object.prototype.hasOwnProperty,y=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,w={},A={};function R(n){return g.call(A,n)?!0:g.call(w,n)?!1:y.test(n)?A[n]=!0:(w[n]=!0,!1)}function F(n,i,a,c){if(a!==null&&a.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return c?!1:a!==null?!a.acceptsBooleans:(n=n.toLowerCase().slice(0,5),n!=="data-"&&n!=="aria-");default:return!1}}function B(n,i,a,c){if(i===null||typeof i>"u"||F(n,i,a,c))return!0;if(c)return!1;if(a!==null)switch(a.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function K(n,i,a,c,d,m,v){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=c,this.attributeNamespace=d,this.mustUseProperty=a,this.propertyName=n,this.type=i,this.sanitizeURL=m,this.removeEmptyString=v}var z={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n){z[n]=new K(n,0,!1,n,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(n){var i=n[0];z[i]=new K(i,1,!1,n[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(n){z[n]=new K(n,2,!1,n.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(n){z[n]=new K(n,2,!1,n,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n){z[n]=new K(n,3,!1,n.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(n){z[n]=new K(n,3,!0,n,null,!1,!1)}),["capture","download"].forEach(function(n){z[n]=new K(n,4,!1,n,null,!1,!1)}),["cols","rows","size","span"].forEach(function(n){z[n]=new K(n,6,!1,n,null,!1,!1)}),["rowSpan","start"].forEach(function(n){z[n]=new K(n,5,!1,n.toLowerCase(),null,!1,!1)});var pe=/[\-:]([a-z])/g;function ae(n){return n[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n){var i=n.replace(pe,ae);z[i]=new K(i,1,!1,n,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n){var i=n.replace(pe,ae);z[i]=new K(i,1,!1,n,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(n){var i=n.replace(pe,ae);z[i]=new K(i,1,!1,n,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(n){z[n]=new K(n,1,!1,n.toLowerCase(),null,!1,!1)}),z.xlinkHref=new K("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(n){z[n]=new K(n,1,!1,n.toLowerCase(),null,!0,!0)});function le(n,i,a,c){var d=z.hasOwnProperty(i)?z[i]:null;(d!==null?d.type!==0:c||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(B(i,a,d,c)&&(a=null),c||d===null?R(i)&&(a===null?n.removeAttribute(i):n.setAttribute(i,""+a)):d.mustUseProperty?n[d.propertyName]=a===null?d.type===3?!1:"":a:(i=d.attributeName,c=d.attributeNamespace,a===null?n.removeAttribute(i):(d=d.type,a=d===3||d===4&&a===!0?"":""+a,c?n.setAttributeNS(c,i,a):n.setAttribute(i,a))))}var de=r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,je=Symbol.for("react.element"),we=Symbol.for("react.portal"),N=Symbol.for("react.fragment"),T=Symbol.for("react.strict_mode"),C=Symbol.for("react.profiler"),k=Symbol.for("react.provider"),O=Symbol.for("react.context"),V=Symbol.for("react.forward_ref"),S=Symbol.for("react.suspense"),nt=Symbol.for("react.suspense_list"),yt=Symbol.for("react.memo"),Ye=Symbol.for("react.lazy"),Ne=Symbol.for("react.offscreen"),ee=Symbol.iterator;function fe(n){return n===null||typeof n!="object"?null:(n=ee&&n[ee]||n["@@iterator"],typeof n=="function"?n:null)}var te=Object.assign,x;function H(n){if(x===void 0)try{throw Error()}catch(a){var i=a.stack.trim().match(/\n( *(at )?)/);x=i&&i[1]||""}return`
`+x+n}var ce=!1;function Ie(n,i){if(!n||ce)return"";ce=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(U){var c=U}Reflect.construct(n,[],i)}else{try{i.call()}catch(U){c=U}n.call(i.prototype)}else{try{throw Error()}catch(U){c=U}n()}}catch(U){if(U&&c&&typeof U.stack=="string"){for(var d=U.stack.split(`
`),m=c.stack.split(`
`),v=d.length-1,I=m.length-1;1<=v&&0<=I&&d[v]!==m[I];)I--;for(;1<=v&&0<=I;v--,I--)if(d[v]!==m[I]){if(v!==1||I!==1)do if(v--,I--,0>I||d[v]!==m[I]){var P=`
`+d[v].replace(" at new "," at ");return n.displayName&&P.includes("<anonymous>")&&(P=P.replace("<anonymous>",n.displayName)),P}while(1<=v&&0<=I);break}}}finally{ce=!1,Error.prepareStackTrace=a}return(n=n?n.displayName||n.name:"")?H(n):""}function Re(n){switch(n.tag){case 5:return H(n.type);case 16:return H("Lazy");case 13:return H("Suspense");case 19:return H("SuspenseList");case 0:case 2:case 15:return n=Ie(n.type,!1),n;case 11:return n=Ie(n.type.render,!1),n;case 1:return n=Ie(n.type,!0),n;default:return""}}function ke(n){if(n==null)return null;if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n;switch(n){case N:return"Fragment";case we:return"Portal";case C:return"Profiler";case T:return"StrictMode";case S:return"Suspense";case nt:return"SuspenseList"}if(typeof n=="object")switch(n.$$typeof){case O:return(n.displayName||"Context")+".Consumer";case k:return(n._context.displayName||"Context")+".Provider";case V:var i=n.render;return n=n.displayName,n||(n=i.displayName||i.name||"",n=n!==""?"ForwardRef("+n+")":"ForwardRef"),n;case yt:return i=n.displayName||null,i!==null?i:ke(n.type)||"Memo";case Ye:i=n._payload,n=n._init;try{return ke(n(i))}catch{}}return null}function Ue(n){var i=n.type;switch(n.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return n=i.render,n=n.displayName||n.name||"",i.displayName||(n!==""?"ForwardRef("+n+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return ke(i);case 8:return i===T?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function Le(n){switch(typeof n){case"boolean":case"number":case"string":case"undefined":return n;case"object":return n;default:return""}}function qe(n){var i=n.type;return(n=n.nodeName)&&n.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function ft(n){var i=qe(n)?"checked":"value",a=Object.getOwnPropertyDescriptor(n.constructor.prototype,i),c=""+n[i];if(!n.hasOwnProperty(i)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var d=a.get,m=a.set;return Object.defineProperty(n,i,{configurable:!0,get:function(){return d.call(this)},set:function(v){c=""+v,m.call(this,v)}}),Object.defineProperty(n,i,{enumerable:a.enumerable}),{getValue:function(){return c},setValue:function(v){c=""+v},stopTracking:function(){n._valueTracker=null,delete n[i]}}}}function xn(n){n._valueTracker||(n._valueTracker=ft(n))}function Pr(n){if(!n)return!1;var i=n._valueTracker;if(!i)return!0;var a=i.getValue(),c="";return n&&(c=qe(n)?n.checked?"true":"false":n.value),n=c,n!==a?(i.setValue(n),!0):!1}function rr(n){if(n=n||(typeof document<"u"?document:void 0),typeof n>"u")return null;try{return n.activeElement||n.body}catch{return n.body}}function Vn(n,i){var a=i.checked;return te({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:a??n._wrapperState.initialChecked})}function Ln(n,i){var a=i.defaultValue==null?"":i.defaultValue,c=i.checked!=null?i.checked:i.defaultChecked;a=Le(i.value!=null?i.value:a),n._wrapperState={initialChecked:c,initialValue:a,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function kr(n,i){i=i.checked,i!=null&&le(n,"checked",i,!1)}function Nr(n,i){kr(n,i);var a=Le(i.value),c=i.type;if(a!=null)c==="number"?(a===0&&n.value===""||n.value!=a)&&(n.value=""+a):n.value!==""+a&&(n.value=""+a);else if(c==="submit"||c==="reset"){n.removeAttribute("value");return}i.hasOwnProperty("value")?bn(n,i.type,a):i.hasOwnProperty("defaultValue")&&bn(n,i.type,Le(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(n.defaultChecked=!!i.defaultChecked)}function Jr(n,i,a){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var c=i.type;if(!(c!=="submit"&&c!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+n._wrapperState.initialValue,a||i===n.value||(n.value=i),n.defaultValue=i}a=n.name,a!==""&&(n.name=""),n.defaultChecked=!!n._wrapperState.initialChecked,a!==""&&(n.name=a)}function bn(n,i,a){(i!=="number"||rr(n.ownerDocument)!==n)&&(a==null?n.defaultValue=""+n._wrapperState.initialValue:n.defaultValue!==""+a&&(n.defaultValue=""+a))}var W=Array.isArray;function Ae(n,i,a,c){if(n=n.options,i){i={};for(var d=0;d<a.length;d++)i["$"+a[d]]=!0;for(a=0;a<n.length;a++)d=i.hasOwnProperty("$"+n[a].value),n[a].selected!==d&&(n[a].selected=d),d&&c&&(n[a].defaultSelected=!0)}else{for(a=""+Le(a),i=null,d=0;d<n.length;d++){if(n[d].value===a){n[d].selected=!0,c&&(n[d].defaultSelected=!0);return}i!==null||n[d].disabled||(i=n[d])}i!==null&&(i.selected=!0)}}function xe(n,i){if(i.dangerouslySetInnerHTML!=null)throw Error(t(91));return te({},i,{value:void 0,defaultValue:void 0,children:""+n._wrapperState.initialValue})}function ut(n,i){var a=i.value;if(a==null){if(a=i.children,i=i.defaultValue,a!=null){if(i!=null)throw Error(t(92));if(W(a)){if(1<a.length)throw Error(t(93));a=a[0]}i=a}i==null&&(i=""),a=i}n._wrapperState={initialValue:Le(a)}}function Je(n,i){var a=Le(i.value),c=Le(i.defaultValue);a!=null&&(a=""+a,a!==n.value&&(n.value=a),i.defaultValue==null&&n.defaultValue!==a&&(n.defaultValue=a)),c!=null&&(n.defaultValue=""+c)}function Mn(n){var i=n.textContent;i===n._wrapperState.initialValue&&i!==""&&i!==null&&(n.value=i)}function $e(n){switch(n){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function pt(n,i){return n==null||n==="http://www.w3.org/1999/xhtml"?$e(i):n==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":n}var En,Zr=(function(n){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,a,c,d){MSApp.execUnsafeLocalFunction(function(){return n(i,a,c,d)})}:n})(function(n,i){if(n.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in n)n.innerHTML=i;else{for(En=En||document.createElement("div"),En.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=En.firstChild;n.firstChild;)n.removeChild(n.firstChild);for(;i.firstChild;)n.appendChild(i.firstChild)}});function ir(n,i){if(i){var a=n.firstChild;if(a&&a===n.lastChild&&a.nodeType===3){a.nodeValue=i;return}}n.textContent=i}var sr={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Dr=["Webkit","ms","Moz","O"];Object.keys(sr).forEach(function(n){Dr.forEach(function(i){i=i+n.charAt(0).toUpperCase()+n.substring(1),sr[i]=sr[n]})});function Go(n,i,a){return i==null||typeof i=="boolean"||i===""?"":a||typeof i!="number"||i===0||sr.hasOwnProperty(n)&&sr[n]?(""+i).trim():i+"px"}function Ko(n,i){n=n.style;for(var a in i)if(i.hasOwnProperty(a)){var c=a.indexOf("--")===0,d=Go(a,i[a],c);a==="float"&&(a="cssFloat"),c?n.setProperty(a,d):n[a]=d}}var Qo=te({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function Xo(n,i){if(i){if(Qo[n]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(t(137,n));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(t(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(t(61))}if(i.style!=null&&typeof i.style!="object")throw Error(t(62))}}function Yo(n,i){if(n.indexOf("-")===-1)return typeof i.is=="string";switch(n){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Ki=null;function Ls(n){return n=n.target||n.srcElement||window,n.correspondingUseElement&&(n=n.correspondingUseElement),n.nodeType===3?n.parentNode:n}var bs=null,wn=null,or=null;function Ms(n){if(n=wa(n)){if(typeof bs!="function")throw Error(t(280));var i=n.stateNode;i&&(i=Ql(i),bs(n.stateNode,n.type,i))}}function ar(n){wn?or?or.push(n):or=[n]:wn=n}function Jo(){if(wn){var n=wn,i=or;if(or=wn=null,Ms(n),i)for(n=0;n<i.length;n++)Ms(i[n])}}function Qi(n,i){return n(i)}function Zo(){}var Or=!1;function ea(n,i,a){if(Or)return n(i,a);Or=!0;try{return Qi(n,i,a)}finally{Or=!1,(wn!==null||or!==null)&&(Zo(),Jo())}}function mt(n,i){var a=n.stateNode;if(a===null)return null;var c=Ql(a);if(c===null)return null;a=c[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(c=!c.disabled)||(n=n.type,c=!(n==="button"||n==="input"||n==="select"||n==="textarea")),n=!c;break e;default:n=!1}if(n)return null;if(a&&typeof a!="function")throw Error(t(231,i,typeof a));return a}var Us=!1;if(f)try{var Un={};Object.defineProperty(Un,"passive",{get:function(){Us=!0}}),window.addEventListener("test",Un,Un),window.removeEventListener("test",Un,Un)}catch{Us=!1}function Xi(n,i,a,c,d,m,v,I,P){var U=Array.prototype.slice.call(arguments,3);try{i.apply(a,U)}catch(Q){this.onError(Q)}}var Yi=!1,Fs=null,Fn=!1,ta=null,Bc={onError:function(n){Yi=!0,Fs=n}};function js(n,i,a,c,d,m,v,I,P){Yi=!1,Fs=null,Xi.apply(Bc,arguments)}function El(n,i,a,c,d,m,v,I,P){if(js.apply(this,arguments),Yi){if(Yi){var U=Fs;Yi=!1,Fs=null}else throw Error(t(198));Fn||(Fn=!0,ta=U)}}function jn(n){var i=n,a=n;if(n.alternate)for(;i.return;)i=i.return;else{n=i;do i=n,(i.flags&4098)!==0&&(a=i.return),n=i.return;while(n)}return i.tag===3?a:null}function Ji(n){if(n.tag===13){var i=n.memoizedState;if(i===null&&(n=n.alternate,n!==null&&(i=n.memoizedState)),i!==null)return i.dehydrated}return null}function Bn(n){if(jn(n)!==n)throw Error(t(188))}function wl(n){var i=n.alternate;if(!i){if(i=jn(n),i===null)throw Error(t(188));return i!==n?null:n}for(var a=n,c=i;;){var d=a.return;if(d===null)break;var m=d.alternate;if(m===null){if(c=d.return,c!==null){a=c;continue}break}if(d.child===m.child){for(m=d.child;m;){if(m===a)return Bn(d),n;if(m===c)return Bn(d),i;m=m.sibling}throw Error(t(188))}if(a.return!==c.return)a=d,c=m;else{for(var v=!1,I=d.child;I;){if(I===a){v=!0,a=d,c=m;break}if(I===c){v=!0,c=d,a=m;break}I=I.sibling}if(!v){for(I=m.child;I;){if(I===a){v=!0,a=m,c=d;break}if(I===c){v=!0,c=m,a=d;break}I=I.sibling}if(!v)throw Error(t(189))}}if(a.alternate!==c)throw Error(t(190))}if(a.tag!==3)throw Error(t(188));return a.stateNode.current===a?n:i}function na(n){return n=wl(n),n!==null?Bs(n):null}function Bs(n){if(n.tag===5||n.tag===6)return n;for(n=n.child;n!==null;){var i=Bs(n);if(i!==null)return i;n=n.sibling}return null}var zs=e.unstable_scheduleCallback,ra=e.unstable_cancelCallback,Tl=e.unstable_shouldYield,zc=e.unstable_requestPaint,Ke=e.unstable_now,Il=e.unstable_getCurrentPriorityLevel,Zi=e.unstable_ImmediatePriority,ei=e.unstable_UserBlockingPriority,Tn=e.unstable_NormalPriority,ia=e.unstable_LowPriority,Sl=e.unstable_IdlePriority,es=null,hn=null;function Al(n){if(hn&&typeof hn.onCommitFiberRoot=="function")try{hn.onCommitFiberRoot(es,n,void 0,(n.current.flags&128)===128)}catch{}}var Qt=Math.clz32?Math.clz32:Cl,sa=Math.log,Rl=Math.LN2;function Cl(n){return n>>>=0,n===0?32:31-(sa(n)/Rl|0)|0}var $s=64,Hs=4194304;function ti(n){switch(n&-n){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return n&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return n}}function ts(n,i){var a=n.pendingLanes;if(a===0)return 0;var c=0,d=n.suspendedLanes,m=n.pingedLanes,v=a&268435455;if(v!==0){var I=v&~d;I!==0?c=ti(I):(m&=v,m!==0&&(c=ti(m)))}else v=a&~d,v!==0?c=ti(v):m!==0&&(c=ti(m));if(c===0)return 0;if(i!==0&&i!==c&&(i&d)===0&&(d=c&-c,m=i&-i,d>=m||d===16&&(m&4194240)!==0))return i;if((c&4)!==0&&(c|=a&16),i=n.entangledLanes,i!==0)for(n=n.entanglements,i&=c;0<i;)a=31-Qt(i),d=1<<a,c|=n[a],i&=~d;return c}function $c(n,i){switch(n){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function xr(n,i){for(var a=n.suspendedLanes,c=n.pingedLanes,d=n.expirationTimes,m=n.pendingLanes;0<m;){var v=31-Qt(m),I=1<<v,P=d[v];P===-1?((I&a)===0||(I&c)!==0)&&(d[v]=$c(I,i)):P<=i&&(n.expiredLanes|=I),m&=~I}}function dn(n){return n=n.pendingLanes&-1073741825,n!==0?n:n&1073741824?1073741824:0}function ns(){var n=$s;return $s<<=1,($s&4194240)===0&&($s=64),n}function ni(n){for(var i=[],a=0;31>a;a++)i.push(n);return i}function ri(n,i,a){n.pendingLanes|=i,i!==536870912&&(n.suspendedLanes=0,n.pingedLanes=0),n=n.eventTimes,i=31-Qt(i),n[i]=a}function We(n,i){var a=n.pendingLanes&~i;n.pendingLanes=i,n.suspendedLanes=0,n.pingedLanes=0,n.expiredLanes&=i,n.mutableReadLanes&=i,n.entangledLanes&=i,i=n.entanglements;var c=n.eventTimes;for(n=n.expirationTimes;0<a;){var d=31-Qt(a),m=1<<d;i[d]=0,c[d]=-1,n[d]=-1,a&=~m}}function ii(n,i){var a=n.entangledLanes|=i;for(n=n.entanglements;a;){var c=31-Qt(a),d=1<<c;d&i|n[c]&i&&(n[c]|=i),a&=~d}}var Ve=0;function si(n){return n&=-n,1<n?4<n?(n&268435455)!==0?16:536870912:4:1}var Pl,qs,kl,Nl,Dl,oa=!1,lr=[],Vt=null,zn=null,$n=null,oi=new Map,In=new Map,ur=[],Hc="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function Ol(n,i){switch(n){case"focusin":case"focusout":Vt=null;break;case"dragenter":case"dragleave":zn=null;break;case"mouseover":case"mouseout":$n=null;break;case"pointerover":case"pointerout":oi.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":In.delete(i.pointerId)}}function en(n,i,a,c,d,m){return n===null||n.nativeEvent!==m?(n={blockedOn:i,domEventName:a,eventSystemFlags:c,nativeEvent:m,targetContainers:[d]},i!==null&&(i=wa(i),i!==null&&qs(i)),n):(n.eventSystemFlags|=c,i=n.targetContainers,d!==null&&i.indexOf(d)===-1&&i.push(d),n)}function qc(n,i,a,c,d){switch(i){case"focusin":return Vt=en(Vt,n,i,a,c,d),!0;case"dragenter":return zn=en(zn,n,i,a,c,d),!0;case"mouseover":return $n=en($n,n,i,a,c,d),!0;case"pointerover":var m=d.pointerId;return oi.set(m,en(oi.get(m)||null,n,i,a,c,d)),!0;case"gotpointercapture":return m=d.pointerId,In.set(m,en(In.get(m)||null,n,i,a,c,d)),!0}return!1}function xl(n){var i=as(n.target);if(i!==null){var a=jn(i);if(a!==null){if(i=a.tag,i===13){if(i=Ji(a),i!==null){n.blockedOn=i,Dl(n.priority,function(){kl(a)});return}}else if(i===3&&a.stateNode.current.memoizedState.isDehydrated){n.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}n.blockedOn=null}function Vr(n){if(n.blockedOn!==null)return!1;for(var i=n.targetContainers;0<i.length;){var a=Ws(n.domEventName,n.eventSystemFlags,i[0],n.nativeEvent);if(a===null){a=n.nativeEvent;var c=new a.constructor(a.type,a);Ki=c,a.target.dispatchEvent(c),Ki=null}else return i=wa(a),i!==null&&qs(i),n.blockedOn=a,!1;i.shift()}return!0}function rs(n,i,a){Vr(n)&&a.delete(i)}function Vl(){oa=!1,Vt!==null&&Vr(Vt)&&(Vt=null),zn!==null&&Vr(zn)&&(zn=null),$n!==null&&Vr($n)&&($n=null),oi.forEach(rs),In.forEach(rs)}function Hn(n,i){n.blockedOn===i&&(n.blockedOn=null,oa||(oa=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,Vl)))}function qn(n){function i(d){return Hn(d,n)}if(0<lr.length){Hn(lr[0],n);for(var a=1;a<lr.length;a++){var c=lr[a];c.blockedOn===n&&(c.blockedOn=null)}}for(Vt!==null&&Hn(Vt,n),zn!==null&&Hn(zn,n),$n!==null&&Hn($n,n),oi.forEach(i),In.forEach(i),a=0;a<ur.length;a++)c=ur[a],c.blockedOn===n&&(c.blockedOn=null);for(;0<ur.length&&(a=ur[0],a.blockedOn===null);)xl(a),a.blockedOn===null&&ur.shift()}var Lr=de.ReactCurrentBatchConfig,ai=!0;function rt(n,i,a,c){var d=Ve,m=Lr.transition;Lr.transition=null;try{Ve=1,aa(n,i,a,c)}finally{Ve=d,Lr.transition=m}}function Wc(n,i,a,c){var d=Ve,m=Lr.transition;Lr.transition=null;try{Ve=4,aa(n,i,a,c)}finally{Ve=d,Lr.transition=m}}function aa(n,i,a,c){if(ai){var d=Ws(n,i,a,c);if(d===null)rh(n,i,c,is,a),Ol(n,c);else if(qc(d,n,i,a,c))c.stopPropagation();else if(Ol(n,c),i&4&&-1<Hc.indexOf(n)){for(;d!==null;){var m=wa(d);if(m!==null&&Pl(m),m=Ws(n,i,a,c),m===null&&rh(n,i,c,is,a),m===d)break;d=m}d!==null&&c.stopPropagation()}else rh(n,i,c,null,a)}}var is=null;function Ws(n,i,a,c){if(is=null,n=Ls(c),n=as(n),n!==null)if(i=jn(n),i===null)n=null;else if(a=i.tag,a===13){if(n=Ji(i),n!==null)return n;n=null}else if(a===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;n=null}else i!==n&&(n=null);return is=n,null}function la(n){switch(n){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(Il()){case Zi:return 1;case ei:return 4;case Tn:case ia:return 16;case Sl:return 536870912;default:return 16}default:return 16}}var fn=null,Gs=null,tn=null;function ua(){if(tn)return tn;var n,i=Gs,a=i.length,c,d="value"in fn?fn.value:fn.textContent,m=d.length;for(n=0;n<a&&i[n]===d[n];n++);var v=a-n;for(c=1;c<=v&&i[a-c]===d[m-c];c++);return tn=d.slice(n,1<c?1-c:void 0)}function Ks(n){var i=n.keyCode;return"charCode"in n?(n=n.charCode,n===0&&i===13&&(n=13)):n=i,n===10&&(n=13),32<=n||n===13?n:0}function cr(){return!0}function ca(){return!1}function Lt(n){function i(a,c,d,m,v){this._reactName=a,this._targetInst=d,this.type=c,this.nativeEvent=m,this.target=v,this.currentTarget=null;for(var I in n)n.hasOwnProperty(I)&&(a=n[I],this[I]=a?a(m):m[I]);return this.isDefaultPrevented=(m.defaultPrevented!=null?m.defaultPrevented:m.returnValue===!1)?cr:ca,this.isPropagationStopped=ca,this}return te(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=cr)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=cr)},persist:function(){},isPersistent:cr}),i}var Wn={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(n){return n.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Qs=Lt(Wn),hr=te({},Wn,{view:0,detail:0}),Gc=Lt(hr),Xs,br,li,ss=te({},hr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:dr,button:0,buttons:0,relatedTarget:function(n){return n.relatedTarget===void 0?n.fromElement===n.srcElement?n.toElement:n.fromElement:n.relatedTarget},movementX:function(n){return"movementX"in n?n.movementX:(n!==li&&(li&&n.type==="mousemove"?(Xs=n.screenX-li.screenX,br=n.screenY-li.screenY):br=Xs=0,li=n),Xs)},movementY:function(n){return"movementY"in n?n.movementY:br}}),Ys=Lt(ss),ha=te({},ss,{dataTransfer:0}),Ll=Lt(ha),Js=te({},hr,{relatedTarget:0}),Zs=Lt(Js),bl=te({},Wn,{animationName:0,elapsedTime:0,pseudoElement:0}),Mr=Lt(bl),Ml=te({},Wn,{clipboardData:function(n){return"clipboardData"in n?n.clipboardData:window.clipboardData}}),Ul=Lt(Ml),Fl=te({},Wn,{data:0}),da=Lt(Fl),eo={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Xt={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},jl={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Bl(n){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(n):(n=jl[n])?!!i[n]:!1}function dr(){return Bl}var u=te({},hr,{key:function(n){if(n.key){var i=eo[n.key]||n.key;if(i!=="Unidentified")return i}return n.type==="keypress"?(n=Ks(n),n===13?"Enter":String.fromCharCode(n)):n.type==="keydown"||n.type==="keyup"?Xt[n.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:dr,charCode:function(n){return n.type==="keypress"?Ks(n):0},keyCode:function(n){return n.type==="keydown"||n.type==="keyup"?n.keyCode:0},which:function(n){return n.type==="keypress"?Ks(n):n.type==="keydown"||n.type==="keyup"?n.keyCode:0}}),p=Lt(u),_=te({},ss,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),E=Lt(_),L=te({},hr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:dr}),j=Lt(L),Z=te({},Wn,{propertyName:0,elapsedTime:0,pseudoElement:0}),He=Lt(Z),St=te({},ss,{deltaX:function(n){return"deltaX"in n?n.deltaX:"wheelDeltaX"in n?-n.wheelDeltaX:0},deltaY:function(n){return"deltaY"in n?n.deltaY:"wheelDeltaY"in n?-n.wheelDeltaY:"wheelDelta"in n?-n.wheelDelta:0},deltaZ:0,deltaMode:0}),be=Lt(St),kt=[9,13,27,32],vt=f&&"CompositionEvent"in window,Sn=null;f&&"documentMode"in document&&(Sn=document.documentMode);var pn=f&&"TextEvent"in window&&!Sn,os=f&&(!vt||Sn&&8<Sn&&11>=Sn),to=" ",mp=!1;function gp(n,i){switch(n){case"keyup":return kt.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function _p(n){return n=n.detail,typeof n=="object"&&"data"in n?n.data:null}var no=!1;function nw(n,i){switch(n){case"compositionend":return _p(i);case"keypress":return i.which!==32?null:(mp=!0,to);case"textInput":return n=i.data,n===to&&mp?null:n;default:return null}}function rw(n,i){if(no)return n==="compositionend"||!vt&&gp(n,i)?(n=ua(),tn=Gs=fn=null,no=!1,n):null;switch(n){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return os&&i.locale!=="ko"?null:i.data;default:return null}}var iw={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function yp(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i==="input"?!!iw[n.type]:i==="textarea"}function vp(n,i,a,c){ar(c),i=Wl(i,"onChange"),0<i.length&&(a=new Qs("onChange","change",null,a,c),n.push({event:a,listeners:i}))}var fa=null,pa=null;function sw(n){Mp(n,0)}function zl(n){var i=ao(n);if(Pr(i))return n}function ow(n,i){if(n==="change")return i}var Ep=!1;if(f){var Kc;if(f){var Qc="oninput"in document;if(!Qc){var wp=document.createElement("div");wp.setAttribute("oninput","return;"),Qc=typeof wp.oninput=="function"}Kc=Qc}else Kc=!1;Ep=Kc&&(!document.documentMode||9<document.documentMode)}function Tp(){fa&&(fa.detachEvent("onpropertychange",Ip),pa=fa=null)}function Ip(n){if(n.propertyName==="value"&&zl(pa)){var i=[];vp(i,pa,n,Ls(n)),ea(sw,i)}}function aw(n,i,a){n==="focusin"?(Tp(),fa=i,pa=a,fa.attachEvent("onpropertychange",Ip)):n==="focusout"&&Tp()}function lw(n){if(n==="selectionchange"||n==="keyup"||n==="keydown")return zl(pa)}function uw(n,i){if(n==="click")return zl(i)}function cw(n,i){if(n==="input"||n==="change")return zl(i)}function hw(n,i){return n===i&&(n!==0||1/n===1/i)||n!==n&&i!==i}var Gn=typeof Object.is=="function"?Object.is:hw;function ma(n,i){if(Gn(n,i))return!0;if(typeof n!="object"||n===null||typeof i!="object"||i===null)return!1;var a=Object.keys(n),c=Object.keys(i);if(a.length!==c.length)return!1;for(c=0;c<a.length;c++){var d=a[c];if(!g.call(i,d)||!Gn(n[d],i[d]))return!1}return!0}function Sp(n){for(;n&&n.firstChild;)n=n.firstChild;return n}function Ap(n,i){var a=Sp(n);n=0;for(var c;a;){if(a.nodeType===3){if(c=n+a.textContent.length,n<=i&&c>=i)return{node:a,offset:i-n};n=c}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=Sp(a)}}function Rp(n,i){return n&&i?n===i?!0:n&&n.nodeType===3?!1:i&&i.nodeType===3?Rp(n,i.parentNode):"contains"in n?n.contains(i):n.compareDocumentPosition?!!(n.compareDocumentPosition(i)&16):!1:!1}function Cp(){for(var n=window,i=rr();i instanceof n.HTMLIFrameElement;){try{var a=typeof i.contentWindow.location.href=="string"}catch{a=!1}if(a)n=i.contentWindow;else break;i=rr(n.document)}return i}function Xc(n){var i=n&&n.nodeName&&n.nodeName.toLowerCase();return i&&(i==="input"&&(n.type==="text"||n.type==="search"||n.type==="tel"||n.type==="url"||n.type==="password")||i==="textarea"||n.contentEditable==="true")}function dw(n){var i=Cp(),a=n.focusedElem,c=n.selectionRange;if(i!==a&&a&&a.ownerDocument&&Rp(a.ownerDocument.documentElement,a)){if(c!==null&&Xc(a)){if(i=c.start,n=c.end,n===void 0&&(n=i),"selectionStart"in a)a.selectionStart=i,a.selectionEnd=Math.min(n,a.value.length);else if(n=(i=a.ownerDocument||document)&&i.defaultView||window,n.getSelection){n=n.getSelection();var d=a.textContent.length,m=Math.min(c.start,d);c=c.end===void 0?m:Math.min(c.end,d),!n.extend&&m>c&&(d=c,c=m,m=d),d=Ap(a,m);var v=Ap(a,c);d&&v&&(n.rangeCount!==1||n.anchorNode!==d.node||n.anchorOffset!==d.offset||n.focusNode!==v.node||n.focusOffset!==v.offset)&&(i=i.createRange(),i.setStart(d.node,d.offset),n.removeAllRanges(),m>c?(n.addRange(i),n.extend(v.node,v.offset)):(i.setEnd(v.node,v.offset),n.addRange(i)))}}for(i=[],n=a;n=n.parentNode;)n.nodeType===1&&i.push({element:n,left:n.scrollLeft,top:n.scrollTop});for(typeof a.focus=="function"&&a.focus(),a=0;a<i.length;a++)n=i[a],n.element.scrollLeft=n.left,n.element.scrollTop=n.top}}var fw=f&&"documentMode"in document&&11>=document.documentMode,ro=null,Yc=null,ga=null,Jc=!1;function Pp(n,i,a){var c=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Jc||ro==null||ro!==rr(c)||(c=ro,"selectionStart"in c&&Xc(c)?c={start:c.selectionStart,end:c.selectionEnd}:(c=(c.ownerDocument&&c.ownerDocument.defaultView||window).getSelection(),c={anchorNode:c.anchorNode,anchorOffset:c.anchorOffset,focusNode:c.focusNode,focusOffset:c.focusOffset}),ga&&ma(ga,c)||(ga=c,c=Wl(Yc,"onSelect"),0<c.length&&(i=new Qs("onSelect","select",null,i,a),n.push({event:i,listeners:c}),i.target=ro)))}function $l(n,i){var a={};return a[n.toLowerCase()]=i.toLowerCase(),a["Webkit"+n]="webkit"+i,a["Moz"+n]="moz"+i,a}var io={animationend:$l("Animation","AnimationEnd"),animationiteration:$l("Animation","AnimationIteration"),animationstart:$l("Animation","AnimationStart"),transitionend:$l("Transition","TransitionEnd")},Zc={},kp={};f&&(kp=document.createElement("div").style,"AnimationEvent"in window||(delete io.animationend.animation,delete io.animationiteration.animation,delete io.animationstart.animation),"TransitionEvent"in window||delete io.transitionend.transition);function Hl(n){if(Zc[n])return Zc[n];if(!io[n])return n;var i=io[n],a;for(a in i)if(i.hasOwnProperty(a)&&a in kp)return Zc[n]=i[a];return n}var Np=Hl("animationend"),Dp=Hl("animationiteration"),Op=Hl("animationstart"),xp=Hl("transitionend"),Vp=new Map,Lp="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function ui(n,i){Vp.set(n,i),l(i,[n])}for(var eh=0;eh<Lp.length;eh++){var th=Lp[eh],pw=th.toLowerCase(),mw=th[0].toUpperCase()+th.slice(1);ui(pw,"on"+mw)}ui(Np,"onAnimationEnd"),ui(Dp,"onAnimationIteration"),ui(Op,"onAnimationStart"),ui("dblclick","onDoubleClick"),ui("focusin","onFocus"),ui("focusout","onBlur"),ui(xp,"onTransitionEnd"),h("onMouseEnter",["mouseout","mouseover"]),h("onMouseLeave",["mouseout","mouseover"]),h("onPointerEnter",["pointerout","pointerover"]),h("onPointerLeave",["pointerout","pointerover"]),l("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),l("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),l("onBeforeInput",["compositionend","keypress","textInput","paste"]),l("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),l("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var _a="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),gw=new Set("cancel close invalid load scroll toggle".split(" ").concat(_a));function bp(n,i,a){var c=n.type||"unknown-event";n.currentTarget=a,El(c,i,void 0,n),n.currentTarget=null}function Mp(n,i){i=(i&4)!==0;for(var a=0;a<n.length;a++){var c=n[a],d=c.event;c=c.listeners;e:{var m=void 0;if(i)for(var v=c.length-1;0<=v;v--){var I=c[v],P=I.instance,U=I.currentTarget;if(I=I.listener,P!==m&&d.isPropagationStopped())break e;bp(d,I,U),m=P}else for(v=0;v<c.length;v++){if(I=c[v],P=I.instance,U=I.currentTarget,I=I.listener,P!==m&&d.isPropagationStopped())break e;bp(d,I,U),m=P}}}if(Fn)throw n=ta,Fn=!1,ta=null,n}function Ze(n,i){var a=i[uh];a===void 0&&(a=i[uh]=new Set);var c=n+"__bubble";a.has(c)||(Up(i,n,2,!1),a.add(c))}function nh(n,i,a){var c=0;i&&(c|=4),Up(a,n,c,i)}var ql="_reactListening"+Math.random().toString(36).slice(2);function ya(n){if(!n[ql]){n[ql]=!0,s.forEach(function(a){a!=="selectionchange"&&(gw.has(a)||nh(a,!1,n),nh(a,!0,n))});var i=n.nodeType===9?n:n.ownerDocument;i===null||i[ql]||(i[ql]=!0,nh("selectionchange",!1,i))}}function Up(n,i,a,c){switch(la(i)){case 1:var d=rt;break;case 4:d=Wc;break;default:d=aa}a=d.bind(null,i,a,n),d=void 0,!Us||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(d=!0),c?d!==void 0?n.addEventListener(i,a,{capture:!0,passive:d}):n.addEventListener(i,a,!0):d!==void 0?n.addEventListener(i,a,{passive:d}):n.addEventListener(i,a,!1)}function rh(n,i,a,c,d){var m=c;if((i&1)===0&&(i&2)===0&&c!==null)e:for(;;){if(c===null)return;var v=c.tag;if(v===3||v===4){var I=c.stateNode.containerInfo;if(I===d||I.nodeType===8&&I.parentNode===d)break;if(v===4)for(v=c.return;v!==null;){var P=v.tag;if((P===3||P===4)&&(P=v.stateNode.containerInfo,P===d||P.nodeType===8&&P.parentNode===d))return;v=v.return}for(;I!==null;){if(v=as(I),v===null)return;if(P=v.tag,P===5||P===6){c=m=v;continue e}I=I.parentNode}}c=c.return}ea(function(){var U=m,Q=Ls(a),Y=[];e:{var G=Vp.get(n);if(G!==void 0){var re=Qs,oe=n;switch(n){case"keypress":if(Ks(a)===0)break e;case"keydown":case"keyup":re=p;break;case"focusin":oe="focus",re=Zs;break;case"focusout":oe="blur",re=Zs;break;case"beforeblur":case"afterblur":re=Zs;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":re=Ys;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":re=Ll;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":re=j;break;case Np:case Dp:case Op:re=Mr;break;case xp:re=He;break;case"scroll":re=Gc;break;case"wheel":re=be;break;case"copy":case"cut":case"paste":re=Ul;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":re=E}var ue=(i&4)!==0,gt=!ue&&n==="scroll",b=ue?G!==null?G+"Capture":null:G;ue=[];for(var D=U,M;D!==null;){M=D;var J=M.stateNode;if(M.tag===5&&J!==null&&(M=J,b!==null&&(J=mt(D,b),J!=null&&ue.push(va(D,J,M)))),gt)break;D=D.return}0<ue.length&&(G=new re(G,oe,null,a,Q),Y.push({event:G,listeners:ue}))}}if((i&7)===0){e:{if(G=n==="mouseover"||n==="pointerover",re=n==="mouseout"||n==="pointerout",G&&a!==Ki&&(oe=a.relatedTarget||a.fromElement)&&(as(oe)||oe[Ur]))break e;if((re||G)&&(G=Q.window===Q?Q:(G=Q.ownerDocument)?G.defaultView||G.parentWindow:window,re?(oe=a.relatedTarget||a.toElement,re=U,oe=oe?as(oe):null,oe!==null&&(gt=jn(oe),oe!==gt||oe.tag!==5&&oe.tag!==6)&&(oe=null)):(re=null,oe=U),re!==oe)){if(ue=Ys,J="onMouseLeave",b="onMouseEnter",D="mouse",(n==="pointerout"||n==="pointerover")&&(ue=E,J="onPointerLeave",b="onPointerEnter",D="pointer"),gt=re==null?G:ao(re),M=oe==null?G:ao(oe),G=new ue(J,D+"leave",re,a,Q),G.target=gt,G.relatedTarget=M,J=null,as(Q)===U&&(ue=new ue(b,D+"enter",oe,a,Q),ue.target=M,ue.relatedTarget=gt,J=ue),gt=J,re&&oe)t:{for(ue=re,b=oe,D=0,M=ue;M;M=so(M))D++;for(M=0,J=b;J;J=so(J))M++;for(;0<D-M;)ue=so(ue),D--;for(;0<M-D;)b=so(b),M--;for(;D--;){if(ue===b||b!==null&&ue===b.alternate)break t;ue=so(ue),b=so(b)}ue=null}else ue=null;re!==null&&Fp(Y,G,re,ue,!1),oe!==null&&gt!==null&&Fp(Y,gt,oe,ue,!0)}}e:{if(G=U?ao(U):window,re=G.nodeName&&G.nodeName.toLowerCase(),re==="select"||re==="input"&&G.type==="file")var he=ow;else if(yp(G))if(Ep)he=cw;else{he=lw;var ge=aw}else(re=G.nodeName)&&re.toLowerCase()==="input"&&(G.type==="checkbox"||G.type==="radio")&&(he=uw);if(he&&(he=he(n,U))){vp(Y,he,a,Q);break e}ge&&ge(n,G,U),n==="focusout"&&(ge=G._wrapperState)&&ge.controlled&&G.type==="number"&&bn(G,"number",G.value)}switch(ge=U?ao(U):window,n){case"focusin":(yp(ge)||ge.contentEditable==="true")&&(ro=ge,Yc=U,ga=null);break;case"focusout":ga=Yc=ro=null;break;case"mousedown":Jc=!0;break;case"contextmenu":case"mouseup":case"dragend":Jc=!1,Pp(Y,a,Q);break;case"selectionchange":if(fw)break;case"keydown":case"keyup":Pp(Y,a,Q)}var _e;if(vt)e:{switch(n){case"compositionstart":var Ee="onCompositionStart";break e;case"compositionend":Ee="onCompositionEnd";break e;case"compositionupdate":Ee="onCompositionUpdate";break e}Ee=void 0}else no?gp(n,a)&&(Ee="onCompositionEnd"):n==="keydown"&&a.keyCode===229&&(Ee="onCompositionStart");Ee&&(os&&a.locale!=="ko"&&(no||Ee!=="onCompositionStart"?Ee==="onCompositionEnd"&&no&&(_e=ua()):(fn=Q,Gs="value"in fn?fn.value:fn.textContent,no=!0)),ge=Wl(U,Ee),0<ge.length&&(Ee=new da(Ee,n,null,a,Q),Y.push({event:Ee,listeners:ge}),_e?Ee.data=_e:(_e=_p(a),_e!==null&&(Ee.data=_e)))),(_e=pn?nw(n,a):rw(n,a))&&(U=Wl(U,"onBeforeInput"),0<U.length&&(Q=new da("onBeforeInput","beforeinput",null,a,Q),Y.push({event:Q,listeners:U}),Q.data=_e))}Mp(Y,i)})}function va(n,i,a){return{instance:n,listener:i,currentTarget:a}}function Wl(n,i){for(var a=i+"Capture",c=[];n!==null;){var d=n,m=d.stateNode;d.tag===5&&m!==null&&(d=m,m=mt(n,a),m!=null&&c.unshift(va(n,m,d)),m=mt(n,i),m!=null&&c.push(va(n,m,d))),n=n.return}return c}function so(n){if(n===null)return null;do n=n.return;while(n&&n.tag!==5);return n||null}function Fp(n,i,a,c,d){for(var m=i._reactName,v=[];a!==null&&a!==c;){var I=a,P=I.alternate,U=I.stateNode;if(P!==null&&P===c)break;I.tag===5&&U!==null&&(I=U,d?(P=mt(a,m),P!=null&&v.unshift(va(a,P,I))):d||(P=mt(a,m),P!=null&&v.push(va(a,P,I)))),a=a.return}v.length!==0&&n.push({event:i,listeners:v})}var _w=/\r\n?/g,yw=/\u0000|\uFFFD/g;function jp(n){return(typeof n=="string"?n:""+n).replace(_w,`
`).replace(yw,"")}function Gl(n,i,a){if(i=jp(i),jp(n)!==i&&a)throw Error(t(425))}function Kl(){}var ih=null,sh=null;function oh(n,i){return n==="textarea"||n==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var ah=typeof setTimeout=="function"?setTimeout:void 0,vw=typeof clearTimeout=="function"?clearTimeout:void 0,Bp=typeof Promise=="function"?Promise:void 0,Ew=typeof queueMicrotask=="function"?queueMicrotask:typeof Bp<"u"?function(n){return Bp.resolve(null).then(n).catch(ww)}:ah;function ww(n){setTimeout(function(){throw n})}function lh(n,i){var a=i,c=0;do{var d=a.nextSibling;if(n.removeChild(a),d&&d.nodeType===8)if(a=d.data,a==="/$"){if(c===0){n.removeChild(d),qn(i);return}c--}else a!=="$"&&a!=="$?"&&a!=="$!"||c++;a=d}while(a);qn(i)}function ci(n){for(;n!=null;n=n.nextSibling){var i=n.nodeType;if(i===1||i===3)break;if(i===8){if(i=n.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return n}function zp(n){n=n.previousSibling;for(var i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="$"||a==="$!"||a==="$?"){if(i===0)return n;i--}else a==="/$"&&i++}n=n.previousSibling}return null}var oo=Math.random().toString(36).slice(2),fr="__reactFiber$"+oo,Ea="__reactProps$"+oo,Ur="__reactContainer$"+oo,uh="__reactEvents$"+oo,Tw="__reactListeners$"+oo,Iw="__reactHandles$"+oo;function as(n){var i=n[fr];if(i)return i;for(var a=n.parentNode;a;){if(i=a[Ur]||a[fr]){if(a=i.alternate,i.child!==null||a!==null&&a.child!==null)for(n=zp(n);n!==null;){if(a=n[fr])return a;n=zp(n)}return i}n=a,a=n.parentNode}return null}function wa(n){return n=n[fr]||n[Ur],!n||n.tag!==5&&n.tag!==6&&n.tag!==13&&n.tag!==3?null:n}function ao(n){if(n.tag===5||n.tag===6)return n.stateNode;throw Error(t(33))}function Ql(n){return n[Ea]||null}var ch=[],lo=-1;function hi(n){return{current:n}}function et(n){0>lo||(n.current=ch[lo],ch[lo]=null,lo--)}function Qe(n,i){lo++,ch[lo]=n.current,n.current=i}var di={},Bt=hi(di),nn=hi(!1),ls=di;function uo(n,i){var a=n.type.contextTypes;if(!a)return di;var c=n.stateNode;if(c&&c.__reactInternalMemoizedUnmaskedChildContext===i)return c.__reactInternalMemoizedMaskedChildContext;var d={},m;for(m in a)d[m]=i[m];return c&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=i,n.__reactInternalMemoizedMaskedChildContext=d),d}function rn(n){return n=n.childContextTypes,n!=null}function Xl(){et(nn),et(Bt)}function $p(n,i,a){if(Bt.current!==di)throw Error(t(168));Qe(Bt,i),Qe(nn,a)}function Hp(n,i,a){var c=n.stateNode;if(i=i.childContextTypes,typeof c.getChildContext!="function")return a;c=c.getChildContext();for(var d in c)if(!(d in i))throw Error(t(108,Ue(n)||"Unknown",d));return te({},a,c)}function Yl(n){return n=(n=n.stateNode)&&n.__reactInternalMemoizedMergedChildContext||di,ls=Bt.current,Qe(Bt,n),Qe(nn,nn.current),!0}function qp(n,i,a){var c=n.stateNode;if(!c)throw Error(t(169));a?(n=Hp(n,i,ls),c.__reactInternalMemoizedMergedChildContext=n,et(nn),et(Bt),Qe(Bt,n)):et(nn),Qe(nn,a)}var Fr=null,Jl=!1,hh=!1;function Wp(n){Fr===null?Fr=[n]:Fr.push(n)}function Sw(n){Jl=!0,Wp(n)}function fi(){if(!hh&&Fr!==null){hh=!0;var n=0,i=Ve;try{var a=Fr;for(Ve=1;n<a.length;n++){var c=a[n];do c=c(!0);while(c!==null)}Fr=null,Jl=!1}catch(d){throw Fr!==null&&(Fr=Fr.slice(n+1)),zs(Zi,fi),d}finally{Ve=i,hh=!1}}return null}var co=[],ho=0,Zl=null,eu=0,An=[],Rn=0,us=null,jr=1,Br="";function cs(n,i){co[ho++]=eu,co[ho++]=Zl,Zl=n,eu=i}function Gp(n,i,a){An[Rn++]=jr,An[Rn++]=Br,An[Rn++]=us,us=n;var c=jr;n=Br;var d=32-Qt(c)-1;c&=~(1<<d),a+=1;var m=32-Qt(i)+d;if(30<m){var v=d-d%5;m=(c&(1<<v)-1).toString(32),c>>=v,d-=v,jr=1<<32-Qt(i)+d|a<<d|c,Br=m+n}else jr=1<<m|a<<d|c,Br=n}function dh(n){n.return!==null&&(cs(n,1),Gp(n,1,0))}function fh(n){for(;n===Zl;)Zl=co[--ho],co[ho]=null,eu=co[--ho],co[ho]=null;for(;n===us;)us=An[--Rn],An[Rn]=null,Br=An[--Rn],An[Rn]=null,jr=An[--Rn],An[Rn]=null}var mn=null,gn=null,it=!1,Kn=null;function Kp(n,i){var a=Nn(5,null,null,0);a.elementType="DELETED",a.stateNode=i,a.return=n,i=n.deletions,i===null?(n.deletions=[a],n.flags|=16):i.push(a)}function Qp(n,i){switch(n.tag){case 5:var a=n.type;return i=i.nodeType!==1||a.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(n.stateNode=i,mn=n,gn=ci(i.firstChild),!0):!1;case 6:return i=n.pendingProps===""||i.nodeType!==3?null:i,i!==null?(n.stateNode=i,mn=n,gn=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(a=us!==null?{id:jr,overflow:Br}:null,n.memoizedState={dehydrated:i,treeContext:a,retryLane:1073741824},a=Nn(18,null,null,0),a.stateNode=i,a.return=n,n.child=a,mn=n,gn=null,!0):!1;default:return!1}}function ph(n){return(n.mode&1)!==0&&(n.flags&128)===0}function mh(n){if(it){var i=gn;if(i){var a=i;if(!Qp(n,i)){if(ph(n))throw Error(t(418));i=ci(a.nextSibling);var c=mn;i&&Qp(n,i)?Kp(c,a):(n.flags=n.flags&-4097|2,it=!1,mn=n)}}else{if(ph(n))throw Error(t(418));n.flags=n.flags&-4097|2,it=!1,mn=n}}}function Xp(n){for(n=n.return;n!==null&&n.tag!==5&&n.tag!==3&&n.tag!==13;)n=n.return;mn=n}function tu(n){if(n!==mn)return!1;if(!it)return Xp(n),it=!0,!1;var i;if((i=n.tag!==3)&&!(i=n.tag!==5)&&(i=n.type,i=i!=="head"&&i!=="body"&&!oh(n.type,n.memoizedProps)),i&&(i=gn)){if(ph(n))throw Yp(),Error(t(418));for(;i;)Kp(n,i),i=ci(i.nextSibling)}if(Xp(n),n.tag===13){if(n=n.memoizedState,n=n!==null?n.dehydrated:null,!n)throw Error(t(317));e:{for(n=n.nextSibling,i=0;n;){if(n.nodeType===8){var a=n.data;if(a==="/$"){if(i===0){gn=ci(n.nextSibling);break e}i--}else a!=="$"&&a!=="$!"&&a!=="$?"||i++}n=n.nextSibling}gn=null}}else gn=mn?ci(n.stateNode.nextSibling):null;return!0}function Yp(){for(var n=gn;n;)n=ci(n.nextSibling)}function fo(){gn=mn=null,it=!1}function gh(n){Kn===null?Kn=[n]:Kn.push(n)}var Aw=de.ReactCurrentBatchConfig;function Ta(n,i,a){if(n=a.ref,n!==null&&typeof n!="function"&&typeof n!="object"){if(a._owner){if(a=a._owner,a){if(a.tag!==1)throw Error(t(309));var c=a.stateNode}if(!c)throw Error(t(147,n));var d=c,m=""+n;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===m?i.ref:(i=function(v){var I=d.refs;v===null?delete I[m]:I[m]=v},i._stringRef=m,i)}if(typeof n!="string")throw Error(t(284));if(!a._owner)throw Error(t(290,n))}return n}function nu(n,i){throw n=Object.prototype.toString.call(i),Error(t(31,n==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":n))}function Jp(n){var i=n._init;return i(n._payload)}function Zp(n){function i(b,D){if(n){var M=b.deletions;M===null?(b.deletions=[D],b.flags|=16):M.push(D)}}function a(b,D){if(!n)return null;for(;D!==null;)i(b,D),D=D.sibling;return null}function c(b,D){for(b=new Map;D!==null;)D.key!==null?b.set(D.key,D):b.set(D.index,D),D=D.sibling;return b}function d(b,D){return b=wi(b,D),b.index=0,b.sibling=null,b}function m(b,D,M){return b.index=M,n?(M=b.alternate,M!==null?(M=M.index,M<D?(b.flags|=2,D):M):(b.flags|=2,D)):(b.flags|=1048576,D)}function v(b){return n&&b.alternate===null&&(b.flags|=2),b}function I(b,D,M,J){return D===null||D.tag!==6?(D=ad(M,b.mode,J),D.return=b,D):(D=d(D,M),D.return=b,D)}function P(b,D,M,J){var he=M.type;return he===N?Q(b,D,M.props.children,J,M.key):D!==null&&(D.elementType===he||typeof he=="object"&&he!==null&&he.$$typeof===Ye&&Jp(he)===D.type)?(J=d(D,M.props),J.ref=Ta(b,D,M),J.return=b,J):(J=Ru(M.type,M.key,M.props,null,b.mode,J),J.ref=Ta(b,D,M),J.return=b,J)}function U(b,D,M,J){return D===null||D.tag!==4||D.stateNode.containerInfo!==M.containerInfo||D.stateNode.implementation!==M.implementation?(D=ld(M,b.mode,J),D.return=b,D):(D=d(D,M.children||[]),D.return=b,D)}function Q(b,D,M,J,he){return D===null||D.tag!==7?(D=ys(M,b.mode,J,he),D.return=b,D):(D=d(D,M),D.return=b,D)}function Y(b,D,M){if(typeof D=="string"&&D!==""||typeof D=="number")return D=ad(""+D,b.mode,M),D.return=b,D;if(typeof D=="object"&&D!==null){switch(D.$$typeof){case je:return M=Ru(D.type,D.key,D.props,null,b.mode,M),M.ref=Ta(b,null,D),M.return=b,M;case we:return D=ld(D,b.mode,M),D.return=b,D;case Ye:var J=D._init;return Y(b,J(D._payload),M)}if(W(D)||fe(D))return D=ys(D,b.mode,M,null),D.return=b,D;nu(b,D)}return null}function G(b,D,M,J){var he=D!==null?D.key:null;if(typeof M=="string"&&M!==""||typeof M=="number")return he!==null?null:I(b,D,""+M,J);if(typeof M=="object"&&M!==null){switch(M.$$typeof){case je:return M.key===he?P(b,D,M,J):null;case we:return M.key===he?U(b,D,M,J):null;case Ye:return he=M._init,G(b,D,he(M._payload),J)}if(W(M)||fe(M))return he!==null?null:Q(b,D,M,J,null);nu(b,M)}return null}function re(b,D,M,J,he){if(typeof J=="string"&&J!==""||typeof J=="number")return b=b.get(M)||null,I(D,b,""+J,he);if(typeof J=="object"&&J!==null){switch(J.$$typeof){case je:return b=b.get(J.key===null?M:J.key)||null,P(D,b,J,he);case we:return b=b.get(J.key===null?M:J.key)||null,U(D,b,J,he);case Ye:var ge=J._init;return re(b,D,M,ge(J._payload),he)}if(W(J)||fe(J))return b=b.get(M)||null,Q(D,b,J,he,null);nu(D,J)}return null}function oe(b,D,M,J){for(var he=null,ge=null,_e=D,Ee=D=0,Ot=null;_e!==null&&Ee<M.length;Ee++){_e.index>Ee?(Ot=_e,_e=null):Ot=_e.sibling;var Be=G(b,_e,M[Ee],J);if(Be===null){_e===null&&(_e=Ot);break}n&&_e&&Be.alternate===null&&i(b,_e),D=m(Be,D,Ee),ge===null?he=Be:ge.sibling=Be,ge=Be,_e=Ot}if(Ee===M.length)return a(b,_e),it&&cs(b,Ee),he;if(_e===null){for(;Ee<M.length;Ee++)_e=Y(b,M[Ee],J),_e!==null&&(D=m(_e,D,Ee),ge===null?he=_e:ge.sibling=_e,ge=_e);return it&&cs(b,Ee),he}for(_e=c(b,_e);Ee<M.length;Ee++)Ot=re(_e,b,Ee,M[Ee],J),Ot!==null&&(n&&Ot.alternate!==null&&_e.delete(Ot.key===null?Ee:Ot.key),D=m(Ot,D,Ee),ge===null?he=Ot:ge.sibling=Ot,ge=Ot);return n&&_e.forEach(function(Ti){return i(b,Ti)}),it&&cs(b,Ee),he}function ue(b,D,M,J){var he=fe(M);if(typeof he!="function")throw Error(t(150));if(M=he.call(M),M==null)throw Error(t(151));for(var ge=he=null,_e=D,Ee=D=0,Ot=null,Be=M.next();_e!==null&&!Be.done;Ee++,Be=M.next()){_e.index>Ee?(Ot=_e,_e=null):Ot=_e.sibling;var Ti=G(b,_e,Be.value,J);if(Ti===null){_e===null&&(_e=Ot);break}n&&_e&&Ti.alternate===null&&i(b,_e),D=m(Ti,D,Ee),ge===null?he=Ti:ge.sibling=Ti,ge=Ti,_e=Ot}if(Be.done)return a(b,_e),it&&cs(b,Ee),he;if(_e===null){for(;!Be.done;Ee++,Be=M.next())Be=Y(b,Be.value,J),Be!==null&&(D=m(Be,D,Ee),ge===null?he=Be:ge.sibling=Be,ge=Be);return it&&cs(b,Ee),he}for(_e=c(b,_e);!Be.done;Ee++,Be=M.next())Be=re(_e,b,Ee,Be.value,J),Be!==null&&(n&&Be.alternate!==null&&_e.delete(Be.key===null?Ee:Be.key),D=m(Be,D,Ee),ge===null?he=Be:ge.sibling=Be,ge=Be);return n&&_e.forEach(function(iT){return i(b,iT)}),it&&cs(b,Ee),he}function gt(b,D,M,J){if(typeof M=="object"&&M!==null&&M.type===N&&M.key===null&&(M=M.props.children),typeof M=="object"&&M!==null){switch(M.$$typeof){case je:e:{for(var he=M.key,ge=D;ge!==null;){if(ge.key===he){if(he=M.type,he===N){if(ge.tag===7){a(b,ge.sibling),D=d(ge,M.props.children),D.return=b,b=D;break e}}else if(ge.elementType===he||typeof he=="object"&&he!==null&&he.$$typeof===Ye&&Jp(he)===ge.type){a(b,ge.sibling),D=d(ge,M.props),D.ref=Ta(b,ge,M),D.return=b,b=D;break e}a(b,ge);break}else i(b,ge);ge=ge.sibling}M.type===N?(D=ys(M.props.children,b.mode,J,M.key),D.return=b,b=D):(J=Ru(M.type,M.key,M.props,null,b.mode,J),J.ref=Ta(b,D,M),J.return=b,b=J)}return v(b);case we:e:{for(ge=M.key;D!==null;){if(D.key===ge)if(D.tag===4&&D.stateNode.containerInfo===M.containerInfo&&D.stateNode.implementation===M.implementation){a(b,D.sibling),D=d(D,M.children||[]),D.return=b,b=D;break e}else{a(b,D);break}else i(b,D);D=D.sibling}D=ld(M,b.mode,J),D.return=b,b=D}return v(b);case Ye:return ge=M._init,gt(b,D,ge(M._payload),J)}if(W(M))return oe(b,D,M,J);if(fe(M))return ue(b,D,M,J);nu(b,M)}return typeof M=="string"&&M!==""||typeof M=="number"?(M=""+M,D!==null&&D.tag===6?(a(b,D.sibling),D=d(D,M),D.return=b,b=D):(a(b,D),D=ad(M,b.mode,J),D.return=b,b=D),v(b)):a(b,D)}return gt}var po=Zp(!0),em=Zp(!1),ru=hi(null),iu=null,mo=null,_h=null;function yh(){_h=mo=iu=null}function vh(n){var i=ru.current;et(ru),n._currentValue=i}function Eh(n,i,a){for(;n!==null;){var c=n.alternate;if((n.childLanes&i)!==i?(n.childLanes|=i,c!==null&&(c.childLanes|=i)):c!==null&&(c.childLanes&i)!==i&&(c.childLanes|=i),n===a)break;n=n.return}}function go(n,i){iu=n,_h=mo=null,n=n.dependencies,n!==null&&n.firstContext!==null&&((n.lanes&i)!==0&&(sn=!0),n.firstContext=null)}function Cn(n){var i=n._currentValue;if(_h!==n)if(n={context:n,memoizedValue:i,next:null},mo===null){if(iu===null)throw Error(t(308));mo=n,iu.dependencies={lanes:0,firstContext:n}}else mo=mo.next=n;return i}var hs=null;function wh(n){hs===null?hs=[n]:hs.push(n)}function tm(n,i,a,c){var d=i.interleaved;return d===null?(a.next=a,wh(i)):(a.next=d.next,d.next=a),i.interleaved=a,zr(n,c)}function zr(n,i){n.lanes|=i;var a=n.alternate;for(a!==null&&(a.lanes|=i),a=n,n=n.return;n!==null;)n.childLanes|=i,a=n.alternate,a!==null&&(a.childLanes|=i),a=n,n=n.return;return a.tag===3?a.stateNode:null}var pi=!1;function Th(n){n.updateQueue={baseState:n.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function nm(n,i){n=n.updateQueue,i.updateQueue===n&&(i.updateQueue={baseState:n.baseState,firstBaseUpdate:n.firstBaseUpdate,lastBaseUpdate:n.lastBaseUpdate,shared:n.shared,effects:n.effects})}function $r(n,i){return{eventTime:n,lane:i,tag:0,payload:null,callback:null,next:null}}function mi(n,i,a){var c=n.updateQueue;if(c===null)return null;if(c=c.shared,(Fe&2)!==0){var d=c.pending;return d===null?i.next=i:(i.next=d.next,d.next=i),c.pending=i,zr(n,a)}return d=c.interleaved,d===null?(i.next=i,wh(c)):(i.next=d.next,d.next=i),c.interleaved=i,zr(n,a)}function su(n,i,a){if(i=i.updateQueue,i!==null&&(i=i.shared,(a&4194240)!==0)){var c=i.lanes;c&=n.pendingLanes,a|=c,i.lanes=a,ii(n,a)}}function rm(n,i){var a=n.updateQueue,c=n.alternate;if(c!==null&&(c=c.updateQueue,a===c)){var d=null,m=null;if(a=a.firstBaseUpdate,a!==null){do{var v={eventTime:a.eventTime,lane:a.lane,tag:a.tag,payload:a.payload,callback:a.callback,next:null};m===null?d=m=v:m=m.next=v,a=a.next}while(a!==null);m===null?d=m=i:m=m.next=i}else d=m=i;a={baseState:c.baseState,firstBaseUpdate:d,lastBaseUpdate:m,shared:c.shared,effects:c.effects},n.updateQueue=a;return}n=a.lastBaseUpdate,n===null?a.firstBaseUpdate=i:n.next=i,a.lastBaseUpdate=i}function ou(n,i,a,c){var d=n.updateQueue;pi=!1;var m=d.firstBaseUpdate,v=d.lastBaseUpdate,I=d.shared.pending;if(I!==null){d.shared.pending=null;var P=I,U=P.next;P.next=null,v===null?m=U:v.next=U,v=P;var Q=n.alternate;Q!==null&&(Q=Q.updateQueue,I=Q.lastBaseUpdate,I!==v&&(I===null?Q.firstBaseUpdate=U:I.next=U,Q.lastBaseUpdate=P))}if(m!==null){var Y=d.baseState;v=0,Q=U=P=null,I=m;do{var G=I.lane,re=I.eventTime;if((c&G)===G){Q!==null&&(Q=Q.next={eventTime:re,lane:0,tag:I.tag,payload:I.payload,callback:I.callback,next:null});e:{var oe=n,ue=I;switch(G=i,re=a,ue.tag){case 1:if(oe=ue.payload,typeof oe=="function"){Y=oe.call(re,Y,G);break e}Y=oe;break e;case 3:oe.flags=oe.flags&-65537|128;case 0:if(oe=ue.payload,G=typeof oe=="function"?oe.call(re,Y,G):oe,G==null)break e;Y=te({},Y,G);break e;case 2:pi=!0}}I.callback!==null&&I.lane!==0&&(n.flags|=64,G=d.effects,G===null?d.effects=[I]:G.push(I))}else re={eventTime:re,lane:G,tag:I.tag,payload:I.payload,callback:I.callback,next:null},Q===null?(U=Q=re,P=Y):Q=Q.next=re,v|=G;if(I=I.next,I===null){if(I=d.shared.pending,I===null)break;G=I,I=G.next,G.next=null,d.lastBaseUpdate=G,d.shared.pending=null}}while(!0);if(Q===null&&(P=Y),d.baseState=P,d.firstBaseUpdate=U,d.lastBaseUpdate=Q,i=d.shared.interleaved,i!==null){d=i;do v|=d.lane,d=d.next;while(d!==i)}else m===null&&(d.shared.lanes=0);ps|=v,n.lanes=v,n.memoizedState=Y}}function im(n,i,a){if(n=i.effects,i.effects=null,n!==null)for(i=0;i<n.length;i++){var c=n[i],d=c.callback;if(d!==null){if(c.callback=null,c=a,typeof d!="function")throw Error(t(191,d));d.call(c)}}}var Ia={},pr=hi(Ia),Sa=hi(Ia),Aa=hi(Ia);function ds(n){if(n===Ia)throw Error(t(174));return n}function Ih(n,i){switch(Qe(Aa,i),Qe(Sa,n),Qe(pr,Ia),n=i.nodeType,n){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:pt(null,"");break;default:n=n===8?i.parentNode:i,i=n.namespaceURI||null,n=n.tagName,i=pt(i,n)}et(pr),Qe(pr,i)}function _o(){et(pr),et(Sa),et(Aa)}function sm(n){ds(Aa.current);var i=ds(pr.current),a=pt(i,n.type);i!==a&&(Qe(Sa,n),Qe(pr,a))}function Sh(n){Sa.current===n&&(et(pr),et(Sa))}var st=hi(0);function au(n){for(var i=n;i!==null;){if(i.tag===13){var a=i.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||a.data==="$?"||a.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if((i.flags&128)!==0)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var Ah=[];function Rh(){for(var n=0;n<Ah.length;n++)Ah[n]._workInProgressVersionPrimary=null;Ah.length=0}var lu=de.ReactCurrentDispatcher,Ch=de.ReactCurrentBatchConfig,fs=0,ot=null,At=null,Nt=null,uu=!1,Ra=!1,Ca=0,Rw=0;function zt(){throw Error(t(321))}function Ph(n,i){if(i===null)return!1;for(var a=0;a<i.length&&a<n.length;a++)if(!Gn(n[a],i[a]))return!1;return!0}function kh(n,i,a,c,d,m){if(fs=m,ot=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,lu.current=n===null||n.memoizedState===null?Nw:Dw,n=a(c,d),Ra){m=0;do{if(Ra=!1,Ca=0,25<=m)throw Error(t(301));m+=1,Nt=At=null,i.updateQueue=null,lu.current=Ow,n=a(c,d)}while(Ra)}if(lu.current=du,i=At!==null&&At.next!==null,fs=0,Nt=At=ot=null,uu=!1,i)throw Error(t(300));return n}function Nh(){var n=Ca!==0;return Ca=0,n}function mr(){var n={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Nt===null?ot.memoizedState=Nt=n:Nt=Nt.next=n,Nt}function Pn(){if(At===null){var n=ot.alternate;n=n!==null?n.memoizedState:null}else n=At.next;var i=Nt===null?ot.memoizedState:Nt.next;if(i!==null)Nt=i,At=n;else{if(n===null)throw Error(t(310));At=n,n={memoizedState:At.memoizedState,baseState:At.baseState,baseQueue:At.baseQueue,queue:At.queue,next:null},Nt===null?ot.memoizedState=Nt=n:Nt=Nt.next=n}return Nt}function Pa(n,i){return typeof i=="function"?i(n):i}function Dh(n){var i=Pn(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var c=At,d=c.baseQueue,m=a.pending;if(m!==null){if(d!==null){var v=d.next;d.next=m.next,m.next=v}c.baseQueue=d=m,a.pending=null}if(d!==null){m=d.next,c=c.baseState;var I=v=null,P=null,U=m;do{var Q=U.lane;if((fs&Q)===Q)P!==null&&(P=P.next={lane:0,action:U.action,hasEagerState:U.hasEagerState,eagerState:U.eagerState,next:null}),c=U.hasEagerState?U.eagerState:n(c,U.action);else{var Y={lane:Q,action:U.action,hasEagerState:U.hasEagerState,eagerState:U.eagerState,next:null};P===null?(I=P=Y,v=c):P=P.next=Y,ot.lanes|=Q,ps|=Q}U=U.next}while(U!==null&&U!==m);P===null?v=c:P.next=I,Gn(c,i.memoizedState)||(sn=!0),i.memoizedState=c,i.baseState=v,i.baseQueue=P,a.lastRenderedState=c}if(n=a.interleaved,n!==null){d=n;do m=d.lane,ot.lanes|=m,ps|=m,d=d.next;while(d!==n)}else d===null&&(a.lanes=0);return[i.memoizedState,a.dispatch]}function Oh(n){var i=Pn(),a=i.queue;if(a===null)throw Error(t(311));a.lastRenderedReducer=n;var c=a.dispatch,d=a.pending,m=i.memoizedState;if(d!==null){a.pending=null;var v=d=d.next;do m=n(m,v.action),v=v.next;while(v!==d);Gn(m,i.memoizedState)||(sn=!0),i.memoizedState=m,i.baseQueue===null&&(i.baseState=m),a.lastRenderedState=m}return[m,c]}function om(){}function am(n,i){var a=ot,c=Pn(),d=i(),m=!Gn(c.memoizedState,d);if(m&&(c.memoizedState=d,sn=!0),c=c.queue,xh(cm.bind(null,a,c,n),[n]),c.getSnapshot!==i||m||Nt!==null&&Nt.memoizedState.tag&1){if(a.flags|=2048,ka(9,um.bind(null,a,c,d,i),void 0,null),Dt===null)throw Error(t(349));(fs&30)!==0||lm(a,i,d)}return d}function lm(n,i,a){n.flags|=16384,n={getSnapshot:i,value:a},i=ot.updateQueue,i===null?(i={lastEffect:null,stores:null},ot.updateQueue=i,i.stores=[n]):(a=i.stores,a===null?i.stores=[n]:a.push(n))}function um(n,i,a,c){i.value=a,i.getSnapshot=c,hm(i)&&dm(n)}function cm(n,i,a){return a(function(){hm(i)&&dm(n)})}function hm(n){var i=n.getSnapshot;n=n.value;try{var a=i();return!Gn(n,a)}catch{return!0}}function dm(n){var i=zr(n,1);i!==null&&Jn(i,n,1,-1)}function fm(n){var i=mr();return typeof n=="function"&&(n=n()),i.memoizedState=i.baseState=n,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Pa,lastRenderedState:n},i.queue=n,n=n.dispatch=kw.bind(null,ot,n),[i.memoizedState,n]}function ka(n,i,a,c){return n={tag:n,create:i,destroy:a,deps:c,next:null},i=ot.updateQueue,i===null?(i={lastEffect:null,stores:null},ot.updateQueue=i,i.lastEffect=n.next=n):(a=i.lastEffect,a===null?i.lastEffect=n.next=n:(c=a.next,a.next=n,n.next=c,i.lastEffect=n)),n}function pm(){return Pn().memoizedState}function cu(n,i,a,c){var d=mr();ot.flags|=n,d.memoizedState=ka(1|i,a,void 0,c===void 0?null:c)}function hu(n,i,a,c){var d=Pn();c=c===void 0?null:c;var m=void 0;if(At!==null){var v=At.memoizedState;if(m=v.destroy,c!==null&&Ph(c,v.deps)){d.memoizedState=ka(i,a,m,c);return}}ot.flags|=n,d.memoizedState=ka(1|i,a,m,c)}function mm(n,i){return cu(8390656,8,n,i)}function xh(n,i){return hu(2048,8,n,i)}function gm(n,i){return hu(4,2,n,i)}function _m(n,i){return hu(4,4,n,i)}function ym(n,i){if(typeof i=="function")return n=n(),i(n),function(){i(null)};if(i!=null)return n=n(),i.current=n,function(){i.current=null}}function vm(n,i,a){return a=a!=null?a.concat([n]):null,hu(4,4,ym.bind(null,i,n),a)}function Vh(){}function Em(n,i){var a=Pn();i=i===void 0?null:i;var c=a.memoizedState;return c!==null&&i!==null&&Ph(i,c[1])?c[0]:(a.memoizedState=[n,i],n)}function wm(n,i){var a=Pn();i=i===void 0?null:i;var c=a.memoizedState;return c!==null&&i!==null&&Ph(i,c[1])?c[0]:(n=n(),a.memoizedState=[n,i],n)}function Tm(n,i,a){return(fs&21)===0?(n.baseState&&(n.baseState=!1,sn=!0),n.memoizedState=a):(Gn(a,i)||(a=ns(),ot.lanes|=a,ps|=a,n.baseState=!0),i)}function Cw(n,i){var a=Ve;Ve=a!==0&&4>a?a:4,n(!0);var c=Ch.transition;Ch.transition={};try{n(!1),i()}finally{Ve=a,Ch.transition=c}}function Im(){return Pn().memoizedState}function Pw(n,i,a){var c=vi(n);if(a={lane:c,action:a,hasEagerState:!1,eagerState:null,next:null},Sm(n))Am(i,a);else if(a=tm(n,i,a,c),a!==null){var d=Jt();Jn(a,n,c,d),Rm(a,i,c)}}function kw(n,i,a){var c=vi(n),d={lane:c,action:a,hasEagerState:!1,eagerState:null,next:null};if(Sm(n))Am(i,d);else{var m=n.alternate;if(n.lanes===0&&(m===null||m.lanes===0)&&(m=i.lastRenderedReducer,m!==null))try{var v=i.lastRenderedState,I=m(v,a);if(d.hasEagerState=!0,d.eagerState=I,Gn(I,v)){var P=i.interleaved;P===null?(d.next=d,wh(i)):(d.next=P.next,P.next=d),i.interleaved=d;return}}catch{}finally{}a=tm(n,i,d,c),a!==null&&(d=Jt(),Jn(a,n,c,d),Rm(a,i,c))}}function Sm(n){var i=n.alternate;return n===ot||i!==null&&i===ot}function Am(n,i){Ra=uu=!0;var a=n.pending;a===null?i.next=i:(i.next=a.next,a.next=i),n.pending=i}function Rm(n,i,a){if((a&4194240)!==0){var c=i.lanes;c&=n.pendingLanes,a|=c,i.lanes=a,ii(n,a)}}var du={readContext:Cn,useCallback:zt,useContext:zt,useEffect:zt,useImperativeHandle:zt,useInsertionEffect:zt,useLayoutEffect:zt,useMemo:zt,useReducer:zt,useRef:zt,useState:zt,useDebugValue:zt,useDeferredValue:zt,useTransition:zt,useMutableSource:zt,useSyncExternalStore:zt,useId:zt,unstable_isNewReconciler:!1},Nw={readContext:Cn,useCallback:function(n,i){return mr().memoizedState=[n,i===void 0?null:i],n},useContext:Cn,useEffect:mm,useImperativeHandle:function(n,i,a){return a=a!=null?a.concat([n]):null,cu(4194308,4,ym.bind(null,i,n),a)},useLayoutEffect:function(n,i){return cu(4194308,4,n,i)},useInsertionEffect:function(n,i){return cu(4,2,n,i)},useMemo:function(n,i){var a=mr();return i=i===void 0?null:i,n=n(),a.memoizedState=[n,i],n},useReducer:function(n,i,a){var c=mr();return i=a!==void 0?a(i):i,c.memoizedState=c.baseState=i,n={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:n,lastRenderedState:i},c.queue=n,n=n.dispatch=Pw.bind(null,ot,n),[c.memoizedState,n]},useRef:function(n){var i=mr();return n={current:n},i.memoizedState=n},useState:fm,useDebugValue:Vh,useDeferredValue:function(n){return mr().memoizedState=n},useTransition:function(){var n=fm(!1),i=n[0];return n=Cw.bind(null,n[1]),mr().memoizedState=n,[i,n]},useMutableSource:function(){},useSyncExternalStore:function(n,i,a){var c=ot,d=mr();if(it){if(a===void 0)throw Error(t(407));a=a()}else{if(a=i(),Dt===null)throw Error(t(349));(fs&30)!==0||lm(c,i,a)}d.memoizedState=a;var m={value:a,getSnapshot:i};return d.queue=m,mm(cm.bind(null,c,m,n),[n]),c.flags|=2048,ka(9,um.bind(null,c,m,a,i),void 0,null),a},useId:function(){var n=mr(),i=Dt.identifierPrefix;if(it){var a=Br,c=jr;a=(c&~(1<<32-Qt(c)-1)).toString(32)+a,i=":"+i+"R"+a,a=Ca++,0<a&&(i+="H"+a.toString(32)),i+=":"}else a=Rw++,i=":"+i+"r"+a.toString(32)+":";return n.memoizedState=i},unstable_isNewReconciler:!1},Dw={readContext:Cn,useCallback:Em,useContext:Cn,useEffect:xh,useImperativeHandle:vm,useInsertionEffect:gm,useLayoutEffect:_m,useMemo:wm,useReducer:Dh,useRef:pm,useState:function(){return Dh(Pa)},useDebugValue:Vh,useDeferredValue:function(n){var i=Pn();return Tm(i,At.memoizedState,n)},useTransition:function(){var n=Dh(Pa)[0],i=Pn().memoizedState;return[n,i]},useMutableSource:om,useSyncExternalStore:am,useId:Im,unstable_isNewReconciler:!1},Ow={readContext:Cn,useCallback:Em,useContext:Cn,useEffect:xh,useImperativeHandle:vm,useInsertionEffect:gm,useLayoutEffect:_m,useMemo:wm,useReducer:Oh,useRef:pm,useState:function(){return Oh(Pa)},useDebugValue:Vh,useDeferredValue:function(n){var i=Pn();return At===null?i.memoizedState=n:Tm(i,At.memoizedState,n)},useTransition:function(){var n=Oh(Pa)[0],i=Pn().memoizedState;return[n,i]},useMutableSource:om,useSyncExternalStore:am,useId:Im,unstable_isNewReconciler:!1};function Qn(n,i){if(n&&n.defaultProps){i=te({},i),n=n.defaultProps;for(var a in n)i[a]===void 0&&(i[a]=n[a]);return i}return i}function Lh(n,i,a,c){i=n.memoizedState,a=a(c,i),a=a==null?i:te({},i,a),n.memoizedState=a,n.lanes===0&&(n.updateQueue.baseState=a)}var fu={isMounted:function(n){return(n=n._reactInternals)?jn(n)===n:!1},enqueueSetState:function(n,i,a){n=n._reactInternals;var c=Jt(),d=vi(n),m=$r(c,d);m.payload=i,a!=null&&(m.callback=a),i=mi(n,m,d),i!==null&&(Jn(i,n,d,c),su(i,n,d))},enqueueReplaceState:function(n,i,a){n=n._reactInternals;var c=Jt(),d=vi(n),m=$r(c,d);m.tag=1,m.payload=i,a!=null&&(m.callback=a),i=mi(n,m,d),i!==null&&(Jn(i,n,d,c),su(i,n,d))},enqueueForceUpdate:function(n,i){n=n._reactInternals;var a=Jt(),c=vi(n),d=$r(a,c);d.tag=2,i!=null&&(d.callback=i),i=mi(n,d,c),i!==null&&(Jn(i,n,c,a),su(i,n,c))}};function Cm(n,i,a,c,d,m,v){return n=n.stateNode,typeof n.shouldComponentUpdate=="function"?n.shouldComponentUpdate(c,m,v):i.prototype&&i.prototype.isPureReactComponent?!ma(a,c)||!ma(d,m):!0}function Pm(n,i,a){var c=!1,d=di,m=i.contextType;return typeof m=="object"&&m!==null?m=Cn(m):(d=rn(i)?ls:Bt.current,c=i.contextTypes,m=(c=c!=null)?uo(n,d):di),i=new i(a,m),n.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=fu,n.stateNode=i,i._reactInternals=n,c&&(n=n.stateNode,n.__reactInternalMemoizedUnmaskedChildContext=d,n.__reactInternalMemoizedMaskedChildContext=m),i}function km(n,i,a,c){n=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(a,c),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(a,c),i.state!==n&&fu.enqueueReplaceState(i,i.state,null)}function bh(n,i,a,c){var d=n.stateNode;d.props=a,d.state=n.memoizedState,d.refs={},Th(n);var m=i.contextType;typeof m=="object"&&m!==null?d.context=Cn(m):(m=rn(i)?ls:Bt.current,d.context=uo(n,m)),d.state=n.memoizedState,m=i.getDerivedStateFromProps,typeof m=="function"&&(Lh(n,i,m,a),d.state=n.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof d.getSnapshotBeforeUpdate=="function"||typeof d.UNSAFE_componentWillMount!="function"&&typeof d.componentWillMount!="function"||(i=d.state,typeof d.componentWillMount=="function"&&d.componentWillMount(),typeof d.UNSAFE_componentWillMount=="function"&&d.UNSAFE_componentWillMount(),i!==d.state&&fu.enqueueReplaceState(d,d.state,null),ou(n,a,d,c),d.state=n.memoizedState),typeof d.componentDidMount=="function"&&(n.flags|=4194308)}function yo(n,i){try{var a="",c=i;do a+=Re(c),c=c.return;while(c);var d=a}catch(m){d=`
Error generating stack: `+m.message+`
`+m.stack}return{value:n,source:i,stack:d,digest:null}}function Mh(n,i,a){return{value:n,source:null,stack:a??null,digest:i??null}}function Uh(n,i){try{console.error(i.value)}catch(a){setTimeout(function(){throw a})}}var xw=typeof WeakMap=="function"?WeakMap:Map;function Nm(n,i,a){a=$r(-1,a),a.tag=3,a.payload={element:null};var c=i.value;return a.callback=function(){Eu||(Eu=!0,Zh=c),Uh(n,i)},a}function Dm(n,i,a){a=$r(-1,a),a.tag=3;var c=n.type.getDerivedStateFromError;if(typeof c=="function"){var d=i.value;a.payload=function(){return c(d)},a.callback=function(){Uh(n,i)}}var m=n.stateNode;return m!==null&&typeof m.componentDidCatch=="function"&&(a.callback=function(){Uh(n,i),typeof c!="function"&&(_i===null?_i=new Set([this]):_i.add(this));var v=i.stack;this.componentDidCatch(i.value,{componentStack:v!==null?v:""})}),a}function Om(n,i,a){var c=n.pingCache;if(c===null){c=n.pingCache=new xw;var d=new Set;c.set(i,d)}else d=c.get(i),d===void 0&&(d=new Set,c.set(i,d));d.has(a)||(d.add(a),n=Gw.bind(null,n,i,a),i.then(n,n))}function xm(n){do{var i;if((i=n.tag===13)&&(i=n.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return n;n=n.return}while(n!==null);return null}function Vm(n,i,a,c,d){return(n.mode&1)===0?(n===i?n.flags|=65536:(n.flags|=128,a.flags|=131072,a.flags&=-52805,a.tag===1&&(a.alternate===null?a.tag=17:(i=$r(-1,1),i.tag=2,mi(a,i,1))),a.lanes|=1),n):(n.flags|=65536,n.lanes=d,n)}var Vw=de.ReactCurrentOwner,sn=!1;function Yt(n,i,a,c){i.child=n===null?em(i,null,a,c):po(i,n.child,a,c)}function Lm(n,i,a,c,d){a=a.render;var m=i.ref;return go(i,d),c=kh(n,i,a,c,m,d),a=Nh(),n!==null&&!sn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~d,Hr(n,i,d)):(it&&a&&dh(i),i.flags|=1,Yt(n,i,c,d),i.child)}function bm(n,i,a,c,d){if(n===null){var m=a.type;return typeof m=="function"&&!od(m)&&m.defaultProps===void 0&&a.compare===null&&a.defaultProps===void 0?(i.tag=15,i.type=m,Mm(n,i,m,c,d)):(n=Ru(a.type,null,c,i,i.mode,d),n.ref=i.ref,n.return=i,i.child=n)}if(m=n.child,(n.lanes&d)===0){var v=m.memoizedProps;if(a=a.compare,a=a!==null?a:ma,a(v,c)&&n.ref===i.ref)return Hr(n,i,d)}return i.flags|=1,n=wi(m,c),n.ref=i.ref,n.return=i,i.child=n}function Mm(n,i,a,c,d){if(n!==null){var m=n.memoizedProps;if(ma(m,c)&&n.ref===i.ref)if(sn=!1,i.pendingProps=c=m,(n.lanes&d)!==0)(n.flags&131072)!==0&&(sn=!0);else return i.lanes=n.lanes,Hr(n,i,d)}return Fh(n,i,a,c,d)}function Um(n,i,a){var c=i.pendingProps,d=c.children,m=n!==null?n.memoizedState:null;if(c.mode==="hidden")if((i.mode&1)===0)i.memoizedState={baseLanes:0,cachePool:null,transitions:null},Qe(Eo,_n),_n|=a;else{if((a&1073741824)===0)return n=m!==null?m.baseLanes|a:a,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:n,cachePool:null,transitions:null},i.updateQueue=null,Qe(Eo,_n),_n|=n,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},c=m!==null?m.baseLanes:a,Qe(Eo,_n),_n|=c}else m!==null?(c=m.baseLanes|a,i.memoizedState=null):c=a,Qe(Eo,_n),_n|=c;return Yt(n,i,d,a),i.child}function Fm(n,i){var a=i.ref;(n===null&&a!==null||n!==null&&n.ref!==a)&&(i.flags|=512,i.flags|=2097152)}function Fh(n,i,a,c,d){var m=rn(a)?ls:Bt.current;return m=uo(i,m),go(i,d),a=kh(n,i,a,c,m,d),c=Nh(),n!==null&&!sn?(i.updateQueue=n.updateQueue,i.flags&=-2053,n.lanes&=~d,Hr(n,i,d)):(it&&c&&dh(i),i.flags|=1,Yt(n,i,a,d),i.child)}function jm(n,i,a,c,d){if(rn(a)){var m=!0;Yl(i)}else m=!1;if(go(i,d),i.stateNode===null)mu(n,i),Pm(i,a,c),bh(i,a,c,d),c=!0;else if(n===null){var v=i.stateNode,I=i.memoizedProps;v.props=I;var P=v.context,U=a.contextType;typeof U=="object"&&U!==null?U=Cn(U):(U=rn(a)?ls:Bt.current,U=uo(i,U));var Q=a.getDerivedStateFromProps,Y=typeof Q=="function"||typeof v.getSnapshotBeforeUpdate=="function";Y||typeof v.UNSAFE_componentWillReceiveProps!="function"&&typeof v.componentWillReceiveProps!="function"||(I!==c||P!==U)&&km(i,v,c,U),pi=!1;var G=i.memoizedState;v.state=G,ou(i,c,v,d),P=i.memoizedState,I!==c||G!==P||nn.current||pi?(typeof Q=="function"&&(Lh(i,a,Q,c),P=i.memoizedState),(I=pi||Cm(i,a,I,c,G,P,U))?(Y||typeof v.UNSAFE_componentWillMount!="function"&&typeof v.componentWillMount!="function"||(typeof v.componentWillMount=="function"&&v.componentWillMount(),typeof v.UNSAFE_componentWillMount=="function"&&v.UNSAFE_componentWillMount()),typeof v.componentDidMount=="function"&&(i.flags|=4194308)):(typeof v.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=c,i.memoizedState=P),v.props=c,v.state=P,v.context=U,c=I):(typeof v.componentDidMount=="function"&&(i.flags|=4194308),c=!1)}else{v=i.stateNode,nm(n,i),I=i.memoizedProps,U=i.type===i.elementType?I:Qn(i.type,I),v.props=U,Y=i.pendingProps,G=v.context,P=a.contextType,typeof P=="object"&&P!==null?P=Cn(P):(P=rn(a)?ls:Bt.current,P=uo(i,P));var re=a.getDerivedStateFromProps;(Q=typeof re=="function"||typeof v.getSnapshotBeforeUpdate=="function")||typeof v.UNSAFE_componentWillReceiveProps!="function"&&typeof v.componentWillReceiveProps!="function"||(I!==Y||G!==P)&&km(i,v,c,P),pi=!1,G=i.memoizedState,v.state=G,ou(i,c,v,d);var oe=i.memoizedState;I!==Y||G!==oe||nn.current||pi?(typeof re=="function"&&(Lh(i,a,re,c),oe=i.memoizedState),(U=pi||Cm(i,a,U,c,G,oe,P)||!1)?(Q||typeof v.UNSAFE_componentWillUpdate!="function"&&typeof v.componentWillUpdate!="function"||(typeof v.componentWillUpdate=="function"&&v.componentWillUpdate(c,oe,P),typeof v.UNSAFE_componentWillUpdate=="function"&&v.UNSAFE_componentWillUpdate(c,oe,P)),typeof v.componentDidUpdate=="function"&&(i.flags|=4),typeof v.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof v.componentDidUpdate!="function"||I===n.memoizedProps&&G===n.memoizedState||(i.flags|=4),typeof v.getSnapshotBeforeUpdate!="function"||I===n.memoizedProps&&G===n.memoizedState||(i.flags|=1024),i.memoizedProps=c,i.memoizedState=oe),v.props=c,v.state=oe,v.context=P,c=U):(typeof v.componentDidUpdate!="function"||I===n.memoizedProps&&G===n.memoizedState||(i.flags|=4),typeof v.getSnapshotBeforeUpdate!="function"||I===n.memoizedProps&&G===n.memoizedState||(i.flags|=1024),c=!1)}return jh(n,i,a,c,m,d)}function jh(n,i,a,c,d,m){Fm(n,i);var v=(i.flags&128)!==0;if(!c&&!v)return d&&qp(i,a,!1),Hr(n,i,m);c=i.stateNode,Vw.current=i;var I=v&&typeof a.getDerivedStateFromError!="function"?null:c.render();return i.flags|=1,n!==null&&v?(i.child=po(i,n.child,null,m),i.child=po(i,null,I,m)):Yt(n,i,I,m),i.memoizedState=c.state,d&&qp(i,a,!0),i.child}function Bm(n){var i=n.stateNode;i.pendingContext?$p(n,i.pendingContext,i.pendingContext!==i.context):i.context&&$p(n,i.context,!1),Ih(n,i.containerInfo)}function zm(n,i,a,c,d){return fo(),gh(d),i.flags|=256,Yt(n,i,a,c),i.child}var Bh={dehydrated:null,treeContext:null,retryLane:0};function zh(n){return{baseLanes:n,cachePool:null,transitions:null}}function $m(n,i,a){var c=i.pendingProps,d=st.current,m=!1,v=(i.flags&128)!==0,I;if((I=v)||(I=n!==null&&n.memoizedState===null?!1:(d&2)!==0),I?(m=!0,i.flags&=-129):(n===null||n.memoizedState!==null)&&(d|=1),Qe(st,d&1),n===null)return mh(i),n=i.memoizedState,n!==null&&(n=n.dehydrated,n!==null)?((i.mode&1)===0?i.lanes=1:n.data==="$!"?i.lanes=8:i.lanes=1073741824,null):(v=c.children,n=c.fallback,m?(c=i.mode,m=i.child,v={mode:"hidden",children:v},(c&1)===0&&m!==null?(m.childLanes=0,m.pendingProps=v):m=Cu(v,c,0,null),n=ys(n,c,a,null),m.return=i,n.return=i,m.sibling=n,i.child=m,i.child.memoizedState=zh(a),i.memoizedState=Bh,n):$h(i,v));if(d=n.memoizedState,d!==null&&(I=d.dehydrated,I!==null))return Lw(n,i,v,c,I,d,a);if(m){m=c.fallback,v=i.mode,d=n.child,I=d.sibling;var P={mode:"hidden",children:c.children};return(v&1)===0&&i.child!==d?(c=i.child,c.childLanes=0,c.pendingProps=P,i.deletions=null):(c=wi(d,P),c.subtreeFlags=d.subtreeFlags&14680064),I!==null?m=wi(I,m):(m=ys(m,v,a,null),m.flags|=2),m.return=i,c.return=i,c.sibling=m,i.child=c,c=m,m=i.child,v=n.child.memoizedState,v=v===null?zh(a):{baseLanes:v.baseLanes|a,cachePool:null,transitions:v.transitions},m.memoizedState=v,m.childLanes=n.childLanes&~a,i.memoizedState=Bh,c}return m=n.child,n=m.sibling,c=wi(m,{mode:"visible",children:c.children}),(i.mode&1)===0&&(c.lanes=a),c.return=i,c.sibling=null,n!==null&&(a=i.deletions,a===null?(i.deletions=[n],i.flags|=16):a.push(n)),i.child=c,i.memoizedState=null,c}function $h(n,i){return i=Cu({mode:"visible",children:i},n.mode,0,null),i.return=n,n.child=i}function pu(n,i,a,c){return c!==null&&gh(c),po(i,n.child,null,a),n=$h(i,i.pendingProps.children),n.flags|=2,i.memoizedState=null,n}function Lw(n,i,a,c,d,m,v){if(a)return i.flags&256?(i.flags&=-257,c=Mh(Error(t(422))),pu(n,i,v,c)):i.memoizedState!==null?(i.child=n.child,i.flags|=128,null):(m=c.fallback,d=i.mode,c=Cu({mode:"visible",children:c.children},d,0,null),m=ys(m,d,v,null),m.flags|=2,c.return=i,m.return=i,c.sibling=m,i.child=c,(i.mode&1)!==0&&po(i,n.child,null,v),i.child.memoizedState=zh(v),i.memoizedState=Bh,m);if((i.mode&1)===0)return pu(n,i,v,null);if(d.data==="$!"){if(c=d.nextSibling&&d.nextSibling.dataset,c)var I=c.dgst;return c=I,m=Error(t(419)),c=Mh(m,c,void 0),pu(n,i,v,c)}if(I=(v&n.childLanes)!==0,sn||I){if(c=Dt,c!==null){switch(v&-v){case 4:d=2;break;case 16:d=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:d=32;break;case 536870912:d=268435456;break;default:d=0}d=(d&(c.suspendedLanes|v))!==0?0:d,d!==0&&d!==m.retryLane&&(m.retryLane=d,zr(n,d),Jn(c,n,d,-1))}return sd(),c=Mh(Error(t(421))),pu(n,i,v,c)}return d.data==="$?"?(i.flags|=128,i.child=n.child,i=Kw.bind(null,n),d._reactRetry=i,null):(n=m.treeContext,gn=ci(d.nextSibling),mn=i,it=!0,Kn=null,n!==null&&(An[Rn++]=jr,An[Rn++]=Br,An[Rn++]=us,jr=n.id,Br=n.overflow,us=i),i=$h(i,c.children),i.flags|=4096,i)}function Hm(n,i,a){n.lanes|=i;var c=n.alternate;c!==null&&(c.lanes|=i),Eh(n.return,i,a)}function Hh(n,i,a,c,d){var m=n.memoizedState;m===null?n.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:c,tail:a,tailMode:d}:(m.isBackwards=i,m.rendering=null,m.renderingStartTime=0,m.last=c,m.tail=a,m.tailMode=d)}function qm(n,i,a){var c=i.pendingProps,d=c.revealOrder,m=c.tail;if(Yt(n,i,c.children,a),c=st.current,(c&2)!==0)c=c&1|2,i.flags|=128;else{if(n!==null&&(n.flags&128)!==0)e:for(n=i.child;n!==null;){if(n.tag===13)n.memoizedState!==null&&Hm(n,a,i);else if(n.tag===19)Hm(n,a,i);else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===i)break e;for(;n.sibling===null;){if(n.return===null||n.return===i)break e;n=n.return}n.sibling.return=n.return,n=n.sibling}c&=1}if(Qe(st,c),(i.mode&1)===0)i.memoizedState=null;else switch(d){case"forwards":for(a=i.child,d=null;a!==null;)n=a.alternate,n!==null&&au(n)===null&&(d=a),a=a.sibling;a=d,a===null?(d=i.child,i.child=null):(d=a.sibling,a.sibling=null),Hh(i,!1,d,a,m);break;case"backwards":for(a=null,d=i.child,i.child=null;d!==null;){if(n=d.alternate,n!==null&&au(n)===null){i.child=d;break}n=d.sibling,d.sibling=a,a=d,d=n}Hh(i,!0,a,null,m);break;case"together":Hh(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function mu(n,i){(i.mode&1)===0&&n!==null&&(n.alternate=null,i.alternate=null,i.flags|=2)}function Hr(n,i,a){if(n!==null&&(i.dependencies=n.dependencies),ps|=i.lanes,(a&i.childLanes)===0)return null;if(n!==null&&i.child!==n.child)throw Error(t(153));if(i.child!==null){for(n=i.child,a=wi(n,n.pendingProps),i.child=a,a.return=i;n.sibling!==null;)n=n.sibling,a=a.sibling=wi(n,n.pendingProps),a.return=i;a.sibling=null}return i.child}function bw(n,i,a){switch(i.tag){case 3:Bm(i),fo();break;case 5:sm(i);break;case 1:rn(i.type)&&Yl(i);break;case 4:Ih(i,i.stateNode.containerInfo);break;case 10:var c=i.type._context,d=i.memoizedProps.value;Qe(ru,c._currentValue),c._currentValue=d;break;case 13:if(c=i.memoizedState,c!==null)return c.dehydrated!==null?(Qe(st,st.current&1),i.flags|=128,null):(a&i.child.childLanes)!==0?$m(n,i,a):(Qe(st,st.current&1),n=Hr(n,i,a),n!==null?n.sibling:null);Qe(st,st.current&1);break;case 19:if(c=(a&i.childLanes)!==0,(n.flags&128)!==0){if(c)return qm(n,i,a);i.flags|=128}if(d=i.memoizedState,d!==null&&(d.rendering=null,d.tail=null,d.lastEffect=null),Qe(st,st.current),c)break;return null;case 22:case 23:return i.lanes=0,Um(n,i,a)}return Hr(n,i,a)}var Wm,qh,Gm,Km;Wm=function(n,i){for(var a=i.child;a!==null;){if(a.tag===5||a.tag===6)n.appendChild(a.stateNode);else if(a.tag!==4&&a.child!==null){a.child.return=a,a=a.child;continue}if(a===i)break;for(;a.sibling===null;){if(a.return===null||a.return===i)return;a=a.return}a.sibling.return=a.return,a=a.sibling}},qh=function(){},Gm=function(n,i,a,c){var d=n.memoizedProps;if(d!==c){n=i.stateNode,ds(pr.current);var m=null;switch(a){case"input":d=Vn(n,d),c=Vn(n,c),m=[];break;case"select":d=te({},d,{value:void 0}),c=te({},c,{value:void 0}),m=[];break;case"textarea":d=xe(n,d),c=xe(n,c),m=[];break;default:typeof d.onClick!="function"&&typeof c.onClick=="function"&&(n.onclick=Kl)}Xo(a,c);var v;a=null;for(U in d)if(!c.hasOwnProperty(U)&&d.hasOwnProperty(U)&&d[U]!=null)if(U==="style"){var I=d[U];for(v in I)I.hasOwnProperty(v)&&(a||(a={}),a[v]="")}else U!=="dangerouslySetInnerHTML"&&U!=="children"&&U!=="suppressContentEditableWarning"&&U!=="suppressHydrationWarning"&&U!=="autoFocus"&&(o.hasOwnProperty(U)?m||(m=[]):(m=m||[]).push(U,null));for(U in c){var P=c[U];if(I=d!=null?d[U]:void 0,c.hasOwnProperty(U)&&P!==I&&(P!=null||I!=null))if(U==="style")if(I){for(v in I)!I.hasOwnProperty(v)||P&&P.hasOwnProperty(v)||(a||(a={}),a[v]="");for(v in P)P.hasOwnProperty(v)&&I[v]!==P[v]&&(a||(a={}),a[v]=P[v])}else a||(m||(m=[]),m.push(U,a)),a=P;else U==="dangerouslySetInnerHTML"?(P=P?P.__html:void 0,I=I?I.__html:void 0,P!=null&&I!==P&&(m=m||[]).push(U,P)):U==="children"?typeof P!="string"&&typeof P!="number"||(m=m||[]).push(U,""+P):U!=="suppressContentEditableWarning"&&U!=="suppressHydrationWarning"&&(o.hasOwnProperty(U)?(P!=null&&U==="onScroll"&&Ze("scroll",n),m||I===P||(m=[])):(m=m||[]).push(U,P))}a&&(m=m||[]).push("style",a);var U=m;(i.updateQueue=U)&&(i.flags|=4)}},Km=function(n,i,a,c){a!==c&&(i.flags|=4)};function Na(n,i){if(!it)switch(n.tailMode){case"hidden":i=n.tail;for(var a=null;i!==null;)i.alternate!==null&&(a=i),i=i.sibling;a===null?n.tail=null:a.sibling=null;break;case"collapsed":a=n.tail;for(var c=null;a!==null;)a.alternate!==null&&(c=a),a=a.sibling;c===null?i||n.tail===null?n.tail=null:n.tail.sibling=null:c.sibling=null}}function $t(n){var i=n.alternate!==null&&n.alternate.child===n.child,a=0,c=0;if(i)for(var d=n.child;d!==null;)a|=d.lanes|d.childLanes,c|=d.subtreeFlags&14680064,c|=d.flags&14680064,d.return=n,d=d.sibling;else for(d=n.child;d!==null;)a|=d.lanes|d.childLanes,c|=d.subtreeFlags,c|=d.flags,d.return=n,d=d.sibling;return n.subtreeFlags|=c,n.childLanes=a,i}function Mw(n,i,a){var c=i.pendingProps;switch(fh(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return $t(i),null;case 1:return rn(i.type)&&Xl(),$t(i),null;case 3:return c=i.stateNode,_o(),et(nn),et(Bt),Rh(),c.pendingContext&&(c.context=c.pendingContext,c.pendingContext=null),(n===null||n.child===null)&&(tu(i)?i.flags|=4:n===null||n.memoizedState.isDehydrated&&(i.flags&256)===0||(i.flags|=1024,Kn!==null&&(nd(Kn),Kn=null))),qh(n,i),$t(i),null;case 5:Sh(i);var d=ds(Aa.current);if(a=i.type,n!==null&&i.stateNode!=null)Gm(n,i,a,c,d),n.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!c){if(i.stateNode===null)throw Error(t(166));return $t(i),null}if(n=ds(pr.current),tu(i)){c=i.stateNode,a=i.type;var m=i.memoizedProps;switch(c[fr]=i,c[Ea]=m,n=(i.mode&1)!==0,a){case"dialog":Ze("cancel",c),Ze("close",c);break;case"iframe":case"object":case"embed":Ze("load",c);break;case"video":case"audio":for(d=0;d<_a.length;d++)Ze(_a[d],c);break;case"source":Ze("error",c);break;case"img":case"image":case"link":Ze("error",c),Ze("load",c);break;case"details":Ze("toggle",c);break;case"input":Ln(c,m),Ze("invalid",c);break;case"select":c._wrapperState={wasMultiple:!!m.multiple},Ze("invalid",c);break;case"textarea":ut(c,m),Ze("invalid",c)}Xo(a,m),d=null;for(var v in m)if(m.hasOwnProperty(v)){var I=m[v];v==="children"?typeof I=="string"?c.textContent!==I&&(m.suppressHydrationWarning!==!0&&Gl(c.textContent,I,n),d=["children",I]):typeof I=="number"&&c.textContent!==""+I&&(m.suppressHydrationWarning!==!0&&Gl(c.textContent,I,n),d=["children",""+I]):o.hasOwnProperty(v)&&I!=null&&v==="onScroll"&&Ze("scroll",c)}switch(a){case"input":xn(c),Jr(c,m,!0);break;case"textarea":xn(c),Mn(c);break;case"select":case"option":break;default:typeof m.onClick=="function"&&(c.onclick=Kl)}c=d,i.updateQueue=c,c!==null&&(i.flags|=4)}else{v=d.nodeType===9?d:d.ownerDocument,n==="http://www.w3.org/1999/xhtml"&&(n=$e(a)),n==="http://www.w3.org/1999/xhtml"?a==="script"?(n=v.createElement("div"),n.innerHTML="<script><\/script>",n=n.removeChild(n.firstChild)):typeof c.is=="string"?n=v.createElement(a,{is:c.is}):(n=v.createElement(a),a==="select"&&(v=n,c.multiple?v.multiple=!0:c.size&&(v.size=c.size))):n=v.createElementNS(n,a),n[fr]=i,n[Ea]=c,Wm(n,i,!1,!1),i.stateNode=n;e:{switch(v=Yo(a,c),a){case"dialog":Ze("cancel",n),Ze("close",n),d=c;break;case"iframe":case"object":case"embed":Ze("load",n),d=c;break;case"video":case"audio":for(d=0;d<_a.length;d++)Ze(_a[d],n);d=c;break;case"source":Ze("error",n),d=c;break;case"img":case"image":case"link":Ze("error",n),Ze("load",n),d=c;break;case"details":Ze("toggle",n),d=c;break;case"input":Ln(n,c),d=Vn(n,c),Ze("invalid",n);break;case"option":d=c;break;case"select":n._wrapperState={wasMultiple:!!c.multiple},d=te({},c,{value:void 0}),Ze("invalid",n);break;case"textarea":ut(n,c),d=xe(n,c),Ze("invalid",n);break;default:d=c}Xo(a,d),I=d;for(m in I)if(I.hasOwnProperty(m)){var P=I[m];m==="style"?Ko(n,P):m==="dangerouslySetInnerHTML"?(P=P?P.__html:void 0,P!=null&&Zr(n,P)):m==="children"?typeof P=="string"?(a!=="textarea"||P!=="")&&ir(n,P):typeof P=="number"&&ir(n,""+P):m!=="suppressContentEditableWarning"&&m!=="suppressHydrationWarning"&&m!=="autoFocus"&&(o.hasOwnProperty(m)?P!=null&&m==="onScroll"&&Ze("scroll",n):P!=null&&le(n,m,P,v))}switch(a){case"input":xn(n),Jr(n,c,!1);break;case"textarea":xn(n),Mn(n);break;case"option":c.value!=null&&n.setAttribute("value",""+Le(c.value));break;case"select":n.multiple=!!c.multiple,m=c.value,m!=null?Ae(n,!!c.multiple,m,!1):c.defaultValue!=null&&Ae(n,!!c.multiple,c.defaultValue,!0);break;default:typeof d.onClick=="function"&&(n.onclick=Kl)}switch(a){case"button":case"input":case"select":case"textarea":c=!!c.autoFocus;break e;case"img":c=!0;break e;default:c=!1}}c&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return $t(i),null;case 6:if(n&&i.stateNode!=null)Km(n,i,n.memoizedProps,c);else{if(typeof c!="string"&&i.stateNode===null)throw Error(t(166));if(a=ds(Aa.current),ds(pr.current),tu(i)){if(c=i.stateNode,a=i.memoizedProps,c[fr]=i,(m=c.nodeValue!==a)&&(n=mn,n!==null))switch(n.tag){case 3:Gl(c.nodeValue,a,(n.mode&1)!==0);break;case 5:n.memoizedProps.suppressHydrationWarning!==!0&&Gl(c.nodeValue,a,(n.mode&1)!==0)}m&&(i.flags|=4)}else c=(a.nodeType===9?a:a.ownerDocument).createTextNode(c),c[fr]=i,i.stateNode=c}return $t(i),null;case 13:if(et(st),c=i.memoizedState,n===null||n.memoizedState!==null&&n.memoizedState.dehydrated!==null){if(it&&gn!==null&&(i.mode&1)!==0&&(i.flags&128)===0)Yp(),fo(),i.flags|=98560,m=!1;else if(m=tu(i),c!==null&&c.dehydrated!==null){if(n===null){if(!m)throw Error(t(318));if(m=i.memoizedState,m=m!==null?m.dehydrated:null,!m)throw Error(t(317));m[fr]=i}else fo(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;$t(i),m=!1}else Kn!==null&&(nd(Kn),Kn=null),m=!0;if(!m)return i.flags&65536?i:null}return(i.flags&128)!==0?(i.lanes=a,i):(c=c!==null,c!==(n!==null&&n.memoizedState!==null)&&c&&(i.child.flags|=8192,(i.mode&1)!==0&&(n===null||(st.current&1)!==0?Rt===0&&(Rt=3):sd())),i.updateQueue!==null&&(i.flags|=4),$t(i),null);case 4:return _o(),qh(n,i),n===null&&ya(i.stateNode.containerInfo),$t(i),null;case 10:return vh(i.type._context),$t(i),null;case 17:return rn(i.type)&&Xl(),$t(i),null;case 19:if(et(st),m=i.memoizedState,m===null)return $t(i),null;if(c=(i.flags&128)!==0,v=m.rendering,v===null)if(c)Na(m,!1);else{if(Rt!==0||n!==null&&(n.flags&128)!==0)for(n=i.child;n!==null;){if(v=au(n),v!==null){for(i.flags|=128,Na(m,!1),c=v.updateQueue,c!==null&&(i.updateQueue=c,i.flags|=4),i.subtreeFlags=0,c=a,a=i.child;a!==null;)m=a,n=c,m.flags&=14680066,v=m.alternate,v===null?(m.childLanes=0,m.lanes=n,m.child=null,m.subtreeFlags=0,m.memoizedProps=null,m.memoizedState=null,m.updateQueue=null,m.dependencies=null,m.stateNode=null):(m.childLanes=v.childLanes,m.lanes=v.lanes,m.child=v.child,m.subtreeFlags=0,m.deletions=null,m.memoizedProps=v.memoizedProps,m.memoizedState=v.memoizedState,m.updateQueue=v.updateQueue,m.type=v.type,n=v.dependencies,m.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),a=a.sibling;return Qe(st,st.current&1|2),i.child}n=n.sibling}m.tail!==null&&Ke()>wo&&(i.flags|=128,c=!0,Na(m,!1),i.lanes=4194304)}else{if(!c)if(n=au(v),n!==null){if(i.flags|=128,c=!0,a=n.updateQueue,a!==null&&(i.updateQueue=a,i.flags|=4),Na(m,!0),m.tail===null&&m.tailMode==="hidden"&&!v.alternate&&!it)return $t(i),null}else 2*Ke()-m.renderingStartTime>wo&&a!==1073741824&&(i.flags|=128,c=!0,Na(m,!1),i.lanes=4194304);m.isBackwards?(v.sibling=i.child,i.child=v):(a=m.last,a!==null?a.sibling=v:i.child=v,m.last=v)}return m.tail!==null?(i=m.tail,m.rendering=i,m.tail=i.sibling,m.renderingStartTime=Ke(),i.sibling=null,a=st.current,Qe(st,c?a&1|2:a&1),i):($t(i),null);case 22:case 23:return id(),c=i.memoizedState!==null,n!==null&&n.memoizedState!==null!==c&&(i.flags|=8192),c&&(i.mode&1)!==0?(_n&1073741824)!==0&&($t(i),i.subtreeFlags&6&&(i.flags|=8192)):$t(i),null;case 24:return null;case 25:return null}throw Error(t(156,i.tag))}function Uw(n,i){switch(fh(i),i.tag){case 1:return rn(i.type)&&Xl(),n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 3:return _o(),et(nn),et(Bt),Rh(),n=i.flags,(n&65536)!==0&&(n&128)===0?(i.flags=n&-65537|128,i):null;case 5:return Sh(i),null;case 13:if(et(st),n=i.memoizedState,n!==null&&n.dehydrated!==null){if(i.alternate===null)throw Error(t(340));fo()}return n=i.flags,n&65536?(i.flags=n&-65537|128,i):null;case 19:return et(st),null;case 4:return _o(),null;case 10:return vh(i.type._context),null;case 22:case 23:return id(),null;case 24:return null;default:return null}}var gu=!1,Ht=!1,Fw=typeof WeakSet=="function"?WeakSet:Set,se=null;function vo(n,i){var a=n.ref;if(a!==null)if(typeof a=="function")try{a(null)}catch(c){ct(n,i,c)}else a.current=null}function Wh(n,i,a){try{a()}catch(c){ct(n,i,c)}}var Qm=!1;function jw(n,i){if(ih=ai,n=Cp(),Xc(n)){if("selectionStart"in n)var a={start:n.selectionStart,end:n.selectionEnd};else e:{a=(a=n.ownerDocument)&&a.defaultView||window;var c=a.getSelection&&a.getSelection();if(c&&c.rangeCount!==0){a=c.anchorNode;var d=c.anchorOffset,m=c.focusNode;c=c.focusOffset;try{a.nodeType,m.nodeType}catch{a=null;break e}var v=0,I=-1,P=-1,U=0,Q=0,Y=n,G=null;t:for(;;){for(var re;Y!==a||d!==0&&Y.nodeType!==3||(I=v+d),Y!==m||c!==0&&Y.nodeType!==3||(P=v+c),Y.nodeType===3&&(v+=Y.nodeValue.length),(re=Y.firstChild)!==null;)G=Y,Y=re;for(;;){if(Y===n)break t;if(G===a&&++U===d&&(I=v),G===m&&++Q===c&&(P=v),(re=Y.nextSibling)!==null)break;Y=G,G=Y.parentNode}Y=re}a=I===-1||P===-1?null:{start:I,end:P}}else a=null}a=a||{start:0,end:0}}else a=null;for(sh={focusedElem:n,selectionRange:a},ai=!1,se=i;se!==null;)if(i=se,n=i.child,(i.subtreeFlags&1028)!==0&&n!==null)n.return=i,se=n;else for(;se!==null;){i=se;try{var oe=i.alternate;if((i.flags&1024)!==0)switch(i.tag){case 0:case 11:case 15:break;case 1:if(oe!==null){var ue=oe.memoizedProps,gt=oe.memoizedState,b=i.stateNode,D=b.getSnapshotBeforeUpdate(i.elementType===i.type?ue:Qn(i.type,ue),gt);b.__reactInternalSnapshotBeforeUpdate=D}break;case 3:var M=i.stateNode.containerInfo;M.nodeType===1?M.textContent="":M.nodeType===9&&M.documentElement&&M.removeChild(M.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(t(163))}}catch(J){ct(i,i.return,J)}if(n=i.sibling,n!==null){n.return=i.return,se=n;break}se=i.return}return oe=Qm,Qm=!1,oe}function Da(n,i,a){var c=i.updateQueue;if(c=c!==null?c.lastEffect:null,c!==null){var d=c=c.next;do{if((d.tag&n)===n){var m=d.destroy;d.destroy=void 0,m!==void 0&&Wh(i,a,m)}d=d.next}while(d!==c)}}function _u(n,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var a=i=i.next;do{if((a.tag&n)===n){var c=a.create;a.destroy=c()}a=a.next}while(a!==i)}}function Gh(n){var i=n.ref;if(i!==null){var a=n.stateNode;switch(n.tag){case 5:n=a;break;default:n=a}typeof i=="function"?i(n):i.current=n}}function Xm(n){var i=n.alternate;i!==null&&(n.alternate=null,Xm(i)),n.child=null,n.deletions=null,n.sibling=null,n.tag===5&&(i=n.stateNode,i!==null&&(delete i[fr],delete i[Ea],delete i[uh],delete i[Tw],delete i[Iw])),n.stateNode=null,n.return=null,n.dependencies=null,n.memoizedProps=null,n.memoizedState=null,n.pendingProps=null,n.stateNode=null,n.updateQueue=null}function Ym(n){return n.tag===5||n.tag===3||n.tag===4}function Jm(n){e:for(;;){for(;n.sibling===null;){if(n.return===null||Ym(n.return))return null;n=n.return}for(n.sibling.return=n.return,n=n.sibling;n.tag!==5&&n.tag!==6&&n.tag!==18;){if(n.flags&2||n.child===null||n.tag===4)continue e;n.child.return=n,n=n.child}if(!(n.flags&2))return n.stateNode}}function Kh(n,i,a){var c=n.tag;if(c===5||c===6)n=n.stateNode,i?a.nodeType===8?a.parentNode.insertBefore(n,i):a.insertBefore(n,i):(a.nodeType===8?(i=a.parentNode,i.insertBefore(n,a)):(i=a,i.appendChild(n)),a=a._reactRootContainer,a!=null||i.onclick!==null||(i.onclick=Kl));else if(c!==4&&(n=n.child,n!==null))for(Kh(n,i,a),n=n.sibling;n!==null;)Kh(n,i,a),n=n.sibling}function Qh(n,i,a){var c=n.tag;if(c===5||c===6)n=n.stateNode,i?a.insertBefore(n,i):a.appendChild(n);else if(c!==4&&(n=n.child,n!==null))for(Qh(n,i,a),n=n.sibling;n!==null;)Qh(n,i,a),n=n.sibling}var bt=null,Xn=!1;function gi(n,i,a){for(a=a.child;a!==null;)Zm(n,i,a),a=a.sibling}function Zm(n,i,a){if(hn&&typeof hn.onCommitFiberUnmount=="function")try{hn.onCommitFiberUnmount(es,a)}catch{}switch(a.tag){case 5:Ht||vo(a,i);case 6:var c=bt,d=Xn;bt=null,gi(n,i,a),bt=c,Xn=d,bt!==null&&(Xn?(n=bt,a=a.stateNode,n.nodeType===8?n.parentNode.removeChild(a):n.removeChild(a)):bt.removeChild(a.stateNode));break;case 18:bt!==null&&(Xn?(n=bt,a=a.stateNode,n.nodeType===8?lh(n.parentNode,a):n.nodeType===1&&lh(n,a),qn(n)):lh(bt,a.stateNode));break;case 4:c=bt,d=Xn,bt=a.stateNode.containerInfo,Xn=!0,gi(n,i,a),bt=c,Xn=d;break;case 0:case 11:case 14:case 15:if(!Ht&&(c=a.updateQueue,c!==null&&(c=c.lastEffect,c!==null))){d=c=c.next;do{var m=d,v=m.destroy;m=m.tag,v!==void 0&&((m&2)!==0||(m&4)!==0)&&Wh(a,i,v),d=d.next}while(d!==c)}gi(n,i,a);break;case 1:if(!Ht&&(vo(a,i),c=a.stateNode,typeof c.componentWillUnmount=="function"))try{c.props=a.memoizedProps,c.state=a.memoizedState,c.componentWillUnmount()}catch(I){ct(a,i,I)}gi(n,i,a);break;case 21:gi(n,i,a);break;case 22:a.mode&1?(Ht=(c=Ht)||a.memoizedState!==null,gi(n,i,a),Ht=c):gi(n,i,a);break;default:gi(n,i,a)}}function eg(n){var i=n.updateQueue;if(i!==null){n.updateQueue=null;var a=n.stateNode;a===null&&(a=n.stateNode=new Fw),i.forEach(function(c){var d=Qw.bind(null,n,c);a.has(c)||(a.add(c),c.then(d,d))})}}function Yn(n,i){var a=i.deletions;if(a!==null)for(var c=0;c<a.length;c++){var d=a[c];try{var m=n,v=i,I=v;e:for(;I!==null;){switch(I.tag){case 5:bt=I.stateNode,Xn=!1;break e;case 3:bt=I.stateNode.containerInfo,Xn=!0;break e;case 4:bt=I.stateNode.containerInfo,Xn=!0;break e}I=I.return}if(bt===null)throw Error(t(160));Zm(m,v,d),bt=null,Xn=!1;var P=d.alternate;P!==null&&(P.return=null),d.return=null}catch(U){ct(d,i,U)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)tg(i,n),i=i.sibling}function tg(n,i){var a=n.alternate,c=n.flags;switch(n.tag){case 0:case 11:case 14:case 15:if(Yn(i,n),gr(n),c&4){try{Da(3,n,n.return),_u(3,n)}catch(ue){ct(n,n.return,ue)}try{Da(5,n,n.return)}catch(ue){ct(n,n.return,ue)}}break;case 1:Yn(i,n),gr(n),c&512&&a!==null&&vo(a,a.return);break;case 5:if(Yn(i,n),gr(n),c&512&&a!==null&&vo(a,a.return),n.flags&32){var d=n.stateNode;try{ir(d,"")}catch(ue){ct(n,n.return,ue)}}if(c&4&&(d=n.stateNode,d!=null)){var m=n.memoizedProps,v=a!==null?a.memoizedProps:m,I=n.type,P=n.updateQueue;if(n.updateQueue=null,P!==null)try{I==="input"&&m.type==="radio"&&m.name!=null&&kr(d,m),Yo(I,v);var U=Yo(I,m);for(v=0;v<P.length;v+=2){var Q=P[v],Y=P[v+1];Q==="style"?Ko(d,Y):Q==="dangerouslySetInnerHTML"?Zr(d,Y):Q==="children"?ir(d,Y):le(d,Q,Y,U)}switch(I){case"input":Nr(d,m);break;case"textarea":Je(d,m);break;case"select":var G=d._wrapperState.wasMultiple;d._wrapperState.wasMultiple=!!m.multiple;var re=m.value;re!=null?Ae(d,!!m.multiple,re,!1):G!==!!m.multiple&&(m.defaultValue!=null?Ae(d,!!m.multiple,m.defaultValue,!0):Ae(d,!!m.multiple,m.multiple?[]:"",!1))}d[Ea]=m}catch(ue){ct(n,n.return,ue)}}break;case 6:if(Yn(i,n),gr(n),c&4){if(n.stateNode===null)throw Error(t(162));d=n.stateNode,m=n.memoizedProps;try{d.nodeValue=m}catch(ue){ct(n,n.return,ue)}}break;case 3:if(Yn(i,n),gr(n),c&4&&a!==null&&a.memoizedState.isDehydrated)try{qn(i.containerInfo)}catch(ue){ct(n,n.return,ue)}break;case 4:Yn(i,n),gr(n);break;case 13:Yn(i,n),gr(n),d=n.child,d.flags&8192&&(m=d.memoizedState!==null,d.stateNode.isHidden=m,!m||d.alternate!==null&&d.alternate.memoizedState!==null||(Jh=Ke())),c&4&&eg(n);break;case 22:if(Q=a!==null&&a.memoizedState!==null,n.mode&1?(Ht=(U=Ht)||Q,Yn(i,n),Ht=U):Yn(i,n),gr(n),c&8192){if(U=n.memoizedState!==null,(n.stateNode.isHidden=U)&&!Q&&(n.mode&1)!==0)for(se=n,Q=n.child;Q!==null;){for(Y=se=Q;se!==null;){switch(G=se,re=G.child,G.tag){case 0:case 11:case 14:case 15:Da(4,G,G.return);break;case 1:vo(G,G.return);var oe=G.stateNode;if(typeof oe.componentWillUnmount=="function"){c=G,a=G.return;try{i=c,oe.props=i.memoizedProps,oe.state=i.memoizedState,oe.componentWillUnmount()}catch(ue){ct(c,a,ue)}}break;case 5:vo(G,G.return);break;case 22:if(G.memoizedState!==null){ig(Y);continue}}re!==null?(re.return=G,se=re):ig(Y)}Q=Q.sibling}e:for(Q=null,Y=n;;){if(Y.tag===5){if(Q===null){Q=Y;try{d=Y.stateNode,U?(m=d.style,typeof m.setProperty=="function"?m.setProperty("display","none","important"):m.display="none"):(I=Y.stateNode,P=Y.memoizedProps.style,v=P!=null&&P.hasOwnProperty("display")?P.display:null,I.style.display=Go("display",v))}catch(ue){ct(n,n.return,ue)}}}else if(Y.tag===6){if(Q===null)try{Y.stateNode.nodeValue=U?"":Y.memoizedProps}catch(ue){ct(n,n.return,ue)}}else if((Y.tag!==22&&Y.tag!==23||Y.memoizedState===null||Y===n)&&Y.child!==null){Y.child.return=Y,Y=Y.child;continue}if(Y===n)break e;for(;Y.sibling===null;){if(Y.return===null||Y.return===n)break e;Q===Y&&(Q=null),Y=Y.return}Q===Y&&(Q=null),Y.sibling.return=Y.return,Y=Y.sibling}}break;case 19:Yn(i,n),gr(n),c&4&&eg(n);break;case 21:break;default:Yn(i,n),gr(n)}}function gr(n){var i=n.flags;if(i&2){try{e:{for(var a=n.return;a!==null;){if(Ym(a)){var c=a;break e}a=a.return}throw Error(t(160))}switch(c.tag){case 5:var d=c.stateNode;c.flags&32&&(ir(d,""),c.flags&=-33);var m=Jm(n);Qh(n,m,d);break;case 3:case 4:var v=c.stateNode.containerInfo,I=Jm(n);Kh(n,I,v);break;default:throw Error(t(161))}}catch(P){ct(n,n.return,P)}n.flags&=-3}i&4096&&(n.flags&=-4097)}function Bw(n,i,a){se=n,ng(n)}function ng(n,i,a){for(var c=(n.mode&1)!==0;se!==null;){var d=se,m=d.child;if(d.tag===22&&c){var v=d.memoizedState!==null||gu;if(!v){var I=d.alternate,P=I!==null&&I.memoizedState!==null||Ht;I=gu;var U=Ht;if(gu=v,(Ht=P)&&!U)for(se=d;se!==null;)v=se,P=v.child,v.tag===22&&v.memoizedState!==null?sg(d):P!==null?(P.return=v,se=P):sg(d);for(;m!==null;)se=m,ng(m),m=m.sibling;se=d,gu=I,Ht=U}rg(n)}else(d.subtreeFlags&8772)!==0&&m!==null?(m.return=d,se=m):rg(n)}}function rg(n){for(;se!==null;){var i=se;if((i.flags&8772)!==0){var a=i.alternate;try{if((i.flags&8772)!==0)switch(i.tag){case 0:case 11:case 15:Ht||_u(5,i);break;case 1:var c=i.stateNode;if(i.flags&4&&!Ht)if(a===null)c.componentDidMount();else{var d=i.elementType===i.type?a.memoizedProps:Qn(i.type,a.memoizedProps);c.componentDidUpdate(d,a.memoizedState,c.__reactInternalSnapshotBeforeUpdate)}var m=i.updateQueue;m!==null&&im(i,m,c);break;case 3:var v=i.updateQueue;if(v!==null){if(a=null,i.child!==null)switch(i.child.tag){case 5:a=i.child.stateNode;break;case 1:a=i.child.stateNode}im(i,v,a)}break;case 5:var I=i.stateNode;if(a===null&&i.flags&4){a=I;var P=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":P.autoFocus&&a.focus();break;case"img":P.src&&(a.src=P.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var U=i.alternate;if(U!==null){var Q=U.memoizedState;if(Q!==null){var Y=Q.dehydrated;Y!==null&&qn(Y)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(t(163))}Ht||i.flags&512&&Gh(i)}catch(G){ct(i,i.return,G)}}if(i===n){se=null;break}if(a=i.sibling,a!==null){a.return=i.return,se=a;break}se=i.return}}function ig(n){for(;se!==null;){var i=se;if(i===n){se=null;break}var a=i.sibling;if(a!==null){a.return=i.return,se=a;break}se=i.return}}function sg(n){for(;se!==null;){var i=se;try{switch(i.tag){case 0:case 11:case 15:var a=i.return;try{_u(4,i)}catch(P){ct(i,a,P)}break;case 1:var c=i.stateNode;if(typeof c.componentDidMount=="function"){var d=i.return;try{c.componentDidMount()}catch(P){ct(i,d,P)}}var m=i.return;try{Gh(i)}catch(P){ct(i,m,P)}break;case 5:var v=i.return;try{Gh(i)}catch(P){ct(i,v,P)}}}catch(P){ct(i,i.return,P)}if(i===n){se=null;break}var I=i.sibling;if(I!==null){I.return=i.return,se=I;break}se=i.return}}var zw=Math.ceil,yu=de.ReactCurrentDispatcher,Xh=de.ReactCurrentOwner,kn=de.ReactCurrentBatchConfig,Fe=0,Dt=null,Et=null,Mt=0,_n=0,Eo=hi(0),Rt=0,Oa=null,ps=0,vu=0,Yh=0,xa=null,on=null,Jh=0,wo=1/0,qr=null,Eu=!1,Zh=null,_i=null,wu=!1,yi=null,Tu=0,Va=0,ed=null,Iu=-1,Su=0;function Jt(){return(Fe&6)!==0?Ke():Iu!==-1?Iu:Iu=Ke()}function vi(n){return(n.mode&1)===0?1:(Fe&2)!==0&&Mt!==0?Mt&-Mt:Aw.transition!==null?(Su===0&&(Su=ns()),Su):(n=Ve,n!==0||(n=window.event,n=n===void 0?16:la(n.type)),n)}function Jn(n,i,a,c){if(50<Va)throw Va=0,ed=null,Error(t(185));ri(n,a,c),((Fe&2)===0||n!==Dt)&&(n===Dt&&((Fe&2)===0&&(vu|=a),Rt===4&&Ei(n,Mt)),an(n,c),a===1&&Fe===0&&(i.mode&1)===0&&(wo=Ke()+500,Jl&&fi()))}function an(n,i){var a=n.callbackNode;xr(n,i);var c=ts(n,n===Dt?Mt:0);if(c===0)a!==null&&ra(a),n.callbackNode=null,n.callbackPriority=0;else if(i=c&-c,n.callbackPriority!==i){if(a!=null&&ra(a),i===1)n.tag===0?Sw(ag.bind(null,n)):Wp(ag.bind(null,n)),Ew(function(){(Fe&6)===0&&fi()}),a=null;else{switch(si(c)){case 1:a=Zi;break;case 4:a=ei;break;case 16:a=Tn;break;case 536870912:a=Sl;break;default:a=Tn}a=mg(a,og.bind(null,n))}n.callbackPriority=i,n.callbackNode=a}}function og(n,i){if(Iu=-1,Su=0,(Fe&6)!==0)throw Error(t(327));var a=n.callbackNode;if(To()&&n.callbackNode!==a)return null;var c=ts(n,n===Dt?Mt:0);if(c===0)return null;if((c&30)!==0||(c&n.expiredLanes)!==0||i)i=Au(n,c);else{i=c;var d=Fe;Fe|=2;var m=ug();(Dt!==n||Mt!==i)&&(qr=null,wo=Ke()+500,gs(n,i));do try{qw();break}catch(I){lg(n,I)}while(!0);yh(),yu.current=m,Fe=d,Et!==null?i=0:(Dt=null,Mt=0,i=Rt)}if(i!==0){if(i===2&&(d=dn(n),d!==0&&(c=d,i=td(n,d))),i===1)throw a=Oa,gs(n,0),Ei(n,c),an(n,Ke()),a;if(i===6)Ei(n,c);else{if(d=n.current.alternate,(c&30)===0&&!$w(d)&&(i=Au(n,c),i===2&&(m=dn(n),m!==0&&(c=m,i=td(n,m))),i===1))throw a=Oa,gs(n,0),Ei(n,c),an(n,Ke()),a;switch(n.finishedWork=d,n.finishedLanes=c,i){case 0:case 1:throw Error(t(345));case 2:_s(n,on,qr);break;case 3:if(Ei(n,c),(c&130023424)===c&&(i=Jh+500-Ke(),10<i)){if(ts(n,0)!==0)break;if(d=n.suspendedLanes,(d&c)!==c){Jt(),n.pingedLanes|=n.suspendedLanes&d;break}n.timeoutHandle=ah(_s.bind(null,n,on,qr),i);break}_s(n,on,qr);break;case 4:if(Ei(n,c),(c&4194240)===c)break;for(i=n.eventTimes,d=-1;0<c;){var v=31-Qt(c);m=1<<v,v=i[v],v>d&&(d=v),c&=~m}if(c=d,c=Ke()-c,c=(120>c?120:480>c?480:1080>c?1080:1920>c?1920:3e3>c?3e3:4320>c?4320:1960*zw(c/1960))-c,10<c){n.timeoutHandle=ah(_s.bind(null,n,on,qr),c);break}_s(n,on,qr);break;case 5:_s(n,on,qr);break;default:throw Error(t(329))}}}return an(n,Ke()),n.callbackNode===a?og.bind(null,n):null}function td(n,i){var a=xa;return n.current.memoizedState.isDehydrated&&(gs(n,i).flags|=256),n=Au(n,i),n!==2&&(i=on,on=a,i!==null&&nd(i)),n}function nd(n){on===null?on=n:on.push.apply(on,n)}function $w(n){for(var i=n;;){if(i.flags&16384){var a=i.updateQueue;if(a!==null&&(a=a.stores,a!==null))for(var c=0;c<a.length;c++){var d=a[c],m=d.getSnapshot;d=d.value;try{if(!Gn(m(),d))return!1}catch{return!1}}}if(a=i.child,i.subtreeFlags&16384&&a!==null)a.return=i,i=a;else{if(i===n)break;for(;i.sibling===null;){if(i.return===null||i.return===n)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function Ei(n,i){for(i&=~Yh,i&=~vu,n.suspendedLanes|=i,n.pingedLanes&=~i,n=n.expirationTimes;0<i;){var a=31-Qt(i),c=1<<a;n[a]=-1,i&=~c}}function ag(n){if((Fe&6)!==0)throw Error(t(327));To();var i=ts(n,0);if((i&1)===0)return an(n,Ke()),null;var a=Au(n,i);if(n.tag!==0&&a===2){var c=dn(n);c!==0&&(i=c,a=td(n,c))}if(a===1)throw a=Oa,gs(n,0),Ei(n,i),an(n,Ke()),a;if(a===6)throw Error(t(345));return n.finishedWork=n.current.alternate,n.finishedLanes=i,_s(n,on,qr),an(n,Ke()),null}function rd(n,i){var a=Fe;Fe|=1;try{return n(i)}finally{Fe=a,Fe===0&&(wo=Ke()+500,Jl&&fi())}}function ms(n){yi!==null&&yi.tag===0&&(Fe&6)===0&&To();var i=Fe;Fe|=1;var a=kn.transition,c=Ve;try{if(kn.transition=null,Ve=1,n)return n()}finally{Ve=c,kn.transition=a,Fe=i,(Fe&6)===0&&fi()}}function id(){_n=Eo.current,et(Eo)}function gs(n,i){n.finishedWork=null,n.finishedLanes=0;var a=n.timeoutHandle;if(a!==-1&&(n.timeoutHandle=-1,vw(a)),Et!==null)for(a=Et.return;a!==null;){var c=a;switch(fh(c),c.tag){case 1:c=c.type.childContextTypes,c!=null&&Xl();break;case 3:_o(),et(nn),et(Bt),Rh();break;case 5:Sh(c);break;case 4:_o();break;case 13:et(st);break;case 19:et(st);break;case 10:vh(c.type._context);break;case 22:case 23:id()}a=a.return}if(Dt=n,Et=n=wi(n.current,null),Mt=_n=i,Rt=0,Oa=null,Yh=vu=ps=0,on=xa=null,hs!==null){for(i=0;i<hs.length;i++)if(a=hs[i],c=a.interleaved,c!==null){a.interleaved=null;var d=c.next,m=a.pending;if(m!==null){var v=m.next;m.next=d,c.next=v}a.pending=c}hs=null}return n}function lg(n,i){do{var a=Et;try{if(yh(),lu.current=du,uu){for(var c=ot.memoizedState;c!==null;){var d=c.queue;d!==null&&(d.pending=null),c=c.next}uu=!1}if(fs=0,Nt=At=ot=null,Ra=!1,Ca=0,Xh.current=null,a===null||a.return===null){Rt=1,Oa=i,Et=null;break}e:{var m=n,v=a.return,I=a,P=i;if(i=Mt,I.flags|=32768,P!==null&&typeof P=="object"&&typeof P.then=="function"){var U=P,Q=I,Y=Q.tag;if((Q.mode&1)===0&&(Y===0||Y===11||Y===15)){var G=Q.alternate;G?(Q.updateQueue=G.updateQueue,Q.memoizedState=G.memoizedState,Q.lanes=G.lanes):(Q.updateQueue=null,Q.memoizedState=null)}var re=xm(v);if(re!==null){re.flags&=-257,Vm(re,v,I,m,i),re.mode&1&&Om(m,U,i),i=re,P=U;var oe=i.updateQueue;if(oe===null){var ue=new Set;ue.add(P),i.updateQueue=ue}else oe.add(P);break e}else{if((i&1)===0){Om(m,U,i),sd();break e}P=Error(t(426))}}else if(it&&I.mode&1){var gt=xm(v);if(gt!==null){(gt.flags&65536)===0&&(gt.flags|=256),Vm(gt,v,I,m,i),gh(yo(P,I));break e}}m=P=yo(P,I),Rt!==4&&(Rt=2),xa===null?xa=[m]:xa.push(m),m=v;do{switch(m.tag){case 3:m.flags|=65536,i&=-i,m.lanes|=i;var b=Nm(m,P,i);rm(m,b);break e;case 1:I=P;var D=m.type,M=m.stateNode;if((m.flags&128)===0&&(typeof D.getDerivedStateFromError=="function"||M!==null&&typeof M.componentDidCatch=="function"&&(_i===null||!_i.has(M)))){m.flags|=65536,i&=-i,m.lanes|=i;var J=Dm(m,I,i);rm(m,J);break e}}m=m.return}while(m!==null)}hg(a)}catch(he){i=he,Et===a&&a!==null&&(Et=a=a.return);continue}break}while(!0)}function ug(){var n=yu.current;return yu.current=du,n===null?du:n}function sd(){(Rt===0||Rt===3||Rt===2)&&(Rt=4),Dt===null||(ps&268435455)===0&&(vu&268435455)===0||Ei(Dt,Mt)}function Au(n,i){var a=Fe;Fe|=2;var c=ug();(Dt!==n||Mt!==i)&&(qr=null,gs(n,i));do try{Hw();break}catch(d){lg(n,d)}while(!0);if(yh(),Fe=a,yu.current=c,Et!==null)throw Error(t(261));return Dt=null,Mt=0,Rt}function Hw(){for(;Et!==null;)cg(Et)}function qw(){for(;Et!==null&&!Tl();)cg(Et)}function cg(n){var i=pg(n.alternate,n,_n);n.memoizedProps=n.pendingProps,i===null?hg(n):Et=i,Xh.current=null}function hg(n){var i=n;do{var a=i.alternate;if(n=i.return,(i.flags&32768)===0){if(a=Mw(a,i,_n),a!==null){Et=a;return}}else{if(a=Uw(a,i),a!==null){a.flags&=32767,Et=a;return}if(n!==null)n.flags|=32768,n.subtreeFlags=0,n.deletions=null;else{Rt=6,Et=null;return}}if(i=i.sibling,i!==null){Et=i;return}Et=i=n}while(i!==null);Rt===0&&(Rt=5)}function _s(n,i,a){var c=Ve,d=kn.transition;try{kn.transition=null,Ve=1,Ww(n,i,a,c)}finally{kn.transition=d,Ve=c}return null}function Ww(n,i,a,c){do To();while(yi!==null);if((Fe&6)!==0)throw Error(t(327));a=n.finishedWork;var d=n.finishedLanes;if(a===null)return null;if(n.finishedWork=null,n.finishedLanes=0,a===n.current)throw Error(t(177));n.callbackNode=null,n.callbackPriority=0;var m=a.lanes|a.childLanes;if(We(n,m),n===Dt&&(Et=Dt=null,Mt=0),(a.subtreeFlags&2064)===0&&(a.flags&2064)===0||wu||(wu=!0,mg(Tn,function(){return To(),null})),m=(a.flags&15990)!==0,(a.subtreeFlags&15990)!==0||m){m=kn.transition,kn.transition=null;var v=Ve;Ve=1;var I=Fe;Fe|=4,Xh.current=null,jw(n,a),tg(a,n),dw(sh),ai=!!ih,sh=ih=null,n.current=a,Bw(a),zc(),Fe=I,Ve=v,kn.transition=m}else n.current=a;if(wu&&(wu=!1,yi=n,Tu=d),m=n.pendingLanes,m===0&&(_i=null),Al(a.stateNode),an(n,Ke()),i!==null)for(c=n.onRecoverableError,a=0;a<i.length;a++)d=i[a],c(d.value,{componentStack:d.stack,digest:d.digest});if(Eu)throw Eu=!1,n=Zh,Zh=null,n;return(Tu&1)!==0&&n.tag!==0&&To(),m=n.pendingLanes,(m&1)!==0?n===ed?Va++:(Va=0,ed=n):Va=0,fi(),null}function To(){if(yi!==null){var n=si(Tu),i=kn.transition,a=Ve;try{if(kn.transition=null,Ve=16>n?16:n,yi===null)var c=!1;else{if(n=yi,yi=null,Tu=0,(Fe&6)!==0)throw Error(t(331));var d=Fe;for(Fe|=4,se=n.current;se!==null;){var m=se,v=m.child;if((se.flags&16)!==0){var I=m.deletions;if(I!==null){for(var P=0;P<I.length;P++){var U=I[P];for(se=U;se!==null;){var Q=se;switch(Q.tag){case 0:case 11:case 15:Da(8,Q,m)}var Y=Q.child;if(Y!==null)Y.return=Q,se=Y;else for(;se!==null;){Q=se;var G=Q.sibling,re=Q.return;if(Xm(Q),Q===U){se=null;break}if(G!==null){G.return=re,se=G;break}se=re}}}var oe=m.alternate;if(oe!==null){var ue=oe.child;if(ue!==null){oe.child=null;do{var gt=ue.sibling;ue.sibling=null,ue=gt}while(ue!==null)}}se=m}}if((m.subtreeFlags&2064)!==0&&v!==null)v.return=m,se=v;else e:for(;se!==null;){if(m=se,(m.flags&2048)!==0)switch(m.tag){case 0:case 11:case 15:Da(9,m,m.return)}var b=m.sibling;if(b!==null){b.return=m.return,se=b;break e}se=m.return}}var D=n.current;for(se=D;se!==null;){v=se;var M=v.child;if((v.subtreeFlags&2064)!==0&&M!==null)M.return=v,se=M;else e:for(v=D;se!==null;){if(I=se,(I.flags&2048)!==0)try{switch(I.tag){case 0:case 11:case 15:_u(9,I)}}catch(he){ct(I,I.return,he)}if(I===v){se=null;break e}var J=I.sibling;if(J!==null){J.return=I.return,se=J;break e}se=I.return}}if(Fe=d,fi(),hn&&typeof hn.onPostCommitFiberRoot=="function")try{hn.onPostCommitFiberRoot(es,n)}catch{}c=!0}return c}finally{Ve=a,kn.transition=i}}return!1}function dg(n,i,a){i=yo(a,i),i=Nm(n,i,1),n=mi(n,i,1),i=Jt(),n!==null&&(ri(n,1,i),an(n,i))}function ct(n,i,a){if(n.tag===3)dg(n,n,a);else for(;i!==null;){if(i.tag===3){dg(i,n,a);break}else if(i.tag===1){var c=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof c.componentDidCatch=="function"&&(_i===null||!_i.has(c))){n=yo(a,n),n=Dm(i,n,1),i=mi(i,n,1),n=Jt(),i!==null&&(ri(i,1,n),an(i,n));break}}i=i.return}}function Gw(n,i,a){var c=n.pingCache;c!==null&&c.delete(i),i=Jt(),n.pingedLanes|=n.suspendedLanes&a,Dt===n&&(Mt&a)===a&&(Rt===4||Rt===3&&(Mt&130023424)===Mt&&500>Ke()-Jh?gs(n,0):Yh|=a),an(n,i)}function fg(n,i){i===0&&((n.mode&1)===0?i=1:(i=Hs,Hs<<=1,(Hs&130023424)===0&&(Hs=4194304)));var a=Jt();n=zr(n,i),n!==null&&(ri(n,i,a),an(n,a))}function Kw(n){var i=n.memoizedState,a=0;i!==null&&(a=i.retryLane),fg(n,a)}function Qw(n,i){var a=0;switch(n.tag){case 13:var c=n.stateNode,d=n.memoizedState;d!==null&&(a=d.retryLane);break;case 19:c=n.stateNode;break;default:throw Error(t(314))}c!==null&&c.delete(i),fg(n,a)}var pg;pg=function(n,i,a){if(n!==null)if(n.memoizedProps!==i.pendingProps||nn.current)sn=!0;else{if((n.lanes&a)===0&&(i.flags&128)===0)return sn=!1,bw(n,i,a);sn=(n.flags&131072)!==0}else sn=!1,it&&(i.flags&1048576)!==0&&Gp(i,eu,i.index);switch(i.lanes=0,i.tag){case 2:var c=i.type;mu(n,i),n=i.pendingProps;var d=uo(i,Bt.current);go(i,a),d=kh(null,i,c,n,d,a);var m=Nh();return i.flags|=1,typeof d=="object"&&d!==null&&typeof d.render=="function"&&d.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,rn(c)?(m=!0,Yl(i)):m=!1,i.memoizedState=d.state!==null&&d.state!==void 0?d.state:null,Th(i),d.updater=fu,i.stateNode=d,d._reactInternals=i,bh(i,c,n,a),i=jh(null,i,c,!0,m,a)):(i.tag=0,it&&m&&dh(i),Yt(null,i,d,a),i=i.child),i;case 16:c=i.elementType;e:{switch(mu(n,i),n=i.pendingProps,d=c._init,c=d(c._payload),i.type=c,d=i.tag=Yw(c),n=Qn(c,n),d){case 0:i=Fh(null,i,c,n,a);break e;case 1:i=jm(null,i,c,n,a);break e;case 11:i=Lm(null,i,c,n,a);break e;case 14:i=bm(null,i,c,Qn(c.type,n),a);break e}throw Error(t(306,c,""))}return i;case 0:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:Qn(c,d),Fh(n,i,c,d,a);case 1:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:Qn(c,d),jm(n,i,c,d,a);case 3:e:{if(Bm(i),n===null)throw Error(t(387));c=i.pendingProps,m=i.memoizedState,d=m.element,nm(n,i),ou(i,c,null,a);var v=i.memoizedState;if(c=v.element,m.isDehydrated)if(m={element:c,isDehydrated:!1,cache:v.cache,pendingSuspenseBoundaries:v.pendingSuspenseBoundaries,transitions:v.transitions},i.updateQueue.baseState=m,i.memoizedState=m,i.flags&256){d=yo(Error(t(423)),i),i=zm(n,i,c,a,d);break e}else if(c!==d){d=yo(Error(t(424)),i),i=zm(n,i,c,a,d);break e}else for(gn=ci(i.stateNode.containerInfo.firstChild),mn=i,it=!0,Kn=null,a=em(i,null,c,a),i.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling;else{if(fo(),c===d){i=Hr(n,i,a);break e}Yt(n,i,c,a)}i=i.child}return i;case 5:return sm(i),n===null&&mh(i),c=i.type,d=i.pendingProps,m=n!==null?n.memoizedProps:null,v=d.children,oh(c,d)?v=null:m!==null&&oh(c,m)&&(i.flags|=32),Fm(n,i),Yt(n,i,v,a),i.child;case 6:return n===null&&mh(i),null;case 13:return $m(n,i,a);case 4:return Ih(i,i.stateNode.containerInfo),c=i.pendingProps,n===null?i.child=po(i,null,c,a):Yt(n,i,c,a),i.child;case 11:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:Qn(c,d),Lm(n,i,c,d,a);case 7:return Yt(n,i,i.pendingProps,a),i.child;case 8:return Yt(n,i,i.pendingProps.children,a),i.child;case 12:return Yt(n,i,i.pendingProps.children,a),i.child;case 10:e:{if(c=i.type._context,d=i.pendingProps,m=i.memoizedProps,v=d.value,Qe(ru,c._currentValue),c._currentValue=v,m!==null)if(Gn(m.value,v)){if(m.children===d.children&&!nn.current){i=Hr(n,i,a);break e}}else for(m=i.child,m!==null&&(m.return=i);m!==null;){var I=m.dependencies;if(I!==null){v=m.child;for(var P=I.firstContext;P!==null;){if(P.context===c){if(m.tag===1){P=$r(-1,a&-a),P.tag=2;var U=m.updateQueue;if(U!==null){U=U.shared;var Q=U.pending;Q===null?P.next=P:(P.next=Q.next,Q.next=P),U.pending=P}}m.lanes|=a,P=m.alternate,P!==null&&(P.lanes|=a),Eh(m.return,a,i),I.lanes|=a;break}P=P.next}}else if(m.tag===10)v=m.type===i.type?null:m.child;else if(m.tag===18){if(v=m.return,v===null)throw Error(t(341));v.lanes|=a,I=v.alternate,I!==null&&(I.lanes|=a),Eh(v,a,i),v=m.sibling}else v=m.child;if(v!==null)v.return=m;else for(v=m;v!==null;){if(v===i){v=null;break}if(m=v.sibling,m!==null){m.return=v.return,v=m;break}v=v.return}m=v}Yt(n,i,d.children,a),i=i.child}return i;case 9:return d=i.type,c=i.pendingProps.children,go(i,a),d=Cn(d),c=c(d),i.flags|=1,Yt(n,i,c,a),i.child;case 14:return c=i.type,d=Qn(c,i.pendingProps),d=Qn(c.type,d),bm(n,i,c,d,a);case 15:return Mm(n,i,i.type,i.pendingProps,a);case 17:return c=i.type,d=i.pendingProps,d=i.elementType===c?d:Qn(c,d),mu(n,i),i.tag=1,rn(c)?(n=!0,Yl(i)):n=!1,go(i,a),Pm(i,c,d),bh(i,c,d,a),jh(null,i,c,!0,n,a);case 19:return qm(n,i,a);case 22:return Um(n,i,a)}throw Error(t(156,i.tag))};function mg(n,i){return zs(n,i)}function Xw(n,i,a,c){this.tag=n,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=c,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Nn(n,i,a,c){return new Xw(n,i,a,c)}function od(n){return n=n.prototype,!(!n||!n.isReactComponent)}function Yw(n){if(typeof n=="function")return od(n)?1:0;if(n!=null){if(n=n.$$typeof,n===V)return 11;if(n===yt)return 14}return 2}function wi(n,i){var a=n.alternate;return a===null?(a=Nn(n.tag,i,n.key,n.mode),a.elementType=n.elementType,a.type=n.type,a.stateNode=n.stateNode,a.alternate=n,n.alternate=a):(a.pendingProps=i,a.type=n.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=n.flags&14680064,a.childLanes=n.childLanes,a.lanes=n.lanes,a.child=n.child,a.memoizedProps=n.memoizedProps,a.memoizedState=n.memoizedState,a.updateQueue=n.updateQueue,i=n.dependencies,a.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},a.sibling=n.sibling,a.index=n.index,a.ref=n.ref,a}function Ru(n,i,a,c,d,m){var v=2;if(c=n,typeof n=="function")od(n)&&(v=1);else if(typeof n=="string")v=5;else e:switch(n){case N:return ys(a.children,d,m,i);case T:v=8,d|=8;break;case C:return n=Nn(12,a,i,d|2),n.elementType=C,n.lanes=m,n;case S:return n=Nn(13,a,i,d),n.elementType=S,n.lanes=m,n;case nt:return n=Nn(19,a,i,d),n.elementType=nt,n.lanes=m,n;case Ne:return Cu(a,d,m,i);default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case k:v=10;break e;case O:v=9;break e;case V:v=11;break e;case yt:v=14;break e;case Ye:v=16,c=null;break e}throw Error(t(130,n==null?n:typeof n,""))}return i=Nn(v,a,i,d),i.elementType=n,i.type=c,i.lanes=m,i}function ys(n,i,a,c){return n=Nn(7,n,c,i),n.lanes=a,n}function Cu(n,i,a,c){return n=Nn(22,n,c,i),n.elementType=Ne,n.lanes=a,n.stateNode={isHidden:!1},n}function ad(n,i,a){return n=Nn(6,n,null,i),n.lanes=a,n}function ld(n,i,a){return i=Nn(4,n.children!==null?n.children:[],n.key,i),i.lanes=a,i.stateNode={containerInfo:n.containerInfo,pendingChildren:null,implementation:n.implementation},i}function Jw(n,i,a,c,d){this.tag=i,this.containerInfo=n,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=ni(0),this.expirationTimes=ni(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ni(0),this.identifierPrefix=c,this.onRecoverableError=d,this.mutableSourceEagerHydrationData=null}function ud(n,i,a,c,d,m,v,I,P){return n=new Jw(n,i,a,I,P),i===1?(i=1,m===!0&&(i|=8)):i=0,m=Nn(3,null,null,i),n.current=m,m.stateNode=n,m.memoizedState={element:c,isDehydrated:a,cache:null,transitions:null,pendingSuspenseBoundaries:null},Th(m),n}function Zw(n,i,a){var c=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:we,key:c==null?null:""+c,children:n,containerInfo:i,implementation:a}}function gg(n){if(!n)return di;n=n._reactInternals;e:{if(jn(n)!==n||n.tag!==1)throw Error(t(170));var i=n;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(rn(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(t(171))}if(n.tag===1){var a=n.type;if(rn(a))return Hp(n,a,i)}return i}function _g(n,i,a,c,d,m,v,I,P){return n=ud(a,c,!0,n,d,m,v,I,P),n.context=gg(null),a=n.current,c=Jt(),d=vi(a),m=$r(c,d),m.callback=i??null,mi(a,m,d),n.current.lanes=d,ri(n,d,c),an(n,c),n}function Pu(n,i,a,c){var d=i.current,m=Jt(),v=vi(d);return a=gg(a),i.context===null?i.context=a:i.pendingContext=a,i=$r(m,v),i.payload={element:n},c=c===void 0?null:c,c!==null&&(i.callback=c),n=mi(d,i,v),n!==null&&(Jn(n,d,v,m),su(n,d,v)),v}function ku(n){if(n=n.current,!n.child)return null;switch(n.child.tag){case 5:return n.child.stateNode;default:return n.child.stateNode}}function yg(n,i){if(n=n.memoizedState,n!==null&&n.dehydrated!==null){var a=n.retryLane;n.retryLane=a!==0&&a<i?a:i}}function cd(n,i){yg(n,i),(n=n.alternate)&&yg(n,i)}function eT(){return null}var vg=typeof reportError=="function"?reportError:function(n){console.error(n)};function hd(n){this._internalRoot=n}Nu.prototype.render=hd.prototype.render=function(n){var i=this._internalRoot;if(i===null)throw Error(t(409));Pu(n,i,null,null)},Nu.prototype.unmount=hd.prototype.unmount=function(){var n=this._internalRoot;if(n!==null){this._internalRoot=null;var i=n.containerInfo;ms(function(){Pu(null,n,null,null)}),i[Ur]=null}};function Nu(n){this._internalRoot=n}Nu.prototype.unstable_scheduleHydration=function(n){if(n){var i=Nl();n={blockedOn:null,target:n,priority:i};for(var a=0;a<ur.length&&i!==0&&i<ur[a].priority;a++);ur.splice(a,0,n),a===0&&xl(n)}};function dd(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11)}function Du(n){return!(!n||n.nodeType!==1&&n.nodeType!==9&&n.nodeType!==11&&(n.nodeType!==8||n.nodeValue!==" react-mount-point-unstable "))}function Eg(){}function tT(n,i,a,c,d){if(d){if(typeof c=="function"){var m=c;c=function(){var U=ku(v);m.call(U)}}var v=_g(i,c,n,0,null,!1,!1,"",Eg);return n._reactRootContainer=v,n[Ur]=v.current,ya(n.nodeType===8?n.parentNode:n),ms(),v}for(;d=n.lastChild;)n.removeChild(d);if(typeof c=="function"){var I=c;c=function(){var U=ku(P);I.call(U)}}var P=ud(n,0,!1,null,null,!1,!1,"",Eg);return n._reactRootContainer=P,n[Ur]=P.current,ya(n.nodeType===8?n.parentNode:n),ms(function(){Pu(i,P,a,c)}),P}function Ou(n,i,a,c,d){var m=a._reactRootContainer;if(m){var v=m;if(typeof d=="function"){var I=d;d=function(){var P=ku(v);I.call(P)}}Pu(i,v,n,d)}else v=tT(a,i,n,d,c);return ku(v)}Pl=function(n){switch(n.tag){case 3:var i=n.stateNode;if(i.current.memoizedState.isDehydrated){var a=ti(i.pendingLanes);a!==0&&(ii(i,a|1),an(i,Ke()),(Fe&6)===0&&(wo=Ke()+500,fi()))}break;case 13:ms(function(){var c=zr(n,1);if(c!==null){var d=Jt();Jn(c,n,1,d)}}),cd(n,1)}},qs=function(n){if(n.tag===13){var i=zr(n,134217728);if(i!==null){var a=Jt();Jn(i,n,134217728,a)}cd(n,134217728)}},kl=function(n){if(n.tag===13){var i=vi(n),a=zr(n,i);if(a!==null){var c=Jt();Jn(a,n,i,c)}cd(n,i)}},Nl=function(){return Ve},Dl=function(n,i){var a=Ve;try{return Ve=n,i()}finally{Ve=a}},bs=function(n,i,a){switch(i){case"input":if(Nr(n,a),i=a.name,a.type==="radio"&&i!=null){for(a=n;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<a.length;i++){var c=a[i];if(c!==n&&c.form===n.form){var d=Ql(c);if(!d)throw Error(t(90));Pr(c),Nr(c,d)}}}break;case"textarea":Je(n,a);break;case"select":i=a.value,i!=null&&Ae(n,!!a.multiple,i,!1)}},Qi=rd,Zo=ms;var nT={usingClientEntryPoint:!1,Events:[wa,ao,Ql,ar,Jo,rd]},La={findFiberByHostInstance:as,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},rT={bundleType:La.bundleType,version:La.version,rendererPackageName:La.rendererPackageName,rendererConfig:La.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:de.ReactCurrentDispatcher,findHostInstanceByFiber:function(n){return n=na(n),n===null?null:n.stateNode},findFiberByHostInstance:La.findFiberByHostInstance||eT,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var xu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!xu.isDisabled&&xu.supportsFiber)try{es=xu.inject(rT),hn=xu}catch{}}return ln.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=nT,ln.createPortal=function(n,i){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!dd(i))throw Error(t(200));return Zw(n,i,null,a)},ln.createRoot=function(n,i){if(!dd(n))throw Error(t(299));var a=!1,c="",d=vg;return i!=null&&(i.unstable_strictMode===!0&&(a=!0),i.identifierPrefix!==void 0&&(c=i.identifierPrefix),i.onRecoverableError!==void 0&&(d=i.onRecoverableError)),i=ud(n,1,!1,null,null,a,!1,c,d),n[Ur]=i.current,ya(n.nodeType===8?n.parentNode:n),new hd(i)},ln.findDOMNode=function(n){if(n==null)return null;if(n.nodeType===1)return n;var i=n._reactInternals;if(i===void 0)throw typeof n.render=="function"?Error(t(188)):(n=Object.keys(n).join(","),Error(t(268,n)));return n=na(i),n=n===null?null:n.stateNode,n},ln.flushSync=function(n){return ms(n)},ln.hydrate=function(n,i,a){if(!Du(i))throw Error(t(200));return Ou(null,n,i,!0,a)},ln.hydrateRoot=function(n,i,a){if(!dd(n))throw Error(t(405));var c=a!=null&&a.hydratedSources||null,d=!1,m="",v=vg;if(a!=null&&(a.unstable_strictMode===!0&&(d=!0),a.identifierPrefix!==void 0&&(m=a.identifierPrefix),a.onRecoverableError!==void 0&&(v=a.onRecoverableError)),i=_g(i,null,n,1,a??null,d,!1,m,v),n[Ur]=i.current,ya(n),c)for(n=0;n<c.length;n++)a=c[n],d=a._getVersion,d=d(a._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[a,d]:i.mutableSourceEagerHydrationData.push(a,d);return new Nu(i)},ln.render=function(n,i,a){if(!Du(i))throw Error(t(200));return Ou(null,n,i,!1,a)},ln.unmountComponentAtNode=function(n){if(!Du(n))throw Error(t(40));return n._reactRootContainer?(ms(function(){Ou(null,null,n,!1,function(){n._reactRootContainer=null,n[Ur]=null})}),!0):!1},ln.unstable_batchedUpdates=rd,ln.unstable_renderSubtreeIntoContainer=function(n,i,a,c){if(!Du(a))throw Error(t(200));if(n==null||n._reactInternals===void 0)throw Error(t(38));return Ou(n,i,a,!1,c)},ln.version="18.3.1-next-f1338f8080-20240426",ln}var Pg;function dT(){if(Pg)return md.exports;Pg=1;function r(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r)}catch(e){console.error(e)}}return r(),md.exports=hT(),md.exports}var kg;function fT(){if(kg)return Vu;kg=1;var r=dT();return Vu.createRoot=r.createRoot,Vu.hydrateRoot=r.hydrateRoot,Vu}var pT=fT();const mT=yy(pT),gT=()=>{};var Ng={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vy=function(r){const e=[];let t=0;for(let s=0;s<r.length;s++){let o=r.charCodeAt(s);o<128?e[t++]=o:o<2048?(e[t++]=o>>6|192,e[t++]=o&63|128):(o&64512)===55296&&s+1<r.length&&(r.charCodeAt(s+1)&64512)===56320?(o=65536+((o&1023)<<10)+(r.charCodeAt(++s)&1023),e[t++]=o>>18|240,e[t++]=o>>12&63|128,e[t++]=o>>6&63|128,e[t++]=o&63|128):(e[t++]=o>>12|224,e[t++]=o>>6&63|128,e[t++]=o&63|128)}return e},_T=function(r){const e=[];let t=0,s=0;for(;t<r.length;){const o=r[t++];if(o<128)e[s++]=String.fromCharCode(o);else if(o>191&&o<224){const l=r[t++];e[s++]=String.fromCharCode((o&31)<<6|l&63)}else if(o>239&&o<365){const l=r[t++],h=r[t++],f=r[t++],g=((o&7)<<18|(l&63)<<12|(h&63)<<6|f&63)-65536;e[s++]=String.fromCharCode(55296+(g>>10)),e[s++]=String.fromCharCode(56320+(g&1023))}else{const l=r[t++],h=r[t++];e[s++]=String.fromCharCode((o&15)<<12|(l&63)<<6|h&63)}}return e.join("")},Ey={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(r,e){if(!Array.isArray(r))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,s=[];for(let o=0;o<r.length;o+=3){const l=r[o],h=o+1<r.length,f=h?r[o+1]:0,g=o+2<r.length,y=g?r[o+2]:0,w=l>>2,A=(l&3)<<4|f>>4;let R=(f&15)<<2|y>>6,F=y&63;g||(F=64,h||(R=64)),s.push(t[w],t[A],t[R],t[F])}return s.join("")},encodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(r):this.encodeByteArray(vy(r),e)},decodeString(r,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(r):_T(this.decodeStringToByteArray(r,e))},decodeStringToByteArray(r,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,s=[];for(let o=0;o<r.length;){const l=t[r.charAt(o++)],f=o<r.length?t[r.charAt(o)]:0;++o;const y=o<r.length?t[r.charAt(o)]:64;++o;const A=o<r.length?t[r.charAt(o)]:64;if(++o,l==null||f==null||y==null||A==null)throw new yT;const R=l<<2|f>>4;if(s.push(R),y!==64){const F=f<<4&240|y>>2;if(s.push(F),A!==64){const B=y<<6&192|A;s.push(B)}}}return s},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let r=0;r<this.ENCODED_VALS.length;r++)this.byteToCharMap_[r]=this.ENCODED_VALS.charAt(r),this.charToByteMap_[this.byteToCharMap_[r]]=r,this.byteToCharMapWebSafe_[r]=this.ENCODED_VALS_WEBSAFE.charAt(r),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[r]]=r,r>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(r)]=r,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(r)]=r)}}};class yT extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const vT=function(r){const e=vy(r);return Ey.encodeByteArray(e,!0)},ec=function(r){return vT(r).replace(/\./g,"")},wy=function(r){try{return Ey.decodeString(r,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ET(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wT=()=>ET().__FIREBASE_DEFAULTS__,TT=()=>{if(typeof process>"u"||typeof Ng>"u")return;const r=Ng.__FIREBASE_DEFAULTS__;if(r)return JSON.parse(r)},IT=()=>{if(typeof document>"u")return;let r;try{r=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=r&&wy(r[1]);return e&&JSON.parse(e)},yc=()=>{try{return gT()||wT()||TT()||IT()}catch(r){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${r}`);return}},Ty=r=>{var e,t;return(t=(e=yc())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[r]},Iy=r=>{const e=Ty(r);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const s=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),s]:[e.substring(0,t),s]},Sy=()=>{var r;return(r=yc())===null||r===void 0?void 0:r.config},Ay=r=>{var e;return(e=yc())===null||e===void 0?void 0:e[`_${r}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ST{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,s)=>{t?this.reject(t):this.resolve(s),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,s))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hi(r){try{return(r.startsWith("http://")||r.startsWith("https://")?new URL(r).hostname:r).endsWith(".cloudworkstations.dev")}catch{return!1}}async function df(r){return(await fetch(r,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ry(r,e){if(r.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},s=e||"demo-project",o=r.iat||0,l=r.sub||r.user_id;if(!l)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const h=Object.assign({iss:`https://securetoken.google.com/${s}`,aud:s,iat:o,exp:o+3600,auth_time:o,sub:l,user_id:l,firebase:{sign_in_provider:"custom",identities:{}}},r);return[ec(JSON.stringify(t)),ec(JSON.stringify(h)),""].join(".")}const Ha={};function AT(){const r={prod:[],emulator:[]};for(const e of Object.keys(Ha))Ha[e]?r.emulator.push(e):r.prod.push(e);return r}function RT(r){let e=document.getElementById(r),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",r),t=!0),{created:t,element:e}}let Dg=!1;function ff(r,e){if(typeof window>"u"||typeof document>"u"||!Hi(window.location.host)||Ha[r]===e||Ha[r]||Dg)return;Ha[r]=e;function t(R){return`__firebase__banner__${R}`}const s="__firebase__banner",l=AT().prod.length>0;function h(){const R=document.getElementById(s);R&&R.remove()}function f(R){R.style.display="flex",R.style.background="#7faaf0",R.style.position="fixed",R.style.bottom="5px",R.style.left="5px",R.style.padding=".5em",R.style.borderRadius="5px",R.style.alignItems="center"}function g(R,F){R.setAttribute("width","24"),R.setAttribute("id",F),R.setAttribute("height","24"),R.setAttribute("viewBox","0 0 24 24"),R.setAttribute("fill","none"),R.style.marginLeft="-6px"}function y(){const R=document.createElement("span");return R.style.cursor="pointer",R.style.marginLeft="16px",R.style.fontSize="24px",R.innerHTML=" &times;",R.onclick=()=>{Dg=!0,h()},R}function w(R,F){R.setAttribute("id",F),R.innerText="Learn more",R.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",R.setAttribute("target","__blank"),R.style.paddingLeft="5px",R.style.textDecoration="underline"}function A(){const R=RT(s),F=t("text"),B=document.getElementById(F)||document.createElement("span"),K=t("learnmore"),z=document.getElementById(K)||document.createElement("a"),pe=t("preprendIcon"),ae=document.getElementById(pe)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(R.created){const le=R.element;f(le),w(z,K);const de=y();g(ae,pe),le.append(ae,B,z,de),document.body.appendChild(le)}l?(B.innerText="Preview backend disconnected.",ae.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(ae.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,B.innerText="Preview backend running in this workspace."),B.setAttribute("id",F)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",A):A()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function CT(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Kt())}function PT(){var r;const e=(r=yc())===null||r===void 0?void 0:r.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function kT(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function NT(){const r=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof r=="object"&&r.id!==void 0}function DT(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function OT(){const r=Kt();return r.indexOf("MSIE ")>=0||r.indexOf("Trident/")>=0}function xT(){return!PT()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function VT(){try{return typeof indexedDB=="object"}catch{return!1}}function LT(){return new Promise((r,e)=>{try{let t=!0;const s="validate-browser-context-for-indexeddb-analytics-module",o=self.indexedDB.open(s);o.onsuccess=()=>{o.result.close(),t||self.indexedDB.deleteDatabase(s),r(!0)},o.onupgradeneeded=()=>{t=!1},o.onerror=()=>{var l;e(((l=o.error)===null||l===void 0?void 0:l.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bT="FirebaseError";class Cr extends Error{constructor(e,t,s){super(t),this.code=e,this.customData=s,this.name=bT,Object.setPrototypeOf(this,Cr.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ll.prototype.create)}}class ll{constructor(e,t,s){this.service=e,this.serviceName=t,this.errors=s}create(e,...t){const s=t[0]||{},o=`${this.service}/${e}`,l=this.errors[e],h=l?MT(l,s):"Error",f=`${this.serviceName}: ${h} (${o}).`;return new Cr(o,f,s)}}function MT(r,e){return r.replace(UT,(t,s)=>{const o=e[s];return o!=null?String(o):`<${s}?>`})}const UT=/\{\$([^}]+)}/g;function FT(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}function Is(r,e){if(r===e)return!0;const t=Object.keys(r),s=Object.keys(e);for(const o of t){if(!s.includes(o))return!1;const l=r[o],h=e[o];if(Og(l)&&Og(h)){if(!Is(l,h))return!1}else if(l!==h)return!1}for(const o of s)if(!t.includes(o))return!1;return!0}function Og(r){return r!==null&&typeof r=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ul(r){const e=[];for(const[t,s]of Object.entries(r))Array.isArray(s)?s.forEach(o=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(o))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(s));return e.length?"&"+e.join("&"):""}function Ua(r){const e={};return r.replace(/^\?/,"").split("&").forEach(s=>{if(s){const[o,l]=s.split("=");e[decodeURIComponent(o)]=decodeURIComponent(l)}}),e}function Fa(r){const e=r.indexOf("?");if(!e)return"";const t=r.indexOf("#",e);return r.substring(e,t>0?t:void 0)}function jT(r,e){const t=new BT(r,e);return t.subscribe.bind(t)}class BT{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(s=>{this.error(s)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,s){let o;if(e===void 0&&t===void 0&&s===void 0)throw new Error("Missing Observer.");zT(e,["next","error","complete"])?o=e:o={next:e,error:t,complete:s},o.next===void 0&&(o.next=yd),o.error===void 0&&(o.error=yd),o.complete===void 0&&(o.complete=yd);const l=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?o.error(this.finalError):o.complete()}catch{}}),this.observers.push(o),l}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(s){typeof console<"u"&&console.error&&console.error(s)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function zT(r,e){if(typeof r!="object"||r===null)return!1;for(const t of e)if(t in r&&typeof r[t]=="function")return!0;return!1}function yd(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function at(r){return r&&r._delegate?r._delegate:r}class bi{constructor(e,t,s){this.name=e,this.instanceFactory=t,this.type=s,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Es="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $T{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const s=new ST;if(this.instancesDeferred.set(t,s),this.isInitialized(t)||this.shouldAutoInitialize())try{const o=this.getOrInitializeService({instanceIdentifier:t});o&&s.resolve(o)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const s=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),o=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(s)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:s})}catch(l){if(o)return null;throw l}else{if(o)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(qT(e))try{this.getOrInitializeService({instanceIdentifier:Es})}catch{}for(const[t,s]of this.instancesDeferred.entries()){const o=this.normalizeInstanceIdentifier(t);try{const l=this.getOrInitializeService({instanceIdentifier:o});s.resolve(l)}catch{}}}}clearInstance(e=Es){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Es){return this.instances.has(e)}getOptions(e=Es){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,s=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(s))throw Error(`${this.name}(${s}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const o=this.getOrInitializeService({instanceIdentifier:s,options:t});for(const[l,h]of this.instancesDeferred.entries()){const f=this.normalizeInstanceIdentifier(l);s===f&&h.resolve(o)}return o}onInit(e,t){var s;const o=this.normalizeInstanceIdentifier(t),l=(s=this.onInitCallbacks.get(o))!==null&&s!==void 0?s:new Set;l.add(e),this.onInitCallbacks.set(o,l);const h=this.instances.get(o);return h&&e(h,o),()=>{l.delete(e)}}invokeOnInitCallbacks(e,t){const s=this.onInitCallbacks.get(t);if(s)for(const o of s)try{o(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let s=this.instances.get(e);if(!s&&this.component&&(s=this.component.instanceFactory(this.container,{instanceIdentifier:HT(e),options:t}),this.instances.set(e,s),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(s,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,s)}catch{}return s||null}normalizeInstanceIdentifier(e=Es){return this.component?this.component.multipleInstances?e:Es:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function HT(r){return r===Es?void 0:r}function qT(r){return r.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WT{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new $T(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var De;(function(r){r[r.DEBUG=0]="DEBUG",r[r.VERBOSE=1]="VERBOSE",r[r.INFO=2]="INFO",r[r.WARN=3]="WARN",r[r.ERROR=4]="ERROR",r[r.SILENT=5]="SILENT"})(De||(De={}));const GT={debug:De.DEBUG,verbose:De.VERBOSE,info:De.INFO,warn:De.WARN,error:De.ERROR,silent:De.SILENT},KT=De.INFO,QT={[De.DEBUG]:"log",[De.VERBOSE]:"log",[De.INFO]:"info",[De.WARN]:"warn",[De.ERROR]:"error"},XT=(r,e,...t)=>{if(e<r.logLevel)return;const s=new Date().toISOString(),o=QT[e];if(o)console[o](`[${s}]  ${r.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class pf{constructor(e){this.name=e,this._logLevel=KT,this._logHandler=XT,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in De))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?GT[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,De.DEBUG,...e),this._logHandler(this,De.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,De.VERBOSE,...e),this._logHandler(this,De.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,De.INFO,...e),this._logHandler(this,De.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,De.WARN,...e),this._logHandler(this,De.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,De.ERROR,...e),this._logHandler(this,De.ERROR,...e)}}const YT=(r,e)=>e.some(t=>r instanceof t);let xg,Vg;function JT(){return xg||(xg=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ZT(){return Vg||(Vg=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Cy=new WeakMap,Md=new WeakMap,Py=new WeakMap,vd=new WeakMap,mf=new WeakMap;function e0(r){const e=new Promise((t,s)=>{const o=()=>{r.removeEventListener("success",l),r.removeEventListener("error",h)},l=()=>{t(Ni(r.result)),o()},h=()=>{s(r.error),o()};r.addEventListener("success",l),r.addEventListener("error",h)});return e.then(t=>{t instanceof IDBCursor&&Cy.set(t,r)}).catch(()=>{}),mf.set(e,r),e}function t0(r){if(Md.has(r))return;const e=new Promise((t,s)=>{const o=()=>{r.removeEventListener("complete",l),r.removeEventListener("error",h),r.removeEventListener("abort",h)},l=()=>{t(),o()},h=()=>{s(r.error||new DOMException("AbortError","AbortError")),o()};r.addEventListener("complete",l),r.addEventListener("error",h),r.addEventListener("abort",h)});Md.set(r,e)}let Ud={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return Md.get(r);if(e==="objectStoreNames")return r.objectStoreNames||Py.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Ni(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function n0(r){Ud=r(Ud)}function r0(r){return r===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const s=r.call(Ed(this),e,...t);return Py.set(s,e.sort?e.sort():[e]),Ni(s)}:ZT().includes(r)?function(...e){return r.apply(Ed(this),e),Ni(Cy.get(this))}:function(...e){return Ni(r.apply(Ed(this),e))}}function i0(r){return typeof r=="function"?r0(r):(r instanceof IDBTransaction&&t0(r),YT(r,JT())?new Proxy(r,Ud):r)}function Ni(r){if(r instanceof IDBRequest)return e0(r);if(vd.has(r))return vd.get(r);const e=i0(r);return e!==r&&(vd.set(r,e),mf.set(e,r)),e}const Ed=r=>mf.get(r);function s0(r,e,{blocked:t,upgrade:s,blocking:o,terminated:l}={}){const h=indexedDB.open(r,e),f=Ni(h);return s&&h.addEventListener("upgradeneeded",g=>{s(Ni(h.result),g.oldVersion,g.newVersion,Ni(h.transaction),g)}),t&&h.addEventListener("blocked",g=>t(g.oldVersion,g.newVersion,g)),f.then(g=>{l&&g.addEventListener("close",()=>l()),o&&g.addEventListener("versionchange",y=>o(y.oldVersion,y.newVersion,y))}).catch(()=>{}),f}const o0=["get","getKey","getAll","getAllKeys","count"],a0=["put","add","delete","clear"],wd=new Map;function Lg(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(wd.get(e))return wd.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,o=a0.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(o||o0.includes(t)))return;const l=async function(h,...f){const g=this.transaction(h,o?"readwrite":"readonly");let y=g.store;return s&&(y=y.index(f.shift())),(await Promise.all([y[t](...f),o&&g.done]))[0]};return wd.set(e,l),l}n0(r=>({...r,get:(e,t,s)=>Lg(e,t)||r.get(e,t,s),has:(e,t)=>!!Lg(e,t)||r.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l0{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(u0(t)){const s=t.getImmediate();return`${s.library}/${s.version}`}else return null}).filter(t=>t).join(" ")}}function u0(r){const e=r.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Fd="@firebase/app",bg="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kr=new pf("@firebase/app"),c0="@firebase/app-compat",h0="@firebase/analytics-compat",d0="@firebase/analytics",f0="@firebase/app-check-compat",p0="@firebase/app-check",m0="@firebase/auth",g0="@firebase/auth-compat",_0="@firebase/database",y0="@firebase/data-connect",v0="@firebase/database-compat",E0="@firebase/functions",w0="@firebase/functions-compat",T0="@firebase/installations",I0="@firebase/installations-compat",S0="@firebase/messaging",A0="@firebase/messaging-compat",R0="@firebase/performance",C0="@firebase/performance-compat",P0="@firebase/remote-config",k0="@firebase/remote-config-compat",N0="@firebase/storage",D0="@firebase/storage-compat",O0="@firebase/firestore",x0="@firebase/ai",V0="@firebase/firestore-compat",L0="firebase",b0="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jd="[DEFAULT]",M0={[Fd]:"fire-core",[c0]:"fire-core-compat",[d0]:"fire-analytics",[h0]:"fire-analytics-compat",[p0]:"fire-app-check",[f0]:"fire-app-check-compat",[m0]:"fire-auth",[g0]:"fire-auth-compat",[_0]:"fire-rtdb",[y0]:"fire-data-connect",[v0]:"fire-rtdb-compat",[E0]:"fire-fn",[w0]:"fire-fn-compat",[T0]:"fire-iid",[I0]:"fire-iid-compat",[S0]:"fire-fcm",[A0]:"fire-fcm-compat",[R0]:"fire-perf",[C0]:"fire-perf-compat",[P0]:"fire-rc",[k0]:"fire-rc-compat",[N0]:"fire-gcs",[D0]:"fire-gcs-compat",[O0]:"fire-fst",[V0]:"fire-fst-compat",[x0]:"fire-vertex","fire-js":"fire-js",[L0]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tc=new Map,U0=new Map,Bd=new Map;function Mg(r,e){try{r.container.addComponent(e)}catch(t){Kr.debug(`Component ${e.name} failed to register with FirebaseApp ${r.name}`,t)}}function Ss(r){const e=r.name;if(Bd.has(e))return Kr.debug(`There were multiple attempts to register component ${e}.`),!1;Bd.set(e,r);for(const t of tc.values())Mg(t,r);for(const t of U0.values())Mg(t,r);return!0}function vc(r,e){const t=r.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),r.container.getProvider(e)}function Dn(r){return r==null?!1:r.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F0={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Di=new ll("app","Firebase",F0);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j0{constructor(e,t,s){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=s,this.container.addComponent(new bi("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Di.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ns=b0;function ky(r,e={}){let t=r;typeof e!="object"&&(e={name:e});const s=Object.assign({name:jd,automaticDataCollectionEnabled:!0},e),o=s.name;if(typeof o!="string"||!o)throw Di.create("bad-app-name",{appName:String(o)});if(t||(t=Sy()),!t)throw Di.create("no-options");const l=tc.get(o);if(l){if(Is(t,l.options)&&Is(s,l.config))return l;throw Di.create("duplicate-app",{appName:o})}const h=new WT(o);for(const g of Bd.values())h.addComponent(g);const f=new j0(t,s,h);return tc.set(o,f),f}function gf(r=jd){const e=tc.get(r);if(!e&&r===jd&&Sy())return ky();if(!e)throw Di.create("no-app",{appName:r});return e}function vr(r,e,t){var s;let o=(s=M0[r])!==null&&s!==void 0?s:r;t&&(o+=`-${t}`);const l=o.match(/\s|\//),h=e.match(/\s|\//);if(l||h){const f=[`Unable to register library "${o}" with version "${e}":`];l&&f.push(`library name "${o}" contains illegal characters (whitespace or "/")`),l&&h&&f.push("and"),h&&f.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Kr.warn(f.join(" "));return}Ss(new bi(`${o}-version`,()=>({library:o,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const B0="firebase-heartbeat-database",z0=1,Ya="firebase-heartbeat-store";let Td=null;function Ny(){return Td||(Td=s0(B0,z0,{upgrade:(r,e)=>{switch(e){case 0:try{r.createObjectStore(Ya)}catch(t){console.warn(t)}}}}).catch(r=>{throw Di.create("idb-open",{originalErrorMessage:r.message})})),Td}async function $0(r){try{const t=(await Ny()).transaction(Ya),s=await t.objectStore(Ya).get(Dy(r));return await t.done,s}catch(e){if(e instanceof Cr)Kr.warn(e.message);else{const t=Di.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Kr.warn(t.message)}}}async function Ug(r,e){try{const s=(await Ny()).transaction(Ya,"readwrite");await s.objectStore(Ya).put(e,Dy(r)),await s.done}catch(t){if(t instanceof Cr)Kr.warn(t.message);else{const s=Di.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Kr.warn(s.message)}}}function Dy(r){return`${r.name}!${r.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const H0=1024,q0=30;class W0{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new K0(t),this._heartbeatsCachePromise=this._storage.read().then(s=>(this._heartbeatsCache=s,s))}async triggerHeartbeat(){var e,t;try{const o=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),l=Fg();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===l||this._heartbeatsCache.heartbeats.some(h=>h.date===l))return;if(this._heartbeatsCache.heartbeats.push({date:l,agent:o}),this._heartbeatsCache.heartbeats.length>q0){const h=Q0(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(h,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(s){Kr.warn(s)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Fg(),{heartbeatsToSend:s,unsentEntries:o}=G0(this._heartbeatsCache.heartbeats),l=ec(JSON.stringify({version:2,heartbeats:s}));return this._heartbeatsCache.lastSentHeartbeatDate=t,o.length>0?(this._heartbeatsCache.heartbeats=o,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),l}catch(t){return Kr.warn(t),""}}}function Fg(){return new Date().toISOString().substring(0,10)}function G0(r,e=H0){const t=[];let s=r.slice();for(const o of r){const l=t.find(h=>h.agent===o.agent);if(l){if(l.dates.push(o.date),jg(t)>e){l.dates.pop();break}}else if(t.push({agent:o.agent,dates:[o.date]}),jg(t)>e){t.pop();break}s=s.slice(1)}return{heartbeatsToSend:t,unsentEntries:s}}class K0{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return VT()?LT().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await $0(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const o=await this.read();return Ug(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:o.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const o=await this.read();return Ug(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:o.lastSentHeartbeatDate,heartbeats:[...o.heartbeats,...e.heartbeats]})}else return}}function jg(r){return ec(JSON.stringify({version:2,heartbeats:r})).length}function Q0(r){if(r.length===0)return-1;let e=0,t=r[0].date;for(let s=1;s<r.length;s++)r[s].date<t&&(t=r[s].date,e=s);return e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function X0(r){Ss(new bi("platform-logger",e=>new l0(e),"PRIVATE")),Ss(new bi("heartbeat",e=>new W0(e),"PRIVATE")),vr(Fd,bg,r),vr(Fd,bg,"esm2017"),vr("fire-js","")}X0("");var Y0="firebase",J0="11.10.0";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */vr(Y0,J0,"app");function _f(r,e){var t={};for(var s in r)Object.prototype.hasOwnProperty.call(r,s)&&e.indexOf(s)<0&&(t[s]=r[s]);if(r!=null&&typeof Object.getOwnPropertySymbols=="function")for(var o=0,s=Object.getOwnPropertySymbols(r);o<s.length;o++)e.indexOf(s[o])<0&&Object.prototype.propertyIsEnumerable.call(r,s[o])&&(t[s[o]]=r[s[o]]);return t}function Oy(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Z0=Oy,xy=new ll("auth","Firebase",Oy());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nc=new pf("@firebase/auth");function eI(r,...e){nc.logLevel<=De.WARN&&nc.warn(`Auth (${Ns}): ${r}`,...e)}function Hu(r,...e){nc.logLevel<=De.ERROR&&nc.error(`Auth (${Ns}): ${r}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tr(r,...e){throw yf(r,...e)}function Er(r,...e){return yf(r,...e)}function Vy(r,e,t){const s=Object.assign(Object.assign({},Z0()),{[e]:t});return new ll("auth","Firebase",s).create(e,{appName:r.name})}function Oi(r){return Vy(r,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function yf(r,...e){if(typeof r!="string"){const t=e[0],s=[...e.slice(1)];return s[0]&&(s[0].appName=r.name),r._errorFactory.create(t,...s)}return xy.create(r,...e)}function ye(r,e,...t){if(!r)throw yf(e,...t)}function Wr(r){const e="INTERNAL ASSERTION FAILED: "+r;throw Hu(e),new Error(e)}function Qr(r,e){r||Wr(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zd(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.href)||""}function tI(){return Bg()==="http:"||Bg()==="https:"}function Bg(){var r;return typeof self<"u"&&((r=self.location)===null||r===void 0?void 0:r.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(tI()||NT()||"connection"in navigator)?navigator.onLine:!0}function rI(){if(typeof navigator>"u")return null;const r=navigator;return r.languages&&r.languages[0]||r.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cl{constructor(e,t){this.shortDelay=e,this.longDelay=t,Qr(t>e,"Short delay should be less than long delay!"),this.isMobile=CT()||DT()}get(){return nI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vf(r,e){Qr(r.emulator,"Emulator should always be set here");const{url:t}=r.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ly{static initialize(e,t,s){this.fetchImpl=e,t&&(this.headersImpl=t),s&&(this.responseImpl=s)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Wr("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Wr("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Wr("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sI=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],oI=new cl(3e4,6e4);function Ds(r,e){return r.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:r.tenantId}):e}async function qi(r,e,t,s,o={}){return by(r,o,async()=>{let l={},h={};s&&(e==="GET"?h=s:l={body:JSON.stringify(s)});const f=ul(Object.assign({key:r.config.apiKey},h)).slice(1),g=await r._getAdditionalHeaders();g["Content-Type"]="application/json",r.languageCode&&(g["X-Firebase-Locale"]=r.languageCode);const y=Object.assign({method:e,headers:g},l);return kT()||(y.referrerPolicy="no-referrer"),r.emulatorConfig&&Hi(r.emulatorConfig.host)&&(y.credentials="include"),Ly.fetch()(await My(r,r.config.apiHost,t,f),y)})}async function by(r,e,t){r._canInitEmulator=!1;const s=Object.assign(Object.assign({},iI),e);try{const o=new lI(r),l=await Promise.race([t(),o.promise]);o.clearNetworkTimeout();const h=await l.json();if("needConfirmation"in h)throw Lu(r,"account-exists-with-different-credential",h);if(l.ok&&!("errorMessage"in h))return h;{const f=l.ok?h.errorMessage:h.error.message,[g,y]=f.split(" : ");if(g==="FEDERATED_USER_ID_ALREADY_LINKED")throw Lu(r,"credential-already-in-use",h);if(g==="EMAIL_EXISTS")throw Lu(r,"email-already-in-use",h);if(g==="USER_DISABLED")throw Lu(r,"user-disabled",h);const w=s[g]||g.toLowerCase().replace(/[_\s]+/g,"-");if(y)throw Vy(r,w,y);tr(r,w)}}catch(o){if(o instanceof Cr)throw o;tr(r,"network-request-failed",{message:String(o)})}}async function Ec(r,e,t,s,o={}){const l=await qi(r,e,t,s,o);return"mfaPendingCredential"in l&&tr(r,"multi-factor-auth-required",{_serverResponse:l}),l}async function My(r,e,t,s){const o=`${e}${t}?${s}`,l=r,h=l.config.emulator?vf(r.config,o):`${r.config.apiScheme}://${o}`;return sI.includes(t)&&(await l._persistenceManagerAvailable,l._getPersistenceType()==="COOKIE")?l._getPersistence()._getFinalTarget(h).toString():h}function aI(r){switch(r){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class lI{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,s)=>{this.timer=setTimeout(()=>s(Er(this.auth,"network-request-failed")),oI.get())})}}function Lu(r,e,t){const s={appName:r.name};t.email&&(s.email=t.email),t.phoneNumber&&(s.phoneNumber=t.phoneNumber);const o=Er(r,e,s);return o.customData._tokenResponse=t,o}function zg(r){return r!==void 0&&r.enterprise!==void 0}class uI{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return aI(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}}async function cI(r,e){return qi(r,"GET","/v2/recaptchaConfig",Ds(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hI(r,e){return qi(r,"POST","/v1/accounts:delete",e)}async function rc(r,e){return qi(r,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qa(r){if(r)try{const e=new Date(Number(r));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function dI(r,e=!1){const t=at(r),s=await t.getIdToken(e),o=Ef(s);ye(o&&o.exp&&o.auth_time&&o.iat,t.auth,"internal-error");const l=typeof o.firebase=="object"?o.firebase:void 0,h=l==null?void 0:l.sign_in_provider;return{claims:o,token:s,authTime:qa(Id(o.auth_time)),issuedAtTime:qa(Id(o.iat)),expirationTime:qa(Id(o.exp)),signInProvider:h||null,signInSecondFactor:(l==null?void 0:l.sign_in_second_factor)||null}}function Id(r){return Number(r)*1e3}function Ef(r){const[e,t,s]=r.split(".");if(e===void 0||t===void 0||s===void 0)return Hu("JWT malformed, contained fewer than 3 sections"),null;try{const o=wy(t);return o?JSON.parse(o):(Hu("Failed to decode base64 JWT payload"),null)}catch(o){return Hu("Caught error parsing JWT payload as JSON",o==null?void 0:o.toString()),null}}function $g(r){const e=Ef(r);return ye(e,"internal-error"),ye(typeof e.exp<"u","internal-error"),ye(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ja(r,e,t=!1){if(t)return e;try{return await e}catch(s){throw s instanceof Cr&&fI(s)&&r.auth.currentUser===r&&await r.auth.signOut(),s}}function fI({code:r}){return r==="auth/user-disabled"||r==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const s=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),s}else{this.errorBackoff=3e4;const o=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,o)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $d{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=qa(this.lastLoginAt),this.creationTime=qa(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ic(r){var e;const t=r.auth,s=await r.getIdToken(),o=await Ja(r,rc(t,{idToken:s}));ye(o==null?void 0:o.users.length,t,"internal-error");const l=o.users[0];r._notifyReloadListener(l);const h=!((e=l.providerUserInfo)===null||e===void 0)&&e.length?Uy(l.providerUserInfo):[],f=gI(r.providerData,h),g=r.isAnonymous,y=!(r.email&&l.passwordHash)&&!(f!=null&&f.length),w=g?y:!1,A={uid:l.localId,displayName:l.displayName||null,photoURL:l.photoUrl||null,email:l.email||null,emailVerified:l.emailVerified||!1,phoneNumber:l.phoneNumber||null,tenantId:l.tenantId||null,providerData:f,metadata:new $d(l.createdAt,l.lastLoginAt),isAnonymous:w};Object.assign(r,A)}async function mI(r){const e=at(r);await ic(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function gI(r,e){return[...r.filter(s=>!e.some(o=>o.providerId===s.providerId)),...e]}function Uy(r){return r.map(e=>{var{providerId:t}=e,s=_f(e,["providerId"]);return{providerId:t,uid:s.rawId||"",displayName:s.displayName||null,email:s.email||null,phoneNumber:s.phoneNumber||null,photoURL:s.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _I(r,e){const t=await by(r,{},async()=>{const s=ul({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:o,apiKey:l}=r.config,h=await My(r,o,"/v1/token",`key=${l}`),f=await r._getAdditionalHeaders();f["Content-Type"]="application/x-www-form-urlencoded";const g={method:"POST",headers:f,body:s};return r.emulatorConfig&&Hi(r.emulatorConfig.host)&&(g.credentials="include"),Ly.fetch()(h,g)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function yI(r,e){return qi(r,"POST","/v2/accounts:revokeToken",Ds(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Po{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ye(e.idToken,"internal-error"),ye(typeof e.idToken<"u","internal-error"),ye(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):$g(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){ye(e.length!==0,"internal-error");const t=$g(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(ye(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:s,refreshToken:o,expiresIn:l}=await _I(e,t);this.updateTokensAndExpiration(s,o,Number(l))}updateTokensAndExpiration(e,t,s){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+s*1e3}static fromJSON(e,t){const{refreshToken:s,accessToken:o,expirationTime:l}=t,h=new Po;return s&&(ye(typeof s=="string","internal-error",{appName:e}),h.refreshToken=s),o&&(ye(typeof o=="string","internal-error",{appName:e}),h.accessToken=o),l&&(ye(typeof l=="number","internal-error",{appName:e}),h.expirationTime=l),h}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Po,this.toJSON())}_performRefresh(){return Wr("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ii(r,e){ye(typeof r=="string"||typeof r>"u","internal-error",{appName:e})}class Zn{constructor(e){var{uid:t,auth:s,stsTokenManager:o}=e,l=_f(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new pI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=s,this.stsTokenManager=o,this.accessToken=o.accessToken,this.displayName=l.displayName||null,this.email=l.email||null,this.emailVerified=l.emailVerified||!1,this.phoneNumber=l.phoneNumber||null,this.photoURL=l.photoURL||null,this.isAnonymous=l.isAnonymous||!1,this.tenantId=l.tenantId||null,this.providerData=l.providerData?[...l.providerData]:[],this.metadata=new $d(l.createdAt||void 0,l.lastLoginAt||void 0)}async getIdToken(e){const t=await Ja(this,this.stsTokenManager.getToken(this.auth,e));return ye(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return dI(this,e)}reload(){return mI(this)}_assign(e){this!==e&&(ye(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Zn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){ye(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let s=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),s=!0),t&&await ic(this),await this.auth._persistUserIfCurrent(this),s&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Dn(this.auth.app))return Promise.reject(Oi(this.auth));const e=await this.getIdToken();return await Ja(this,hI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var s,o,l,h,f,g,y,w;const A=(s=t.displayName)!==null&&s!==void 0?s:void 0,R=(o=t.email)!==null&&o!==void 0?o:void 0,F=(l=t.phoneNumber)!==null&&l!==void 0?l:void 0,B=(h=t.photoURL)!==null&&h!==void 0?h:void 0,K=(f=t.tenantId)!==null&&f!==void 0?f:void 0,z=(g=t._redirectEventId)!==null&&g!==void 0?g:void 0,pe=(y=t.createdAt)!==null&&y!==void 0?y:void 0,ae=(w=t.lastLoginAt)!==null&&w!==void 0?w:void 0,{uid:le,emailVerified:de,isAnonymous:je,providerData:we,stsTokenManager:N}=t;ye(le&&N,e,"internal-error");const T=Po.fromJSON(this.name,N);ye(typeof le=="string",e,"internal-error"),Ii(A,e.name),Ii(R,e.name),ye(typeof de=="boolean",e,"internal-error"),ye(typeof je=="boolean",e,"internal-error"),Ii(F,e.name),Ii(B,e.name),Ii(K,e.name),Ii(z,e.name),Ii(pe,e.name),Ii(ae,e.name);const C=new Zn({uid:le,auth:e,email:R,emailVerified:de,displayName:A,isAnonymous:je,photoURL:B,phoneNumber:F,tenantId:K,stsTokenManager:T,createdAt:pe,lastLoginAt:ae});return we&&Array.isArray(we)&&(C.providerData=we.map(k=>Object.assign({},k))),z&&(C._redirectEventId=z),C}static async _fromIdTokenResponse(e,t,s=!1){const o=new Po;o.updateFromServerResponse(t);const l=new Zn({uid:t.localId,auth:e,stsTokenManager:o,isAnonymous:s});return await ic(l),l}static async _fromGetAccountInfoResponse(e,t,s){const o=t.users[0];ye(o.localId!==void 0,"internal-error");const l=o.providerUserInfo!==void 0?Uy(o.providerUserInfo):[],h=!(o.email&&o.passwordHash)&&!(l!=null&&l.length),f=new Po;f.updateFromIdToken(s);const g=new Zn({uid:o.localId,auth:e,stsTokenManager:f,isAnonymous:h}),y={uid:o.localId,displayName:o.displayName||null,photoURL:o.photoUrl||null,email:o.email||null,emailVerified:o.emailVerified||!1,phoneNumber:o.phoneNumber||null,tenantId:o.tenantId||null,providerData:l,metadata:new $d(o.createdAt,o.lastLoginAt),isAnonymous:!(o.email&&o.passwordHash)&&!(l!=null&&l.length)};return Object.assign(g,y),g}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Hg=new Map;function Gr(r){Qr(r instanceof Function,"Expected a class definition");let e=Hg.get(r);return e?(Qr(e instanceof r,"Instance stored in cache mismatched with class"),e):(e=new r,Hg.set(r,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fy{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Fy.type="NONE";const qg=Fy;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qu(r,e,t){return`firebase:${r}:${e}:${t}`}class ko{constructor(e,t,s){this.persistence=e,this.auth=t,this.userKey=s;const{config:o,name:l}=this.auth;this.fullUserKey=qu(this.userKey,o.apiKey,l),this.fullPersistenceKey=qu("persistence",o.apiKey,l),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await rc(this.auth,{idToken:e}).catch(()=>{});return t?Zn._fromGetAccountInfoResponse(this.auth,t,e):null}return Zn._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,s="authUser"){if(!t.length)return new ko(Gr(qg),e,s);const o=(await Promise.all(t.map(async y=>{if(await y._isAvailable())return y}))).filter(y=>y);let l=o[0]||Gr(qg);const h=qu(s,e.config.apiKey,e.name);let f=null;for(const y of t)try{const w=await y._get(h);if(w){let A;if(typeof w=="string"){const R=await rc(e,{idToken:w}).catch(()=>{});if(!R)break;A=await Zn._fromGetAccountInfoResponse(e,R,w)}else A=Zn._fromJSON(e,w);y!==l&&(f=A),l=y;break}}catch{}const g=o.filter(y=>y._shouldAllowMigration);return!l._shouldAllowMigration||!g.length?new ko(l,e,s):(l=g[0],f&&await l._set(h,f.toJSON()),await Promise.all(t.map(async y=>{if(y!==l)try{await y._remove(h)}catch{}})),new ko(l,e,s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wg(r){const e=r.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if($y(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(jy(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(qy(e))return"Blackberry";if(Wy(e))return"Webos";if(By(e))return"Safari";if((e.includes("chrome/")||zy(e))&&!e.includes("edge/"))return"Chrome";if(Hy(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,s=r.match(t);if((s==null?void 0:s.length)===2)return s[1]}return"Other"}function jy(r=Kt()){return/firefox\//i.test(r)}function By(r=Kt()){const e=r.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function zy(r=Kt()){return/crios\//i.test(r)}function $y(r=Kt()){return/iemobile/i.test(r)}function Hy(r=Kt()){return/android/i.test(r)}function qy(r=Kt()){return/blackberry/i.test(r)}function Wy(r=Kt()){return/webos/i.test(r)}function wf(r=Kt()){return/iphone|ipad|ipod/i.test(r)||/macintosh/i.test(r)&&/mobile/i.test(r)}function vI(r=Kt()){var e;return wf(r)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function EI(){return OT()&&document.documentMode===10}function Gy(r=Kt()){return wf(r)||Hy(r)||Wy(r)||qy(r)||/windows phone/i.test(r)||$y(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ky(r,e=[]){let t;switch(r){case"Browser":t=Wg(Kt());break;case"Worker":t=`${Wg(Kt())}-${r}`;break;default:t=r}const s=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Ns}/${s}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const s=l=>new Promise((h,f)=>{try{const g=e(l);h(g)}catch(g){f(g)}});s.onAbort=t,this.queue.push(s);const o=this.queue.length-1;return()=>{this.queue[o]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const s of this.queue)await s(e),s.onAbort&&t.push(s.onAbort)}catch(s){t.reverse();for(const o of t)try{o()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:s==null?void 0:s.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function TI(r,e={}){return qi(r,"GET","/v2/passwordPolicy",Ds(r,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const II=6;class SI{constructor(e){var t,s,o,l;const h=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=h.minPasswordLength)!==null&&t!==void 0?t:II,h.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=h.maxPasswordLength),h.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=h.containsLowercaseCharacter),h.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=h.containsUppercaseCharacter),h.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=h.containsNumericCharacter),h.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=h.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(o=(s=e.allowedNonAlphanumericCharacters)===null||s===void 0?void 0:s.join(""))!==null&&o!==void 0?o:"",this.forceUpgradeOnSignin=(l=e.forceUpgradeOnSignin)!==null&&l!==void 0?l:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,s,o,l,h,f;const g={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,g),this.validatePasswordCharacterOptions(e,g),g.isValid&&(g.isValid=(t=g.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),g.isValid&&(g.isValid=(s=g.meetsMaxPasswordLength)!==null&&s!==void 0?s:!0),g.isValid&&(g.isValid=(o=g.containsLowercaseLetter)!==null&&o!==void 0?o:!0),g.isValid&&(g.isValid=(l=g.containsUppercaseLetter)!==null&&l!==void 0?l:!0),g.isValid&&(g.isValid=(h=g.containsNumericCharacter)!==null&&h!==void 0?h:!0),g.isValid&&(g.isValid=(f=g.containsNonAlphanumericCharacter)!==null&&f!==void 0?f:!0),g}validatePasswordLengthOptions(e,t){const s=this.customStrengthOptions.minPasswordLength,o=this.customStrengthOptions.maxPasswordLength;s&&(t.meetsMinPasswordLength=e.length>=s),o&&(t.meetsMaxPasswordLength=e.length<=o)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let s;for(let o=0;o<e.length;o++)s=e.charAt(o),this.updatePasswordCharacterOptionsStatuses(t,s>="a"&&s<="z",s>="A"&&s<="Z",s>="0"&&s<="9",this.allowedNonAlphanumericCharacters.includes(s))}updatePasswordCharacterOptionsStatuses(e,t,s,o,l){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=s)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=o)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=l))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AI{constructor(e,t,s,o){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=s,this.config=o,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Gg(this),this.idTokenSubscription=new Gg(this),this.beforeStateQueue=new wI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=xy,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=o.sdkClientVersion,this._persistenceManagerAvailable=new Promise(l=>this._resolvePersistenceManagerAvailable=l)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Gr(t)),this._initializationPromise=this.queue(async()=>{var s,o,l;if(!this._deleted&&(this.persistenceManager=await ko.create(this,e),(s=this._resolvePersistenceManagerAvailable)===null||s===void 0||s.call(this),!this._deleted)){if(!((o=this._popupRedirectResolver)===null||o===void 0)&&o._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((l=this.currentUser)===null||l===void 0?void 0:l.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await rc(this,{idToken:e}),s=await Zn._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(s)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Dn(this.app)){const h=this.app.settings.authIdToken;return h?new Promise(f=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(h).then(f,f))}):this.directlySetCurrentUser(null)}const s=await this.assertedPersistence.getCurrentUser();let o=s,l=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const h=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,f=o==null?void 0:o._redirectEventId,g=await this.tryRedirectSignIn(e);(!h||h===f)&&(g!=null&&g.user)&&(o=g.user,l=!0)}if(!o)return this.directlySetCurrentUser(null);if(!o._redirectEventId){if(l)try{await this.beforeStateQueue.runMiddleware(o)}catch(h){o=s,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(h))}return o?this.reloadAndSetCurrentUserOrClear(o):this.directlySetCurrentUser(null)}return ye(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===o._redirectEventId?this.directlySetCurrentUser(o):this.reloadAndSetCurrentUserOrClear(o)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await ic(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=rI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Dn(this.app))return Promise.reject(Oi(this));const t=e?at(e):null;return t&&ye(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&ye(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Dn(this.app)?Promise.reject(Oi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Dn(this.app)?Promise.reject(Oi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Gr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await TI(this),t=new SI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ll("auth","Firebase",e())}onAuthStateChanged(e,t,s){return this.registerStateListener(this.authStateSubscription,e,t,s)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,s){return this.registerStateListener(this.idTokenSubscription,e,t,s)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const s=this.onAuthStateChanged(()=>{s(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),s={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(s.tenantId=this.tenantId),await yI(this,s)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const s=await this.getOrInitRedirectPersistenceManager(t);return e===null?s.removeCurrentUser():s.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Gr(e)||this._popupRedirectResolver;ye(t,this,"argument-error"),this.redirectPersistenceManager=await ko.create(this,[Gr(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,s;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((s=this.redirectUser)===null||s===void 0?void 0:s._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const s=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==s&&(this.lastNotifiedUid=s,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,s,o){if(this._deleted)return()=>{};const l=typeof t=="function"?t:t.next.bind(t);let h=!1;const f=this._isInitialized?Promise.resolve():this._initializationPromise;if(ye(f,this,"internal-error"),f.then(()=>{h||l(this.currentUser)}),typeof t=="function"){const g=e.addObserver(t,s,o);return()=>{h=!0,g()}}else{const g=e.addObserver(t);return()=>{h=!0,g()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ye(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Ky(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const s=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());s&&(t["X-Firebase-Client"]=s);const o=await this._getAppCheckToken();return o&&(t["X-Firebase-AppCheck"]=o),t}async _getAppCheckToken(){var e;if(Dn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&eI(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function jo(r){return at(r)}class Gg{constructor(e){this.auth=e,this.observer=null,this.addObserver=jT(t=>this.observer=t)}get next(){return ye(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let wc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function RI(r){wc=r}function Qy(r){return wc.loadJS(r)}function CI(){return wc.recaptchaEnterpriseScript}function PI(){return wc.gapiScript}function kI(r){return`__${r}${Math.floor(Math.random()*1e6)}`}class NI{constructor(){this.enterprise=new DI}ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}class DI{ready(e){e()}execute(e,t){return Promise.resolve("token")}render(e,t){return""}}const OI="recaptcha-enterprise",Xy="NO_RECAPTCHA";class xI{constructor(e){this.type=OI,this.auth=jo(e)}async verify(e="verify",t=!1){async function s(l){if(!t){if(l.tenantId==null&&l._agentRecaptchaConfig!=null)return l._agentRecaptchaConfig.siteKey;if(l.tenantId!=null&&l._tenantRecaptchaConfigs[l.tenantId]!==void 0)return l._tenantRecaptchaConfigs[l.tenantId].siteKey}return new Promise(async(h,f)=>{cI(l,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(g=>{if(g.recaptchaKey===void 0)f(new Error("recaptcha Enterprise site key undefined"));else{const y=new uI(g);return l.tenantId==null?l._agentRecaptchaConfig=y:l._tenantRecaptchaConfigs[l.tenantId]=y,h(y.siteKey)}}).catch(g=>{f(g)})})}function o(l,h,f){const g=window.grecaptcha;zg(g)?g.enterprise.ready(()=>{g.enterprise.execute(l,{action:e}).then(y=>{h(y)}).catch(()=>{h(Xy)})}):f(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new NI().execute("siteKey",{action:"verify"}):new Promise((l,h)=>{s(this.auth).then(f=>{if(!t&&zg(window.grecaptcha))o(f,l,h);else{if(typeof window>"u"){h(new Error("RecaptchaVerifier is only supported in browser"));return}let g=CI();g.length!==0&&(g+=f),Qy(g).then(()=>{o(f,l,h)}).catch(y=>{h(y)})}}).catch(f=>{h(f)})})}}async function Kg(r,e,t,s=!1,o=!1){const l=new xI(r);let h;if(o)h=Xy;else try{h=await l.verify(t)}catch{h=await l.verify(t,!0)}const f=Object.assign({},e);if(t==="mfaSmsEnrollment"||t==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in f){const g=f.phoneEnrollmentInfo.phoneNumber,y=f.phoneEnrollmentInfo.recaptchaToken;Object.assign(f,{phoneEnrollmentInfo:{phoneNumber:g,recaptchaToken:y,captchaResponse:h,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in f){const g=f.phoneSignInInfo.recaptchaToken;Object.assign(f,{phoneSignInInfo:{recaptchaToken:g,captchaResponse:h,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return f}return s?Object.assign(f,{captchaResp:h}):Object.assign(f,{captchaResponse:h}),Object.assign(f,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(f,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),f}async function Qg(r,e,t,s,o){var l;if(!((l=r._getRecaptchaConfig())===null||l===void 0)&&l.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const h=await Kg(r,e,t,t==="getOobCode");return s(r,h)}else return s(r,e).catch(async h=>{if(h.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const f=await Kg(r,e,t,t==="getOobCode");return s(r,f)}else return Promise.reject(h)})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VI(r,e){const t=vc(r,"auth");if(t.isInitialized()){const o=t.getImmediate(),l=t.getOptions();if(Is(l,e??{}))return o;tr(o,"already-initialized")}return t.initialize({options:e})}function LI(r,e){const t=(e==null?void 0:e.persistence)||[],s=(Array.isArray(t)?t:[t]).map(Gr);e!=null&&e.errorMap&&r._updateErrorMap(e.errorMap),r._initializeWithPersistence(s,e==null?void 0:e.popupRedirectResolver)}function bI(r,e,t){const s=jo(r);ye(/^https?:\/\//.test(e),s,"invalid-emulator-scheme");const o=!1,l=Yy(e),{host:h,port:f}=MI(e),g=f===null?"":`:${f}`,y={url:`${l}//${h}${g}/`},w=Object.freeze({host:h,port:f,protocol:l.replace(":",""),options:Object.freeze({disableWarnings:o})});if(!s._canInitEmulator){ye(s.config.emulator&&s.emulatorConfig,s,"emulator-config-failed"),ye(Is(y,s.config.emulator)&&Is(w,s.emulatorConfig),s,"emulator-config-failed");return}s.config.emulator=y,s.emulatorConfig=w,s.settings.appVerificationDisabledForTesting=!0,Hi(h)?(df(`${l}//${h}${g}`),ff("Auth",!0)):UI()}function Yy(r){const e=r.indexOf(":");return e<0?"":r.substr(0,e+1)}function MI(r){const e=Yy(r),t=/(\/\/)?([^?#/]+)/.exec(r.substr(e.length));if(!t)return{host:"",port:null};const s=t[2].split("@").pop()||"",o=/^(\[[^\]]+\])(:|$)/.exec(s);if(o){const l=o[1];return{host:l,port:Xg(s.substr(l.length+1))}}else{const[l,h]=s.split(":");return{host:l,port:Xg(h)}}}function Xg(r){if(!r)return null;const e=Number(r);return isNaN(e)?null:e}function UI(){function r(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",r):r())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tf{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Wr("not implemented")}_getIdTokenResponse(e){return Wr("not implemented")}_linkToIdToken(e,t){return Wr("not implemented")}_getReauthenticationResolver(e){return Wr("not implemented")}}async function FI(r,e){return qi(r,"POST","/v1/accounts:signUp",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function jI(r,e){return Ec(r,"POST","/v1/accounts:signInWithPassword",Ds(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function BI(r,e){return Ec(r,"POST","/v1/accounts:signInWithEmailLink",Ds(r,e))}async function zI(r,e){return Ec(r,"POST","/v1/accounts:signInWithEmailLink",Ds(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Za extends Tf{constructor(e,t,s,o=null){super("password",s),this._email=e,this._password=t,this._tenantId=o}static _fromEmailAndPassword(e,t){return new Za(e,t,"password")}static _fromEmailAndCode(e,t,s=null){return new Za(e,t,"emailLink",s)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Qg(e,t,"signInWithPassword",jI);case"emailLink":return BI(e,{email:this._email,oobCode:this._password});default:tr(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const s={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Qg(e,s,"signUpPassword",FI);case"emailLink":return zI(e,{idToken:t,email:this._email,oobCode:this._password});default:tr(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function No(r,e){return Ec(r,"POST","/v1/accounts:signInWithIdp",Ds(r,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $I="http://localhost";class As extends Tf{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new As(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):tr("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:s,signInMethod:o}=t,l=_f(t,["providerId","signInMethod"]);if(!s||!o)return null;const h=new As(s,o);return h.idToken=l.idToken||void 0,h.accessToken=l.accessToken||void 0,h.secret=l.secret,h.nonce=l.nonce,h.pendingToken=l.pendingToken||null,h}_getIdTokenResponse(e){const t=this.buildRequest();return No(e,t)}_linkToIdToken(e,t){const s=this.buildRequest();return s.idToken=t,No(e,s)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,No(e,t)}buildRequest(){const e={requestUri:$I,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ul(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function HI(r){switch(r){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function qI(r){const e=Ua(Fa(r)).link,t=e?Ua(Fa(e)).deep_link_id:null,s=Ua(Fa(r)).deep_link_id;return(s?Ua(Fa(s)).link:null)||s||t||e||r}class If{constructor(e){var t,s,o,l,h,f;const g=Ua(Fa(e)),y=(t=g.apiKey)!==null&&t!==void 0?t:null,w=(s=g.oobCode)!==null&&s!==void 0?s:null,A=HI((o=g.mode)!==null&&o!==void 0?o:null);ye(y&&w&&A,"argument-error"),this.apiKey=y,this.operation=A,this.code=w,this.continueUrl=(l=g.continueUrl)!==null&&l!==void 0?l:null,this.languageCode=(h=g.lang)!==null&&h!==void 0?h:null,this.tenantId=(f=g.tenantId)!==null&&f!==void 0?f:null}static parseLink(e){const t=qI(e);try{return new If(t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bo{constructor(){this.providerId=Bo.PROVIDER_ID}static credential(e,t){return Za._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const s=If.parseLink(t);return ye(s,"argument-error"),Za._fromEmailAndCode(e,s.code,s.tenantId)}}Bo.PROVIDER_ID="password";Bo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Bo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jy{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hl extends Jy{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Si extends hl{constructor(){super("facebook.com")}static credential(e){return As._fromParams({providerId:Si.PROVIDER_ID,signInMethod:Si.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Si.credentialFromTaggedObject(e)}static credentialFromError(e){return Si.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Si.credential(e.oauthAccessToken)}catch{return null}}}Si.FACEBOOK_SIGN_IN_METHOD="facebook.com";Si.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ai extends hl{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return As._fromParams({providerId:Ai.PROVIDER_ID,signInMethod:Ai.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Ai.credentialFromTaggedObject(e)}static credentialFromError(e){return Ai.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:s}=e;if(!t&&!s)return null;try{return Ai.credential(t,s)}catch{return null}}}Ai.GOOGLE_SIGN_IN_METHOD="google.com";Ai.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ri extends hl{constructor(){super("github.com")}static credential(e){return As._fromParams({providerId:Ri.PROVIDER_ID,signInMethod:Ri.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ri.credentialFromTaggedObject(e)}static credentialFromError(e){return Ri.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ri.credential(e.oauthAccessToken)}catch{return null}}}Ri.GITHUB_SIGN_IN_METHOD="github.com";Ri.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ci extends hl{constructor(){super("twitter.com")}static credential(e,t){return As._fromParams({providerId:Ci.PROVIDER_ID,signInMethod:Ci.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Ci.credentialFromTaggedObject(e)}static credentialFromError(e){return Ci.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:s}=e;if(!t||!s)return null;try{return Ci.credential(t,s)}catch{return null}}}Ci.TWITTER_SIGN_IN_METHOD="twitter.com";Ci.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vo{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,s,o=!1){const l=await Zn._fromIdTokenResponse(e,s,o),h=Yg(s);return new Vo({user:l,providerId:h,_tokenResponse:s,operationType:t})}static async _forOperation(e,t,s){await e._updateTokensIfNecessary(s,!0);const o=Yg(s);return new Vo({user:e,providerId:o,_tokenResponse:s,operationType:t})}}function Yg(r){return r.providerId?r.providerId:"phoneNumber"in r?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sc extends Cr{constructor(e,t,s,o){var l;super(t.code,t.message),this.operationType=s,this.user=o,Object.setPrototypeOf(this,sc.prototype),this.customData={appName:e.name,tenantId:(l=e.tenantId)!==null&&l!==void 0?l:void 0,_serverResponse:t.customData._serverResponse,operationType:s}}static _fromErrorAndOperation(e,t,s,o){return new sc(e,t,s,o)}}function Zy(r,e,t,s){return(e==="reauthenticate"?t._getReauthenticationResolver(r):t._getIdTokenResponse(r)).catch(l=>{throw l.code==="auth/multi-factor-auth-required"?sc._fromErrorAndOperation(r,l,e,s):l})}async function WI(r,e,t=!1){const s=await Ja(r,e._linkToIdToken(r.auth,await r.getIdToken()),t);return Vo._forOperation(r,"link",s)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function GI(r,e,t=!1){const{auth:s}=r;if(Dn(s.app))return Promise.reject(Oi(s));const o="reauthenticate";try{const l=await Ja(r,Zy(s,o,e,r),t);ye(l.idToken,s,"internal-error");const h=Ef(l.idToken);ye(h,s,"internal-error");const{sub:f}=h;return ye(r.uid===f,s,"user-mismatch"),Vo._forOperation(r,o,l)}catch(l){throw(l==null?void 0:l.code)==="auth/user-not-found"&&tr(s,"user-mismatch"),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ev(r,e,t=!1){if(Dn(r.app))return Promise.reject(Oi(r));const s="signIn",o=await Zy(r,s,e),l=await Vo._fromIdTokenResponse(r,s,o);return t||await r._updateCurrentUser(l.user),l}async function KI(r,e){return ev(jo(r),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function QI(r){const e=jo(r);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}function XI(r,e,t){return Dn(r.app)?Promise.reject(Oi(r)):KI(at(r),Bo.credential(e,t)).catch(async s=>{throw s.code==="auth/password-does-not-meet-requirements"&&QI(r),s})}function YI(r,e,t,s){return at(r).onIdTokenChanged(e,t,s)}function JI(r,e,t){return at(r).beforeAuthStateChanged(e,t)}function ZI(r,e,t,s){return at(r).onAuthStateChanged(e,t,s)}function eS(r){return at(r).signOut()}const oc="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tv{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(oc,"1"),this.storage.removeItem(oc),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tS=1e3,nS=10;class nv extends tv{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Gy(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const s=this.storage.getItem(t),o=this.localCache[t];s!==o&&e(t,o,s)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((h,f,g)=>{this.notifyListeners(h,g)});return}const s=e.key;t?this.detachListener():this.stopPolling();const o=()=>{const h=this.storage.getItem(s);!t&&this.localCache[s]===h||this.notifyListeners(s,h)},l=this.storage.getItem(s);EI()&&l!==e.newValue&&e.newValue!==e.oldValue?setTimeout(o,nS):o()}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const o of Array.from(s))o(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,s)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:s}),!0)})},tS)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}nv.type="LOCAL";const rS=nv;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rv extends tv{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}rv.type="SESSION";const iv=rv;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iS(r){return Promise.all(r.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tc{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(o=>o.isListeningto(e));if(t)return t;const s=new Tc(e);return this.receivers.push(s),s}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:s,eventType:o,data:l}=t.data,h=this.handlersMap[o];if(!(h!=null&&h.size))return;t.ports[0].postMessage({status:"ack",eventId:s,eventType:o});const f=Array.from(h).map(async y=>y(t.origin,l)),g=await iS(f);t.ports[0].postMessage({status:"done",eventId:s,eventType:o,response:g})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Tc.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sf(r="",e=10){let t="";for(let s=0;s<e;s++)t+=Math.floor(Math.random()*10);return r+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sS{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,s=50){const o=typeof MessageChannel<"u"?new MessageChannel:null;if(!o)throw new Error("connection_unavailable");let l,h;return new Promise((f,g)=>{const y=Sf("",20);o.port1.start();const w=setTimeout(()=>{g(new Error("unsupported_event"))},s);h={messageChannel:o,onMessage(A){const R=A;if(R.data.eventId===y)switch(R.data.status){case"ack":clearTimeout(w),l=setTimeout(()=>{g(new Error("timeout"))},3e3);break;case"done":clearTimeout(l),f(R.data.response);break;default:clearTimeout(w),clearTimeout(l),g(new Error("invalid_response"));break}}},this.handlers.add(h),o.port1.addEventListener("message",h.onMessage),this.target.postMessage({eventType:e,eventId:y,data:t},[o.port2])}).finally(()=>{h&&this.removeMessageHandler(h)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wr(){return window}function oS(r){wr().location.href=r}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sv(){return typeof wr().WorkerGlobalScope<"u"&&typeof wr().importScripts=="function"}async function aS(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function lS(){var r;return((r=navigator==null?void 0:navigator.serviceWorker)===null||r===void 0?void 0:r.controller)||null}function uS(){return sv()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ov="firebaseLocalStorageDb",cS=1,ac="firebaseLocalStorage",av="fbase_key";class dl{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Ic(r,e){return r.transaction([ac],e?"readwrite":"readonly").objectStore(ac)}function hS(){const r=indexedDB.deleteDatabase(ov);return new dl(r).toPromise()}function Hd(){const r=indexedDB.open(ov,cS);return new Promise((e,t)=>{r.addEventListener("error",()=>{t(r.error)}),r.addEventListener("upgradeneeded",()=>{const s=r.result;try{s.createObjectStore(ac,{keyPath:av})}catch(o){t(o)}}),r.addEventListener("success",async()=>{const s=r.result;s.objectStoreNames.contains(ac)?e(s):(s.close(),await hS(),e(await Hd()))})})}async function Jg(r,e,t){const s=Ic(r,!0).put({[av]:e,value:t});return new dl(s).toPromise()}async function dS(r,e){const t=Ic(r,!1).get(e),s=await new dl(t).toPromise();return s===void 0?null:s.value}function Zg(r,e){const t=Ic(r,!0).delete(e);return new dl(t).toPromise()}const fS=800,pS=3;class lv{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Hd(),this.db)}async _withRetries(e){let t=0;for(;;)try{const s=await this._openDb();return await e(s)}catch(s){if(t++>pS)throw s;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return sv()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Tc._getInstance(uS()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await aS(),!this.activeServiceWorker)return;this.sender=new sS(this.activeServiceWorker);const s=await this.sender._send("ping",{},800);s&&!((e=s[0])===null||e===void 0)&&e.fulfilled&&!((t=s[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||lS()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Hd();return await Jg(e,oc,"1"),await Zg(e,oc),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(s=>Jg(s,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(s=>dS(s,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Zg(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(o=>{const l=Ic(o,!1).getAll();return new dl(l).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],s=new Set;if(e.length!==0)for(const{fbase_key:o,value:l}of e)s.add(o),JSON.stringify(this.localCache[o])!==JSON.stringify(l)&&(this.notifyListeners(o,l),t.push(o));for(const o of Object.keys(this.localCache))this.localCache[o]&&!s.has(o)&&(this.notifyListeners(o,null),t.push(o));return t}notifyListeners(e,t){this.localCache[e]=t;const s=this.listeners[e];if(s)for(const o of Array.from(s))o(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),fS)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}lv.type="LOCAL";const mS=lv;new cl(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gS(r,e){return e?Gr(e):(ye(r._popupRedirectResolver,r,"argument-error"),r._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Af extends Tf{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return No(e,this._buildIdpRequest())}_linkToIdToken(e,t){return No(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return No(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function _S(r){return ev(r.auth,new Af(r),r.bypassAuthState)}function yS(r){const{auth:e,user:t}=r;return ye(t,e,"internal-error"),GI(t,new Af(r),r.bypassAuthState)}async function vS(r){const{auth:e,user:t}=r;return ye(t,e,"internal-error"),WI(t,new Af(r),r.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uv{constructor(e,t,s,o,l=!1){this.auth=e,this.resolver=s,this.user=o,this.bypassAuthState=l,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(s){this.reject(s)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:s,postBody:o,tenantId:l,error:h,type:f}=e;if(h){this.reject(h);return}const g={auth:this.auth,requestUri:t,sessionId:s,tenantId:l||void 0,postBody:o||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(f)(g))}catch(y){this.reject(y)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return _S;case"linkViaPopup":case"linkViaRedirect":return vS;case"reauthViaPopup":case"reauthViaRedirect":return yS;default:tr(this.auth,"internal-error")}}resolve(e){Qr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Qr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ES=new cl(2e3,1e4);class Co extends uv{constructor(e,t,s,o,l){super(e,t,o,l),this.provider=s,this.authWindow=null,this.pollId=null,Co.currentPopupAction&&Co.currentPopupAction.cancel(),Co.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ye(e,this.auth,"internal-error"),e}async onExecution(){Qr(this.filter.length===1,"Popup operations only handle one event");const e=Sf();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Er(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Er(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Co.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,s;if(!((s=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||s===void 0)&&s.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Er(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,ES.get())};e()}}Co.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wS="pendingRedirect",Wu=new Map;class TS extends uv{constructor(e,t,s=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,s),this.eventId=null}async execute(){let e=Wu.get(this.auth._key());if(!e){try{const s=await IS(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(s)}catch(t){e=()=>Promise.reject(t)}Wu.set(this.auth._key(),e)}return this.bypassAuthState||Wu.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function IS(r,e){const t=RS(e),s=AS(r);if(!await s._isAvailable())return!1;const o=await s._get(t)==="true";return await s._remove(t),o}function SS(r,e){Wu.set(r._key(),e)}function AS(r){return Gr(r._redirectPersistence)}function RS(r){return qu(wS,r.config.apiKey,r.name)}async function CS(r,e,t=!1){if(Dn(r.app))return Promise.reject(Oi(r));const s=jo(r),o=gS(s,e),h=await new TS(s,o,t).execute();return h&&!t&&(delete h.user._redirectEventId,await s._persistUserIfCurrent(h.user),await s._setRedirectUser(null,e)),h}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PS=600*1e3;class kS{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(s=>{this.isEventForConsumer(e,s)&&(t=!0,this.sendToConsumer(e,s),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!NS(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var s;if(e.error&&!cv(e)){const o=((s=e.error.code)===null||s===void 0?void 0:s.split("auth/")[1])||"internal-error";t.onError(Er(this.auth,o))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const s=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&s}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=PS&&this.cachedEventUids.clear(),this.cachedEventUids.has(e_(e))}saveEventToCache(e){this.cachedEventUids.add(e_(e)),this.lastProcessedEventTime=Date.now()}}function e_(r){return[r.type,r.eventId,r.sessionId,r.tenantId].filter(e=>e).join("-")}function cv({type:r,error:e}){return r==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function NS(r){switch(r.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return cv(r);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DS(r,e={}){return qi(r,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OS=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,xS=/^https?/;async function VS(r){if(r.config.emulator)return;const{authorizedDomains:e}=await DS(r);for(const t of e)try{if(LS(t))return}catch{}tr(r,"unauthorized-domain")}function LS(r){const e=zd(),{protocol:t,hostname:s}=new URL(e);if(r.startsWith("chrome-extension://")){const h=new URL(r);return h.hostname===""&&s===""?t==="chrome-extension:"&&r.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&h.hostname===s}if(!xS.test(t))return!1;if(OS.test(r))return s===r;const o=r.replace(/\./g,"\\.");return new RegExp("^(.+\\."+o+"|"+o+")$","i").test(s)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bS=new cl(3e4,6e4);function t_(){const r=wr().___jsl;if(r!=null&&r.H){for(const e of Object.keys(r.H))if(r.H[e].r=r.H[e].r||[],r.H[e].L=r.H[e].L||[],r.H[e].r=[...r.H[e].L],r.CP)for(let t=0;t<r.CP.length;t++)r.CP[t]=null}}function MS(r){return new Promise((e,t)=>{var s,o,l;function h(){t_(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{t_(),t(Er(r,"network-request-failed"))},timeout:bS.get()})}if(!((o=(s=wr().gapi)===null||s===void 0?void 0:s.iframes)===null||o===void 0)&&o.Iframe)e(gapi.iframes.getContext());else if(!((l=wr().gapi)===null||l===void 0)&&l.load)h();else{const f=kI("iframefcb");return wr()[f]=()=>{gapi.load?h():t(Er(r,"network-request-failed"))},Qy(`${PI()}?onload=${f}`).catch(g=>t(g))}}).catch(e=>{throw Gu=null,e})}let Gu=null;function US(r){return Gu=Gu||MS(r),Gu}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const FS=new cl(5e3,15e3),jS="__/auth/iframe",BS="emulator/auth/iframe",zS={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},$S=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function HS(r){const e=r.config;ye(e.authDomain,r,"auth-domain-config-required");const t=e.emulator?vf(e,BS):`https://${r.config.authDomain}/${jS}`,s={apiKey:e.apiKey,appName:r.name,v:Ns},o=$S.get(r.config.apiHost);o&&(s.eid=o);const l=r._getFrameworks();return l.length&&(s.fw=l.join(",")),`${t}?${ul(s).slice(1)}`}async function qS(r){const e=await US(r),t=wr().gapi;return ye(t,r,"internal-error"),e.open({where:document.body,url:HS(r),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:zS,dontclear:!0},s=>new Promise(async(o,l)=>{await s.restyle({setHideOnLeave:!1});const h=Er(r,"network-request-failed"),f=wr().setTimeout(()=>{l(h)},FS.get());function g(){wr().clearTimeout(f),o(s)}s.ping(g).then(g,()=>{l(h)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WS={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},GS=500,KS=600,QS="_blank",XS="http://localhost";class n_{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function YS(r,e,t,s=GS,o=KS){const l=Math.max((window.screen.availHeight-o)/2,0).toString(),h=Math.max((window.screen.availWidth-s)/2,0).toString();let f="";const g=Object.assign(Object.assign({},WS),{width:s.toString(),height:o.toString(),top:l,left:h}),y=Kt().toLowerCase();t&&(f=zy(y)?QS:t),jy(y)&&(e=e||XS,g.scrollbars="yes");const w=Object.entries(g).reduce((R,[F,B])=>`${R}${F}=${B},`,"");if(vI(y)&&f!=="_self")return JS(e||"",f),new n_(null);const A=window.open(e||"",f,w);ye(A,r,"popup-blocked");try{A.focus()}catch{}return new n_(A)}function JS(r,e){const t=document.createElement("a");t.href=r,t.target=e;const s=document.createEvent("MouseEvent");s.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ZS="__/auth/handler",eA="emulator/auth/handler",tA=encodeURIComponent("fac");async function r_(r,e,t,s,o,l){ye(r.config.authDomain,r,"auth-domain-config-required"),ye(r.config.apiKey,r,"invalid-api-key");const h={apiKey:r.config.apiKey,appName:r.name,authType:t,redirectUrl:s,v:Ns,eventId:o};if(e instanceof Jy){e.setDefaultLanguage(r.languageCode),h.providerId=e.providerId||"",FT(e.getCustomParameters())||(h.customParameters=JSON.stringify(e.getCustomParameters()));for(const[w,A]of Object.entries({}))h[w]=A}if(e instanceof hl){const w=e.getScopes().filter(A=>A!=="");w.length>0&&(h.scopes=w.join(","))}r.tenantId&&(h.tid=r.tenantId);const f=h;for(const w of Object.keys(f))f[w]===void 0&&delete f[w];const g=await r._getAppCheckToken(),y=g?`#${tA}=${encodeURIComponent(g)}`:"";return`${nA(r)}?${ul(f).slice(1)}${y}`}function nA({config:r}){return r.emulator?vf(r,eA):`https://${r.authDomain}/${ZS}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sd="webStorageSupport";class rA{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=iv,this._completeRedirectFn=CS,this._overrideRedirectResult=SS}async _openPopup(e,t,s,o){var l;Qr((l=this.eventManagers[e._key()])===null||l===void 0?void 0:l.manager,"_initialize() not called before _openPopup()");const h=await r_(e,t,s,zd(),o);return YS(e,h,Sf())}async _openRedirect(e,t,s,o){await this._originValidation(e);const l=await r_(e,t,s,zd(),o);return oS(l),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:o,promise:l}=this.eventManagers[t];return o?Promise.resolve(o):(Qr(l,"If manager is not set, promise should be"),l)}const s=this.initAndGetManager(e);return this.eventManagers[t]={promise:s},s.catch(()=>{delete this.eventManagers[t]}),s}async initAndGetManager(e){const t=await qS(e),s=new kS(e);return t.register("authEvent",o=>(ye(o==null?void 0:o.authEvent,e,"invalid-auth-event"),{status:s.onEvent(o.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:s},this.iframes[e._key()]=t,s}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Sd,{type:Sd},o=>{var l;const h=(l=o==null?void 0:o[0])===null||l===void 0?void 0:l[Sd];h!==void 0&&t(!!h),tr(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=VS(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Gy()||By()||wf()}}const iA=rA;var i_="@firebase/auth",s_="1.10.8";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sA{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(s=>{e((s==null?void 0:s.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){ye(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oA(r){switch(r){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function aA(r){Ss(new bi("auth",(e,{options:t})=>{const s=e.getProvider("app").getImmediate(),o=e.getProvider("heartbeat"),l=e.getProvider("app-check-internal"),{apiKey:h,authDomain:f}=s.options;ye(h&&!h.includes(":"),"invalid-api-key",{appName:s.name});const g={apiKey:h,authDomain:f,clientPlatform:r,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Ky(r)},y=new AI(s,o,l,g);return LI(y,t),y},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,s)=>{e.getProvider("auth-internal").initialize()})),Ss(new bi("auth-internal",e=>{const t=jo(e.getProvider("auth").getImmediate());return(s=>new sA(s))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),vr(i_,s_,oA(r)),vr(i_,s_,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lA=300,uA=Ay("authIdTokenMaxAge")||lA;let o_=null;const cA=r=>async e=>{const t=e&&await e.getIdTokenResult(),s=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(s&&s>uA)return;const o=t==null?void 0:t.token;o_!==o&&(o_=o,await fetch(r,{method:o?"POST":"DELETE",headers:o?{Authorization:`Bearer ${o}`}:{}}))};function hA(r=gf()){const e=vc(r,"auth");if(e.isInitialized())return e.getImmediate();const t=VI(r,{popupRedirectResolver:iA,persistence:[mS,rS,iv]}),s=Ay("authTokenSyncURL");if(s&&typeof isSecureContext=="boolean"&&isSecureContext){const l=new URL(s,location.origin);if(location.origin===l.origin){const h=cA(l.toString());JI(t,h,()=>h(t.currentUser)),YI(t,f=>h(f))}}const o=Ty("auth");return o&&bI(t,`http://${o}`),t}function dA(){var r,e;return(e=(r=document.getElementsByTagName("head"))===null||r===void 0?void 0:r[0])!==null&&e!==void 0?e:document}RI({loadJS(r){return new Promise((e,t)=>{const s=document.createElement("script");s.setAttribute("src",r),s.onload=e,s.onerror=o=>{const l=Er("internal-error");l.customData=o,t(l)},s.type="text/javascript",s.charset="UTF-8",dA().appendChild(s)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});aA("Browser");var a_=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var xi,hv;(function(){var r;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(N,T){function C(){}C.prototype=T.prototype,N.D=T.prototype,N.prototype=new C,N.prototype.constructor=N,N.C=function(k,O,V){for(var S=Array(arguments.length-2),nt=2;nt<arguments.length;nt++)S[nt-2]=arguments[nt];return T.prototype[O].apply(k,S)}}function t(){this.blockSize=-1}function s(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(s,t),s.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function o(N,T,C){C||(C=0);var k=Array(16);if(typeof T=="string")for(var O=0;16>O;++O)k[O]=T.charCodeAt(C++)|T.charCodeAt(C++)<<8|T.charCodeAt(C++)<<16|T.charCodeAt(C++)<<24;else for(O=0;16>O;++O)k[O]=T[C++]|T[C++]<<8|T[C++]<<16|T[C++]<<24;T=N.g[0],C=N.g[1],O=N.g[2];var V=N.g[3],S=T+(V^C&(O^V))+k[0]+3614090360&4294967295;T=C+(S<<7&4294967295|S>>>25),S=V+(O^T&(C^O))+k[1]+3905402710&4294967295,V=T+(S<<12&4294967295|S>>>20),S=O+(C^V&(T^C))+k[2]+606105819&4294967295,O=V+(S<<17&4294967295|S>>>15),S=C+(T^O&(V^T))+k[3]+3250441966&4294967295,C=O+(S<<22&4294967295|S>>>10),S=T+(V^C&(O^V))+k[4]+4118548399&4294967295,T=C+(S<<7&4294967295|S>>>25),S=V+(O^T&(C^O))+k[5]+1200080426&4294967295,V=T+(S<<12&4294967295|S>>>20),S=O+(C^V&(T^C))+k[6]+2821735955&4294967295,O=V+(S<<17&4294967295|S>>>15),S=C+(T^O&(V^T))+k[7]+4249261313&4294967295,C=O+(S<<22&4294967295|S>>>10),S=T+(V^C&(O^V))+k[8]+1770035416&4294967295,T=C+(S<<7&4294967295|S>>>25),S=V+(O^T&(C^O))+k[9]+2336552879&4294967295,V=T+(S<<12&4294967295|S>>>20),S=O+(C^V&(T^C))+k[10]+4294925233&4294967295,O=V+(S<<17&4294967295|S>>>15),S=C+(T^O&(V^T))+k[11]+2304563134&4294967295,C=O+(S<<22&4294967295|S>>>10),S=T+(V^C&(O^V))+k[12]+1804603682&4294967295,T=C+(S<<7&4294967295|S>>>25),S=V+(O^T&(C^O))+k[13]+4254626195&4294967295,V=T+(S<<12&4294967295|S>>>20),S=O+(C^V&(T^C))+k[14]+2792965006&4294967295,O=V+(S<<17&4294967295|S>>>15),S=C+(T^O&(V^T))+k[15]+1236535329&4294967295,C=O+(S<<22&4294967295|S>>>10),S=T+(O^V&(C^O))+k[1]+4129170786&4294967295,T=C+(S<<5&4294967295|S>>>27),S=V+(C^O&(T^C))+k[6]+3225465664&4294967295,V=T+(S<<9&4294967295|S>>>23),S=O+(T^C&(V^T))+k[11]+643717713&4294967295,O=V+(S<<14&4294967295|S>>>18),S=C+(V^T&(O^V))+k[0]+3921069994&4294967295,C=O+(S<<20&4294967295|S>>>12),S=T+(O^V&(C^O))+k[5]+3593408605&4294967295,T=C+(S<<5&4294967295|S>>>27),S=V+(C^O&(T^C))+k[10]+38016083&4294967295,V=T+(S<<9&4294967295|S>>>23),S=O+(T^C&(V^T))+k[15]+3634488961&4294967295,O=V+(S<<14&4294967295|S>>>18),S=C+(V^T&(O^V))+k[4]+3889429448&4294967295,C=O+(S<<20&4294967295|S>>>12),S=T+(O^V&(C^O))+k[9]+568446438&4294967295,T=C+(S<<5&4294967295|S>>>27),S=V+(C^O&(T^C))+k[14]+3275163606&4294967295,V=T+(S<<9&4294967295|S>>>23),S=O+(T^C&(V^T))+k[3]+4107603335&4294967295,O=V+(S<<14&4294967295|S>>>18),S=C+(V^T&(O^V))+k[8]+1163531501&4294967295,C=O+(S<<20&4294967295|S>>>12),S=T+(O^V&(C^O))+k[13]+2850285829&4294967295,T=C+(S<<5&4294967295|S>>>27),S=V+(C^O&(T^C))+k[2]+4243563512&4294967295,V=T+(S<<9&4294967295|S>>>23),S=O+(T^C&(V^T))+k[7]+1735328473&4294967295,O=V+(S<<14&4294967295|S>>>18),S=C+(V^T&(O^V))+k[12]+2368359562&4294967295,C=O+(S<<20&4294967295|S>>>12),S=T+(C^O^V)+k[5]+4294588738&4294967295,T=C+(S<<4&4294967295|S>>>28),S=V+(T^C^O)+k[8]+2272392833&4294967295,V=T+(S<<11&4294967295|S>>>21),S=O+(V^T^C)+k[11]+1839030562&4294967295,O=V+(S<<16&4294967295|S>>>16),S=C+(O^V^T)+k[14]+4259657740&4294967295,C=O+(S<<23&4294967295|S>>>9),S=T+(C^O^V)+k[1]+2763975236&4294967295,T=C+(S<<4&4294967295|S>>>28),S=V+(T^C^O)+k[4]+1272893353&4294967295,V=T+(S<<11&4294967295|S>>>21),S=O+(V^T^C)+k[7]+4139469664&4294967295,O=V+(S<<16&4294967295|S>>>16),S=C+(O^V^T)+k[10]+3200236656&4294967295,C=O+(S<<23&4294967295|S>>>9),S=T+(C^O^V)+k[13]+681279174&4294967295,T=C+(S<<4&4294967295|S>>>28),S=V+(T^C^O)+k[0]+3936430074&4294967295,V=T+(S<<11&4294967295|S>>>21),S=O+(V^T^C)+k[3]+3572445317&4294967295,O=V+(S<<16&4294967295|S>>>16),S=C+(O^V^T)+k[6]+76029189&4294967295,C=O+(S<<23&4294967295|S>>>9),S=T+(C^O^V)+k[9]+3654602809&4294967295,T=C+(S<<4&4294967295|S>>>28),S=V+(T^C^O)+k[12]+3873151461&4294967295,V=T+(S<<11&4294967295|S>>>21),S=O+(V^T^C)+k[15]+530742520&4294967295,O=V+(S<<16&4294967295|S>>>16),S=C+(O^V^T)+k[2]+3299628645&4294967295,C=O+(S<<23&4294967295|S>>>9),S=T+(O^(C|~V))+k[0]+4096336452&4294967295,T=C+(S<<6&4294967295|S>>>26),S=V+(C^(T|~O))+k[7]+1126891415&4294967295,V=T+(S<<10&4294967295|S>>>22),S=O+(T^(V|~C))+k[14]+2878612391&4294967295,O=V+(S<<15&4294967295|S>>>17),S=C+(V^(O|~T))+k[5]+4237533241&4294967295,C=O+(S<<21&4294967295|S>>>11),S=T+(O^(C|~V))+k[12]+1700485571&4294967295,T=C+(S<<6&4294967295|S>>>26),S=V+(C^(T|~O))+k[3]+2399980690&4294967295,V=T+(S<<10&4294967295|S>>>22),S=O+(T^(V|~C))+k[10]+4293915773&4294967295,O=V+(S<<15&4294967295|S>>>17),S=C+(V^(O|~T))+k[1]+2240044497&4294967295,C=O+(S<<21&4294967295|S>>>11),S=T+(O^(C|~V))+k[8]+1873313359&4294967295,T=C+(S<<6&4294967295|S>>>26),S=V+(C^(T|~O))+k[15]+4264355552&4294967295,V=T+(S<<10&4294967295|S>>>22),S=O+(T^(V|~C))+k[6]+2734768916&4294967295,O=V+(S<<15&4294967295|S>>>17),S=C+(V^(O|~T))+k[13]+1309151649&4294967295,C=O+(S<<21&4294967295|S>>>11),S=T+(O^(C|~V))+k[4]+4149444226&4294967295,T=C+(S<<6&4294967295|S>>>26),S=V+(C^(T|~O))+k[11]+3174756917&4294967295,V=T+(S<<10&4294967295|S>>>22),S=O+(T^(V|~C))+k[2]+718787259&4294967295,O=V+(S<<15&4294967295|S>>>17),S=C+(V^(O|~T))+k[9]+3951481745&4294967295,N.g[0]=N.g[0]+T&4294967295,N.g[1]=N.g[1]+(O+(S<<21&4294967295|S>>>11))&4294967295,N.g[2]=N.g[2]+O&4294967295,N.g[3]=N.g[3]+V&4294967295}s.prototype.u=function(N,T){T===void 0&&(T=N.length);for(var C=T-this.blockSize,k=this.B,O=this.h,V=0;V<T;){if(O==0)for(;V<=C;)o(this,N,V),V+=this.blockSize;if(typeof N=="string"){for(;V<T;)if(k[O++]=N.charCodeAt(V++),O==this.blockSize){o(this,k),O=0;break}}else for(;V<T;)if(k[O++]=N[V++],O==this.blockSize){o(this,k),O=0;break}}this.h=O,this.o+=T},s.prototype.v=function(){var N=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);N[0]=128;for(var T=1;T<N.length-8;++T)N[T]=0;var C=8*this.o;for(T=N.length-8;T<N.length;++T)N[T]=C&255,C/=256;for(this.u(N),N=Array(16),T=C=0;4>T;++T)for(var k=0;32>k;k+=8)N[C++]=this.g[T]>>>k&255;return N};function l(N,T){var C=f;return Object.prototype.hasOwnProperty.call(C,N)?C[N]:C[N]=T(N)}function h(N,T){this.h=T;for(var C=[],k=!0,O=N.length-1;0<=O;O--){var V=N[O]|0;k&&V==T||(C[O]=V,k=!1)}this.g=C}var f={};function g(N){return-128<=N&&128>N?l(N,function(T){return new h([T|0],0>T?-1:0)}):new h([N|0],0>N?-1:0)}function y(N){if(isNaN(N)||!isFinite(N))return A;if(0>N)return z(y(-N));for(var T=[],C=1,k=0;N>=C;k++)T[k]=N/C|0,C*=4294967296;return new h(T,0)}function w(N,T){if(N.length==0)throw Error("number format error: empty string");if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(N.charAt(0)=="-")return z(w(N.substring(1),T));if(0<=N.indexOf("-"))throw Error('number format error: interior "-" character');for(var C=y(Math.pow(T,8)),k=A,O=0;O<N.length;O+=8){var V=Math.min(8,N.length-O),S=parseInt(N.substring(O,O+V),T);8>V?(V=y(Math.pow(T,V)),k=k.j(V).add(y(S))):(k=k.j(C),k=k.add(y(S)))}return k}var A=g(0),R=g(1),F=g(16777216);r=h.prototype,r.m=function(){if(K(this))return-z(this).m();for(var N=0,T=1,C=0;C<this.g.length;C++){var k=this.i(C);N+=(0<=k?k:4294967296+k)*T,T*=4294967296}return N},r.toString=function(N){if(N=N||10,2>N||36<N)throw Error("radix out of range: "+N);if(B(this))return"0";if(K(this))return"-"+z(this).toString(N);for(var T=y(Math.pow(N,6)),C=this,k="";;){var O=de(C,T).g;C=pe(C,O.j(T));var V=((0<C.g.length?C.g[0]:C.h)>>>0).toString(N);if(C=O,B(C))return V+k;for(;6>V.length;)V="0"+V;k=V+k}},r.i=function(N){return 0>N?0:N<this.g.length?this.g[N]:this.h};function B(N){if(N.h!=0)return!1;for(var T=0;T<N.g.length;T++)if(N.g[T]!=0)return!1;return!0}function K(N){return N.h==-1}r.l=function(N){return N=pe(this,N),K(N)?-1:B(N)?0:1};function z(N){for(var T=N.g.length,C=[],k=0;k<T;k++)C[k]=~N.g[k];return new h(C,~N.h).add(R)}r.abs=function(){return K(this)?z(this):this},r.add=function(N){for(var T=Math.max(this.g.length,N.g.length),C=[],k=0,O=0;O<=T;O++){var V=k+(this.i(O)&65535)+(N.i(O)&65535),S=(V>>>16)+(this.i(O)>>>16)+(N.i(O)>>>16);k=S>>>16,V&=65535,S&=65535,C[O]=S<<16|V}return new h(C,C[C.length-1]&-2147483648?-1:0)};function pe(N,T){return N.add(z(T))}r.j=function(N){if(B(this)||B(N))return A;if(K(this))return K(N)?z(this).j(z(N)):z(z(this).j(N));if(K(N))return z(this.j(z(N)));if(0>this.l(F)&&0>N.l(F))return y(this.m()*N.m());for(var T=this.g.length+N.g.length,C=[],k=0;k<2*T;k++)C[k]=0;for(k=0;k<this.g.length;k++)for(var O=0;O<N.g.length;O++){var V=this.i(k)>>>16,S=this.i(k)&65535,nt=N.i(O)>>>16,yt=N.i(O)&65535;C[2*k+2*O]+=S*yt,ae(C,2*k+2*O),C[2*k+2*O+1]+=V*yt,ae(C,2*k+2*O+1),C[2*k+2*O+1]+=S*nt,ae(C,2*k+2*O+1),C[2*k+2*O+2]+=V*nt,ae(C,2*k+2*O+2)}for(k=0;k<T;k++)C[k]=C[2*k+1]<<16|C[2*k];for(k=T;k<2*T;k++)C[k]=0;return new h(C,0)};function ae(N,T){for(;(N[T]&65535)!=N[T];)N[T+1]+=N[T]>>>16,N[T]&=65535,T++}function le(N,T){this.g=N,this.h=T}function de(N,T){if(B(T))throw Error("division by zero");if(B(N))return new le(A,A);if(K(N))return T=de(z(N),T),new le(z(T.g),z(T.h));if(K(T))return T=de(N,z(T)),new le(z(T.g),T.h);if(30<N.g.length){if(K(N)||K(T))throw Error("slowDivide_ only works with positive integers.");for(var C=R,k=T;0>=k.l(N);)C=je(C),k=je(k);var O=we(C,1),V=we(k,1);for(k=we(k,2),C=we(C,2);!B(k);){var S=V.add(k);0>=S.l(N)&&(O=O.add(C),V=S),k=we(k,1),C=we(C,1)}return T=pe(N,O.j(T)),new le(O,T)}for(O=A;0<=N.l(T);){for(C=Math.max(1,Math.floor(N.m()/T.m())),k=Math.ceil(Math.log(C)/Math.LN2),k=48>=k?1:Math.pow(2,k-48),V=y(C),S=V.j(T);K(S)||0<S.l(N);)C-=k,V=y(C),S=V.j(T);B(V)&&(V=R),O=O.add(V),N=pe(N,S)}return new le(O,N)}r.A=function(N){return de(this,N).h},r.and=function(N){for(var T=Math.max(this.g.length,N.g.length),C=[],k=0;k<T;k++)C[k]=this.i(k)&N.i(k);return new h(C,this.h&N.h)},r.or=function(N){for(var T=Math.max(this.g.length,N.g.length),C=[],k=0;k<T;k++)C[k]=this.i(k)|N.i(k);return new h(C,this.h|N.h)},r.xor=function(N){for(var T=Math.max(this.g.length,N.g.length),C=[],k=0;k<T;k++)C[k]=this.i(k)^N.i(k);return new h(C,this.h^N.h)};function je(N){for(var T=N.g.length+1,C=[],k=0;k<T;k++)C[k]=N.i(k)<<1|N.i(k-1)>>>31;return new h(C,N.h)}function we(N,T){var C=T>>5;T%=32;for(var k=N.g.length-C,O=[],V=0;V<k;V++)O[V]=0<T?N.i(V+C)>>>T|N.i(V+C+1)<<32-T:N.i(V+C);return new h(O,N.h)}s.prototype.digest=s.prototype.v,s.prototype.reset=s.prototype.s,s.prototype.update=s.prototype.u,hv=s,h.prototype.add=h.prototype.add,h.prototype.multiply=h.prototype.j,h.prototype.modulo=h.prototype.A,h.prototype.compare=h.prototype.l,h.prototype.toNumber=h.prototype.m,h.prototype.toString=h.prototype.toString,h.prototype.getBits=h.prototype.i,h.fromNumber=y,h.fromString=w,xi=h}).apply(typeof a_<"u"?a_:typeof self<"u"?self:typeof window<"u"?window:{});var bu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var dv,ja,fv,Ku,qd,pv,mv,gv;(function(){var r,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(u,p,_){return u==Array.prototype||u==Object.prototype||(u[p]=_.value),u};function t(u){u=[typeof globalThis=="object"&&globalThis,u,typeof window=="object"&&window,typeof self=="object"&&self,typeof bu=="object"&&bu];for(var p=0;p<u.length;++p){var _=u[p];if(_&&_.Math==Math)return _}throw Error("Cannot find global object")}var s=t(this);function o(u,p){if(p)e:{var _=s;u=u.split(".");for(var E=0;E<u.length-1;E++){var L=u[E];if(!(L in _))break e;_=_[L]}u=u[u.length-1],E=_[u],p=p(E),p!=E&&p!=null&&e(_,u,{configurable:!0,writable:!0,value:p})}}function l(u,p){u instanceof String&&(u+="");var _=0,E=!1,L={next:function(){if(!E&&_<u.length){var j=_++;return{value:p(j,u[j]),done:!1}}return E=!0,{done:!0,value:void 0}}};return L[Symbol.iterator]=function(){return L},L}o("Array.prototype.values",function(u){return u||function(){return l(this,function(p,_){return _})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var h=h||{},f=this||self;function g(u){var p=typeof u;return p=p!="object"?p:u?Array.isArray(u)?"array":p:"null",p=="array"||p=="object"&&typeof u.length=="number"}function y(u){var p=typeof u;return p=="object"&&u!=null||p=="function"}function w(u,p,_){return u.call.apply(u.bind,arguments)}function A(u,p,_){if(!u)throw Error();if(2<arguments.length){var E=Array.prototype.slice.call(arguments,2);return function(){var L=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(L,E),u.apply(p,L)}}return function(){return u.apply(p,arguments)}}function R(u,p,_){return R=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?w:A,R.apply(null,arguments)}function F(u,p){var _=Array.prototype.slice.call(arguments,1);return function(){var E=_.slice();return E.push.apply(E,arguments),u.apply(this,E)}}function B(u,p){function _(){}_.prototype=p.prototype,u.aa=p.prototype,u.prototype=new _,u.prototype.constructor=u,u.Qb=function(E,L,j){for(var Z=Array(arguments.length-2),He=2;He<arguments.length;He++)Z[He-2]=arguments[He];return p.prototype[L].apply(E,Z)}}function K(u){const p=u.length;if(0<p){const _=Array(p);for(let E=0;E<p;E++)_[E]=u[E];return _}return[]}function z(u,p){for(let _=1;_<arguments.length;_++){const E=arguments[_];if(g(E)){const L=u.length||0,j=E.length||0;u.length=L+j;for(let Z=0;Z<j;Z++)u[L+Z]=E[Z]}else u.push(E)}}class pe{constructor(p,_){this.i=p,this.j=_,this.h=0,this.g=null}get(){let p;return 0<this.h?(this.h--,p=this.g,this.g=p.next,p.next=null):p=this.i(),p}}function ae(u){return/^[\s\xa0]*$/.test(u)}function le(){var u=f.navigator;return u&&(u=u.userAgent)?u:""}function de(u){return de[" "](u),u}de[" "]=function(){};var je=le().indexOf("Gecko")!=-1&&!(le().toLowerCase().indexOf("webkit")!=-1&&le().indexOf("Edge")==-1)&&!(le().indexOf("Trident")!=-1||le().indexOf("MSIE")!=-1)&&le().indexOf("Edge")==-1;function we(u,p,_){for(const E in u)p.call(_,u[E],E,u)}function N(u,p){for(const _ in u)p.call(void 0,u[_],_,u)}function T(u){const p={};for(const _ in u)p[_]=u[_];return p}const C="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function k(u,p){let _,E;for(let L=1;L<arguments.length;L++){E=arguments[L];for(_ in E)u[_]=E[_];for(let j=0;j<C.length;j++)_=C[j],Object.prototype.hasOwnProperty.call(E,_)&&(u[_]=E[_])}}function O(u){var p=1;u=u.split(":");const _=[];for(;0<p&&u.length;)_.push(u.shift()),p--;return u.length&&_.push(u.join(":")),_}function V(u){f.setTimeout(()=>{throw u},0)}function S(){var u=fe;let p=null;return u.g&&(p=u.g,u.g=u.g.next,u.g||(u.h=null),p.next=null),p}class nt{constructor(){this.h=this.g=null}add(p,_){const E=yt.get();E.set(p,_),this.h?this.h.next=E:this.g=E,this.h=E}}var yt=new pe(()=>new Ye,u=>u.reset());class Ye{constructor(){this.next=this.g=this.h=null}set(p,_){this.h=p,this.g=_,this.next=null}reset(){this.next=this.g=this.h=null}}let Ne,ee=!1,fe=new nt,te=()=>{const u=f.Promise.resolve(void 0);Ne=()=>{u.then(x)}};var x=()=>{for(var u;u=S();){try{u.h.call(u.g)}catch(_){V(_)}var p=yt;p.j(u),100>p.h&&(p.h++,u.next=p.g,p.g=u)}ee=!1};function H(){this.s=this.s,this.C=this.C}H.prototype.s=!1,H.prototype.ma=function(){this.s||(this.s=!0,this.N())},H.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function ce(u,p){this.type=u,this.g=this.target=p,this.defaultPrevented=!1}ce.prototype.h=function(){this.defaultPrevented=!0};var Ie=(function(){if(!f.addEventListener||!Object.defineProperty)return!1;var u=!1,p=Object.defineProperty({},"passive",{get:function(){u=!0}});try{const _=()=>{};f.addEventListener("test",_,p),f.removeEventListener("test",_,p)}catch{}return u})();function Re(u,p){if(ce.call(this,u?u.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,u){var _=this.type=u.type,E=u.changedTouches&&u.changedTouches.length?u.changedTouches[0]:null;if(this.target=u.target||u.srcElement,this.g=p,p=u.relatedTarget){if(je){e:{try{de(p.nodeName);var L=!0;break e}catch{}L=!1}L||(p=null)}}else _=="mouseover"?p=u.fromElement:_=="mouseout"&&(p=u.toElement);this.relatedTarget=p,E?(this.clientX=E.clientX!==void 0?E.clientX:E.pageX,this.clientY=E.clientY!==void 0?E.clientY:E.pageY,this.screenX=E.screenX||0,this.screenY=E.screenY||0):(this.clientX=u.clientX!==void 0?u.clientX:u.pageX,this.clientY=u.clientY!==void 0?u.clientY:u.pageY,this.screenX=u.screenX||0,this.screenY=u.screenY||0),this.button=u.button,this.key=u.key||"",this.ctrlKey=u.ctrlKey,this.altKey=u.altKey,this.shiftKey=u.shiftKey,this.metaKey=u.metaKey,this.pointerId=u.pointerId||0,this.pointerType=typeof u.pointerType=="string"?u.pointerType:ke[u.pointerType]||"",this.state=u.state,this.i=u,u.defaultPrevented&&Re.aa.h.call(this)}}B(Re,ce);var ke={2:"touch",3:"pen",4:"mouse"};Re.prototype.h=function(){Re.aa.h.call(this);var u=this.i;u.preventDefault?u.preventDefault():u.returnValue=!1};var Ue="closure_listenable_"+(1e6*Math.random()|0),Le=0;function qe(u,p,_,E,L){this.listener=u,this.proxy=null,this.src=p,this.type=_,this.capture=!!E,this.ha=L,this.key=++Le,this.da=this.fa=!1}function ft(u){u.da=!0,u.listener=null,u.proxy=null,u.src=null,u.ha=null}function xn(u){this.src=u,this.g={},this.h=0}xn.prototype.add=function(u,p,_,E,L){var j=u.toString();u=this.g[j],u||(u=this.g[j]=[],this.h++);var Z=rr(u,p,E,L);return-1<Z?(p=u[Z],_||(p.fa=!1)):(p=new qe(p,this.src,j,!!E,L),p.fa=_,u.push(p)),p};function Pr(u,p){var _=p.type;if(_ in u.g){var E=u.g[_],L=Array.prototype.indexOf.call(E,p,void 0),j;(j=0<=L)&&Array.prototype.splice.call(E,L,1),j&&(ft(p),u.g[_].length==0&&(delete u.g[_],u.h--))}}function rr(u,p,_,E){for(var L=0;L<u.length;++L){var j=u[L];if(!j.da&&j.listener==p&&j.capture==!!_&&j.ha==E)return L}return-1}var Vn="closure_lm_"+(1e6*Math.random()|0),Ln={};function kr(u,p,_,E,L){if(Array.isArray(p)){for(var j=0;j<p.length;j++)kr(u,p[j],_,E,L);return null}return _=Mn(_),u&&u[Ue]?u.K(p,_,y(E)?!!E.capture:!1,L):Nr(u,p,_,!1,E,L)}function Nr(u,p,_,E,L,j){if(!p)throw Error("Invalid event type");var Z=y(L)?!!L.capture:!!L,He=ut(u);if(He||(u[Vn]=He=new xn(u)),_=He.add(p,_,E,Z,j),_.proxy)return _;if(E=Jr(),_.proxy=E,E.src=u,E.listener=_,u.addEventListener)Ie||(L=Z),L===void 0&&(L=!1),u.addEventListener(p.toString(),E,L);else if(u.attachEvent)u.attachEvent(Ae(p.toString()),E);else if(u.addListener&&u.removeListener)u.addListener(E);else throw Error("addEventListener and attachEvent are unavailable.");return _}function Jr(){function u(_){return p.call(u.src,u.listener,_)}const p=xe;return u}function bn(u,p,_,E,L){if(Array.isArray(p))for(var j=0;j<p.length;j++)bn(u,p[j],_,E,L);else E=y(E)?!!E.capture:!!E,_=Mn(_),u&&u[Ue]?(u=u.i,p=String(p).toString(),p in u.g&&(j=u.g[p],_=rr(j,_,E,L),-1<_&&(ft(j[_]),Array.prototype.splice.call(j,_,1),j.length==0&&(delete u.g[p],u.h--)))):u&&(u=ut(u))&&(p=u.g[p.toString()],u=-1,p&&(u=rr(p,_,E,L)),(_=-1<u?p[u]:null)&&W(_))}function W(u){if(typeof u!="number"&&u&&!u.da){var p=u.src;if(p&&p[Ue])Pr(p.i,u);else{var _=u.type,E=u.proxy;p.removeEventListener?p.removeEventListener(_,E,u.capture):p.detachEvent?p.detachEvent(Ae(_),E):p.addListener&&p.removeListener&&p.removeListener(E),(_=ut(p))?(Pr(_,u),_.h==0&&(_.src=null,p[Vn]=null)):ft(u)}}}function Ae(u){return u in Ln?Ln[u]:Ln[u]="on"+u}function xe(u,p){if(u.da)u=!0;else{p=new Re(p,this);var _=u.listener,E=u.ha||u.src;u.fa&&W(u),u=_.call(E,p)}return u}function ut(u){return u=u[Vn],u instanceof xn?u:null}var Je="__closure_events_fn_"+(1e9*Math.random()>>>0);function Mn(u){return typeof u=="function"?u:(u[Je]||(u[Je]=function(p){return u.handleEvent(p)}),u[Je])}function $e(){H.call(this),this.i=new xn(this),this.M=this,this.F=null}B($e,H),$e.prototype[Ue]=!0,$e.prototype.removeEventListener=function(u,p,_,E){bn(this,u,p,_,E)};function pt(u,p){var _,E=u.F;if(E)for(_=[];E;E=E.F)_.push(E);if(u=u.M,E=p.type||p,typeof p=="string")p=new ce(p,u);else if(p instanceof ce)p.target=p.target||u;else{var L=p;p=new ce(E,u),k(p,L)}if(L=!0,_)for(var j=_.length-1;0<=j;j--){var Z=p.g=_[j];L=En(Z,E,!0,p)&&L}if(Z=p.g=u,L=En(Z,E,!0,p)&&L,L=En(Z,E,!1,p)&&L,_)for(j=0;j<_.length;j++)Z=p.g=_[j],L=En(Z,E,!1,p)&&L}$e.prototype.N=function(){if($e.aa.N.call(this),this.i){var u=this.i,p;for(p in u.g){for(var _=u.g[p],E=0;E<_.length;E++)ft(_[E]);delete u.g[p],u.h--}}this.F=null},$e.prototype.K=function(u,p,_,E){return this.i.add(String(u),p,!1,_,E)},$e.prototype.L=function(u,p,_,E){return this.i.add(String(u),p,!0,_,E)};function En(u,p,_,E){if(p=u.i.g[String(p)],!p)return!0;p=p.concat();for(var L=!0,j=0;j<p.length;++j){var Z=p[j];if(Z&&!Z.da&&Z.capture==_){var He=Z.listener,St=Z.ha||Z.src;Z.fa&&Pr(u.i,Z),L=He.call(St,E)!==!1&&L}}return L&&!E.defaultPrevented}function Zr(u,p,_){if(typeof u=="function")_&&(u=R(u,_));else if(u&&typeof u.handleEvent=="function")u=R(u.handleEvent,u);else throw Error("Invalid listener argument");return 2147483647<Number(p)?-1:f.setTimeout(u,p||0)}function ir(u){u.g=Zr(()=>{u.g=null,u.i&&(u.i=!1,ir(u))},u.l);const p=u.h;u.h=null,u.m.apply(null,p)}class sr extends H{constructor(p,_){super(),this.m=p,this.l=_,this.h=null,this.i=!1,this.g=null}j(p){this.h=arguments,this.g?this.i=!0:ir(this)}N(){super.N(),this.g&&(f.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Dr(u){H.call(this),this.h=u,this.g={}}B(Dr,H);var Go=[];function Ko(u){we(u.g,function(p,_){this.g.hasOwnProperty(_)&&W(p)},u),u.g={}}Dr.prototype.N=function(){Dr.aa.N.call(this),Ko(this)},Dr.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Qo=f.JSON.stringify,Xo=f.JSON.parse,Yo=class{stringify(u){return f.JSON.stringify(u,void 0)}parse(u){return f.JSON.parse(u,void 0)}};function Ki(){}Ki.prototype.h=null;function Ls(u){return u.h||(u.h=u.i())}function bs(){}var wn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function or(){ce.call(this,"d")}B(or,ce);function Ms(){ce.call(this,"c")}B(Ms,ce);var ar={},Jo=null;function Qi(){return Jo=Jo||new $e}ar.La="serverreachability";function Zo(u){ce.call(this,ar.La,u)}B(Zo,ce);function Or(u){const p=Qi();pt(p,new Zo(p))}ar.STAT_EVENT="statevent";function ea(u,p){ce.call(this,ar.STAT_EVENT,u),this.stat=p}B(ea,ce);function mt(u){const p=Qi();pt(p,new ea(p,u))}ar.Ma="timingevent";function Us(u,p){ce.call(this,ar.Ma,u),this.size=p}B(Us,ce);function Un(u,p){if(typeof u!="function")throw Error("Fn must not be null and must be a function");return f.setTimeout(function(){u()},p)}function Xi(){this.g=!0}Xi.prototype.xa=function(){this.g=!1};function Yi(u,p,_,E,L,j){u.info(function(){if(u.g)if(j)for(var Z="",He=j.split("&"),St=0;St<He.length;St++){var be=He[St].split("=");if(1<be.length){var kt=be[0];be=be[1];var vt=kt.split("_");Z=2<=vt.length&&vt[1]=="type"?Z+(kt+"="+be+"&"):Z+(kt+"=redacted&")}}else Z=null;else Z=j;return"XMLHTTP REQ ("+E+") [attempt "+L+"]: "+p+`
`+_+`
`+Z})}function Fs(u,p,_,E,L,j,Z){u.info(function(){return"XMLHTTP RESP ("+E+") [ attempt "+L+"]: "+p+`
`+_+`
`+j+" "+Z})}function Fn(u,p,_,E){u.info(function(){return"XMLHTTP TEXT ("+p+"): "+Bc(u,_)+(E?" "+E:"")})}function ta(u,p){u.info(function(){return"TIMEOUT: "+p})}Xi.prototype.info=function(){};function Bc(u,p){if(!u.g)return p;if(!p)return null;try{var _=JSON.parse(p);if(_){for(u=0;u<_.length;u++)if(Array.isArray(_[u])){var E=_[u];if(!(2>E.length)){var L=E[1];if(Array.isArray(L)&&!(1>L.length)){var j=L[0];if(j!="noop"&&j!="stop"&&j!="close")for(var Z=1;Z<L.length;Z++)L[Z]=""}}}}return Qo(_)}catch{return p}}var js={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},El={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},jn;function Ji(){}B(Ji,Ki),Ji.prototype.g=function(){return new XMLHttpRequest},Ji.prototype.i=function(){return{}},jn=new Ji;function Bn(u,p,_,E){this.j=u,this.i=p,this.l=_,this.R=E||1,this.U=new Dr(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new wl}function wl(){this.i=null,this.g="",this.h=!1}var na={},Bs={};function zs(u,p,_){u.L=1,u.v=ii(dn(p)),u.m=_,u.P=!0,ra(u,null)}function ra(u,p){u.F=Date.now(),Ke(u),u.A=dn(u.v);var _=u.A,E=u.R;Array.isArray(E)||(E=[String(E)]),oi(_.i,"t",E),u.C=0,_=u.j.J,u.h=new wl,u.g=Fl(u.j,_?p:null,!u.m),0<u.O&&(u.M=new sr(R(u.Y,u,u.g),u.O)),p=u.U,_=u.g,E=u.ca;var L="readystatechange";Array.isArray(L)||(L&&(Go[0]=L.toString()),L=Go);for(var j=0;j<L.length;j++){var Z=kr(_,L[j],E||p.handleEvent,!1,p.h||p);if(!Z)break;p.g[Z.key]=Z}p=u.H?T(u.H):{},u.m?(u.u||(u.u="POST"),p["Content-Type"]="application/x-www-form-urlencoded",u.g.ea(u.A,u.u,u.m,p)):(u.u="GET",u.g.ea(u.A,u.u,null,p)),Or(),Yi(u.i,u.u,u.A,u.l,u.R,u.m)}Bn.prototype.ca=function(u){u=u.target;const p=this.M;p&&tn(u)==3?p.j():this.Y(u)},Bn.prototype.Y=function(u){try{if(u==this.g)e:{const vt=tn(this.g);var p=this.g.Ba();const Sn=this.g.Z();if(!(3>vt)&&(vt!=3||this.g&&(this.h.h||this.g.oa()||ua(this.g)))){this.J||vt!=4||p==7||(p==8||0>=Sn?Or(3):Or(2)),Zi(this);var _=this.g.Z();this.X=_;t:if(Tl(this)){var E=ua(this.g);u="";var L=E.length,j=tn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Tn(this),ei(this);var Z="";break t}this.h.i=new f.TextDecoder}for(p=0;p<L;p++)this.h.h=!0,u+=this.h.i.decode(E[p],{stream:!(j&&p==L-1)});E.length=0,this.h.g+=u,this.C=0,Z=this.h.g}else Z=this.g.oa();if(this.o=_==200,Fs(this.i,this.u,this.A,this.l,this.R,vt,_),this.o){if(this.T&&!this.K){t:{if(this.g){var He,St=this.g;if((He=St.g?St.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!ae(He)){var be=He;break t}}be=null}if(_=be)Fn(this.i,this.l,_,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,ia(this,_);else{this.o=!1,this.s=3,mt(12),Tn(this),ei(this);break e}}if(this.P){_=!0;let pn;for(;!this.J&&this.C<Z.length;)if(pn=zc(this,Z),pn==Bs){vt==4&&(this.s=4,mt(14),_=!1),Fn(this.i,this.l,null,"[Incomplete Response]");break}else if(pn==na){this.s=4,mt(15),Fn(this.i,this.l,Z,"[Invalid Chunk]"),_=!1;break}else Fn(this.i,this.l,pn,null),ia(this,pn);if(Tl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),vt!=4||Z.length!=0||this.h.h||(this.s=1,mt(16),_=!1),this.o=this.o&&_,!_)Fn(this.i,this.l,Z,"[Invalid Chunked Response]"),Tn(this),ei(this);else if(0<Z.length&&!this.W){this.W=!0;var kt=this.j;kt.g==this&&kt.ba&&!kt.M&&(kt.j.info("Great, no buffering proxy detected. Bytes received: "+Z.length),ha(kt),kt.M=!0,mt(11))}}else Fn(this.i,this.l,Z,null),ia(this,Z);vt==4&&Tn(this),this.o&&!this.J&&(vt==4?Zs(this.j,this):(this.o=!1,Ke(this)))}else Ks(this.g),_==400&&0<Z.indexOf("Unknown SID")?(this.s=3,mt(12)):(this.s=0,mt(13)),Tn(this),ei(this)}}}catch{}finally{}};function Tl(u){return u.g?u.u=="GET"&&u.L!=2&&u.j.Ca:!1}function zc(u,p){var _=u.C,E=p.indexOf(`
`,_);return E==-1?Bs:(_=Number(p.substring(_,E)),isNaN(_)?na:(E+=1,E+_>p.length?Bs:(p=p.slice(E,E+_),u.C=E+_,p)))}Bn.prototype.cancel=function(){this.J=!0,Tn(this)};function Ke(u){u.S=Date.now()+u.I,Il(u,u.I)}function Il(u,p){if(u.B!=null)throw Error("WatchDog timer not null");u.B=Un(R(u.ba,u),p)}function Zi(u){u.B&&(f.clearTimeout(u.B),u.B=null)}Bn.prototype.ba=function(){this.B=null;const u=Date.now();0<=u-this.S?(ta(this.i,this.A),this.L!=2&&(Or(),mt(17)),Tn(this),this.s=2,ei(this)):Il(this,this.S-u)};function ei(u){u.j.G==0||u.J||Zs(u.j,u)}function Tn(u){Zi(u);var p=u.M;p&&typeof p.ma=="function"&&p.ma(),u.M=null,Ko(u.U),u.g&&(p=u.g,u.g=null,p.abort(),p.ma())}function ia(u,p){try{var _=u.j;if(_.G!=0&&(_.g==u||Qt(_.h,u))){if(!u.K&&Qt(_.h,u)&&_.G==3){try{var E=_.Da.g.parse(p)}catch{E=null}if(Array.isArray(E)&&E.length==3){var L=E;if(L[0]==0){e:if(!_.u){if(_.g)if(_.g.F+3e3<u.F)Js(_),Wn(_);else break e;Ys(_),mt(18)}}else _.za=L[1],0<_.za-_.T&&37500>L[2]&&_.F&&_.v==0&&!_.C&&(_.C=Un(R(_.Za,_),6e3));if(1>=Al(_.h)&&_.ca){try{_.ca()}catch{}_.ca=void 0}}else Mr(_,11)}else if((u.K||_.g==u)&&Js(_),!ae(p))for(L=_.Da.g.parse(p),p=0;p<L.length;p++){let be=L[p];if(_.T=be[0],be=be[1],_.G==2)if(be[0]=="c"){_.K=be[1],_.ia=be[2];const kt=be[3];kt!=null&&(_.la=kt,_.j.info("VER="+_.la));const vt=be[4];vt!=null&&(_.Aa=vt,_.j.info("SVER="+_.Aa));const Sn=be[5];Sn!=null&&typeof Sn=="number"&&0<Sn&&(E=1.5*Sn,_.L=E,_.j.info("backChannelRequestTimeoutMs_="+E)),E=_;const pn=u.g;if(pn){const os=pn.g?pn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(os){var j=E.h;j.g||os.indexOf("spdy")==-1&&os.indexOf("quic")==-1&&os.indexOf("h2")==-1||(j.j=j.l,j.g=new Set,j.h&&(sa(j,j.h),j.h=null))}if(E.D){const to=pn.g?pn.g.getResponseHeader("X-HTTP-Session-Id"):null;to&&(E.ya=to,We(E.I,E.D,to))}}_.G=3,_.l&&_.l.ua(),_.ba&&(_.R=Date.now()-u.F,_.j.info("Handshake RTT: "+_.R+"ms")),E=_;var Z=u;if(E.qa=Ul(E,E.J?E.ia:null,E.W),Z.K){Rl(E.h,Z);var He=Z,St=E.L;St&&(He.I=St),He.B&&(Zi(He),Ke(He)),E.g=Z}else ss(E);0<_.i.length&&hr(_)}else be[0]!="stop"&&be[0]!="close"||Mr(_,7);else _.G==3&&(be[0]=="stop"||be[0]=="close"?be[0]=="stop"?Mr(_,7):Lt(_):be[0]!="noop"&&_.l&&_.l.ta(be),_.v=0)}}Or(4)}catch{}}var Sl=class{constructor(u,p){this.g=u,this.map=p}};function es(u){this.l=u||10,f.PerformanceNavigationTiming?(u=f.performance.getEntriesByType("navigation"),u=0<u.length&&(u[0].nextHopProtocol=="hq"||u[0].nextHopProtocol=="h2")):u=!!(f.chrome&&f.chrome.loadTimes&&f.chrome.loadTimes()&&f.chrome.loadTimes().wasFetchedViaSpdy),this.j=u?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function hn(u){return u.h?!0:u.g?u.g.size>=u.j:!1}function Al(u){return u.h?1:u.g?u.g.size:0}function Qt(u,p){return u.h?u.h==p:u.g?u.g.has(p):!1}function sa(u,p){u.g?u.g.add(p):u.h=p}function Rl(u,p){u.h&&u.h==p?u.h=null:u.g&&u.g.has(p)&&u.g.delete(p)}es.prototype.cancel=function(){if(this.i=Cl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const u of this.g.values())u.cancel();this.g.clear()}};function Cl(u){if(u.h!=null)return u.i.concat(u.h.D);if(u.g!=null&&u.g.size!==0){let p=u.i;for(const _ of u.g.values())p=p.concat(_.D);return p}return K(u.i)}function $s(u){if(u.V&&typeof u.V=="function")return u.V();if(typeof Map<"u"&&u instanceof Map||typeof Set<"u"&&u instanceof Set)return Array.from(u.values());if(typeof u=="string")return u.split("");if(g(u)){for(var p=[],_=u.length,E=0;E<_;E++)p.push(u[E]);return p}p=[],_=0;for(E in u)p[_++]=u[E];return p}function Hs(u){if(u.na&&typeof u.na=="function")return u.na();if(!u.V||typeof u.V!="function"){if(typeof Map<"u"&&u instanceof Map)return Array.from(u.keys());if(!(typeof Set<"u"&&u instanceof Set)){if(g(u)||typeof u=="string"){var p=[];u=u.length;for(var _=0;_<u;_++)p.push(_);return p}p=[],_=0;for(const E in u)p[_++]=E;return p}}}function ti(u,p){if(u.forEach&&typeof u.forEach=="function")u.forEach(p,void 0);else if(g(u)||typeof u=="string")Array.prototype.forEach.call(u,p,void 0);else for(var _=Hs(u),E=$s(u),L=E.length,j=0;j<L;j++)p.call(void 0,E[j],_&&_[j],u)}var ts=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function $c(u,p){if(u){u=u.split("&");for(var _=0;_<u.length;_++){var E=u[_].indexOf("="),L=null;if(0<=E){var j=u[_].substring(0,E);L=u[_].substring(E+1)}else j=u[_];p(j,L?decodeURIComponent(L.replace(/\+/g," ")):"")}}}function xr(u){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,u instanceof xr){this.h=u.h,ns(this,u.j),this.o=u.o,this.g=u.g,ni(this,u.s),this.l=u.l;var p=u.i,_=new lr;_.i=p.i,p.g&&(_.g=new Map(p.g),_.h=p.h),ri(this,_),this.m=u.m}else u&&(p=String(u).match(ts))?(this.h=!1,ns(this,p[1]||"",!0),this.o=Ve(p[2]||""),this.g=Ve(p[3]||"",!0),ni(this,p[4]),this.l=Ve(p[5]||"",!0),ri(this,p[6]||"",!0),this.m=Ve(p[7]||"")):(this.h=!1,this.i=new lr(null,this.h))}xr.prototype.toString=function(){var u=[],p=this.j;p&&u.push(si(p,qs,!0),":");var _=this.g;return(_||p=="file")&&(u.push("//"),(p=this.o)&&u.push(si(p,qs,!0),"@"),u.push(encodeURIComponent(String(_)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),_=this.s,_!=null&&u.push(":",String(_))),(_=this.l)&&(this.g&&_.charAt(0)!="/"&&u.push("/"),u.push(si(_,_.charAt(0)=="/"?Nl:kl,!0))),(_=this.i.toString())&&u.push("?",_),(_=this.m)&&u.push("#",si(_,oa)),u.join("")};function dn(u){return new xr(u)}function ns(u,p,_){u.j=_?Ve(p,!0):p,u.j&&(u.j=u.j.replace(/:$/,""))}function ni(u,p){if(p){if(p=Number(p),isNaN(p)||0>p)throw Error("Bad port number "+p);u.s=p}else u.s=null}function ri(u,p,_){p instanceof lr?(u.i=p,ur(u.i,u.h)):(_||(p=si(p,Dl)),u.i=new lr(p,u.h))}function We(u,p,_){u.i.set(p,_)}function ii(u){return We(u,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),u}function Ve(u,p){return u?p?decodeURI(u.replace(/%25/g,"%2525")):decodeURIComponent(u):""}function si(u,p,_){return typeof u=="string"?(u=encodeURI(u).replace(p,Pl),_&&(u=u.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),u):null}function Pl(u){return u=u.charCodeAt(0),"%"+(u>>4&15).toString(16)+(u&15).toString(16)}var qs=/[#\/\?@]/g,kl=/[#\?:]/g,Nl=/[#\?]/g,Dl=/[#\?@]/g,oa=/#/g;function lr(u,p){this.h=this.g=null,this.i=u||null,this.j=!!p}function Vt(u){u.g||(u.g=new Map,u.h=0,u.i&&$c(u.i,function(p,_){u.add(decodeURIComponent(p.replace(/\+/g," ")),_)}))}r=lr.prototype,r.add=function(u,p){Vt(this),this.i=null,u=In(this,u);var _=this.g.get(u);return _||this.g.set(u,_=[]),_.push(p),this.h+=1,this};function zn(u,p){Vt(u),p=In(u,p),u.g.has(p)&&(u.i=null,u.h-=u.g.get(p).length,u.g.delete(p))}function $n(u,p){return Vt(u),p=In(u,p),u.g.has(p)}r.forEach=function(u,p){Vt(this),this.g.forEach(function(_,E){_.forEach(function(L){u.call(p,L,E,this)},this)},this)},r.na=function(){Vt(this);const u=Array.from(this.g.values()),p=Array.from(this.g.keys()),_=[];for(let E=0;E<p.length;E++){const L=u[E];for(let j=0;j<L.length;j++)_.push(p[E])}return _},r.V=function(u){Vt(this);let p=[];if(typeof u=="string")$n(this,u)&&(p=p.concat(this.g.get(In(this,u))));else{u=Array.from(this.g.values());for(let _=0;_<u.length;_++)p=p.concat(u[_])}return p},r.set=function(u,p){return Vt(this),this.i=null,u=In(this,u),$n(this,u)&&(this.h-=this.g.get(u).length),this.g.set(u,[p]),this.h+=1,this},r.get=function(u,p){return u?(u=this.V(u),0<u.length?String(u[0]):p):p};function oi(u,p,_){zn(u,p),0<_.length&&(u.i=null,u.g.set(In(u,p),K(_)),u.h+=_.length)}r.toString=function(){if(this.i)return this.i;if(!this.g)return"";const u=[],p=Array.from(this.g.keys());for(var _=0;_<p.length;_++){var E=p[_];const j=encodeURIComponent(String(E)),Z=this.V(E);for(E=0;E<Z.length;E++){var L=j;Z[E]!==""&&(L+="="+encodeURIComponent(String(Z[E]))),u.push(L)}}return this.i=u.join("&")};function In(u,p){return p=String(p),u.j&&(p=p.toLowerCase()),p}function ur(u,p){p&&!u.j&&(Vt(u),u.i=null,u.g.forEach(function(_,E){var L=E.toLowerCase();E!=L&&(zn(this,E),oi(this,L,_))},u)),u.j=p}function Hc(u,p){const _=new Xi;if(f.Image){const E=new Image;E.onload=F(en,_,"TestLoadImage: loaded",!0,p,E),E.onerror=F(en,_,"TestLoadImage: error",!1,p,E),E.onabort=F(en,_,"TestLoadImage: abort",!1,p,E),E.ontimeout=F(en,_,"TestLoadImage: timeout",!1,p,E),f.setTimeout(function(){E.ontimeout&&E.ontimeout()},1e4),E.src=u}else p(!1)}function Ol(u,p){const _=new Xi,E=new AbortController,L=setTimeout(()=>{E.abort(),en(_,"TestPingServer: timeout",!1,p)},1e4);fetch(u,{signal:E.signal}).then(j=>{clearTimeout(L),j.ok?en(_,"TestPingServer: ok",!0,p):en(_,"TestPingServer: server error",!1,p)}).catch(()=>{clearTimeout(L),en(_,"TestPingServer: error",!1,p)})}function en(u,p,_,E,L){try{L&&(L.onload=null,L.onerror=null,L.onabort=null,L.ontimeout=null),E(_)}catch{}}function qc(){this.g=new Yo}function xl(u,p,_){const E=_||"";try{ti(u,function(L,j){let Z=L;y(L)&&(Z=Qo(L)),p.push(E+j+"="+encodeURIComponent(Z))})}catch(L){throw p.push(E+"type="+encodeURIComponent("_badmap")),L}}function Vr(u){this.l=u.Ub||null,this.j=u.eb||!1}B(Vr,Ki),Vr.prototype.g=function(){return new rs(this.l,this.j)},Vr.prototype.i=(function(u){return function(){return u}})({});function rs(u,p){$e.call(this),this.D=u,this.o=p,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}B(rs,$e),r=rs.prototype,r.open=function(u,p){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=u,this.A=p,this.readyState=1,qn(this)},r.send=function(u){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const p={headers:this.u,method:this.B,credentials:this.m,cache:void 0};u&&(p.body=u),(this.D||f).fetch(new Request(this.A,p)).then(this.Sa.bind(this),this.ga.bind(this))},r.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Hn(this)),this.readyState=0},r.Sa=function(u){if(this.g&&(this.l=u,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=u.headers,this.readyState=2,qn(this)),this.g&&(this.readyState=3,qn(this),this.g)))if(this.responseType==="arraybuffer")u.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof f.ReadableStream<"u"&&"body"in u){if(this.j=u.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Vl(this)}else u.text().then(this.Ra.bind(this),this.ga.bind(this))};function Vl(u){u.j.read().then(u.Pa.bind(u)).catch(u.ga.bind(u))}r.Pa=function(u){if(this.g){if(this.o&&u.value)this.response.push(u.value);else if(!this.o){var p=u.value?u.value:new Uint8Array(0);(p=this.v.decode(p,{stream:!u.done}))&&(this.response=this.responseText+=p)}u.done?Hn(this):qn(this),this.readyState==3&&Vl(this)}},r.Ra=function(u){this.g&&(this.response=this.responseText=u,Hn(this))},r.Qa=function(u){this.g&&(this.response=u,Hn(this))},r.ga=function(){this.g&&Hn(this)};function Hn(u){u.readyState=4,u.l=null,u.j=null,u.v=null,qn(u)}r.setRequestHeader=function(u,p){this.u.append(u,p)},r.getResponseHeader=function(u){return this.h&&this.h.get(u.toLowerCase())||""},r.getAllResponseHeaders=function(){if(!this.h)return"";const u=[],p=this.h.entries();for(var _=p.next();!_.done;)_=_.value,u.push(_[0]+": "+_[1]),_=p.next();return u.join(`\r
`)};function qn(u){u.onreadystatechange&&u.onreadystatechange.call(u)}Object.defineProperty(rs.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(u){this.m=u?"include":"same-origin"}});function Lr(u){let p="";return we(u,function(_,E){p+=E,p+=":",p+=_,p+=`\r
`}),p}function ai(u,p,_){e:{for(E in _){var E=!1;break e}E=!0}E||(_=Lr(_),typeof u=="string"?_!=null&&encodeURIComponent(String(_)):We(u,p,_))}function rt(u){$e.call(this),this.headers=new Map,this.o=u||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}B(rt,$e);var Wc=/^https?$/i,aa=["POST","PUT"];r=rt.prototype,r.Ha=function(u){this.J=u},r.ea=function(u,p,_,E){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+u);p=p?p.toUpperCase():"GET",this.D=u,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():jn.g(),this.v=this.o?Ls(this.o):Ls(jn),this.g.onreadystatechange=R(this.Ea,this);try{this.B=!0,this.g.open(p,String(u),!0),this.B=!1}catch(j){is(this,j);return}if(u=_||"",_=new Map(this.headers),E)if(Object.getPrototypeOf(E)===Object.prototype)for(var L in E)_.set(L,E[L]);else if(typeof E.keys=="function"&&typeof E.get=="function")for(const j of E.keys())_.set(j,E.get(j));else throw Error("Unknown input type for opt_headers: "+String(E));E=Array.from(_.keys()).find(j=>j.toLowerCase()=="content-type"),L=f.FormData&&u instanceof f.FormData,!(0<=Array.prototype.indexOf.call(aa,p,void 0))||E||L||_.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[j,Z]of _)this.g.setRequestHeader(j,Z);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Gs(this),this.u=!0,this.g.send(u),this.u=!1}catch(j){is(this,j)}};function is(u,p){u.h=!1,u.g&&(u.j=!0,u.g.abort(),u.j=!1),u.l=p,u.m=5,Ws(u),fn(u)}function Ws(u){u.A||(u.A=!0,pt(u,"complete"),pt(u,"error"))}r.abort=function(u){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=u||7,pt(this,"complete"),pt(this,"abort"),fn(this))},r.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),fn(this,!0)),rt.aa.N.call(this)},r.Ea=function(){this.s||(this.B||this.u||this.j?la(this):this.bb())},r.bb=function(){la(this)};function la(u){if(u.h&&typeof h<"u"&&(!u.v[1]||tn(u)!=4||u.Z()!=2)){if(u.u&&tn(u)==4)Zr(u.Ea,0,u);else if(pt(u,"readystatechange"),tn(u)==4){u.h=!1;try{const Z=u.Z();e:switch(Z){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var p=!0;break e;default:p=!1}var _;if(!(_=p)){var E;if(E=Z===0){var L=String(u.D).match(ts)[1]||null;!L&&f.self&&f.self.location&&(L=f.self.location.protocol.slice(0,-1)),E=!Wc.test(L?L.toLowerCase():"")}_=E}if(_)pt(u,"complete"),pt(u,"success");else{u.m=6;try{var j=2<tn(u)?u.g.statusText:""}catch{j=""}u.l=j+" ["+u.Z()+"]",Ws(u)}}finally{fn(u)}}}}function fn(u,p){if(u.g){Gs(u);const _=u.g,E=u.v[0]?()=>{}:null;u.g=null,u.v=null,p||pt(u,"ready");try{_.onreadystatechange=E}catch{}}}function Gs(u){u.I&&(f.clearTimeout(u.I),u.I=null)}r.isActive=function(){return!!this.g};function tn(u){return u.g?u.g.readyState:0}r.Z=function(){try{return 2<tn(this)?this.g.status:-1}catch{return-1}},r.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},r.Oa=function(u){if(this.g){var p=this.g.responseText;return u&&p.indexOf(u)==0&&(p=p.substring(u.length)),Xo(p)}};function ua(u){try{if(!u.g)return null;if("response"in u.g)return u.g.response;switch(u.H){case"":case"text":return u.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in u.g)return u.g.mozResponseArrayBuffer}return null}catch{return null}}function Ks(u){const p={};u=(u.g&&2<=tn(u)&&u.g.getAllResponseHeaders()||"").split(`\r
`);for(let E=0;E<u.length;E++){if(ae(u[E]))continue;var _=O(u[E]);const L=_[0];if(_=_[1],typeof _!="string")continue;_=_.trim();const j=p[L]||[];p[L]=j,j.push(_)}N(p,function(E){return E.join(", ")})}r.Ba=function(){return this.m},r.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function cr(u,p,_){return _&&_.internalChannelParams&&_.internalChannelParams[u]||p}function ca(u){this.Aa=0,this.i=[],this.j=new Xi,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=cr("failFast",!1,u),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=cr("baseRetryDelayMs",5e3,u),this.cb=cr("retryDelaySeedMs",1e4,u),this.Wa=cr("forwardChannelMaxRetries",2,u),this.wa=cr("forwardChannelRequestTimeoutMs",2e4,u),this.pa=u&&u.xmlHttpFactory||void 0,this.Xa=u&&u.Tb||void 0,this.Ca=u&&u.useFetchStreams||!1,this.L=void 0,this.J=u&&u.supportsCrossDomainXhr||!1,this.K="",this.h=new es(u&&u.concurrentRequestLimit),this.Da=new qc,this.P=u&&u.fastHandshake||!1,this.O=u&&u.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=u&&u.Rb||!1,u&&u.xa&&this.j.xa(),u&&u.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&u&&u.detectBufferingProxy||!1,this.ja=void 0,u&&u.longPollingTimeout&&0<u.longPollingTimeout&&(this.ja=u.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}r=ca.prototype,r.la=8,r.G=1,r.connect=function(u,p,_,E){mt(0),this.W=u,this.H=p||{},_&&E!==void 0&&(this.H.OSID=_,this.H.OAID=E),this.F=this.X,this.I=Ul(this,null,this.W),hr(this)};function Lt(u){if(Qs(u),u.G==3){var p=u.U++,_=dn(u.I);if(We(_,"SID",u.K),We(_,"RID",p),We(_,"TYPE","terminate"),br(u,_),p=new Bn(u,u.j,p),p.L=2,p.v=ii(dn(_)),_=!1,f.navigator&&f.navigator.sendBeacon)try{_=f.navigator.sendBeacon(p.v.toString(),"")}catch{}!_&&f.Image&&(new Image().src=p.v,_=!0),_||(p.g=Fl(p.j,null),p.g.ea(p.v)),p.F=Date.now(),Ke(p)}Ml(u)}function Wn(u){u.g&&(ha(u),u.g.cancel(),u.g=null)}function Qs(u){Wn(u),u.u&&(f.clearTimeout(u.u),u.u=null),Js(u),u.h.cancel(),u.s&&(typeof u.s=="number"&&f.clearTimeout(u.s),u.s=null)}function hr(u){if(!hn(u.h)&&!u.s){u.s=!0;var p=u.Ga;Ne||te(),ee||(Ne(),ee=!0),fe.add(p,u),u.B=0}}function Gc(u,p){return Al(u.h)>=u.h.j-(u.s?1:0)?!1:u.s?(u.i=p.D.concat(u.i),!0):u.G==1||u.G==2||u.B>=(u.Va?0:u.Wa)?!1:(u.s=Un(R(u.Ga,u,p),bl(u,u.B)),u.B++,!0)}r.Ga=function(u){if(this.s)if(this.s=null,this.G==1){if(!u){this.U=Math.floor(1e5*Math.random()),u=this.U++;const L=new Bn(this,this.j,u);let j=this.o;if(this.S&&(j?(j=T(j),k(j,this.S)):j=this.S),this.m!==null||this.O||(L.H=j,j=null),this.P)e:{for(var p=0,_=0;_<this.i.length;_++){t:{var E=this.i[_];if("__data__"in E.map&&(E=E.map.__data__,typeof E=="string")){E=E.length;break t}E=void 0}if(E===void 0)break;if(p+=E,4096<p){p=_;break e}if(p===4096||_===this.i.length-1){p=_+1;break e}}p=1e3}else p=1e3;p=li(this,L,p),_=dn(this.I),We(_,"RID",u),We(_,"CVER",22),this.D&&We(_,"X-HTTP-Session-Id",this.D),br(this,_),j&&(this.O?p="headers="+encodeURIComponent(String(Lr(j)))+"&"+p:this.m&&ai(_,this.m,j)),sa(this.h,L),this.Ua&&We(_,"TYPE","init"),this.P?(We(_,"$req",p),We(_,"SID","null"),L.T=!0,zs(L,_,null)):zs(L,_,p),this.G=2}}else this.G==3&&(u?Xs(this,u):this.i.length==0||hn(this.h)||Xs(this))};function Xs(u,p){var _;p?_=p.l:_=u.U++;const E=dn(u.I);We(E,"SID",u.K),We(E,"RID",_),We(E,"AID",u.T),br(u,E),u.m&&u.o&&ai(E,u.m,u.o),_=new Bn(u,u.j,_,u.B+1),u.m===null&&(_.H=u.o),p&&(u.i=p.D.concat(u.i)),p=li(u,_,1e3),_.I=Math.round(.5*u.wa)+Math.round(.5*u.wa*Math.random()),sa(u.h,_),zs(_,E,p)}function br(u,p){u.H&&we(u.H,function(_,E){We(p,E,_)}),u.l&&ti({},function(_,E){We(p,E,_)})}function li(u,p,_){_=Math.min(u.i.length,_);var E=u.l?R(u.l.Na,u.l,u):null;e:{var L=u.i;let j=-1;for(;;){const Z=["count="+_];j==-1?0<_?(j=L[0].g,Z.push("ofs="+j)):j=0:Z.push("ofs="+j);let He=!0;for(let St=0;St<_;St++){let be=L[St].g;const kt=L[St].map;if(be-=j,0>be)j=Math.max(0,L[St].g-100),He=!1;else try{xl(kt,Z,"req"+be+"_")}catch{E&&E(kt)}}if(He){E=Z.join("&");break e}}}return u=u.i.splice(0,_),p.D=u,E}function ss(u){if(!u.g&&!u.u){u.Y=1;var p=u.Fa;Ne||te(),ee||(Ne(),ee=!0),fe.add(p,u),u.v=0}}function Ys(u){return u.g||u.u||3<=u.v?!1:(u.Y++,u.u=Un(R(u.Fa,u),bl(u,u.v)),u.v++,!0)}r.Fa=function(){if(this.u=null,Ll(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var u=2*this.R;this.j.info("BP detection timer enabled: "+u),this.A=Un(R(this.ab,this),u)}},r.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,mt(10),Wn(this),Ll(this))};function ha(u){u.A!=null&&(f.clearTimeout(u.A),u.A=null)}function Ll(u){u.g=new Bn(u,u.j,"rpc",u.Y),u.m===null&&(u.g.H=u.o),u.g.O=0;var p=dn(u.qa);We(p,"RID","rpc"),We(p,"SID",u.K),We(p,"AID",u.T),We(p,"CI",u.F?"0":"1"),!u.F&&u.ja&&We(p,"TO",u.ja),We(p,"TYPE","xmlhttp"),br(u,p),u.m&&u.o&&ai(p,u.m,u.o),u.L&&(u.g.I=u.L);var _=u.g;u=u.ia,_.L=1,_.v=ii(dn(p)),_.m=null,_.P=!0,ra(_,u)}r.Za=function(){this.C!=null&&(this.C=null,Wn(this),Ys(this),mt(19))};function Js(u){u.C!=null&&(f.clearTimeout(u.C),u.C=null)}function Zs(u,p){var _=null;if(u.g==p){Js(u),ha(u),u.g=null;var E=2}else if(Qt(u.h,p))_=p.D,Rl(u.h,p),E=1;else return;if(u.G!=0){if(p.o)if(E==1){_=p.m?p.m.length:0,p=Date.now()-p.F;var L=u.B;E=Qi(),pt(E,new Us(E,_)),hr(u)}else ss(u);else if(L=p.s,L==3||L==0&&0<p.X||!(E==1&&Gc(u,p)||E==2&&Ys(u)))switch(_&&0<_.length&&(p=u.h,p.i=p.i.concat(_)),L){case 1:Mr(u,5);break;case 4:Mr(u,10);break;case 3:Mr(u,6);break;default:Mr(u,2)}}}function bl(u,p){let _=u.Ta+Math.floor(Math.random()*u.cb);return u.isActive()||(_*=2),_*p}function Mr(u,p){if(u.j.info("Error code "+p),p==2){var _=R(u.fb,u),E=u.Xa;const L=!E;E=new xr(E||"//www.google.com/images/cleardot.gif"),f.location&&f.location.protocol=="http"||ns(E,"https"),ii(E),L?Hc(E.toString(),_):Ol(E.toString(),_)}else mt(2);u.G=0,u.l&&u.l.sa(p),Ml(u),Qs(u)}r.fb=function(u){u?(this.j.info("Successfully pinged google.com"),mt(2)):(this.j.info("Failed to ping google.com"),mt(1))};function Ml(u){if(u.G=0,u.ka=[],u.l){const p=Cl(u.h);(p.length!=0||u.i.length!=0)&&(z(u.ka,p),z(u.ka,u.i),u.h.i.length=0,K(u.i),u.i.length=0),u.l.ra()}}function Ul(u,p,_){var E=_ instanceof xr?dn(_):new xr(_);if(E.g!="")p&&(E.g=p+"."+E.g),ni(E,E.s);else{var L=f.location;E=L.protocol,p=p?p+"."+L.hostname:L.hostname,L=+L.port;var j=new xr(null);E&&ns(j,E),p&&(j.g=p),L&&ni(j,L),_&&(j.l=_),E=j}return _=u.D,p=u.ya,_&&p&&We(E,_,p),We(E,"VER",u.la),br(u,E),E}function Fl(u,p,_){if(p&&!u.J)throw Error("Can't create secondary domain capable XhrIo object.");return p=u.Ca&&!u.pa?new rt(new Vr({eb:_})):new rt(u.pa),p.Ha(u.J),p}r.isActive=function(){return!!this.l&&this.l.isActive(this)};function da(){}r=da.prototype,r.ua=function(){},r.ta=function(){},r.sa=function(){},r.ra=function(){},r.isActive=function(){return!0},r.Na=function(){};function eo(){}eo.prototype.g=function(u,p){return new Xt(u,p)};function Xt(u,p){$e.call(this),this.g=new ca(p),this.l=u,this.h=p&&p.messageUrlParams||null,u=p&&p.messageHeaders||null,p&&p.clientProtocolHeaderRequired&&(u?u["X-Client-Protocol"]="webchannel":u={"X-Client-Protocol":"webchannel"}),this.g.o=u,u=p&&p.initMessageHeaders||null,p&&p.messageContentType&&(u?u["X-WebChannel-Content-Type"]=p.messageContentType:u={"X-WebChannel-Content-Type":p.messageContentType}),p&&p.va&&(u?u["X-WebChannel-Client-Profile"]=p.va:u={"X-WebChannel-Client-Profile":p.va}),this.g.S=u,(u=p&&p.Sb)&&!ae(u)&&(this.g.m=u),this.v=p&&p.supportsCrossDomainXhr||!1,this.u=p&&p.sendRawJson||!1,(p=p&&p.httpSessionIdParam)&&!ae(p)&&(this.g.D=p,u=this.h,u!==null&&p in u&&(u=this.h,p in u&&delete u[p])),this.j=new dr(this)}B(Xt,$e),Xt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Xt.prototype.close=function(){Lt(this.g)},Xt.prototype.o=function(u){var p=this.g;if(typeof u=="string"){var _={};_.__data__=u,u=_}else this.u&&(_={},_.__data__=Qo(u),u=_);p.i.push(new Sl(p.Ya++,u)),p.G==3&&hr(p)},Xt.prototype.N=function(){this.g.l=null,delete this.j,Lt(this.g),delete this.g,Xt.aa.N.call(this)};function jl(u){or.call(this),u.__headers__&&(this.headers=u.__headers__,this.statusCode=u.__status__,delete u.__headers__,delete u.__status__);var p=u.__sm__;if(p){e:{for(const _ in p){u=_;break e}u=void 0}(this.i=u)&&(u=this.i,p=p!==null&&u in p?p[u]:void 0),this.data=p}else this.data=u}B(jl,or);function Bl(){Ms.call(this),this.status=1}B(Bl,Ms);function dr(u){this.g=u}B(dr,da),dr.prototype.ua=function(){pt(this.g,"a")},dr.prototype.ta=function(u){pt(this.g,new jl(u))},dr.prototype.sa=function(u){pt(this.g,new Bl)},dr.prototype.ra=function(){pt(this.g,"b")},eo.prototype.createWebChannel=eo.prototype.g,Xt.prototype.send=Xt.prototype.o,Xt.prototype.open=Xt.prototype.m,Xt.prototype.close=Xt.prototype.close,gv=function(){return new eo},mv=function(){return Qi()},pv=ar,qd={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},js.NO_ERROR=0,js.TIMEOUT=8,js.HTTP_ERROR=6,Ku=js,El.COMPLETE="complete",fv=El,bs.EventType=wn,wn.OPEN="a",wn.CLOSE="b",wn.ERROR="c",wn.MESSAGE="d",$e.prototype.listen=$e.prototype.K,ja=bs,rt.prototype.listenOnce=rt.prototype.L,rt.prototype.getLastError=rt.prototype.Ka,rt.prototype.getLastErrorCode=rt.prototype.Ba,rt.prototype.getStatus=rt.prototype.Z,rt.prototype.getResponseJson=rt.prototype.Oa,rt.prototype.getResponseText=rt.prototype.oa,rt.prototype.send=rt.prototype.ea,rt.prototype.setWithCredentials=rt.prototype.Ha,dv=rt}).apply(typeof bu<"u"?bu:typeof self<"u"?self:typeof window<"u"?window:{});const l_="@firebase/firestore",u_="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Wt.UNAUTHENTICATED=new Wt(null),Wt.GOOGLE_CREDENTIALS=new Wt("google-credentials-uid"),Wt.FIRST_PARTY=new Wt("first-party-uid"),Wt.MOCK_USER=new Wt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let zo="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rs=new pf("@firebase/firestore");function Io(){return Rs.logLevel}function ie(r,...e){if(Rs.logLevel<=De.DEBUG){const t=e.map(Rf);Rs.debug(`Firestore (${zo}): ${r}`,...t)}}function Xr(r,...e){if(Rs.logLevel<=De.ERROR){const t=e.map(Rf);Rs.error(`Firestore (${zo}): ${r}`,...t)}}function Mi(r,...e){if(Rs.logLevel<=De.WARN){const t=e.map(Rf);Rs.warn(`Firestore (${zo}): ${r}`,...t)}}function Rf(r){if(typeof r=="string")return r;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return(function(t){return JSON.stringify(t)})(r)}catch{return r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ve(r,e,t){let s="Unexpected state";typeof e=="string"?s=e:t=e,_v(r,s,t)}function _v(r,e,t){let s=`FIRESTORE (${zo}) INTERNAL ASSERTION FAILED: ${e} (ID: ${r.toString(16)})`;if(t!==void 0)try{s+=" CONTEXT: "+JSON.stringify(t)}catch{s+=" CONTEXT: "+t}throw Xr(s),new Error(s)}function ze(r,e,t,s){let o="Unexpected state";typeof t=="string"?o=t:s=t,r||_v(e,o,s)}function Se(r,e){return r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ne extends Cr{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vi{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yv{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class fA{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Wt.UNAUTHENTICATED)))}shutdown(){}}class pA{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class mA{constructor(e){this.t=e,this.currentUser=Wt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ze(this.o===void 0,42304);let s=this.i;const o=g=>this.i!==s?(s=this.i,t(g)):Promise.resolve();let l=new Vi;this.o=()=>{this.i++,this.currentUser=this.u(),l.resolve(),l=new Vi,e.enqueueRetryable((()=>o(this.currentUser)))};const h=()=>{const g=l;e.enqueueRetryable((async()=>{await g.promise,await o(this.currentUser)}))},f=g=>{ie("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=g,this.o&&(this.auth.addAuthTokenListener(this.o),h())};this.t.onInit((g=>f(g))),setTimeout((()=>{if(!this.auth){const g=this.t.getImmediate({optional:!0});g?f(g):(ie("FirebaseAuthCredentialsProvider","Auth not yet detected"),l.resolve(),l=new Vi)}}),0),h()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((s=>this.i!==e?(ie("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):s?(ze(typeof s.accessToken=="string",31837,{l:s}),new yv(s.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ze(e===null||typeof e=="string",2055,{h:e}),new Wt(e)}}class gA{constructor(e,t,s){this.P=e,this.T=t,this.I=s,this.type="FirstParty",this.user=Wt.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class _A{constructor(e,t,s){this.P=e,this.T=t,this.I=s}getToken(){return Promise.resolve(new gA(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(Wt.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class c_{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class yA{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Dn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){ze(this.o===void 0,3512);const s=l=>{l.error!=null&&ie("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${l.error.message}`);const h=l.token!==this.m;return this.m=l.token,ie("FirebaseAppCheckTokenProvider",`Received ${h?"new":"existing"} token.`),h?t(l.token):Promise.resolve()};this.o=l=>{e.enqueueRetryable((()=>s(l)))};const o=l=>{ie("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=l,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((l=>o(l))),setTimeout((()=>{if(!this.appCheck){const l=this.V.getImmediate({optional:!0});l?o(l):ie("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new c_(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?(ze(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new c_(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vA(r){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(r);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let s=0;s<r;s++)t[s]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vv(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let s="";for(;s.length<20;){const o=vA(40);for(let l=0;l<o.length;++l)s.length<20&&o[l]<t&&(s+=e.charAt(o[l]%62))}return s}}function Ce(r,e){return r<e?-1:r>e?1:0}function Wd(r,e){let t=0;for(;t<r.length&&t<e.length;){const s=r.codePointAt(t),o=e.codePointAt(t);if(s!==o){if(s<128&&o<128)return Ce(s,o);{const l=vv(),h=EA(l.encode(h_(r,t)),l.encode(h_(e,t)));return h!==0?h:Ce(s,o)}}t+=s>65535?2:1}return Ce(r.length,e.length)}function h_(r,e){return r.codePointAt(e)>65535?r.substring(e,e+2):r.substring(e,e+1)}function EA(r,e){for(let t=0;t<r.length&&t<e.length;++t)if(r[t]!==e[t])return Ce(r[t],e[t]);return Ce(r.length,e.length)}function Lo(r,e,t){return r.length===e.length&&r.every(((s,o)=>t(s,e[o])))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const d_="__name__";class _r{constructor(e,t,s){t===void 0?t=0:t>e.length&&ve(637,{offset:t,range:e.length}),s===void 0?s=e.length-t:s>e.length-t&&ve(1746,{length:s,range:e.length-t}),this.segments=e,this.offset=t,this.len=s}get length(){return this.len}isEqual(e){return _r.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof _r?e.forEach((s=>{t.push(s)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,s=this.limit();t<s;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const s=Math.min(e.length,t.length);for(let o=0;o<s;o++){const l=_r.compareSegments(e.get(o),t.get(o));if(l!==0)return l}return Ce(e.length,t.length)}static compareSegments(e,t){const s=_r.isNumericId(e),o=_r.isNumericId(t);return s&&!o?-1:!s&&o?1:s&&o?_r.extractNumericId(e).compare(_r.extractNumericId(t)):Wd(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return xi.fromString(e.substring(4,e.length-2))}}class Xe extends _r{construct(e,t,s){return new Xe(e,t,s)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const s of e){if(s.indexOf("//")>=0)throw new ne($.INVALID_ARGUMENT,`Invalid segment (${s}). Paths must not contain // in them.`);t.push(...s.split("/").filter((o=>o.length>0)))}return new Xe(t)}static emptyPath(){return new Xe([])}}const wA=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ft extends _r{construct(e,t,s){return new Ft(e,t,s)}static isValidIdentifier(e){return wA.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ft.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===d_}static keyField(){return new Ft([d_])}static fromServerFormat(e){const t=[];let s="",o=0;const l=()=>{if(s.length===0)throw new ne($.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(s),s=""};let h=!1;for(;o<e.length;){const f=e[o];if(f==="\\"){if(o+1===e.length)throw new ne($.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const g=e[o+1];if(g!=="\\"&&g!=="."&&g!=="`")throw new ne($.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);s+=g,o+=2}else f==="`"?(h=!h,o++):f!=="."||h?(s+=f,o++):(l(),o++)}if(l(),h)throw new ne($.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ft(t)}static emptyPath(){return new Ft([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class me{constructor(e){this.path=e}static fromPath(e){return new me(Xe.fromString(e))}static fromName(e){return new me(Xe.fromString(e).popFirst(5))}static empty(){return new me(Xe.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Xe.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Xe.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new me(new Xe(e.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ev(r,e,t){if(!t)throw new ne($.INVALID_ARGUMENT,`Function ${r}() cannot be called with an empty ${e}.`)}function TA(r,e,t,s){if(e===!0&&s===!0)throw new ne($.INVALID_ARGUMENT,`${r} and ${t} cannot be used together.`)}function f_(r){if(!me.isDocumentKey(r))throw new ne($.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${r} has ${r.length}.`)}function p_(r){if(me.isDocumentKey(r))throw new ne($.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${r} has ${r.length}.`)}function wv(r){return typeof r=="object"&&r!==null&&(Object.getPrototypeOf(r)===Object.prototype||Object.getPrototypeOf(r)===null)}function Sc(r){if(r===void 0)return"undefined";if(r===null)return"null";if(typeof r=="string")return r.length>20&&(r=`${r.substring(0,20)}...`),JSON.stringify(r);if(typeof r=="number"||typeof r=="boolean")return""+r;if(typeof r=="object"){if(r instanceof Array)return"an array";{const e=(function(s){return s.constructor?s.constructor.name:null})(r);return e?`a custom ${e} object`:"an object"}}return typeof r=="function"?"a function":ve(12329,{type:typeof r})}function Cs(r,e){if("_delegate"in r&&(r=r._delegate),!(r instanceof e)){if(e.name===r.constructor.name)throw new ne($.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Sc(r);throw new ne($.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return r}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function It(r,e){const t={typeString:r};return e&&(t.value=e),t}function fl(r,e){if(!wv(r))throw new ne($.INVALID_ARGUMENT,"JSON must be an object");let t;for(const s in e)if(e[s]){const o=e[s].typeString,l="value"in e[s]?{value:e[s].value}:void 0;if(!(s in r)){t=`JSON missing required field: '${s}'`;break}const h=r[s];if(o&&typeof h!==o){t=`JSON field '${s}' must be a ${o}.`;break}if(l!==void 0&&h!==l.value){t=`Expected '${s}' field to equal '${l.value}'`;break}}if(t)throw new ne($.INVALID_ARGUMENT,t);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m_=-62135596800,g_=1e6;class tt{static now(){return tt.fromMillis(Date.now())}static fromDate(e){return tt.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),s=Math.floor((e-1e3*t)*g_);return new tt(t,s)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new ne($.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new ne($.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<m_)throw new ne($.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new ne($.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/g_}_compareTo(e){return this.seconds===e.seconds?Ce(this.nanoseconds,e.nanoseconds):Ce(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:tt._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(fl(e,tt._jsonSchema))return new tt(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-m_;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}tt._jsonSchemaVersion="firestore/timestamp/1.0",tt._jsonSchema={type:It("string",tt._jsonSchemaVersion),seconds:It("number"),nanoseconds:It("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Te{static fromTimestamp(e){return new Te(e)}static min(){return new Te(new tt(0,0))}static max(){return new Te(new tt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const el=-1;function IA(r,e){const t=r.toTimestamp().seconds,s=r.toTimestamp().nanoseconds+1,o=Te.fromTimestamp(s===1e9?new tt(t+1,0):new tt(t,s));return new Ui(o,me.empty(),e)}function SA(r){return new Ui(r.readTime,r.key,el)}class Ui{constructor(e,t,s){this.readTime=e,this.documentKey=t,this.largestBatchId=s}static min(){return new Ui(Te.min(),me.empty(),el)}static max(){return new Ui(Te.max(),me.empty(),el)}}function AA(r,e){let t=r.readTime.compareTo(e.readTime);return t!==0?t:(t=me.comparator(r.documentKey,e.documentKey),t!==0?t:Ce(r.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RA="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class CA{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach((e=>e()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $o(r){if(r.code!==$.FAILED_PRECONDITION||r.message!==RA)throw r;ie("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class q{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e((t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)}),(t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)}))}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&ve(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new q(((s,o)=>{this.nextCallback=l=>{this.wrapSuccess(e,l).next(s,o)},this.catchCallback=l=>{this.wrapFailure(t,l).next(s,o)}}))}toPromise(){return new Promise(((e,t)=>{this.next(e,t)}))}wrapUserFunction(e){try{const t=e();return t instanceof q?t:q.resolve(t)}catch(t){return q.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction((()=>e(t))):q.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction((()=>e(t))):q.reject(t)}static resolve(e){return new q(((t,s)=>{t(e)}))}static reject(e){return new q(((t,s)=>{s(e)}))}static waitFor(e){return new q(((t,s)=>{let o=0,l=0,h=!1;e.forEach((f=>{++o,f.next((()=>{++l,h&&l===o&&t()}),(g=>s(g)))})),h=!0,l===o&&t()}))}static or(e){let t=q.resolve(!1);for(const s of e)t=t.next((o=>o?q.resolve(o):s()));return t}static forEach(e,t){const s=[];return e.forEach(((o,l)=>{s.push(t.call(this,o,l))})),this.waitFor(s)}static mapArray(e,t){return new q(((s,o)=>{const l=e.length,h=new Array(l);let f=0;for(let g=0;g<l;g++){const y=g;t(e[y]).next((w=>{h[y]=w,++f,f===l&&s(h)}),(w=>o(w)))}}))}static doWhile(e,t){return new q(((s,o)=>{const l=()=>{e()===!0?t().next((()=>{l()}),o):s()};l()}))}}function PA(r){const e=r.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Ho(r){return r.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ac{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=s=>this._e(s),this.ae=s=>t.writeSequenceNumber(s))}_e(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.ae&&this.ae(e),e}}Ac.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pf=-1;function Rc(r){return r==null}function lc(r){return r===0&&1/r==-1/0}function kA(r){return typeof r=="number"&&Number.isInteger(r)&&!lc(r)&&r<=Number.MAX_SAFE_INTEGER&&r>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Tv="";function NA(r){let e="";for(let t=0;t<r.length;t++)e.length>0&&(e=__(e)),e=DA(r.get(t),e);return __(e)}function DA(r,e){let t=e;const s=r.length;for(let o=0;o<s;o++){const l=r.charAt(o);switch(l){case"\0":t+="";break;case Tv:t+="";break;default:t+=l}}return t}function __(r){return r+Tv+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function y_(r){let e=0;for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e++;return e}function Wi(r,e){for(const t in r)Object.prototype.hasOwnProperty.call(r,t)&&e(t,r[t])}function Iv(r){for(const e in r)if(Object.prototype.hasOwnProperty.call(r,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e,t){this.comparator=e,this.root=t||Ut.EMPTY}insert(e,t){return new lt(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ut.BLACK,null,null))}remove(e){return new lt(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ut.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const s=this.comparator(e,t.key);if(s===0)return t.value;s<0?t=t.left:s>0&&(t=t.right)}return null}indexOf(e){let t=0,s=this.root;for(;!s.isEmpty();){const o=this.comparator(e,s.key);if(o===0)return t+s.left.size;o<0?s=s.left:(t+=s.left.size+1,s=s.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal(((t,s)=>(e(t,s),!1)))}toString(){const e=[];return this.inorderTraversal(((t,s)=>(e.push(`${t}:${s}`),!1))),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Mu(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Mu(this.root,e,this.comparator,!1)}getReverseIterator(){return new Mu(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Mu(this.root,e,this.comparator,!0)}}class Mu{constructor(e,t,s,o){this.isReverse=o,this.nodeStack=[];let l=1;for(;!e.isEmpty();)if(l=t?s(e.key,t):1,t&&o&&(l*=-1),l<0)e=this.isReverse?e.left:e.right;else{if(l===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ut{constructor(e,t,s,o,l){this.key=e,this.value=t,this.color=s??Ut.RED,this.left=o??Ut.EMPTY,this.right=l??Ut.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,s,o,l){return new Ut(e??this.key,t??this.value,s??this.color,o??this.left,l??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,s){let o=this;const l=s(e,o.key);return o=l<0?o.copy(null,null,null,o.left.insert(e,t,s),null):l===0?o.copy(null,t,null,null,null):o.copy(null,null,null,null,o.right.insert(e,t,s)),o.fixUp()}removeMin(){if(this.left.isEmpty())return Ut.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let s,o=this;if(t(e,o.key)<0)o.left.isEmpty()||o.left.isRed()||o.left.left.isRed()||(o=o.moveRedLeft()),o=o.copy(null,null,null,o.left.remove(e,t),null);else{if(o.left.isRed()&&(o=o.rotateRight()),o.right.isEmpty()||o.right.isRed()||o.right.left.isRed()||(o=o.moveRedRight()),t(e,o.key)===0){if(o.right.isEmpty())return Ut.EMPTY;s=o.right.min(),o=o.copy(s.key,s.value,null,null,o.right.removeMin())}o=o.copy(null,null,null,null,o.right.remove(e,t))}return o.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ut.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ut.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw ve(43730,{key:this.key,value:this.value});if(this.right.isRed())throw ve(14113,{key:this.key,value:this.value});const e=this.left.check();if(e!==this.right.check())throw ve(27949);return e+(this.isRed()?0:1)}}Ut.EMPTY=null,Ut.RED=!0,Ut.BLACK=!1;Ut.EMPTY=new class{constructor(){this.size=0}get key(){throw ve(57766)}get value(){throw ve(16141)}get color(){throw ve(16727)}get left(){throw ve(29726)}get right(){throw ve(36894)}copy(e,t,s,o,l){return this}insert(e,t,s){return new Ut(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e){this.comparator=e,this.data=new lt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal(((t,s)=>(e(t),!1)))}forEachInRange(e,t){const s=this.data.getIteratorFrom(e[0]);for(;s.hasNext();){const o=s.getNext();if(this.comparator(o.key,e[1])>=0)return;t(o.key)}}forEachWhile(e,t){let s;for(s=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();s.hasNext();)if(!e(s.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new v_(this.data.getIterator())}getIteratorFrom(e){return new v_(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach((s=>{t=t.add(s)})),t}isEqual(e){if(!(e instanceof Pt)||this.size!==e.size)return!1;const t=this.data.getIterator(),s=e.data.getIterator();for(;t.hasNext();){const o=t.getNext().key,l=s.getNext().key;if(this.comparator(o,l)!==0)return!1}return!0}toArray(){const e=[];return this.forEach((t=>{e.push(t)})),e}toString(){const e=[];return this.forEach((t=>e.push(t))),"SortedSet("+e.toString()+")"}copy(e){const t=new Pt(this.comparator);return t.data=e,t}}class v_{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yn{constructor(e){this.fields=e,e.sort(Ft.comparator)}static empty(){return new yn([])}unionWith(e){let t=new Pt(Ft.comparator);for(const s of this.fields)t=t.add(s);for(const s of e)t=t.add(s);return new yn(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Lo(this.fields,e.fields,((t,s)=>t.isEqual(s)))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sv extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(o){try{return atob(o)}catch(l){throw typeof DOMException<"u"&&l instanceof DOMException?new Sv("Invalid base64 string: "+l):l}})(e);return new jt(t)}static fromUint8Array(e){const t=(function(o){let l="";for(let h=0;h<o.length;++h)l+=String.fromCharCode(o[h]);return l})(e);return new jt(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const s=new Uint8Array(t.length);for(let o=0;o<t.length;o++)s[o]=t.charCodeAt(o);return s})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ce(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}jt.EMPTY_BYTE_STRING=new jt("");const OA=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Fi(r){if(ze(!!r,39018),typeof r=="string"){let e=0;const t=OA.exec(r);if(ze(!!t,46558,{timestamp:r}),t[1]){let o=t[1];o=(o+"000000000").substr(0,9),e=Number(o)}const s=new Date(r);return{seconds:Math.floor(s.getTime()/1e3),nanos:e}}return{seconds:_t(r.seconds),nanos:_t(r.nanos)}}function _t(r){return typeof r=="number"?r:typeof r=="string"?Number(r):0}function ji(r){return typeof r=="string"?jt.fromBase64String(r):jt.fromUint8Array(r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Av="server_timestamp",Rv="__type__",Cv="__previous_value__",Pv="__local_write_time__";function kf(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{})[Rv])===null||t===void 0?void 0:t.stringValue)===Av}function Cc(r){const e=r.mapValue.fields[Cv];return kf(e)?Cc(e):e}function tl(r){const e=Fi(r.mapValue.fields[Pv].timestampValue);return new tt(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xA{constructor(e,t,s,o,l,h,f,g,y,w){this.databaseId=e,this.appId=t,this.persistenceKey=s,this.host=o,this.ssl=l,this.forceLongPolling=h,this.autoDetectLongPolling=f,this.longPollingOptions=g,this.useFetchStreams=y,this.isUsingEmulator=w}}const uc="(default)";class nl{constructor(e,t){this.projectId=e,this.database=t||uc}static empty(){return new nl("","")}get isDefaultDatabase(){return this.database===uc}isEqual(e){return e instanceof nl&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kv="__type__",VA="__max__",Uu={mapValue:{}},Nv="__vector__",cc="value";function Bi(r){return"nullValue"in r?0:"booleanValue"in r?1:"integerValue"in r||"doubleValue"in r?2:"timestampValue"in r?3:"stringValue"in r?5:"bytesValue"in r?6:"referenceValue"in r?7:"geoPointValue"in r?8:"arrayValue"in r?9:"mapValue"in r?kf(r)?4:bA(r)?9007199254740991:LA(r)?10:11:ve(28295,{value:r})}function Rr(r,e){if(r===e)return!0;const t=Bi(r);if(t!==Bi(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return r.booleanValue===e.booleanValue;case 4:return tl(r).isEqual(tl(e));case 3:return(function(o,l){if(typeof o.timestampValue=="string"&&typeof l.timestampValue=="string"&&o.timestampValue.length===l.timestampValue.length)return o.timestampValue===l.timestampValue;const h=Fi(o.timestampValue),f=Fi(l.timestampValue);return h.seconds===f.seconds&&h.nanos===f.nanos})(r,e);case 5:return r.stringValue===e.stringValue;case 6:return(function(o,l){return ji(o.bytesValue).isEqual(ji(l.bytesValue))})(r,e);case 7:return r.referenceValue===e.referenceValue;case 8:return(function(o,l){return _t(o.geoPointValue.latitude)===_t(l.geoPointValue.latitude)&&_t(o.geoPointValue.longitude)===_t(l.geoPointValue.longitude)})(r,e);case 2:return(function(o,l){if("integerValue"in o&&"integerValue"in l)return _t(o.integerValue)===_t(l.integerValue);if("doubleValue"in o&&"doubleValue"in l){const h=_t(o.doubleValue),f=_t(l.doubleValue);return h===f?lc(h)===lc(f):isNaN(h)&&isNaN(f)}return!1})(r,e);case 9:return Lo(r.arrayValue.values||[],e.arrayValue.values||[],Rr);case 10:case 11:return(function(o,l){const h=o.mapValue.fields||{},f=l.mapValue.fields||{};if(y_(h)!==y_(f))return!1;for(const g in h)if(h.hasOwnProperty(g)&&(f[g]===void 0||!Rr(h[g],f[g])))return!1;return!0})(r,e);default:return ve(52216,{left:r})}}function rl(r,e){return(r.values||[]).find((t=>Rr(t,e)))!==void 0}function bo(r,e){if(r===e)return 0;const t=Bi(r),s=Bi(e);if(t!==s)return Ce(t,s);switch(t){case 0:case 9007199254740991:return 0;case 1:return Ce(r.booleanValue,e.booleanValue);case 2:return(function(l,h){const f=_t(l.integerValue||l.doubleValue),g=_t(h.integerValue||h.doubleValue);return f<g?-1:f>g?1:f===g?0:isNaN(f)?isNaN(g)?0:-1:1})(r,e);case 3:return E_(r.timestampValue,e.timestampValue);case 4:return E_(tl(r),tl(e));case 5:return Wd(r.stringValue,e.stringValue);case 6:return(function(l,h){const f=ji(l),g=ji(h);return f.compareTo(g)})(r.bytesValue,e.bytesValue);case 7:return(function(l,h){const f=l.split("/"),g=h.split("/");for(let y=0;y<f.length&&y<g.length;y++){const w=Ce(f[y],g[y]);if(w!==0)return w}return Ce(f.length,g.length)})(r.referenceValue,e.referenceValue);case 8:return(function(l,h){const f=Ce(_t(l.latitude),_t(h.latitude));return f!==0?f:Ce(_t(l.longitude),_t(h.longitude))})(r.geoPointValue,e.geoPointValue);case 9:return w_(r.arrayValue,e.arrayValue);case 10:return(function(l,h){var f,g,y,w;const A=l.fields||{},R=h.fields||{},F=(f=A[cc])===null||f===void 0?void 0:f.arrayValue,B=(g=R[cc])===null||g===void 0?void 0:g.arrayValue,K=Ce(((y=F==null?void 0:F.values)===null||y===void 0?void 0:y.length)||0,((w=B==null?void 0:B.values)===null||w===void 0?void 0:w.length)||0);return K!==0?K:w_(F,B)})(r.mapValue,e.mapValue);case 11:return(function(l,h){if(l===Uu.mapValue&&h===Uu.mapValue)return 0;if(l===Uu.mapValue)return 1;if(h===Uu.mapValue)return-1;const f=l.fields||{},g=Object.keys(f),y=h.fields||{},w=Object.keys(y);g.sort(),w.sort();for(let A=0;A<g.length&&A<w.length;++A){const R=Wd(g[A],w[A]);if(R!==0)return R;const F=bo(f[g[A]],y[w[A]]);if(F!==0)return F}return Ce(g.length,w.length)})(r.mapValue,e.mapValue);default:throw ve(23264,{le:t})}}function E_(r,e){if(typeof r=="string"&&typeof e=="string"&&r.length===e.length)return Ce(r,e);const t=Fi(r),s=Fi(e),o=Ce(t.seconds,s.seconds);return o!==0?o:Ce(t.nanos,s.nanos)}function w_(r,e){const t=r.values||[],s=e.values||[];for(let o=0;o<t.length&&o<s.length;++o){const l=bo(t[o],s[o]);if(l)return l}return Ce(t.length,s.length)}function Mo(r){return Gd(r)}function Gd(r){return"nullValue"in r?"null":"booleanValue"in r?""+r.booleanValue:"integerValue"in r?""+r.integerValue:"doubleValue"in r?""+r.doubleValue:"timestampValue"in r?(function(t){const s=Fi(t);return`time(${s.seconds},${s.nanos})`})(r.timestampValue):"stringValue"in r?r.stringValue:"bytesValue"in r?(function(t){return ji(t).toBase64()})(r.bytesValue):"referenceValue"in r?(function(t){return me.fromName(t).toString()})(r.referenceValue):"geoPointValue"in r?(function(t){return`geo(${t.latitude},${t.longitude})`})(r.geoPointValue):"arrayValue"in r?(function(t){let s="[",o=!0;for(const l of t.values||[])o?o=!1:s+=",",s+=Gd(l);return s+"]"})(r.arrayValue):"mapValue"in r?(function(t){const s=Object.keys(t.fields||{}).sort();let o="{",l=!0;for(const h of s)l?l=!1:o+=",",o+=`${h}:${Gd(t.fields[h])}`;return o+"}"})(r.mapValue):ve(61005,{value:r})}function Qu(r){switch(Bi(r)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=Cc(r);return e?16+Qu(e):16;case 5:return 2*r.stringValue.length;case 6:return ji(r.bytesValue).approximateByteSize();case 7:return r.referenceValue.length;case 9:return(function(s){return(s.values||[]).reduce(((o,l)=>o+Qu(l)),0)})(r.arrayValue);case 10:case 11:return(function(s){let o=0;return Wi(s.fields,((l,h)=>{o+=l.length+Qu(h)})),o})(r.mapValue);default:throw ve(13486,{value:r})}}function T_(r,e){return{referenceValue:`projects/${r.projectId}/databases/${r.database}/documents/${e.path.canonicalString()}`}}function Kd(r){return!!r&&"integerValue"in r}function Nf(r){return!!r&&"arrayValue"in r}function I_(r){return!!r&&"nullValue"in r}function S_(r){return!!r&&"doubleValue"in r&&isNaN(Number(r.doubleValue))}function Xu(r){return!!r&&"mapValue"in r}function LA(r){var e,t;return((t=(((e=r==null?void 0:r.mapValue)===null||e===void 0?void 0:e.fields)||{})[kv])===null||t===void 0?void 0:t.stringValue)===Nv}function Wa(r){if(r.geoPointValue)return{geoPointValue:Object.assign({},r.geoPointValue)};if(r.timestampValue&&typeof r.timestampValue=="object")return{timestampValue:Object.assign({},r.timestampValue)};if(r.mapValue){const e={mapValue:{fields:{}}};return Wi(r.mapValue.fields,((t,s)=>e.mapValue.fields[t]=Wa(s))),e}if(r.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(r.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Wa(r.arrayValue.values[t]);return e}return Object.assign({},r)}function bA(r){return(((r.mapValue||{}).fields||{}).__type__||{}).stringValue===VA}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn{constructor(e){this.value=e}static empty(){return new cn({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let s=0;s<e.length-1;++s)if(t=(t.mapValue.fields||{})[e.get(s)],!Xu(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Wa(t)}setAll(e){let t=Ft.emptyPath(),s={},o=[];e.forEach(((h,f)=>{if(!t.isImmediateParentOf(f)){const g=this.getFieldsMap(t);this.applyChanges(g,s,o),s={},o=[],t=f.popLast()}h?s[f.lastSegment()]=Wa(h):o.push(f.lastSegment())}));const l=this.getFieldsMap(t);this.applyChanges(l,s,o)}delete(e){const t=this.field(e.popLast());Xu(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Rr(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let s=0;s<e.length;++s){let o=t.mapValue.fields[e.get(s)];Xu(o)&&o.mapValue.fields||(o={mapValue:{fields:{}}},t.mapValue.fields[e.get(s)]=o),t=o}return t.mapValue.fields}applyChanges(e,t,s){Wi(t,((o,l)=>e[o]=l));for(const o of s)delete e[o]}clone(){return new cn(Wa(this.value))}}function Dv(r){const e=[];return Wi(r.fields,((t,s)=>{const o=new Ft([t]);if(Xu(s)){const l=Dv(s.mapValue).fields;if(l.length===0)e.push(o);else for(const h of l)e.push(o.child(h))}else e.push(o)})),new yn(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gt{constructor(e,t,s,o,l,h,f){this.key=e,this.documentType=t,this.version=s,this.readTime=o,this.createTime=l,this.data=h,this.documentState=f}static newInvalidDocument(e){return new Gt(e,0,Te.min(),Te.min(),Te.min(),cn.empty(),0)}static newFoundDocument(e,t,s,o){return new Gt(e,1,t,Te.min(),s,o,0)}static newNoDocument(e,t){return new Gt(e,2,t,Te.min(),Te.min(),cn.empty(),0)}static newUnknownDocument(e,t){return new Gt(e,3,t,Te.min(),Te.min(),cn.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(Te.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=cn.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=cn.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Te.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Gt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Gt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hc{constructor(e,t){this.position=e,this.inclusive=t}}function A_(r,e,t){let s=0;for(let o=0;o<r.position.length;o++){const l=e[o],h=r.position[o];if(l.field.isKeyField()?s=me.comparator(me.fromName(h.referenceValue),t.key):s=bo(h,t.data.field(l.field)),l.dir==="desc"&&(s*=-1),s!==0)break}return s}function R_(r,e){if(r===null)return e===null;if(e===null||r.inclusive!==e.inclusive||r.position.length!==e.position.length)return!1;for(let t=0;t<r.position.length;t++)if(!Rr(r.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class il{constructor(e,t="asc"){this.field=e,this.dir=t}}function MA(r,e){return r.dir===e.dir&&r.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ov{}class Tt extends Ov{constructor(e,t,s){super(),this.field=e,this.op=t,this.value=s}static create(e,t,s){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,s):new FA(e,t,s):t==="array-contains"?new zA(e,s):t==="in"?new $A(e,s):t==="not-in"?new HA(e,s):t==="array-contains-any"?new qA(e,s):new Tt(e,t,s)}static createKeyFieldInFilter(e,t,s){return t==="in"?new jA(e,s):new BA(e,s)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&t.nullValue===void 0&&this.matchesComparison(bo(t,this.value)):t!==null&&Bi(this.value)===Bi(t)&&this.matchesComparison(bo(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return ve(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class nr extends Ov{constructor(e,t){super(),this.filters=e,this.op=t,this.he=null}static create(e,t){return new nr(e,t)}matches(e){return xv(this)?this.filters.find((t=>!t.matches(e)))===void 0:this.filters.find((t=>t.matches(e)))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce(((e,t)=>e.concat(t.getFlattenedFilters())),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function xv(r){return r.op==="and"}function Vv(r){return UA(r)&&xv(r)}function UA(r){for(const e of r.filters)if(e instanceof nr)return!1;return!0}function Qd(r){if(r instanceof Tt)return r.field.canonicalString()+r.op.toString()+Mo(r.value);if(Vv(r))return r.filters.map((e=>Qd(e))).join(",");{const e=r.filters.map((t=>Qd(t))).join(",");return`${r.op}(${e})`}}function Lv(r,e){return r instanceof Tt?(function(s,o){return o instanceof Tt&&s.op===o.op&&s.field.isEqual(o.field)&&Rr(s.value,o.value)})(r,e):r instanceof nr?(function(s,o){return o instanceof nr&&s.op===o.op&&s.filters.length===o.filters.length?s.filters.reduce(((l,h,f)=>l&&Lv(h,o.filters[f])),!0):!1})(r,e):void ve(19439)}function bv(r){return r instanceof Tt?(function(t){return`${t.field.canonicalString()} ${t.op} ${Mo(t.value)}`})(r):r instanceof nr?(function(t){return t.op.toString()+" {"+t.getFilters().map(bv).join(" ,")+"}"})(r):"Filter"}class FA extends Tt{constructor(e,t,s){super(e,t,s),this.key=me.fromName(s.referenceValue)}matches(e){const t=me.comparator(e.key,this.key);return this.matchesComparison(t)}}class jA extends Tt{constructor(e,t){super(e,"in",t),this.keys=Mv("in",t)}matches(e){return this.keys.some((t=>t.isEqual(e.key)))}}class BA extends Tt{constructor(e,t){super(e,"not-in",t),this.keys=Mv("not-in",t)}matches(e){return!this.keys.some((t=>t.isEqual(e.key)))}}function Mv(r,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map((s=>me.fromName(s.referenceValue)))}class zA extends Tt{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Nf(t)&&rl(t.arrayValue,this.value)}}class $A extends Tt{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&rl(this.value.arrayValue,t)}}class HA extends Tt{constructor(e,t){super(e,"not-in",t)}matches(e){if(rl(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&t.nullValue===void 0&&!rl(this.value.arrayValue,t)}}class qA extends Tt{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Nf(t)||!t.arrayValue.values)&&t.arrayValue.values.some((s=>rl(this.value.arrayValue,s)))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WA{constructor(e,t=null,s=[],o=[],l=null,h=null,f=null){this.path=e,this.collectionGroup=t,this.orderBy=s,this.filters=o,this.limit=l,this.startAt=h,this.endAt=f,this.Pe=null}}function C_(r,e=null,t=[],s=[],o=null,l=null,h=null){return new WA(r,e,t,s,o,l,h)}function Df(r){const e=Se(r);if(e.Pe===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map((s=>Qd(s))).join(","),t+="|ob:",t+=e.orderBy.map((s=>(function(l){return l.field.canonicalString()+l.dir})(s))).join(","),Rc(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map((s=>Mo(s))).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map((s=>Mo(s))).join(",")),e.Pe=t}return e.Pe}function Of(r,e){if(r.limit!==e.limit||r.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<r.orderBy.length;t++)if(!MA(r.orderBy[t],e.orderBy[t]))return!1;if(r.filters.length!==e.filters.length)return!1;for(let t=0;t<r.filters.length;t++)if(!Lv(r.filters[t],e.filters[t]))return!1;return r.collectionGroup===e.collectionGroup&&!!r.path.isEqual(e.path)&&!!R_(r.startAt,e.startAt)&&R_(r.endAt,e.endAt)}function Xd(r){return me.isDocumentKey(r.path)&&r.collectionGroup===null&&r.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo{constructor(e,t=null,s=[],o=[],l=null,h="F",f=null,g=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=s,this.filters=o,this.limit=l,this.limitType=h,this.startAt=f,this.endAt=g,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function GA(r,e,t,s,o,l,h,f){return new qo(r,e,t,s,o,l,h,f)}function Uv(r){return new qo(r)}function P_(r){return r.filters.length===0&&r.limit===null&&r.startAt==null&&r.endAt==null&&(r.explicitOrderBy.length===0||r.explicitOrderBy.length===1&&r.explicitOrderBy[0].field.isKeyField())}function Fv(r){return r.collectionGroup!==null}function Ga(r){const e=Se(r);if(e.Te===null){e.Te=[];const t=new Set;for(const l of e.explicitOrderBy)e.Te.push(l),t.add(l.field.canonicalString());const s=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(h){let f=new Pt(Ft.comparator);return h.filters.forEach((g=>{g.getFlattenedFilters().forEach((y=>{y.isInequality()&&(f=f.add(y.field))}))})),f})(e).forEach((l=>{t.has(l.canonicalString())||l.isKeyField()||e.Te.push(new il(l,s))})),t.has(Ft.keyField().canonicalString())||e.Te.push(new il(Ft.keyField(),s))}return e.Te}function Tr(r){const e=Se(r);return e.Ie||(e.Ie=KA(e,Ga(r))),e.Ie}function KA(r,e){if(r.limitType==="F")return C_(r.path,r.collectionGroup,e,r.filters,r.limit,r.startAt,r.endAt);{e=e.map((o=>{const l=o.dir==="desc"?"asc":"desc";return new il(o.field,l)}));const t=r.endAt?new hc(r.endAt.position,r.endAt.inclusive):null,s=r.startAt?new hc(r.startAt.position,r.startAt.inclusive):null;return C_(r.path,r.collectionGroup,e,r.filters,r.limit,t,s)}}function Yd(r,e){const t=r.filters.concat([e]);return new qo(r.path,r.collectionGroup,r.explicitOrderBy.slice(),t,r.limit,r.limitType,r.startAt,r.endAt)}function Jd(r,e,t){return new qo(r.path,r.collectionGroup,r.explicitOrderBy.slice(),r.filters.slice(),e,t,r.startAt,r.endAt)}function Pc(r,e){return Of(Tr(r),Tr(e))&&r.limitType===e.limitType}function jv(r){return`${Df(Tr(r))}|lt:${r.limitType}`}function So(r){return`Query(target=${(function(t){let s=t.path.canonicalString();return t.collectionGroup!==null&&(s+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(s+=`, filters: [${t.filters.map((o=>bv(o))).join(", ")}]`),Rc(t.limit)||(s+=", limit: "+t.limit),t.orderBy.length>0&&(s+=`, orderBy: [${t.orderBy.map((o=>(function(h){return`${h.field.canonicalString()} (${h.dir})`})(o))).join(", ")}]`),t.startAt&&(s+=", startAt: ",s+=t.startAt.inclusive?"b:":"a:",s+=t.startAt.position.map((o=>Mo(o))).join(",")),t.endAt&&(s+=", endAt: ",s+=t.endAt.inclusive?"a:":"b:",s+=t.endAt.position.map((o=>Mo(o))).join(",")),`Target(${s})`})(Tr(r))}; limitType=${r.limitType})`}function kc(r,e){return e.isFoundDocument()&&(function(s,o){const l=o.key.path;return s.collectionGroup!==null?o.key.hasCollectionId(s.collectionGroup)&&s.path.isPrefixOf(l):me.isDocumentKey(s.path)?s.path.isEqual(l):s.path.isImmediateParentOf(l)})(r,e)&&(function(s,o){for(const l of Ga(s))if(!l.field.isKeyField()&&o.data.field(l.field)===null)return!1;return!0})(r,e)&&(function(s,o){for(const l of s.filters)if(!l.matches(o))return!1;return!0})(r,e)&&(function(s,o){return!(s.startAt&&!(function(h,f,g){const y=A_(h,f,g);return h.inclusive?y<=0:y<0})(s.startAt,Ga(s),o)||s.endAt&&!(function(h,f,g){const y=A_(h,f,g);return h.inclusive?y>=0:y>0})(s.endAt,Ga(s),o))})(r,e)}function QA(r){return r.collectionGroup||(r.path.length%2==1?r.path.lastSegment():r.path.get(r.path.length-2))}function Bv(r){return(e,t)=>{let s=!1;for(const o of Ga(r)){const l=XA(o,e,t);if(l!==0)return l;s=s||o.field.isKeyField()}return 0}}function XA(r,e,t){const s=r.field.isKeyField()?me.comparator(e.key,t.key):(function(l,h,f){const g=h.data.field(l),y=f.data.field(l);return g!==null&&y!==null?bo(g,y):ve(42886)})(r.field,e,t);switch(r.dir){case"asc":return s;case"desc":return-1*s;default:return ve(19790,{direction:r.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Os{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s!==void 0){for(const[o,l]of s)if(this.equalsFn(o,e))return l}}has(e){return this.get(e)!==void 0}set(e,t){const s=this.mapKeyFn(e),o=this.inner[s];if(o===void 0)return this.inner[s]=[[e,t]],void this.innerSize++;for(let l=0;l<o.length;l++)if(this.equalsFn(o[l][0],e))return void(o[l]=[e,t]);o.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),s=this.inner[t];if(s===void 0)return!1;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],e))return s.length===1?delete this.inner[t]:s.splice(o,1),this.innerSize--,!0;return!1}forEach(e){Wi(this.inner,((t,s)=>{for(const[o,l]of s)e(o,l)}))}isEmpty(){return Iv(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YA=new lt(me.comparator);function Yr(){return YA}const zv=new lt(me.comparator);function Ba(...r){let e=zv;for(const t of r)e=e.insert(t.key,t);return e}function $v(r){let e=zv;return r.forEach(((t,s)=>e=e.insert(t,s.overlayedDocument))),e}function ws(){return Ka()}function Hv(){return Ka()}function Ka(){return new Os((r=>r.toString()),((r,e)=>r.isEqual(e)))}const JA=new lt(me.comparator),ZA=new Pt(me.comparator);function Oe(...r){let e=ZA;for(const t of r)e=e.add(t);return e}const eR=new Pt(Ce);function tR(){return eR}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xf(r,e){if(r.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:lc(e)?"-0":e}}function qv(r){return{integerValue:""+r}}function nR(r,e){return kA(e)?qv(e):xf(r,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(){this._=void 0}}function rR(r,e,t){return r instanceof sl?(function(o,l){const h={fields:{[Rv]:{stringValue:Av},[Pv]:{timestampValue:{seconds:o.seconds,nanos:o.nanoseconds}}}};return l&&kf(l)&&(l=Cc(l)),l&&(h.fields[Cv]=l),{mapValue:h}})(t,e):r instanceof ol?Gv(r,e):r instanceof al?Kv(r,e):(function(o,l){const h=Wv(o,l),f=k_(h)+k_(o.Ee);return Kd(h)&&Kd(o.Ee)?qv(f):xf(o.serializer,f)})(r,e)}function iR(r,e,t){return r instanceof ol?Gv(r,e):r instanceof al?Kv(r,e):t}function Wv(r,e){return r instanceof dc?(function(s){return Kd(s)||(function(l){return!!l&&"doubleValue"in l})(s)})(e)?e:{integerValue:0}:null}class sl extends Nc{}class ol extends Nc{constructor(e){super(),this.elements=e}}function Gv(r,e){const t=Qv(e);for(const s of r.elements)t.some((o=>Rr(o,s)))||t.push(s);return{arrayValue:{values:t}}}class al extends Nc{constructor(e){super(),this.elements=e}}function Kv(r,e){let t=Qv(e);for(const s of r.elements)t=t.filter((o=>!Rr(o,s)));return{arrayValue:{values:t}}}class dc extends Nc{constructor(e,t){super(),this.serializer=e,this.Ee=t}}function k_(r){return _t(r.integerValue||r.doubleValue)}function Qv(r){return Nf(r)&&r.arrayValue.values?r.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sR{constructor(e,t){this.field=e,this.transform=t}}function oR(r,e){return r.field.isEqual(e.field)&&(function(s,o){return s instanceof ol&&o instanceof ol||s instanceof al&&o instanceof al?Lo(s.elements,o.elements,Rr):s instanceof dc&&o instanceof dc?Rr(s.Ee,o.Ee):s instanceof sl&&o instanceof sl})(r.transform,e.transform)}class aR{constructor(e,t){this.version=e,this.transformResults=t}}class er{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new er}static exists(e){return new er(void 0,e)}static updateTime(e){return new er(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Yu(r,e){return r.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(r.updateTime):r.exists===void 0||r.exists===e.isFoundDocument()}class Dc{}function Xv(r,e){if(!r.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return r.isNoDocument()?new Vf(r.key,er.none()):new pl(r.key,r.data,er.none());{const t=r.data,s=cn.empty();let o=new Pt(Ft.comparator);for(let l of e.fields)if(!o.has(l)){let h=t.field(l);h===null&&l.length>1&&(l=l.popLast(),h=t.field(l)),h===null?s.delete(l):s.set(l,h),o=o.add(l)}return new Gi(r.key,s,new yn(o.toArray()),er.none())}}function lR(r,e,t){r instanceof pl?(function(o,l,h){const f=o.value.clone(),g=D_(o.fieldTransforms,l,h.transformResults);f.setAll(g),l.convertToFoundDocument(h.version,f).setHasCommittedMutations()})(r,e,t):r instanceof Gi?(function(o,l,h){if(!Yu(o.precondition,l))return void l.convertToUnknownDocument(h.version);const f=D_(o.fieldTransforms,l,h.transformResults),g=l.data;g.setAll(Yv(o)),g.setAll(f),l.convertToFoundDocument(h.version,g).setHasCommittedMutations()})(r,e,t):(function(o,l,h){l.convertToNoDocument(h.version).setHasCommittedMutations()})(0,e,t)}function Qa(r,e,t,s){return r instanceof pl?(function(l,h,f,g){if(!Yu(l.precondition,h))return f;const y=l.value.clone(),w=O_(l.fieldTransforms,g,h);return y.setAll(w),h.convertToFoundDocument(h.version,y).setHasLocalMutations(),null})(r,e,t,s):r instanceof Gi?(function(l,h,f,g){if(!Yu(l.precondition,h))return f;const y=O_(l.fieldTransforms,g,h),w=h.data;return w.setAll(Yv(l)),w.setAll(y),h.convertToFoundDocument(h.version,w).setHasLocalMutations(),f===null?null:f.unionWith(l.fieldMask.fields).unionWith(l.fieldTransforms.map((A=>A.field)))})(r,e,t,s):(function(l,h,f){return Yu(l.precondition,h)?(h.convertToNoDocument(h.version).setHasLocalMutations(),null):f})(r,e,t)}function uR(r,e){let t=null;for(const s of r.fieldTransforms){const o=e.data.field(s.field),l=Wv(s.transform,o||null);l!=null&&(t===null&&(t=cn.empty()),t.set(s.field,l))}return t||null}function N_(r,e){return r.type===e.type&&!!r.key.isEqual(e.key)&&!!r.precondition.isEqual(e.precondition)&&!!(function(s,o){return s===void 0&&o===void 0||!(!s||!o)&&Lo(s,o,((l,h)=>oR(l,h)))})(r.fieldTransforms,e.fieldTransforms)&&(r.type===0?r.value.isEqual(e.value):r.type!==1||r.data.isEqual(e.data)&&r.fieldMask.isEqual(e.fieldMask))}class pl extends Dc{constructor(e,t,s,o=[]){super(),this.key=e,this.value=t,this.precondition=s,this.fieldTransforms=o,this.type=0}getFieldMask(){return null}}class Gi extends Dc{constructor(e,t,s,o,l=[]){super(),this.key=e,this.data=t,this.fieldMask=s,this.precondition=o,this.fieldTransforms=l,this.type=1}getFieldMask(){return this.fieldMask}}function Yv(r){const e=new Map;return r.fieldMask.fields.forEach((t=>{if(!t.isEmpty()){const s=r.data.field(t);e.set(t,s)}})),e}function D_(r,e,t){const s=new Map;ze(r.length===t.length,32656,{Ae:t.length,Re:r.length});for(let o=0;o<t.length;o++){const l=r[o],h=l.transform,f=e.data.field(l.field);s.set(l.field,iR(h,f,t[o]))}return s}function O_(r,e,t){const s=new Map;for(const o of r){const l=o.transform,h=t.data.field(o.field);s.set(o.field,rR(l,h,e))}return s}class Vf extends Dc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class cR extends Dc{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hR{constructor(e,t,s,o){this.batchId=e,this.localWriteTime=t,this.baseMutations=s,this.mutations=o}applyToRemoteDocument(e,t){const s=t.mutationResults;for(let o=0;o<this.mutations.length;o++){const l=this.mutations[o];l.key.isEqual(e.key)&&lR(l,e,s[o])}}applyToLocalView(e,t){for(const s of this.baseMutations)s.key.isEqual(e.key)&&(t=Qa(s,e,t,this.localWriteTime));for(const s of this.mutations)s.key.isEqual(e.key)&&(t=Qa(s,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const s=Hv();return this.mutations.forEach((o=>{const l=e.get(o.key),h=l.overlayedDocument;let f=this.applyToLocalView(h,l.mutatedFields);f=t.has(o.key)?null:f;const g=Xv(h,f);g!==null&&s.set(o.key,g),h.isValidDocument()||h.convertToNoDocument(Te.min())})),s}keys(){return this.mutations.reduce(((e,t)=>e.add(t.key)),Oe())}isEqual(e){return this.batchId===e.batchId&&Lo(this.mutations,e.mutations,((t,s)=>N_(t,s)))&&Lo(this.baseMutations,e.baseMutations,((t,s)=>N_(t,s)))}}class Lf{constructor(e,t,s,o){this.batch=e,this.commitVersion=t,this.mutationResults=s,this.docVersions=o}static from(e,t,s){ze(e.mutations.length===s.length,58842,{Ve:e.mutations.length,me:s.length});let o=(function(){return JA})();const l=e.mutations;for(let h=0;h<l.length;h++)o=o.insert(l[h].key,s[h].version);return new Lf(e,t,s,o)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dR{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fR{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var wt,Me;function pR(r){switch(r){case $.OK:return ve(64938);case $.CANCELLED:case $.UNKNOWN:case $.DEADLINE_EXCEEDED:case $.RESOURCE_EXHAUSTED:case $.INTERNAL:case $.UNAVAILABLE:case $.UNAUTHENTICATED:return!1;case $.INVALID_ARGUMENT:case $.NOT_FOUND:case $.ALREADY_EXISTS:case $.PERMISSION_DENIED:case $.FAILED_PRECONDITION:case $.ABORTED:case $.OUT_OF_RANGE:case $.UNIMPLEMENTED:case $.DATA_LOSS:return!0;default:return ve(15467,{code:r})}}function Jv(r){if(r===void 0)return Xr("GRPC error has no .code"),$.UNKNOWN;switch(r){case wt.OK:return $.OK;case wt.CANCELLED:return $.CANCELLED;case wt.UNKNOWN:return $.UNKNOWN;case wt.DEADLINE_EXCEEDED:return $.DEADLINE_EXCEEDED;case wt.RESOURCE_EXHAUSTED:return $.RESOURCE_EXHAUSTED;case wt.INTERNAL:return $.INTERNAL;case wt.UNAVAILABLE:return $.UNAVAILABLE;case wt.UNAUTHENTICATED:return $.UNAUTHENTICATED;case wt.INVALID_ARGUMENT:return $.INVALID_ARGUMENT;case wt.NOT_FOUND:return $.NOT_FOUND;case wt.ALREADY_EXISTS:return $.ALREADY_EXISTS;case wt.PERMISSION_DENIED:return $.PERMISSION_DENIED;case wt.FAILED_PRECONDITION:return $.FAILED_PRECONDITION;case wt.ABORTED:return $.ABORTED;case wt.OUT_OF_RANGE:return $.OUT_OF_RANGE;case wt.UNIMPLEMENTED:return $.UNIMPLEMENTED;case wt.DATA_LOSS:return $.DATA_LOSS;default:return ve(39323,{code:r})}}(Me=wt||(wt={}))[Me.OK=0]="OK",Me[Me.CANCELLED=1]="CANCELLED",Me[Me.UNKNOWN=2]="UNKNOWN",Me[Me.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Me[Me.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Me[Me.NOT_FOUND=5]="NOT_FOUND",Me[Me.ALREADY_EXISTS=6]="ALREADY_EXISTS",Me[Me.PERMISSION_DENIED=7]="PERMISSION_DENIED",Me[Me.UNAUTHENTICATED=16]="UNAUTHENTICATED",Me[Me.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Me[Me.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Me[Me.ABORTED=10]="ABORTED",Me[Me.OUT_OF_RANGE=11]="OUT_OF_RANGE",Me[Me.UNIMPLEMENTED=12]="UNIMPLEMENTED",Me[Me.INTERNAL=13]="INTERNAL",Me[Me.UNAVAILABLE=14]="UNAVAILABLE",Me[Me.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mR=new xi([4294967295,4294967295],0);function x_(r){const e=vv().encode(r),t=new hv;return t.update(e),new Uint8Array(t.digest())}function V_(r){const e=new DataView(r.buffer),t=e.getUint32(0,!0),s=e.getUint32(4,!0),o=e.getUint32(8,!0),l=e.getUint32(12,!0);return[new xi([t,s],0),new xi([o,l],0)]}class bf{constructor(e,t,s){if(this.bitmap=e,this.padding=t,this.hashCount=s,t<0||t>=8)throw new za(`Invalid padding: ${t}`);if(s<0)throw new za(`Invalid hash count: ${s}`);if(e.length>0&&this.hashCount===0)throw new za(`Invalid hash count: ${s}`);if(e.length===0&&t!==0)throw new za(`Invalid padding when bitmap length is 0: ${t}`);this.fe=8*e.length-t,this.ge=xi.fromNumber(this.fe)}pe(e,t,s){let o=e.add(t.multiply(xi.fromNumber(s)));return o.compare(mR)===1&&(o=new xi([o.getBits(0),o.getBits(1)],0)),o.modulo(this.ge).toNumber()}ye(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.fe===0)return!1;const t=x_(e),[s,o]=V_(t);for(let l=0;l<this.hashCount;l++){const h=this.pe(s,o,l);if(!this.ye(h))return!1}return!0}static create(e,t,s){const o=e%8==0?0:8-e%8,l=new Uint8Array(Math.ceil(e/8)),h=new bf(l,o,t);return s.forEach((f=>h.insert(f))),h}insert(e){if(this.fe===0)return;const t=x_(e),[s,o]=V_(t);for(let l=0;l<this.hashCount;l++){const h=this.pe(s,o,l);this.we(h)}}we(e){const t=Math.floor(e/8),s=e%8;this.bitmap[t]|=1<<s}}class za extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oc{constructor(e,t,s,o,l){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=s,this.documentUpdates=o,this.resolvedLimboDocuments=l}static createSynthesizedRemoteEventForCurrentChange(e,t,s){const o=new Map;return o.set(e,ml.createSynthesizedTargetChangeForCurrentChange(e,t,s)),new Oc(Te.min(),o,new lt(Ce),Yr(),Oe())}}class ml{constructor(e,t,s,o,l){this.resumeToken=e,this.current=t,this.addedDocuments=s,this.modifiedDocuments=o,this.removedDocuments=l}static createSynthesizedTargetChangeForCurrentChange(e,t,s){return new ml(s,t,Oe(),Oe(),Oe())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ju{constructor(e,t,s,o){this.Se=e,this.removedTargetIds=t,this.key=s,this.be=o}}class Zv{constructor(e,t){this.targetId=e,this.De=t}}class eE{constructor(e,t,s=jt.EMPTY_BYTE_STRING,o=null){this.state=e,this.targetIds=t,this.resumeToken=s,this.cause=o}}class L_{constructor(){this.ve=0,this.Ce=b_(),this.Fe=jt.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(e){e.approximateByteSize()>0&&(this.xe=!0,this.Fe=e)}Le(){let e=Oe(),t=Oe(),s=Oe();return this.Ce.forEach(((o,l)=>{switch(l){case 0:e=e.add(o);break;case 2:t=t.add(o);break;case 1:s=s.add(o);break;default:ve(38017,{changeType:l})}})),new ml(this.Fe,this.Me,e,t,s)}ke(){this.xe=!1,this.Ce=b_()}qe(e,t){this.xe=!0,this.Ce=this.Ce.insert(e,t)}Qe(e){this.xe=!0,this.Ce=this.Ce.remove(e)}$e(){this.ve+=1}Ue(){this.ve-=1,ze(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class gR{constructor(e){this.We=e,this.Ge=new Map,this.ze=Yr(),this.je=Fu(),this.Je=Fu(),this.He=new lt(Ce)}Ye(e){for(const t of e.Se)e.be&&e.be.isFoundDocument()?this.Ze(t,e.be):this.Xe(t,e.key,e.be);for(const t of e.removedTargetIds)this.Xe(t,e.key,e.be)}et(e){this.forEachTarget(e,(t=>{const s=this.tt(t);switch(e.state){case 0:this.nt(t)&&s.Be(e.resumeToken);break;case 1:s.Ue(),s.Oe||s.ke(),s.Be(e.resumeToken);break;case 2:s.Ue(),s.Oe||this.removeTarget(t);break;case 3:this.nt(t)&&(s.Ke(),s.Be(e.resumeToken));break;case 4:this.nt(t)&&(this.rt(t),s.Be(e.resumeToken));break;default:ve(56790,{state:e.state})}}))}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Ge.forEach(((s,o)=>{this.nt(o)&&t(o)}))}it(e){const t=e.targetId,s=e.De.count,o=this.st(t);if(o){const l=o.target;if(Xd(l))if(s===0){const h=new me(l.path);this.Xe(t,h,Gt.newNoDocument(h,Te.min()))}else ze(s===1,20013,{expectedCount:s});else{const h=this.ot(t);if(h!==s){const f=this._t(e),g=f?this.ut(f,e,h):1;if(g!==0){this.rt(t);const y=g===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(t,y)}}}}}_t(e){const t=e.De.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:s="",padding:o=0},hashCount:l=0}=t;let h,f;try{h=ji(s).toUint8Array()}catch(g){if(g instanceof Sv)return Mi("Decoding the base64 bloom filter in existence filter failed ("+g.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw g}try{f=new bf(h,o,l)}catch(g){return Mi(g instanceof za?"BloomFilter error: ":"Applying bloom filter failed: ",g),null}return f.fe===0?null:f}ut(e,t,s){return t.De.count===s-this.ht(e,t.targetId)?0:2}ht(e,t){const s=this.We.getRemoteKeysForTarget(t);let o=0;return s.forEach((l=>{const h=this.We.lt(),f=`projects/${h.projectId}/databases/${h.database}/documents/${l.path.canonicalString()}`;e.mightContain(f)||(this.Xe(t,l,null),o++)})),o}Pt(e){const t=new Map;this.Ge.forEach(((l,h)=>{const f=this.st(h);if(f){if(l.current&&Xd(f.target)){const g=new me(f.target.path);this.Tt(g).has(h)||this.It(h,g)||this.Xe(h,g,Gt.newNoDocument(g,e))}l.Ne&&(t.set(h,l.Le()),l.ke())}}));let s=Oe();this.Je.forEach(((l,h)=>{let f=!0;h.forEachWhile((g=>{const y=this.st(g);return!y||y.purpose==="TargetPurposeLimboResolution"||(f=!1,!1)})),f&&(s=s.add(l))})),this.ze.forEach(((l,h)=>h.setReadTime(e)));const o=new Oc(e,t,this.He,this.ze,s);return this.ze=Yr(),this.je=Fu(),this.Je=Fu(),this.He=new lt(Ce),o}Ze(e,t){if(!this.nt(e))return;const s=this.It(e,t.key)?2:0;this.tt(e).qe(t.key,s),this.ze=this.ze.insert(t.key,t),this.je=this.je.insert(t.key,this.Tt(t.key).add(e)),this.Je=this.Je.insert(t.key,this.dt(t.key).add(e))}Xe(e,t,s){if(!this.nt(e))return;const o=this.tt(e);this.It(e,t)?o.qe(t,1):o.Qe(t),this.Je=this.Je.insert(t,this.dt(t).delete(e)),this.Je=this.Je.insert(t,this.dt(t).add(e)),s&&(this.ze=this.ze.insert(t,s))}removeTarget(e){this.Ge.delete(e)}ot(e){const t=this.tt(e).Le();return this.We.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}$e(e){this.tt(e).$e()}tt(e){let t=this.Ge.get(e);return t||(t=new L_,this.Ge.set(e,t)),t}dt(e){let t=this.Je.get(e);return t||(t=new Pt(Ce),this.Je=this.Je.insert(e,t)),t}Tt(e){let t=this.je.get(e);return t||(t=new Pt(Ce),this.je=this.je.insert(e,t)),t}nt(e){const t=this.st(e)!==null;return t||ie("WatchChangeAggregator","Detected inactive target",e),t}st(e){const t=this.Ge.get(e);return t&&t.Oe?null:this.We.Et(e)}rt(e){this.Ge.set(e,new L_),this.We.getRemoteKeysForTarget(e).forEach((t=>{this.Xe(e,t,null)}))}It(e,t){return this.We.getRemoteKeysForTarget(e).has(t)}}function Fu(){return new lt(me.comparator)}function b_(){return new lt(me.comparator)}const _R={asc:"ASCENDING",desc:"DESCENDING"},yR={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},vR={and:"AND",or:"OR"};class ER{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Zd(r,e){return r.useProto3Json||Rc(e)?e:{value:e}}function fc(r,e){return r.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function tE(r,e){return r.useProto3Json?e.toBase64():e.toUint8Array()}function wR(r,e){return fc(r,e.toTimestamp())}function Ir(r){return ze(!!r,49232),Te.fromTimestamp((function(t){const s=Fi(t);return new tt(s.seconds,s.nanos)})(r))}function Mf(r,e){return ef(r,e).canonicalString()}function ef(r,e){const t=(function(o){return new Xe(["projects",o.projectId,"databases",o.database])})(r).child("documents");return e===void 0?t:t.child(e)}function nE(r){const e=Xe.fromString(r);return ze(aE(e),10190,{key:e.toString()}),e}function tf(r,e){return Mf(r.databaseId,e.path)}function Ad(r,e){const t=nE(e);if(t.get(1)!==r.databaseId.projectId)throw new ne($.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+r.databaseId.projectId);if(t.get(3)!==r.databaseId.database)throw new ne($.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+r.databaseId.database);return new me(iE(t))}function rE(r,e){return Mf(r.databaseId,e)}function TR(r){const e=nE(r);return e.length===4?Xe.emptyPath():iE(e)}function nf(r){return new Xe(["projects",r.databaseId.projectId,"databases",r.databaseId.database]).canonicalString()}function iE(r){return ze(r.length>4&&r.get(4)==="documents",29091,{key:r.toString()}),r.popFirst(5)}function M_(r,e,t){return{name:tf(r,e),fields:t.value.mapValue.fields}}function IR(r,e){let t;if("targetChange"in e){e.targetChange;const s=(function(y){return y==="NO_CHANGE"?0:y==="ADD"?1:y==="REMOVE"?2:y==="CURRENT"?3:y==="RESET"?4:ve(39313,{state:y})})(e.targetChange.targetChangeType||"NO_CHANGE"),o=e.targetChange.targetIds||[],l=(function(y,w){return y.useProto3Json?(ze(w===void 0||typeof w=="string",58123),jt.fromBase64String(w||"")):(ze(w===void 0||w instanceof Buffer||w instanceof Uint8Array,16193),jt.fromUint8Array(w||new Uint8Array))})(r,e.targetChange.resumeToken),h=e.targetChange.cause,f=h&&(function(y){const w=y.code===void 0?$.UNKNOWN:Jv(y.code);return new ne(w,y.message||"")})(h);t=new eE(s,o,l,f||null)}else if("documentChange"in e){e.documentChange;const s=e.documentChange;s.document,s.document.name,s.document.updateTime;const o=Ad(r,s.document.name),l=Ir(s.document.updateTime),h=s.document.createTime?Ir(s.document.createTime):Te.min(),f=new cn({mapValue:{fields:s.document.fields}}),g=Gt.newFoundDocument(o,l,h,f),y=s.targetIds||[],w=s.removedTargetIds||[];t=new Ju(y,w,g.key,g)}else if("documentDelete"in e){e.documentDelete;const s=e.documentDelete;s.document;const o=Ad(r,s.document),l=s.readTime?Ir(s.readTime):Te.min(),h=Gt.newNoDocument(o,l),f=s.removedTargetIds||[];t=new Ju([],f,h.key,h)}else if("documentRemove"in e){e.documentRemove;const s=e.documentRemove;s.document;const o=Ad(r,s.document),l=s.removedTargetIds||[];t=new Ju([],l,o,null)}else{if(!("filter"in e))return ve(11601,{At:e});{e.filter;const s=e.filter;s.targetId;const{count:o=0,unchangedNames:l}=s,h=new fR(o,l),f=s.targetId;t=new Zv(f,h)}}return t}function SR(r,e){let t;if(e instanceof pl)t={update:M_(r,e.key,e.value)};else if(e instanceof Vf)t={delete:tf(r,e.key)};else if(e instanceof Gi)t={update:M_(r,e.key,e.data),updateMask:xR(e.fieldMask)};else{if(!(e instanceof cR))return ve(16599,{Rt:e.type});t={verify:tf(r,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map((s=>(function(l,h){const f=h.transform;if(f instanceof sl)return{fieldPath:h.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(f instanceof ol)return{fieldPath:h.field.canonicalString(),appendMissingElements:{values:f.elements}};if(f instanceof al)return{fieldPath:h.field.canonicalString(),removeAllFromArray:{values:f.elements}};if(f instanceof dc)return{fieldPath:h.field.canonicalString(),increment:f.Ee};throw ve(20930,{transform:h.transform})})(0,s)))),e.precondition.isNone||(t.currentDocument=(function(o,l){return l.updateTime!==void 0?{updateTime:wR(o,l.updateTime)}:l.exists!==void 0?{exists:l.exists}:ve(27497)})(r,e.precondition)),t}function AR(r,e){return r&&r.length>0?(ze(e!==void 0,14353),r.map((t=>(function(o,l){let h=o.updateTime?Ir(o.updateTime):Ir(l);return h.isEqual(Te.min())&&(h=Ir(l)),new aR(h,o.transformResults||[])})(t,e)))):[]}function RR(r,e){return{documents:[rE(r,e.path)]}}function CR(r,e){const t={structuredQuery:{}},s=e.path;let o;e.collectionGroup!==null?(o=s,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(o=s.popLast(),t.structuredQuery.from=[{collectionId:s.lastSegment()}]),t.parent=rE(r,o);const l=(function(y){if(y.length!==0)return oE(nr.create(y,"and"))})(e.filters);l&&(t.structuredQuery.where=l);const h=(function(y){if(y.length!==0)return y.map((w=>(function(R){return{field:Ao(R.field),direction:NR(R.dir)}})(w)))})(e.orderBy);h&&(t.structuredQuery.orderBy=h);const f=Zd(r,e.limit);return f!==null&&(t.structuredQuery.limit=f),e.startAt&&(t.structuredQuery.startAt=(function(y){return{before:y.inclusive,values:y.position}})(e.startAt)),e.endAt&&(t.structuredQuery.endAt=(function(y){return{before:!y.inclusive,values:y.position}})(e.endAt)),{Vt:t,parent:o}}function PR(r){let e=TR(r.parent);const t=r.structuredQuery,s=t.from?t.from.length:0;let o=null;if(s>0){ze(s===1,65062);const w=t.from[0];w.allDescendants?o=w.collectionId:e=e.child(w.collectionId)}let l=[];t.where&&(l=(function(A){const R=sE(A);return R instanceof nr&&Vv(R)?R.getFilters():[R]})(t.where));let h=[];t.orderBy&&(h=(function(A){return A.map((R=>(function(B){return new il(Ro(B.field),(function(z){switch(z){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}})(B.direction))})(R)))})(t.orderBy));let f=null;t.limit&&(f=(function(A){let R;return R=typeof A=="object"?A.value:A,Rc(R)?null:R})(t.limit));let g=null;t.startAt&&(g=(function(A){const R=!!A.before,F=A.values||[];return new hc(F,R)})(t.startAt));let y=null;return t.endAt&&(y=(function(A){const R=!A.before,F=A.values||[];return new hc(F,R)})(t.endAt)),GA(e,o,h,l,f,"F",g,y)}function kR(r,e){const t=(function(o){switch(o){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return ve(28987,{purpose:o})}})(e.purpose);return t==null?null:{"goog-listen-tags":t}}function sE(r){return r.unaryFilter!==void 0?(function(t){switch(t.unaryFilter.op){case"IS_NAN":const s=Ro(t.unaryFilter.field);return Tt.create(s,"==",{doubleValue:NaN});case"IS_NULL":const o=Ro(t.unaryFilter.field);return Tt.create(o,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const l=Ro(t.unaryFilter.field);return Tt.create(l,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const h=Ro(t.unaryFilter.field);return Tt.create(h,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return ve(61313);default:return ve(60726)}})(r):r.fieldFilter!==void 0?(function(t){return Tt.create(Ro(t.fieldFilter.field),(function(o){switch(o){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return ve(58110);default:return ve(50506)}})(t.fieldFilter.op),t.fieldFilter.value)})(r):r.compositeFilter!==void 0?(function(t){return nr.create(t.compositeFilter.filters.map((s=>sE(s))),(function(o){switch(o){case"AND":return"and";case"OR":return"or";default:return ve(1026)}})(t.compositeFilter.op))})(r):ve(30097,{filter:r})}function NR(r){return _R[r]}function DR(r){return yR[r]}function OR(r){return vR[r]}function Ao(r){return{fieldPath:r.canonicalString()}}function Ro(r){return Ft.fromServerFormat(r.fieldPath)}function oE(r){return r instanceof Tt?(function(t){if(t.op==="=="){if(S_(t.value))return{unaryFilter:{field:Ao(t.field),op:"IS_NAN"}};if(I_(t.value))return{unaryFilter:{field:Ao(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(S_(t.value))return{unaryFilter:{field:Ao(t.field),op:"IS_NOT_NAN"}};if(I_(t.value))return{unaryFilter:{field:Ao(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Ao(t.field),op:DR(t.op),value:t.value}}})(r):r instanceof nr?(function(t){const s=t.getFilters().map((o=>oE(o)));return s.length===1?s[0]:{compositeFilter:{op:OR(t.op),filters:s}}})(r):ve(54877,{filter:r})}function xR(r){const e=[];return r.fields.forEach((t=>e.push(t.canonicalString()))),{fieldPaths:e}}function aE(r){return r.length>=4&&r.get(0)==="projects"&&r.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ki{constructor(e,t,s,o,l=Te.min(),h=Te.min(),f=jt.EMPTY_BYTE_STRING,g=null){this.target=e,this.targetId=t,this.purpose=s,this.sequenceNumber=o,this.snapshotVersion=l,this.lastLimboFreeSnapshotVersion=h,this.resumeToken=f,this.expectedCount=g}withSequenceNumber(e){return new ki(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new ki(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new ki(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new ki(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class VR{constructor(e){this.gt=e}}function LR(r){const e=PR({parent:r.parent,structuredQuery:r.structuredQuery});return r.limitType==="LAST"?Jd(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bR{constructor(){this.Dn=new MR}addToCollectionParentIndex(e,t){return this.Dn.add(t),q.resolve()}getCollectionParents(e,t){return q.resolve(this.Dn.getEntries(t))}addFieldIndex(e,t){return q.resolve()}deleteFieldIndex(e,t){return q.resolve()}deleteAllFieldIndexes(e){return q.resolve()}createTargetIndexes(e,t){return q.resolve()}getDocumentsMatchingTarget(e,t){return q.resolve(null)}getIndexType(e,t){return q.resolve(0)}getFieldIndexes(e,t){return q.resolve([])}getNextCollectionGroupToUpdate(e){return q.resolve(null)}getMinOffset(e,t){return q.resolve(Ui.min())}getMinOffsetFromCollectionGroup(e,t){return q.resolve(Ui.min())}updateCollectionGroup(e,t,s){return q.resolve()}updateIndexEntries(e,t){return q.resolve()}}class MR{constructor(){this.index={}}add(e){const t=e.lastSegment(),s=e.popLast(),o=this.index[t]||new Pt(Xe.comparator),l=!o.has(s);return this.index[t]=o.add(s),l}has(e){const t=e.lastSegment(),s=e.popLast(),o=this.index[t];return o&&o.has(s)}getEntries(e){return(this.index[e]||new Pt(Xe.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U_={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},lE=41943040;class un{static withCacheSize(e){return new un(e,un.DEFAULT_COLLECTION_PERCENTILE,un.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,t,s){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */un.DEFAULT_COLLECTION_PERCENTILE=10,un.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,un.DEFAULT=new un(lE,un.DEFAULT_COLLECTION_PERCENTILE,un.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),un.DISABLED=new un(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{constructor(e){this._r=e}next(){return this._r+=2,this._r}static ar(){return new Uo(0)}static ur(){return new Uo(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F_="LruGarbageCollector",UR=1048576;function j_([r,e],[t,s]){const o=Ce(r,t);return o===0?Ce(e,s):o}class FR{constructor(e){this.Tr=e,this.buffer=new Pt(j_),this.Ir=0}dr(){return++this.Ir}Er(e){const t=[e,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(t);else{const s=this.buffer.last();j_(t,s)<0&&(this.buffer=this.buffer.delete(s).add(t))}}get maxValue(){return this.buffer.last()[0]}}class jR{constructor(e,t,s){this.garbageCollector=e,this.asyncQueue=t,this.localStore=s,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(e){ie(F_,`Garbage collection scheduled in ${e}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,(async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Ho(t)?ie(F_,"Ignoring IndexedDB error during garbage collection: ",t):await $o(t)}await this.Rr(3e5)}))}}class BR{constructor(e,t){this.Vr=e,this.params=t}calculateTargetCount(e,t){return this.Vr.mr(e).next((s=>Math.floor(t/100*s)))}nthSequenceNumber(e,t){if(t===0)return q.resolve(Ac.ue);const s=new FR(t);return this.Vr.forEachTarget(e,(o=>s.Er(o.sequenceNumber))).next((()=>this.Vr.gr(e,(o=>s.Er(o))))).next((()=>s.maxValue))}removeTargets(e,t,s){return this.Vr.removeTargets(e,t,s)}removeOrphanedDocuments(e,t){return this.Vr.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(ie("LruGarbageCollector","Garbage collection skipped; disabled"),q.resolve(U_)):this.getCacheSize(e).next((s=>s<this.params.cacheSizeCollectionThreshold?(ie("LruGarbageCollector",`Garbage collection skipped; Cache size ${s} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),U_):this.pr(e,t)))}getCacheSize(e){return this.Vr.getCacheSize(e)}pr(e,t){let s,o,l,h,f,g,y;const w=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next((A=>(A>this.params.maximumSequenceNumbersToCollect?(ie("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${A}`),o=this.params.maximumSequenceNumbersToCollect):o=A,h=Date.now(),this.nthSequenceNumber(e,o)))).next((A=>(s=A,f=Date.now(),this.removeTargets(e,s,t)))).next((A=>(l=A,g=Date.now(),this.removeOrphanedDocuments(e,s)))).next((A=>(y=Date.now(),Io()<=De.DEBUG&&ie("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${h-w}ms
	Determined least recently used ${o} in `+(f-h)+`ms
	Removed ${l} targets in `+(g-f)+`ms
	Removed ${A} documents in `+(y-g)+`ms
Total Duration: ${y-w}ms`),q.resolve({didRun:!0,sequenceNumbersCollected:o,targetsRemoved:l,documentsRemoved:A}))))}}function zR(r,e){return new BR(r,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $R{constructor(){this.changes=new Os((e=>e.toString()),((e,t)=>e.isEqual(t))),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Gt.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const s=this.changes.get(t);return s!==void 0?q.resolve(s):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HR{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qR{constructor(e,t,s,o){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=s,this.indexManager=o}getDocument(e,t){let s=null;return this.documentOverlayCache.getOverlay(e,t).next((o=>(s=o,this.remoteDocumentCache.getEntry(e,t)))).next((o=>(s!==null&&Qa(s.mutation,o,yn.empty(),tt.now()),o)))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next((s=>this.getLocalViewOfDocuments(e,s,Oe()).next((()=>s))))}getLocalViewOfDocuments(e,t,s=Oe()){const o=ws();return this.populateOverlays(e,o,t).next((()=>this.computeViews(e,t,o,s).next((l=>{let h=Ba();return l.forEach(((f,g)=>{h=h.insert(f,g.overlayedDocument)})),h}))))}getOverlayedDocuments(e,t){const s=ws();return this.populateOverlays(e,s,t).next((()=>this.computeViews(e,t,s,Oe())))}populateOverlays(e,t,s){const o=[];return s.forEach((l=>{t.has(l)||o.push(l)})),this.documentOverlayCache.getOverlays(e,o).next((l=>{l.forEach(((h,f)=>{t.set(h,f)}))}))}computeViews(e,t,s,o){let l=Yr();const h=Ka(),f=(function(){return Ka()})();return t.forEach(((g,y)=>{const w=s.get(y.key);o.has(y.key)&&(w===void 0||w.mutation instanceof Gi)?l=l.insert(y.key,y):w!==void 0?(h.set(y.key,w.mutation.getFieldMask()),Qa(w.mutation,y,w.mutation.getFieldMask(),tt.now())):h.set(y.key,yn.empty())})),this.recalculateAndSaveOverlays(e,l).next((g=>(g.forEach(((y,w)=>h.set(y,w))),t.forEach(((y,w)=>{var A;return f.set(y,new HR(w,(A=h.get(y))!==null&&A!==void 0?A:null))})),f)))}recalculateAndSaveOverlays(e,t){const s=Ka();let o=new lt(((h,f)=>h-f)),l=Oe();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next((h=>{for(const f of h)f.keys().forEach((g=>{const y=t.get(g);if(y===null)return;let w=s.get(g)||yn.empty();w=f.applyToLocalView(y,w),s.set(g,w);const A=(o.get(f.batchId)||Oe()).add(g);o=o.insert(f.batchId,A)}))})).next((()=>{const h=[],f=o.getReverseIterator();for(;f.hasNext();){const g=f.getNext(),y=g.key,w=g.value,A=Hv();w.forEach((R=>{if(!l.has(R)){const F=Xv(t.get(R),s.get(R));F!==null&&A.set(R,F),l=l.add(R)}})),h.push(this.documentOverlayCache.saveOverlays(e,y,A))}return q.waitFor(h)})).next((()=>s))}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next((s=>this.recalculateAndSaveOverlays(e,s)))}getDocumentsMatchingQuery(e,t,s,o){return(function(h){return me.isDocumentKey(h.path)&&h.collectionGroup===null&&h.filters.length===0})(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Fv(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,s,o):this.getDocumentsMatchingCollectionQuery(e,t,s,o)}getNextDocuments(e,t,s,o){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,s,o).next((l=>{const h=o-l.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,s.largestBatchId,o-l.size):q.resolve(ws());let f=el,g=l;return h.next((y=>q.forEach(y,((w,A)=>(f<A.largestBatchId&&(f=A.largestBatchId),l.get(w)?q.resolve():this.remoteDocumentCache.getEntry(e,w).next((R=>{g=g.insert(w,R)}))))).next((()=>this.populateOverlays(e,y,l))).next((()=>this.computeViews(e,g,y,Oe()))).next((w=>({batchId:f,changes:$v(w)})))))}))}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new me(t)).next((s=>{let o=Ba();return s.isFoundDocument()&&(o=o.insert(s.key,s)),o}))}getDocumentsMatchingCollectionGroupQuery(e,t,s,o){const l=t.collectionGroup;let h=Ba();return this.indexManager.getCollectionParents(e,l).next((f=>q.forEach(f,(g=>{const y=(function(A,R){return new qo(R,null,A.explicitOrderBy.slice(),A.filters.slice(),A.limit,A.limitType,A.startAt,A.endAt)})(t,g.child(l));return this.getDocumentsMatchingCollectionQuery(e,y,s,o).next((w=>{w.forEach(((A,R)=>{h=h.insert(A,R)}))}))})).next((()=>h))))}getDocumentsMatchingCollectionQuery(e,t,s,o){let l;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,s.largestBatchId).next((h=>(l=h,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,s,l,o)))).next((h=>{l.forEach(((g,y)=>{const w=y.getKey();h.get(w)===null&&(h=h.insert(w,Gt.newInvalidDocument(w)))}));let f=Ba();return h.forEach(((g,y)=>{const w=l.get(g);w!==void 0&&Qa(w.mutation,y,yn.empty(),tt.now()),kc(t,y)&&(f=f.insert(g,y))})),f}))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WR{constructor(e){this.serializer=e,this.Br=new Map,this.Lr=new Map}getBundleMetadata(e,t){return q.resolve(this.Br.get(t))}saveBundleMetadata(e,t){return this.Br.set(t.id,(function(o){return{id:o.id,version:o.version,createTime:Ir(o.createTime)}})(t)),q.resolve()}getNamedQuery(e,t){return q.resolve(this.Lr.get(t))}saveNamedQuery(e,t){return this.Lr.set(t.name,(function(o){return{name:o.name,query:LR(o.bundledQuery),readTime:Ir(o.readTime)}})(t)),q.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GR{constructor(){this.overlays=new lt(me.comparator),this.kr=new Map}getOverlay(e,t){return q.resolve(this.overlays.get(t))}getOverlays(e,t){const s=ws();return q.forEach(t,(o=>this.getOverlay(e,o).next((l=>{l!==null&&s.set(o,l)})))).next((()=>s))}saveOverlays(e,t,s){return s.forEach(((o,l)=>{this.wt(e,t,l)})),q.resolve()}removeOverlaysForBatchId(e,t,s){const o=this.kr.get(s);return o!==void 0&&(o.forEach((l=>this.overlays=this.overlays.remove(l))),this.kr.delete(s)),q.resolve()}getOverlaysForCollection(e,t,s){const o=ws(),l=t.length+1,h=new me(t.child("")),f=this.overlays.getIteratorFrom(h);for(;f.hasNext();){const g=f.getNext().value,y=g.getKey();if(!t.isPrefixOf(y.path))break;y.path.length===l&&g.largestBatchId>s&&o.set(g.getKey(),g)}return q.resolve(o)}getOverlaysForCollectionGroup(e,t,s,o){let l=new lt(((y,w)=>y-w));const h=this.overlays.getIterator();for(;h.hasNext();){const y=h.getNext().value;if(y.getKey().getCollectionGroup()===t&&y.largestBatchId>s){let w=l.get(y.largestBatchId);w===null&&(w=ws(),l=l.insert(y.largestBatchId,w)),w.set(y.getKey(),y)}}const f=ws(),g=l.getIterator();for(;g.hasNext()&&(g.getNext().value.forEach(((y,w)=>f.set(y,w))),!(f.size()>=o)););return q.resolve(f)}wt(e,t,s){const o=this.overlays.get(s.key);if(o!==null){const h=this.kr.get(o.largestBatchId).delete(s.key);this.kr.set(o.largestBatchId,h)}this.overlays=this.overlays.insert(s.key,new dR(t,s));let l=this.kr.get(t);l===void 0&&(l=Oe(),this.kr.set(t,l)),this.kr.set(t,l.add(s.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class KR{constructor(){this.sessionToken=jt.EMPTY_BYTE_STRING}getSessionToken(e){return q.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,q.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uf{constructor(){this.qr=new Pt(xt.Qr),this.$r=new Pt(xt.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(e,t){const s=new xt(e,t);this.qr=this.qr.add(s),this.$r=this.$r.add(s)}Kr(e,t){e.forEach((s=>this.addReference(s,t)))}removeReference(e,t){this.Wr(new xt(e,t))}Gr(e,t){e.forEach((s=>this.removeReference(s,t)))}zr(e){const t=new me(new Xe([])),s=new xt(t,e),o=new xt(t,e+1),l=[];return this.$r.forEachInRange([s,o],(h=>{this.Wr(h),l.push(h.key)})),l}jr(){this.qr.forEach((e=>this.Wr(e)))}Wr(e){this.qr=this.qr.delete(e),this.$r=this.$r.delete(e)}Jr(e){const t=new me(new Xe([])),s=new xt(t,e),o=new xt(t,e+1);let l=Oe();return this.$r.forEachInRange([s,o],(h=>{l=l.add(h.key)})),l}containsKey(e){const t=new xt(e,0),s=this.qr.firstAfterOrEqual(t);return s!==null&&e.isEqual(s.key)}}class xt{constructor(e,t){this.key=e,this.Hr=t}static Qr(e,t){return me.comparator(e.key,t.key)||Ce(e.Hr,t.Hr)}static Ur(e,t){return Ce(e.Hr,t.Hr)||me.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QR{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.er=1,this.Yr=new Pt(xt.Qr)}checkEmpty(e){return q.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,s,o){const l=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const h=new hR(l,t,s,o);this.mutationQueue.push(h);for(const f of o)this.Yr=this.Yr.add(new xt(f.key,l)),this.indexManager.addToCollectionParentIndex(e,f.key.path.popLast());return q.resolve(h)}lookupMutationBatch(e,t){return q.resolve(this.Zr(t))}getNextMutationBatchAfterBatchId(e,t){const s=t+1,o=this.Xr(s),l=o<0?0:o;return q.resolve(this.mutationQueue.length>l?this.mutationQueue[l]:null)}getHighestUnacknowledgedBatchId(){return q.resolve(this.mutationQueue.length===0?Pf:this.er-1)}getAllMutationBatches(e){return q.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const s=new xt(t,0),o=new xt(t,Number.POSITIVE_INFINITY),l=[];return this.Yr.forEachInRange([s,o],(h=>{const f=this.Zr(h.Hr);l.push(f)})),q.resolve(l)}getAllMutationBatchesAffectingDocumentKeys(e,t){let s=new Pt(Ce);return t.forEach((o=>{const l=new xt(o,0),h=new xt(o,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([l,h],(f=>{s=s.add(f.Hr)}))})),q.resolve(this.ei(s))}getAllMutationBatchesAffectingQuery(e,t){const s=t.path,o=s.length+1;let l=s;me.isDocumentKey(l)||(l=l.child(""));const h=new xt(new me(l),0);let f=new Pt(Ce);return this.Yr.forEachWhile((g=>{const y=g.key.path;return!!s.isPrefixOf(y)&&(y.length===o&&(f=f.add(g.Hr)),!0)}),h),q.resolve(this.ei(f))}ei(e){const t=[];return e.forEach((s=>{const o=this.Zr(s);o!==null&&t.push(o)})),t}removeMutationBatch(e,t){ze(this.ti(t.batchId,"removed")===0,55003),this.mutationQueue.shift();let s=this.Yr;return q.forEach(t.mutations,(o=>{const l=new xt(o.key,t.batchId);return s=s.delete(l),this.referenceDelegate.markPotentiallyOrphaned(e,o.key)})).next((()=>{this.Yr=s}))}rr(e){}containsKey(e,t){const s=new xt(t,0),o=this.Yr.firstAfterOrEqual(s);return q.resolve(t.isEqual(o&&o.key))}performConsistencyCheck(e){return this.mutationQueue.length,q.resolve()}ti(e,t){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){const t=this.Xr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XR{constructor(e){this.ni=e,this.docs=(function(){return new lt(me.comparator)})(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const s=t.key,o=this.docs.get(s),l=o?o.size:0,h=this.ni(t);return this.docs=this.docs.insert(s,{document:t.mutableCopy(),size:h}),this.size+=h-l,this.indexManager.addToCollectionParentIndex(e,s.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const s=this.docs.get(t);return q.resolve(s?s.document.mutableCopy():Gt.newInvalidDocument(t))}getEntries(e,t){let s=Yr();return t.forEach((o=>{const l=this.docs.get(o);s=s.insert(o,l?l.document.mutableCopy():Gt.newInvalidDocument(o))})),q.resolve(s)}getDocumentsMatchingQuery(e,t,s,o){let l=Yr();const h=t.path,f=new me(h.child("__id-9223372036854775808__")),g=this.docs.getIteratorFrom(f);for(;g.hasNext();){const{key:y,value:{document:w}}=g.getNext();if(!h.isPrefixOf(y.path))break;y.path.length>h.length+1||AA(SA(w),s)<=0||(o.has(w.key)||kc(t,w))&&(l=l.insert(w.key,w.mutableCopy()))}return q.resolve(l)}getAllFromCollectionGroup(e,t,s,o){ve(9500)}ri(e,t){return q.forEach(this.docs,(s=>t(s)))}newChangeBuffer(e){return new YR(this)}getSize(e){return q.resolve(this.size)}}class YR extends $R{constructor(e){super(),this.Or=e}applyChanges(e){const t=[];return this.changes.forEach(((s,o)=>{o.isValidDocument()?t.push(this.Or.addEntry(e,o)):this.Or.removeEntry(s)})),q.waitFor(t)}getFromCache(e,t){return this.Or.getEntry(e,t)}getAllFromCache(e,t){return this.Or.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JR{constructor(e){this.persistence=e,this.ii=new Os((t=>Df(t)),Of),this.lastRemoteSnapshotVersion=Te.min(),this.highestTargetId=0,this.si=0,this.oi=new Uf,this.targetCount=0,this._i=Uo.ar()}forEachTarget(e,t){return this.ii.forEach(((s,o)=>t(o))),q.resolve()}getLastRemoteSnapshotVersion(e){return q.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return q.resolve(this.si)}allocateTargetId(e){return this.highestTargetId=this._i.next(),q.resolve(this.highestTargetId)}setTargetsMetadata(e,t,s){return s&&(this.lastRemoteSnapshotVersion=s),t>this.si&&(this.si=t),q.resolve()}hr(e){this.ii.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this._i=new Uo(t),this.highestTargetId=t),e.sequenceNumber>this.si&&(this.si=e.sequenceNumber)}addTargetData(e,t){return this.hr(t),this.targetCount+=1,q.resolve()}updateTargetData(e,t){return this.hr(t),q.resolve()}removeTargetData(e,t){return this.ii.delete(t.target),this.oi.zr(t.targetId),this.targetCount-=1,q.resolve()}removeTargets(e,t,s){let o=0;const l=[];return this.ii.forEach(((h,f)=>{f.sequenceNumber<=t&&s.get(f.targetId)===null&&(this.ii.delete(h),l.push(this.removeMatchingKeysForTargetId(e,f.targetId)),o++)})),q.waitFor(l).next((()=>o))}getTargetCount(e){return q.resolve(this.targetCount)}getTargetData(e,t){const s=this.ii.get(t)||null;return q.resolve(s)}addMatchingKeys(e,t,s){return this.oi.Kr(t,s),q.resolve()}removeMatchingKeys(e,t,s){this.oi.Gr(t,s);const o=this.persistence.referenceDelegate,l=[];return o&&t.forEach((h=>{l.push(o.markPotentiallyOrphaned(e,h))})),q.waitFor(l)}removeMatchingKeysForTargetId(e,t){return this.oi.zr(t),q.resolve()}getMatchingKeysForTargetId(e,t){const s=this.oi.Jr(t);return q.resolve(s)}containsKey(e,t){return q.resolve(this.oi.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uE{constructor(e,t){this.ai={},this.overlays={},this.ui=new Ac(0),this.ci=!1,this.ci=!0,this.li=new KR,this.referenceDelegate=e(this),this.hi=new JR(this),this.indexManager=new bR,this.remoteDocumentCache=(function(o){return new XR(o)})((s=>this.referenceDelegate.Pi(s))),this.serializer=new VR(t),this.Ti=new WR(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new GR,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let s=this.ai[e.toKey()];return s||(s=new QR(t,this.referenceDelegate),this.ai[e.toKey()]=s),s}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(e,t,s){ie("MemoryPersistence","Starting transaction:",e);const o=new ZR(this.ui.next());return this.referenceDelegate.Ii(),s(o).next((l=>this.referenceDelegate.di(o).next((()=>l)))).toPromise().then((l=>(o.raiseOnCommittedEvent(),l)))}Ei(e,t){return q.or(Object.values(this.ai).map((s=>()=>s.containsKey(e,t))))}}class ZR extends CA{constructor(e){super(),this.currentSequenceNumber=e}}class Ff{constructor(e){this.persistence=e,this.Ai=new Uf,this.Ri=null}static Vi(e){return new Ff(e)}get mi(){if(this.Ri)return this.Ri;throw ve(60996)}addReference(e,t,s){return this.Ai.addReference(s,t),this.mi.delete(s.toString()),q.resolve()}removeReference(e,t,s){return this.Ai.removeReference(s,t),this.mi.add(s.toString()),q.resolve()}markPotentiallyOrphaned(e,t){return this.mi.add(t.toString()),q.resolve()}removeTarget(e,t){this.Ai.zr(t.targetId).forEach((o=>this.mi.add(o.toString())));const s=this.persistence.getTargetCache();return s.getMatchingKeysForTargetId(e,t.targetId).next((o=>{o.forEach((l=>this.mi.add(l.toString())))})).next((()=>s.removeTargetData(e,t)))}Ii(){this.Ri=new Set}di(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return q.forEach(this.mi,(s=>{const o=me.fromPath(s);return this.fi(e,o).next((l=>{l||t.removeEntry(o,Te.min())}))})).next((()=>(this.Ri=null,t.apply(e))))}updateLimboDocument(e,t){return this.fi(e,t).next((s=>{s?this.mi.delete(t.toString()):this.mi.add(t.toString())}))}Pi(e){return 0}fi(e,t){return q.or([()=>q.resolve(this.Ai.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Ei(e,t)])}}class pc{constructor(e,t){this.persistence=e,this.gi=new Os((s=>NA(s.path)),((s,o)=>s.isEqual(o))),this.garbageCollector=zR(this,t)}static Vi(e,t){return new pc(e,t)}Ii(){}di(e){return q.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}mr(e){const t=this.yr(e);return this.persistence.getTargetCache().getTargetCount(e).next((s=>t.next((o=>s+o))))}yr(e){let t=0;return this.gr(e,(s=>{t++})).next((()=>t))}gr(e,t){return q.forEach(this.gi,((s,o)=>this.Sr(e,s,o).next((l=>l?q.resolve():t(o)))))}removeTargets(e,t,s){return this.persistence.getTargetCache().removeTargets(e,t,s)}removeOrphanedDocuments(e,t){let s=0;const o=this.persistence.getRemoteDocumentCache(),l=o.newChangeBuffer();return o.ri(e,(h=>this.Sr(e,h,t).next((f=>{f||(s++,l.removeEntry(h,Te.min()))})))).next((()=>l.apply(e))).next((()=>s))}markPotentiallyOrphaned(e,t){return this.gi.set(t,e.currentSequenceNumber),q.resolve()}removeTarget(e,t){const s=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,s)}addReference(e,t,s){return this.gi.set(s,e.currentSequenceNumber),q.resolve()}removeReference(e,t,s){return this.gi.set(s,e.currentSequenceNumber),q.resolve()}updateLimboDocument(e,t){return this.gi.set(t,e.currentSequenceNumber),q.resolve()}Pi(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Qu(e.data.value)),t}Sr(e,t,s){return q.or([()=>this.persistence.Ei(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const o=this.gi.get(t);return q.resolve(o!==void 0&&o>s)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jf{constructor(e,t,s,o){this.targetId=e,this.fromCache=t,this.Is=s,this.ds=o}static Es(e,t){let s=Oe(),o=Oe();for(const l of t.docChanges)switch(l.type){case 0:s=s.add(l.doc.key);break;case 1:o=o.add(l.doc.key)}return new jf(e,t.fromCache,s,o)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class e1{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class t1{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=(function(){return xT()?8:PA(Kt())>0?6:4})()}initialize(e,t){this.gs=e,this.indexManager=t,this.As=!0}getDocumentsMatchingQuery(e,t,s,o){const l={result:null};return this.ps(e,t).next((h=>{l.result=h})).next((()=>{if(!l.result)return this.ys(e,t,o,s).next((h=>{l.result=h}))})).next((()=>{if(l.result)return;const h=new e1;return this.ws(e,t,h).next((f=>{if(l.result=f,this.Rs)return this.Ss(e,t,h,f.size)}))})).next((()=>l.result))}Ss(e,t,s,o){return s.documentReadCount<this.Vs?(Io()<=De.DEBUG&&ie("QueryEngine","SDK will not create cache indexes for query:",So(t),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),q.resolve()):(Io()<=De.DEBUG&&ie("QueryEngine","Query:",So(t),"scans",s.documentReadCount,"local documents and returns",o,"documents as results."),s.documentReadCount>this.fs*o?(Io()<=De.DEBUG&&ie("QueryEngine","The SDK decides to create cache indexes for query:",So(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Tr(t))):q.resolve())}ps(e,t){if(P_(t))return q.resolve(null);let s=Tr(t);return this.indexManager.getIndexType(e,s).next((o=>o===0?null:(t.limit!==null&&o===1&&(t=Jd(t,null,"F"),s=Tr(t)),this.indexManager.getDocumentsMatchingTarget(e,s).next((l=>{const h=Oe(...l);return this.gs.getDocuments(e,h).next((f=>this.indexManager.getMinOffset(e,s).next((g=>{const y=this.bs(t,f);return this.Ds(t,y,h,g.readTime)?this.ps(e,Jd(t,null,"F")):this.vs(e,y,t,g)}))))})))))}ys(e,t,s,o){return P_(t)||o.isEqual(Te.min())?q.resolve(null):this.gs.getDocuments(e,s).next((l=>{const h=this.bs(t,l);return this.Ds(t,h,s,o)?q.resolve(null):(Io()<=De.DEBUG&&ie("QueryEngine","Re-using previous result from %s to execute query: %s",o.toString(),So(t)),this.vs(e,h,t,IA(o,el)).next((f=>f)))}))}bs(e,t){let s=new Pt(Bv(e));return t.forEach(((o,l)=>{kc(e,l)&&(s=s.add(l))})),s}Ds(e,t,s,o){if(e.limit===null)return!1;if(s.size!==t.size)return!0;const l=e.limitType==="F"?t.last():t.first();return!!l&&(l.hasPendingWrites||l.version.compareTo(o)>0)}ws(e,t,s){return Io()<=De.DEBUG&&ie("QueryEngine","Using full collection scan to execute query:",So(t)),this.gs.getDocumentsMatchingQuery(e,t,Ui.min(),s)}vs(e,t,s,o){return this.gs.getDocumentsMatchingQuery(e,s,o).next((l=>(t.forEach((h=>{l=l.insert(h.key,h)})),l)))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bf="LocalStore",n1=3e8;class r1{constructor(e,t,s,o){this.persistence=e,this.Cs=t,this.serializer=o,this.Fs=new lt(Ce),this.Ms=new Os((l=>Df(l)),Of),this.xs=new Map,this.Os=e.getRemoteDocumentCache(),this.hi=e.getTargetCache(),this.Ti=e.getBundleCache(),this.Ns(s)}Ns(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new qR(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",(t=>e.collect(t,this.Fs)))}}function i1(r,e,t,s){return new r1(r,e,t,s)}async function cE(r,e){const t=Se(r);return await t.persistence.runTransaction("Handle user change","readonly",(s=>{let o;return t.mutationQueue.getAllMutationBatches(s).next((l=>(o=l,t.Ns(e),t.mutationQueue.getAllMutationBatches(s)))).next((l=>{const h=[],f=[];let g=Oe();for(const y of o){h.push(y.batchId);for(const w of y.mutations)g=g.add(w.key)}for(const y of l){f.push(y.batchId);for(const w of y.mutations)g=g.add(w.key)}return t.localDocuments.getDocuments(s,g).next((y=>({Bs:y,removedBatchIds:h,addedBatchIds:f})))}))}))}function s1(r,e){const t=Se(r);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",(s=>{const o=e.batch.keys(),l=t.Os.newChangeBuffer({trackRemovals:!0});return(function(f,g,y,w){const A=y.batch,R=A.keys();let F=q.resolve();return R.forEach((B=>{F=F.next((()=>w.getEntry(g,B))).next((K=>{const z=y.docVersions.get(B);ze(z!==null,48541),K.version.compareTo(z)<0&&(A.applyToRemoteDocument(K,y),K.isValidDocument()&&(K.setReadTime(y.commitVersion),w.addEntry(K)))}))})),F.next((()=>f.mutationQueue.removeMutationBatch(g,A)))})(t,s,e,l).next((()=>l.apply(s))).next((()=>t.mutationQueue.performConsistencyCheck(s))).next((()=>t.documentOverlayCache.removeOverlaysForBatchId(s,o,e.batch.batchId))).next((()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(s,(function(f){let g=Oe();for(let y=0;y<f.mutationResults.length;++y)f.mutationResults[y].transformResults.length>0&&(g=g.add(f.batch.mutations[y].key));return g})(e)))).next((()=>t.localDocuments.getDocuments(s,o)))}))}function hE(r){const e=Se(r);return e.persistence.runTransaction("Get last remote snapshot version","readonly",(t=>e.hi.getLastRemoteSnapshotVersion(t)))}function o1(r,e){const t=Se(r),s=e.snapshotVersion;let o=t.Fs;return t.persistence.runTransaction("Apply remote event","readwrite-primary",(l=>{const h=t.Os.newChangeBuffer({trackRemovals:!0});o=t.Fs;const f=[];e.targetChanges.forEach(((w,A)=>{const R=o.get(A);if(!R)return;f.push(t.hi.removeMatchingKeys(l,w.removedDocuments,A).next((()=>t.hi.addMatchingKeys(l,w.addedDocuments,A))));let F=R.withSequenceNumber(l.currentSequenceNumber);e.targetMismatches.get(A)!==null?F=F.withResumeToken(jt.EMPTY_BYTE_STRING,Te.min()).withLastLimboFreeSnapshotVersion(Te.min()):w.resumeToken.approximateByteSize()>0&&(F=F.withResumeToken(w.resumeToken,s)),o=o.insert(A,F),(function(K,z,pe){return K.resumeToken.approximateByteSize()===0||z.snapshotVersion.toMicroseconds()-K.snapshotVersion.toMicroseconds()>=n1?!0:pe.addedDocuments.size+pe.modifiedDocuments.size+pe.removedDocuments.size>0})(R,F,w)&&f.push(t.hi.updateTargetData(l,F))}));let g=Yr(),y=Oe();if(e.documentUpdates.forEach((w=>{e.resolvedLimboDocuments.has(w)&&f.push(t.persistence.referenceDelegate.updateLimboDocument(l,w))})),f.push(a1(l,h,e.documentUpdates).next((w=>{g=w.Ls,y=w.ks}))),!s.isEqual(Te.min())){const w=t.hi.getLastRemoteSnapshotVersion(l).next((A=>t.hi.setTargetsMetadata(l,l.currentSequenceNumber,s)));f.push(w)}return q.waitFor(f).next((()=>h.apply(l))).next((()=>t.localDocuments.getLocalViewOfDocuments(l,g,y))).next((()=>g))})).then((l=>(t.Fs=o,l)))}function a1(r,e,t){let s=Oe(),o=Oe();return t.forEach((l=>s=s.add(l))),e.getEntries(r,s).next((l=>{let h=Yr();return t.forEach(((f,g)=>{const y=l.get(f);g.isFoundDocument()!==y.isFoundDocument()&&(o=o.add(f)),g.isNoDocument()&&g.version.isEqual(Te.min())?(e.removeEntry(f,g.readTime),h=h.insert(f,g)):!y.isValidDocument()||g.version.compareTo(y.version)>0||g.version.compareTo(y.version)===0&&y.hasPendingWrites?(e.addEntry(g),h=h.insert(f,g)):ie(Bf,"Ignoring outdated watch update for ",f,". Current version:",y.version," Watch version:",g.version)})),{Ls:h,ks:o}}))}function l1(r,e){const t=Se(r);return t.persistence.runTransaction("Get next mutation batch","readonly",(s=>(e===void 0&&(e=Pf),t.mutationQueue.getNextMutationBatchAfterBatchId(s,e))))}function u1(r,e){const t=Se(r);return t.persistence.runTransaction("Allocate target","readwrite",(s=>{let o;return t.hi.getTargetData(s,e).next((l=>l?(o=l,q.resolve(o)):t.hi.allocateTargetId(s).next((h=>(o=new ki(e,h,"TargetPurposeListen",s.currentSequenceNumber),t.hi.addTargetData(s,o).next((()=>o)))))))})).then((s=>{const o=t.Fs.get(s.targetId);return(o===null||s.snapshotVersion.compareTo(o.snapshotVersion)>0)&&(t.Fs=t.Fs.insert(s.targetId,s),t.Ms.set(e,s.targetId)),s}))}async function rf(r,e,t){const s=Se(r),o=s.Fs.get(e),l=t?"readwrite":"readwrite-primary";try{t||await s.persistence.runTransaction("Release target",l,(h=>s.persistence.referenceDelegate.removeTarget(h,o)))}catch(h){if(!Ho(h))throw h;ie(Bf,`Failed to update sequence numbers for target ${e}: ${h}`)}s.Fs=s.Fs.remove(e),s.Ms.delete(o.target)}function B_(r,e,t){const s=Se(r);let o=Te.min(),l=Oe();return s.persistence.runTransaction("Execute query","readwrite",(h=>(function(g,y,w){const A=Se(g),R=A.Ms.get(w);return R!==void 0?q.resolve(A.Fs.get(R)):A.hi.getTargetData(y,w)})(s,h,Tr(e)).next((f=>{if(f)return o=f.lastLimboFreeSnapshotVersion,s.hi.getMatchingKeysForTargetId(h,f.targetId).next((g=>{l=g}))})).next((()=>s.Cs.getDocumentsMatchingQuery(h,e,t?o:Te.min(),t?l:Oe()))).next((f=>(c1(s,QA(e),f),{documents:f,qs:l})))))}function c1(r,e,t){let s=r.xs.get(e)||Te.min();t.forEach(((o,l)=>{l.readTime.compareTo(s)>0&&(s=l.readTime)})),r.xs.set(e,s)}class z_{constructor(){this.activeTargetIds=tR()}Gs(e){this.activeTargetIds=this.activeTargetIds.add(e)}zs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class h1{constructor(){this.Fo=new z_,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,s){}addLocalQueryTarget(e,t=!0){return t&&this.Fo.Gs(e),this.Mo[e]||"not-current"}updateQueryState(e,t,s){this.Mo[e]=t}removeLocalQueryTarget(e){this.Fo.zs(e)}isLocalQueryTarget(e){return this.Fo.activeTargetIds.has(e)}clearQueryState(e){delete this.Mo[e]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(e){return this.Fo.activeTargetIds.has(e)}start(){return this.Fo=new z_,Promise.resolve()}handleUserChange(e,t,s){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class d1{xo(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $_="ConnectivityMonitor";class H_{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(e){this.ko.push(e)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){ie($_,"Network connectivity changed: AVAILABLE");for(const e of this.ko)e(0)}Lo(){ie($_,"Network connectivity changed: UNAVAILABLE");for(const e of this.ko)e(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ju=null;function sf(){return ju===null?ju=(function(){return 268435456+Math.round(2147483648*Math.random())})():ju++,"0x"+ju.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rd="RestConnection",f1={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class p1{get Qo(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),o=encodeURIComponent(this.databaseId.database);this.$o=t+"://"+e.host,this.Uo=`projects/${s}/databases/${o}`,this.Ko=this.databaseId.database===uc?`project_id=${s}`:`project_id=${s}&database_id=${o}`}Wo(e,t,s,o,l){const h=sf(),f=this.Go(e,t.toUriEncodedString());ie(Rd,`Sending RPC '${e}' ${h}:`,f,s);const g={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(g,o,l);const{host:y}=new URL(f),w=Hi(y);return this.jo(e,f,g,s,w).then((A=>(ie(Rd,`Received RPC '${e}' ${h}: `,A),A)),(A=>{throw Mi(Rd,`RPC '${e}' ${h} failed with error: `,A,"url: ",f,"request:",s),A}))}Jo(e,t,s,o,l,h){return this.Wo(e,t,s,o,l)}zo(e,t,s){e["X-Goog-Api-Client"]=(function(){return"gl-js/ fire/"+zo})(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach(((o,l)=>e[l]=o)),s&&s.headers.forEach(((o,l)=>e[l]=o))}Go(e,t){const s=f1[e];return`${this.$o}/v1/${t}:${s}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class m1{constructor(e){this.Ho=e.Ho,this.Yo=e.Yo}Zo(e){this.Xo=e}e_(e){this.t_=e}n_(e){this.r_=e}onMessage(e){this.i_=e}close(){this.Yo()}send(e){this.Ho(e)}s_(){this.Xo()}o_(){this.t_()}__(e){this.r_(e)}a_(e){this.i_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qt="WebChannelConnection";class g1 extends p1{constructor(e){super(e),this.u_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}jo(e,t,s,o,l){const h=sf();return new Promise(((f,g)=>{const y=new dv;y.setWithCredentials(!0),y.listenOnce(fv.COMPLETE,(()=>{try{switch(y.getLastErrorCode()){case Ku.NO_ERROR:const A=y.getResponseJson();ie(qt,`XHR for RPC '${e}' ${h} received:`,JSON.stringify(A)),f(A);break;case Ku.TIMEOUT:ie(qt,`RPC '${e}' ${h} timed out`),g(new ne($.DEADLINE_EXCEEDED,"Request time out"));break;case Ku.HTTP_ERROR:const R=y.getStatus();if(ie(qt,`RPC '${e}' ${h} failed with status:`,R,"response text:",y.getResponseText()),R>0){let F=y.getResponseJson();Array.isArray(F)&&(F=F[0]);const B=F==null?void 0:F.error;if(B&&B.status&&B.message){const K=(function(pe){const ae=pe.toLowerCase().replace(/_/g,"-");return Object.values($).indexOf(ae)>=0?ae:$.UNKNOWN})(B.status);g(new ne(K,B.message))}else g(new ne($.UNKNOWN,"Server responded with status "+y.getStatus()))}else g(new ne($.UNAVAILABLE,"Connection failed."));break;default:ve(9055,{c_:e,streamId:h,l_:y.getLastErrorCode(),h_:y.getLastError()})}}finally{ie(qt,`RPC '${e}' ${h} completed.`)}}));const w=JSON.stringify(o);ie(qt,`RPC '${e}' ${h} sending request:`,o),y.send(t,"POST",w,s,15)}))}P_(e,t,s){const o=sf(),l=[this.$o,"/","google.firestore.v1.Firestore","/",e,"/channel"],h=gv(),f=mv(),g={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},y=this.longPollingOptions.timeoutSeconds;y!==void 0&&(g.longPollingTimeout=Math.round(1e3*y)),this.useFetchStreams&&(g.useFetchStreams=!0),this.zo(g.initMessageHeaders,t,s),g.encodeInitMessageHeaders=!0;const w=l.join("");ie(qt,`Creating RPC '${e}' stream ${o}: ${w}`,g);const A=h.createWebChannel(w,g);this.T_(A);let R=!1,F=!1;const B=new m1({Ho:z=>{F?ie(qt,`Not sending because RPC '${e}' stream ${o} is closed:`,z):(R||(ie(qt,`Opening RPC '${e}' stream ${o} transport.`),A.open(),R=!0),ie(qt,`RPC '${e}' stream ${o} sending:`,z),A.send(z))},Yo:()=>A.close()}),K=(z,pe,ae)=>{z.listen(pe,(le=>{try{ae(le)}catch(de){setTimeout((()=>{throw de}),0)}}))};return K(A,ja.EventType.OPEN,(()=>{F||(ie(qt,`RPC '${e}' stream ${o} transport opened.`),B.s_())})),K(A,ja.EventType.CLOSE,(()=>{F||(F=!0,ie(qt,`RPC '${e}' stream ${o} transport closed`),B.__(),this.I_(A))})),K(A,ja.EventType.ERROR,(z=>{F||(F=!0,Mi(qt,`RPC '${e}' stream ${o} transport errored. Name:`,z.name,"Message:",z.message),B.__(new ne($.UNAVAILABLE,"The operation could not be completed")))})),K(A,ja.EventType.MESSAGE,(z=>{var pe;if(!F){const ae=z.data[0];ze(!!ae,16349);const le=ae,de=(le==null?void 0:le.error)||((pe=le[0])===null||pe===void 0?void 0:pe.error);if(de){ie(qt,`RPC '${e}' stream ${o} received error:`,de);const je=de.status;let we=(function(C){const k=wt[C];if(k!==void 0)return Jv(k)})(je),N=de.message;we===void 0&&(we=$.INTERNAL,N="Unknown error status: "+je+" with message "+de.message),F=!0,B.__(new ne(we,N)),A.close()}else ie(qt,`RPC '${e}' stream ${o} received:`,ae),B.a_(ae)}})),K(f,pv.STAT_EVENT,(z=>{z.stat===qd.PROXY?ie(qt,`RPC '${e}' stream ${o} detected buffering proxy`):z.stat===qd.NOPROXY&&ie(qt,`RPC '${e}' stream ${o} detected no buffering proxy`)})),setTimeout((()=>{B.o_()}),0),B}terminate(){this.u_.forEach((e=>e.close())),this.u_=[]}T_(e){this.u_.push(e)}I_(e){this.u_=this.u_.filter((t=>t===e))}}function Cd(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xc(r){return new ER(r,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dE{constructor(e,t,s=1e3,o=1.5,l=6e4){this.Fi=e,this.timerId=t,this.d_=s,this.E_=o,this.A_=l,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const t=Math.floor(this.R_+this.p_()),s=Math.max(0,Date.now()-this.m_),o=Math.max(0,t-s);o>0&&ie("ExponentialBackoff",`Backing off for ${o} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${s} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,o,(()=>(this.m_=Date.now(),e()))),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const q_="PersistentStream";class fE{constructor(e,t,s,o,l,h,f,g){this.Fi=e,this.w_=s,this.S_=o,this.connection=l,this.authCredentialsProvider=h,this.appCheckCredentialsProvider=f,this.listener=g,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new dE(e,t)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,(()=>this.L_())))}k_(e){this.q_(),this.stream.send(e)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,t){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,e!==4?this.F_.reset():t&&t.code===$.RESOURCE_EXHAUSTED?(Xr(t.toString()),Xr("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):t&&t.code===$.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.n_(t)}U_(){}auth(){this.state=1;const e=this.K_(this.b_),t=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then((([s,o])=>{this.b_===t&&this.W_(s,o)}),(s=>{e((()=>{const o=new ne($.UNKNOWN,"Fetching auth token failed: "+s.message);return this.G_(o)}))}))}W_(e,t){const s=this.K_(this.b_);this.stream=this.z_(e,t),this.stream.Zo((()=>{s((()=>this.listener.Zo()))})),this.stream.e_((()=>{s((()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,(()=>(this.x_()&&(this.state=3),Promise.resolve()))),this.listener.e_())))})),this.stream.n_((o=>{s((()=>this.G_(o)))})),this.stream.onMessage((o=>{s((()=>++this.C_==1?this.j_(o):this.onNext(o)))}))}O_(){this.state=5,this.F_.g_((async()=>{this.state=0,this.start()}))}G_(e){return ie(q_,`close with error: ${e}`),this.stream=null,this.close(4,e)}K_(e){return t=>{this.Fi.enqueueAndForget((()=>this.b_===e?t():(ie(q_,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve())))}}}class _1 extends fE{constructor(e,t,s,o,l,h){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,s,o,h),this.serializer=l}z_(e,t){return this.connection.P_("Listen",e,t)}j_(e){return this.onNext(e)}onNext(e){this.F_.reset();const t=IR(this.serializer,e),s=(function(l){if(!("targetChange"in l))return Te.min();const h=l.targetChange;return h.targetIds&&h.targetIds.length?Te.min():h.readTime?Ir(h.readTime):Te.min()})(e);return this.listener.J_(t,s)}H_(e){const t={};t.database=nf(this.serializer),t.addTarget=(function(l,h){let f;const g=h.target;if(f=Xd(g)?{documents:RR(l,g)}:{query:CR(l,g).Vt},f.targetId=h.targetId,h.resumeToken.approximateByteSize()>0){f.resumeToken=tE(l,h.resumeToken);const y=Zd(l,h.expectedCount);y!==null&&(f.expectedCount=y)}else if(h.snapshotVersion.compareTo(Te.min())>0){f.readTime=fc(l,h.snapshotVersion.toTimestamp());const y=Zd(l,h.expectedCount);y!==null&&(f.expectedCount=y)}return f})(this.serializer,e);const s=kR(this.serializer,e);s&&(t.labels=s),this.k_(t)}Y_(e){const t={};t.database=nf(this.serializer),t.removeTarget=e,this.k_(t)}}class y1 extends fE{constructor(e,t,s,o,l,h){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,s,o,h),this.serializer=l}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(e,t){return this.connection.P_("Write",e,t)}j_(e){return ze(!!e.streamToken,31322),this.lastStreamToken=e.streamToken,ze(!e.writeResults||e.writeResults.length===0,55816),this.listener.ea()}onNext(e){ze(!!e.streamToken,12678),this.lastStreamToken=e.streamToken,this.F_.reset();const t=AR(e.writeResults,e.commitTime),s=Ir(e.commitTime);return this.listener.ta(s,t)}na(){const e={};e.database=nf(this.serializer),this.k_(e)}X_(e){const t={streamToken:this.lastStreamToken,writes:e.map((s=>SR(this.serializer,s)))};this.k_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class v1{}class E1 extends v1{constructor(e,t,s,o){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=s,this.serializer=o,this.ra=!1}ia(){if(this.ra)throw new ne($.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,t,s,o){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([l,h])=>this.connection.Wo(e,ef(t,s),o,l,h))).catch((l=>{throw l.name==="FirebaseError"?(l.code===$.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),l):new ne($.UNKNOWN,l.toString())}))}Jo(e,t,s,o,l){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then((([h,f])=>this.connection.Jo(e,ef(t,s),o,h,f,l))).catch((h=>{throw h.name==="FirebaseError"?(h.code===$.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),h):new ne($.UNKNOWN,h.toString())}))}terminate(){this.ra=!0,this.connection.terminate()}}class w1{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,(()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve()))))}la(e){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ua("Offline")))}set(e){this.ha(),this.sa=0,e==="Online"&&(this._a=!1),this.ua(e)}ua(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}ca(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(Xr(t),this._a=!1):ie("OnlineStateTracker",t)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ps="RemoteStore";class T1{constructor(e,t,s,o,l){this.localStore=e,this.datastore=t,this.asyncQueue=s,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=l,this.Ea.xo((h=>{s.enqueueAndForget((async()=>{xs(this)&&(ie(Ps,"Restarting streams for network reachability change."),await(async function(g){const y=Se(g);y.Ia.add(4),await gl(y),y.Aa.set("Unknown"),y.Ia.delete(4),await Vc(y)})(this))}))})),this.Aa=new w1(s,o)}}async function Vc(r){if(xs(r))for(const e of r.da)await e(!0)}async function gl(r){for(const e of r.da)await e(!1)}function pE(r,e){const t=Se(r);t.Ta.has(e.targetId)||(t.Ta.set(e.targetId,e),qf(t)?Hf(t):Wo(t).x_()&&$f(t,e))}function zf(r,e){const t=Se(r),s=Wo(t);t.Ta.delete(e),s.x_()&&mE(t,e),t.Ta.size===0&&(s.x_()?s.B_():xs(t)&&t.Aa.set("Unknown"))}function $f(r,e){if(r.Ra.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(Te.min())>0){const t=r.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Wo(r).H_(e)}function mE(r,e){r.Ra.$e(e),Wo(r).Y_(e)}function Hf(r){r.Ra=new gR({getRemoteKeysForTarget:e=>r.remoteSyncer.getRemoteKeysForTarget(e),Et:e=>r.Ta.get(e)||null,lt:()=>r.datastore.serializer.databaseId}),Wo(r).start(),r.Aa.aa()}function qf(r){return xs(r)&&!Wo(r).M_()&&r.Ta.size>0}function xs(r){return Se(r).Ia.size===0}function gE(r){r.Ra=void 0}async function I1(r){r.Aa.set("Online")}async function S1(r){r.Ta.forEach(((e,t)=>{$f(r,e)}))}async function A1(r,e){gE(r),qf(r)?(r.Aa.la(e),Hf(r)):r.Aa.set("Unknown")}async function R1(r,e,t){if(r.Aa.set("Online"),e instanceof eE&&e.state===2&&e.cause)try{await(async function(o,l){const h=l.cause;for(const f of l.targetIds)o.Ta.has(f)&&(await o.remoteSyncer.rejectListen(f,h),o.Ta.delete(f),o.Ra.removeTarget(f))})(r,e)}catch(s){ie(Ps,"Failed to remove targets %s: %s ",e.targetIds.join(","),s),await mc(r,s)}else if(e instanceof Ju?r.Ra.Ye(e):e instanceof Zv?r.Ra.it(e):r.Ra.et(e),!t.isEqual(Te.min()))try{const s=await hE(r.localStore);t.compareTo(s)>=0&&await(function(l,h){const f=l.Ra.Pt(h);return f.targetChanges.forEach(((g,y)=>{if(g.resumeToken.approximateByteSize()>0){const w=l.Ta.get(y);w&&l.Ta.set(y,w.withResumeToken(g.resumeToken,h))}})),f.targetMismatches.forEach(((g,y)=>{const w=l.Ta.get(g);if(!w)return;l.Ta.set(g,w.withResumeToken(jt.EMPTY_BYTE_STRING,w.snapshotVersion)),mE(l,g);const A=new ki(w.target,g,y,w.sequenceNumber);$f(l,A)})),l.remoteSyncer.applyRemoteEvent(f)})(r,t)}catch(s){ie(Ps,"Failed to raise snapshot:",s),await mc(r,s)}}async function mc(r,e,t){if(!Ho(e))throw e;r.Ia.add(1),await gl(r),r.Aa.set("Offline"),t||(t=()=>hE(r.localStore)),r.asyncQueue.enqueueRetryable((async()=>{ie(Ps,"Retrying IndexedDB access"),await t(),r.Ia.delete(1),await Vc(r)}))}function _E(r,e){return e().catch((t=>mc(r,t,e)))}async function Lc(r){const e=Se(r),t=zi(e);let s=e.Pa.length>0?e.Pa[e.Pa.length-1].batchId:Pf;for(;C1(e);)try{const o=await l1(e.localStore,s);if(o===null){e.Pa.length===0&&t.B_();break}s=o.batchId,P1(e,o)}catch(o){await mc(e,o)}yE(e)&&vE(e)}function C1(r){return xs(r)&&r.Pa.length<10}function P1(r,e){r.Pa.push(e);const t=zi(r);t.x_()&&t.Z_&&t.X_(e.mutations)}function yE(r){return xs(r)&&!zi(r).M_()&&r.Pa.length>0}function vE(r){zi(r).start()}async function k1(r){zi(r).na()}async function N1(r){const e=zi(r);for(const t of r.Pa)e.X_(t.mutations)}async function D1(r,e,t){const s=r.Pa.shift(),o=Lf.from(s,e,t);await _E(r,(()=>r.remoteSyncer.applySuccessfulWrite(o))),await Lc(r)}async function O1(r,e){e&&zi(r).Z_&&await(async function(s,o){if((function(h){return pR(h)&&h!==$.ABORTED})(o.code)){const l=s.Pa.shift();zi(s).N_(),await _E(s,(()=>s.remoteSyncer.rejectFailedWrite(l.batchId,o))),await Lc(s)}})(r,e),yE(r)&&vE(r)}async function W_(r,e){const t=Se(r);t.asyncQueue.verifyOperationInProgress(),ie(Ps,"RemoteStore received new credentials");const s=xs(t);t.Ia.add(3),await gl(t),s&&t.Aa.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.Ia.delete(3),await Vc(t)}async function x1(r,e){const t=Se(r);e?(t.Ia.delete(2),await Vc(t)):e||(t.Ia.add(2),await gl(t),t.Aa.set("Unknown"))}function Wo(r){return r.Va||(r.Va=(function(t,s,o){const l=Se(t);return l.ia(),new _1(s,l.connection,l.authCredentials,l.appCheckCredentials,l.serializer,o)})(r.datastore,r.asyncQueue,{Zo:I1.bind(null,r),e_:S1.bind(null,r),n_:A1.bind(null,r),J_:R1.bind(null,r)}),r.da.push((async e=>{e?(r.Va.N_(),qf(r)?Hf(r):r.Aa.set("Unknown")):(await r.Va.stop(),gE(r))}))),r.Va}function zi(r){return r.ma||(r.ma=(function(t,s,o){const l=Se(t);return l.ia(),new y1(s,l.connection,l.authCredentials,l.appCheckCredentials,l.serializer,o)})(r.datastore,r.asyncQueue,{Zo:()=>Promise.resolve(),e_:k1.bind(null,r),n_:O1.bind(null,r),ea:N1.bind(null,r),ta:D1.bind(null,r)}),r.da.push((async e=>{e?(r.ma.N_(),await Lc(r)):(await r.ma.stop(),r.Pa.length>0&&(ie(Ps,`Stopping write stream with ${r.Pa.length} pending writes`),r.Pa=[]))}))),r.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wf{constructor(e,t,s,o,l){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=s,this.op=o,this.removalCallback=l,this.deferred=new Vi,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((h=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,s,o,l){const h=Date.now()+s,f=new Wf(e,t,h,o,l);return f.start(s),f}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new ne($.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Gf(r,e){if(Xr("AsyncQueue",`${e}: ${r}`),Ho(r))return new ne($.UNAVAILABLE,`${e}: ${r}`);throw r}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Do{static emptySet(e){return new Do(e.comparator)}constructor(e){this.comparator=e?(t,s)=>e(t,s)||me.comparator(t.key,s.key):(t,s)=>me.comparator(t.key,s.key),this.keyedMap=Ba(),this.sortedSet=new lt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal(((t,s)=>(e(t),!1)))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Do)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),s=e.sortedSet.getIterator();for(;t.hasNext();){const o=t.getNext().key,l=s.getNext().key;if(!o.isEqual(l))return!1}return!0}toString(){const e=[];return this.forEach((t=>{e.push(t.toString())})),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const s=new Do;return s.comparator=this.comparator,s.keyedMap=e,s.sortedSet=t,s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G_{constructor(){this.fa=new lt(me.comparator)}track(e){const t=e.doc.key,s=this.fa.get(t);s?e.type!==0&&s.type===3?this.fa=this.fa.insert(t,e):e.type===3&&s.type!==1?this.fa=this.fa.insert(t,{type:s.type,doc:e.doc}):e.type===2&&s.type===2?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):e.type===2&&s.type===0?this.fa=this.fa.insert(t,{type:0,doc:e.doc}):e.type===1&&s.type===0?this.fa=this.fa.remove(t):e.type===1&&s.type===2?this.fa=this.fa.insert(t,{type:1,doc:s.doc}):e.type===0&&s.type===1?this.fa=this.fa.insert(t,{type:2,doc:e.doc}):ve(63341,{At:e,ga:s}):this.fa=this.fa.insert(t,e)}pa(){const e=[];return this.fa.inorderTraversal(((t,s)=>{e.push(s)})),e}}class Fo{constructor(e,t,s,o,l,h,f,g,y){this.query=e,this.docs=t,this.oldDocs=s,this.docChanges=o,this.mutatedKeys=l,this.fromCache=h,this.syncStateChanged=f,this.excludesMetadataChanges=g,this.hasCachedResults=y}static fromInitialDocuments(e,t,s,o,l){const h=[];return t.forEach((f=>{h.push({type:0,doc:f})})),new Fo(e,t,Do.emptySet(t),h,s,o,!0,!1,l)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Pc(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,s=e.docChanges;if(t.length!==s.length)return!1;for(let o=0;o<t.length;o++)if(t[o].type!==s[o].type||!t[o].doc.isEqual(s[o].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class V1{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some((e=>e.ba()))}}class L1{constructor(){this.queries=K_(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(t,s){const o=Se(t),l=o.queries;o.queries=K_(),l.forEach(((h,f)=>{for(const g of f.wa)g.onError(s)}))})(this,new ne($.ABORTED,"Firestore shutting down"))}}function K_(){return new Os((r=>jv(r)),Pc)}async function b1(r,e){const t=Se(r);let s=3;const o=e.query;let l=t.queries.get(o);l?!l.Sa()&&e.ba()&&(s=2):(l=new V1,s=e.ba()?0:1);try{switch(s){case 0:l.ya=await t.onListen(o,!0);break;case 1:l.ya=await t.onListen(o,!1);break;case 2:await t.onFirstRemoteStoreListen(o)}}catch(h){const f=Gf(h,`Initialization of query '${So(e.query)}' failed`);return void e.onError(f)}t.queries.set(o,l),l.wa.push(e),e.va(t.onlineState),l.ya&&e.Ca(l.ya)&&Kf(t)}async function M1(r,e){const t=Se(r),s=e.query;let o=3;const l=t.queries.get(s);if(l){const h=l.wa.indexOf(e);h>=0&&(l.wa.splice(h,1),l.wa.length===0?o=e.ba()?0:1:!l.Sa()&&e.ba()&&(o=2))}switch(o){case 0:return t.queries.delete(s),t.onUnlisten(s,!0);case 1:return t.queries.delete(s),t.onUnlisten(s,!1);case 2:return t.onLastRemoteStoreUnlisten(s);default:return}}function U1(r,e){const t=Se(r);let s=!1;for(const o of e){const l=o.query,h=t.queries.get(l);if(h){for(const f of h.wa)f.Ca(o)&&(s=!0);h.ya=o}}s&&Kf(t)}function F1(r,e,t){const s=Se(r),o=s.queries.get(e);if(o)for(const l of o.wa)l.onError(t);s.queries.delete(e)}function Kf(r){r.Da.forEach((e=>{e.next()}))}var of,Q_;(Q_=of||(of={})).Fa="default",Q_.Cache="cache";class j1{constructor(e,t,s){this.query=e,this.Ma=t,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=s||{}}Ca(e){if(!this.options.includeMetadataChanges){const s=[];for(const o of e.docChanges)o.type!==3&&s.push(o);e=new Fo(e.query,e.docs,e.oldDocs,s,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.xa?this.Na(e)&&(this.Ma.next(e),t=!0):this.Ba(e,this.onlineState)&&(this.La(e),t=!0),this.Oa=e,t}onError(e){this.Ma.error(e)}va(e){this.onlineState=e;let t=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,e)&&(this.La(this.Oa),t=!0),t}Ba(e,t){if(!e.fromCache||!this.ba())return!0;const s=t!=="Offline";return(!this.options.ka||!s)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}Na(e){if(e.docChanges.length>0)return!0;const t=this.Oa&&this.Oa.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}La(e){e=Fo.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.xa=!0,this.Ma.next(e)}ba(){return this.options.source!==of.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EE{constructor(e){this.key=e}}class wE{constructor(e){this.key=e}}class B1{constructor(e,t){this.query=e,this.Ha=t,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=Oe(),this.mutatedKeys=Oe(),this.Xa=Bv(e),this.eu=new Do(this.Xa)}get tu(){return this.Ha}nu(e,t){const s=t?t.ru:new G_,o=t?t.eu:this.eu;let l=t?t.mutatedKeys:this.mutatedKeys,h=o,f=!1;const g=this.query.limitType==="F"&&o.size===this.query.limit?o.last():null,y=this.query.limitType==="L"&&o.size===this.query.limit?o.first():null;if(e.inorderTraversal(((w,A)=>{const R=o.get(w),F=kc(this.query,A)?A:null,B=!!R&&this.mutatedKeys.has(R.key),K=!!F&&(F.hasLocalMutations||this.mutatedKeys.has(F.key)&&F.hasCommittedMutations);let z=!1;R&&F?R.data.isEqual(F.data)?B!==K&&(s.track({type:3,doc:F}),z=!0):this.iu(R,F)||(s.track({type:2,doc:F}),z=!0,(g&&this.Xa(F,g)>0||y&&this.Xa(F,y)<0)&&(f=!0)):!R&&F?(s.track({type:0,doc:F}),z=!0):R&&!F&&(s.track({type:1,doc:R}),z=!0,(g||y)&&(f=!0)),z&&(F?(h=h.add(F),l=K?l.add(w):l.delete(w)):(h=h.delete(w),l=l.delete(w)))})),this.query.limit!==null)for(;h.size>this.query.limit;){const w=this.query.limitType==="F"?h.last():h.first();h=h.delete(w.key),l=l.delete(w.key),s.track({type:1,doc:w})}return{eu:h,ru:s,Ds:f,mutatedKeys:l}}iu(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,s,o){const l=this.eu;this.eu=e.eu,this.mutatedKeys=e.mutatedKeys;const h=e.ru.pa();h.sort(((w,A)=>(function(F,B){const K=z=>{switch(z){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return ve(20277,{At:z})}};return K(F)-K(B)})(w.type,A.type)||this.Xa(w.doc,A.doc))),this.su(s),o=o!=null&&o;const f=t&&!o?this.ou():[],g=this.Za.size===0&&this.current&&!o?1:0,y=g!==this.Ya;return this.Ya=g,h.length!==0||y?{snapshot:new Fo(this.query,e.eu,l,h,e.mutatedKeys,g===0,y,!1,!!s&&s.resumeToken.approximateByteSize()>0),_u:f}:{_u:f}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new G_,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(e){return!this.Ha.has(e)&&!!this.eu.has(e)&&!this.eu.get(e).hasLocalMutations}su(e){e&&(e.addedDocuments.forEach((t=>this.Ha=this.Ha.add(t))),e.modifiedDocuments.forEach((t=>{})),e.removedDocuments.forEach((t=>this.Ha=this.Ha.delete(t))),this.current=e.current)}ou(){if(!this.current)return[];const e=this.Za;this.Za=Oe(),this.eu.forEach((s=>{this.au(s.key)&&(this.Za=this.Za.add(s.key))}));const t=[];return e.forEach((s=>{this.Za.has(s)||t.push(new wE(s))})),this.Za.forEach((s=>{e.has(s)||t.push(new EE(s))})),t}uu(e){this.Ha=e.qs,this.Za=Oe();const t=this.nu(e.documents);return this.applyChanges(t,!0)}cu(){return Fo.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const Qf="SyncEngine";class z1{constructor(e,t,s){this.query=e,this.targetId=t,this.view=s}}class $1{constructor(e){this.key=e,this.lu=!1}}class H1{constructor(e,t,s,o,l,h){this.localStore=e,this.remoteStore=t,this.eventManager=s,this.sharedClientState=o,this.currentUser=l,this.maxConcurrentLimboResolutions=h,this.hu={},this.Pu=new Os((f=>jv(f)),Pc),this.Tu=new Map,this.Iu=new Set,this.du=new lt(me.comparator),this.Eu=new Map,this.Au=new Uf,this.Ru={},this.Vu=new Map,this.mu=Uo.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function q1(r,e,t=!0){const s=CE(r);let o;const l=s.Pu.get(e);return l?(s.sharedClientState.addLocalQueryTarget(l.targetId),o=l.view.cu()):o=await TE(s,e,t,!0),o}async function W1(r,e){const t=CE(r);await TE(t,e,!0,!1)}async function TE(r,e,t,s){const o=await u1(r.localStore,Tr(e)),l=o.targetId,h=r.sharedClientState.addLocalQueryTarget(l,t);let f;return s&&(f=await G1(r,e,l,h==="current",o.resumeToken)),r.isPrimaryClient&&t&&pE(r.remoteStore,o),f}async function G1(r,e,t,s,o){r.gu=(A,R,F)=>(async function(K,z,pe,ae){let le=z.view.nu(pe);le.Ds&&(le=await B_(K.localStore,z.query,!1).then((({documents:N})=>z.view.nu(N,le))));const de=ae&&ae.targetChanges.get(z.targetId),je=ae&&ae.targetMismatches.get(z.targetId)!=null,we=z.view.applyChanges(le,K.isPrimaryClient,de,je);return Y_(K,z.targetId,we._u),we.snapshot})(r,A,R,F);const l=await B_(r.localStore,e,!0),h=new B1(e,l.qs),f=h.nu(l.documents),g=ml.createSynthesizedTargetChangeForCurrentChange(t,s&&r.onlineState!=="Offline",o),y=h.applyChanges(f,r.isPrimaryClient,g);Y_(r,t,y._u);const w=new z1(e,t,h);return r.Pu.set(e,w),r.Tu.has(t)?r.Tu.get(t).push(e):r.Tu.set(t,[e]),y.snapshot}async function K1(r,e,t){const s=Se(r),o=s.Pu.get(e),l=s.Tu.get(o.targetId);if(l.length>1)return s.Tu.set(o.targetId,l.filter((h=>!Pc(h,e)))),void s.Pu.delete(e);s.isPrimaryClient?(s.sharedClientState.removeLocalQueryTarget(o.targetId),s.sharedClientState.isActiveQueryTarget(o.targetId)||await rf(s.localStore,o.targetId,!1).then((()=>{s.sharedClientState.clearQueryState(o.targetId),t&&zf(s.remoteStore,o.targetId),af(s,o.targetId)})).catch($o)):(af(s,o.targetId),await rf(s.localStore,o.targetId,!0))}async function Q1(r,e){const t=Se(r),s=t.Pu.get(e),o=t.Tu.get(s.targetId);t.isPrimaryClient&&o.length===1&&(t.sharedClientState.removeLocalQueryTarget(s.targetId),zf(t.remoteStore,s.targetId))}async function X1(r,e,t){const s=rC(r);try{const o=await(function(h,f){const g=Se(h),y=tt.now(),w=f.reduce(((F,B)=>F.add(B.key)),Oe());let A,R;return g.persistence.runTransaction("Locally write mutations","readwrite",(F=>{let B=Yr(),K=Oe();return g.Os.getEntries(F,w).next((z=>{B=z,B.forEach(((pe,ae)=>{ae.isValidDocument()||(K=K.add(pe))}))})).next((()=>g.localDocuments.getOverlayedDocuments(F,B))).next((z=>{A=z;const pe=[];for(const ae of f){const le=uR(ae,A.get(ae.key).overlayedDocument);le!=null&&pe.push(new Gi(ae.key,le,Dv(le.value.mapValue),er.exists(!0)))}return g.mutationQueue.addMutationBatch(F,y,pe,f)})).next((z=>{R=z;const pe=z.applyToLocalDocumentSet(A,K);return g.documentOverlayCache.saveOverlays(F,z.batchId,pe)}))})).then((()=>({batchId:R.batchId,changes:$v(A)})))})(s.localStore,e);s.sharedClientState.addPendingMutation(o.batchId),(function(h,f,g){let y=h.Ru[h.currentUser.toKey()];y||(y=new lt(Ce)),y=y.insert(f,g),h.Ru[h.currentUser.toKey()]=y})(s,o.batchId,t),await _l(s,o.changes),await Lc(s.remoteStore)}catch(o){const l=Gf(o,"Failed to persist write");t.reject(l)}}async function IE(r,e){const t=Se(r);try{const s=await o1(t.localStore,e);e.targetChanges.forEach(((o,l)=>{const h=t.Eu.get(l);h&&(ze(o.addedDocuments.size+o.modifiedDocuments.size+o.removedDocuments.size<=1,22616),o.addedDocuments.size>0?h.lu=!0:o.modifiedDocuments.size>0?ze(h.lu,14607):o.removedDocuments.size>0&&(ze(h.lu,42227),h.lu=!1))})),await _l(t,s,e)}catch(s){await $o(s)}}function X_(r,e,t){const s=Se(r);if(s.isPrimaryClient&&t===0||!s.isPrimaryClient&&t===1){const o=[];s.Pu.forEach(((l,h)=>{const f=h.view.va(e);f.snapshot&&o.push(f.snapshot)})),(function(h,f){const g=Se(h);g.onlineState=f;let y=!1;g.queries.forEach(((w,A)=>{for(const R of A.wa)R.va(f)&&(y=!0)})),y&&Kf(g)})(s.eventManager,e),o.length&&s.hu.J_(o),s.onlineState=e,s.isPrimaryClient&&s.sharedClientState.setOnlineState(e)}}async function Y1(r,e,t){const s=Se(r);s.sharedClientState.updateQueryState(e,"rejected",t);const o=s.Eu.get(e),l=o&&o.key;if(l){let h=new lt(me.comparator);h=h.insert(l,Gt.newNoDocument(l,Te.min()));const f=Oe().add(l),g=new Oc(Te.min(),new Map,new lt(Ce),h,f);await IE(s,g),s.du=s.du.remove(l),s.Eu.delete(e),Xf(s)}else await rf(s.localStore,e,!1).then((()=>af(s,e,t))).catch($o)}async function J1(r,e){const t=Se(r),s=e.batch.batchId;try{const o=await s1(t.localStore,e);AE(t,s,null),SE(t,s),t.sharedClientState.updateMutationState(s,"acknowledged"),await _l(t,o)}catch(o){await $o(o)}}async function Z1(r,e,t){const s=Se(r);try{const o=await(function(h,f){const g=Se(h);return g.persistence.runTransaction("Reject batch","readwrite-primary",(y=>{let w;return g.mutationQueue.lookupMutationBatch(y,f).next((A=>(ze(A!==null,37113),w=A.keys(),g.mutationQueue.removeMutationBatch(y,A)))).next((()=>g.mutationQueue.performConsistencyCheck(y))).next((()=>g.documentOverlayCache.removeOverlaysForBatchId(y,w,f))).next((()=>g.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(y,w))).next((()=>g.localDocuments.getDocuments(y,w)))}))})(s.localStore,e);AE(s,e,t),SE(s,e),s.sharedClientState.updateMutationState(e,"rejected",t),await _l(s,o)}catch(o){await $o(o)}}function SE(r,e){(r.Vu.get(e)||[]).forEach((t=>{t.resolve()})),r.Vu.delete(e)}function AE(r,e,t){const s=Se(r);let o=s.Ru[s.currentUser.toKey()];if(o){const l=o.get(e);l&&(t?l.reject(t):l.resolve(),o=o.remove(e)),s.Ru[s.currentUser.toKey()]=o}}function af(r,e,t=null){r.sharedClientState.removeLocalQueryTarget(e);for(const s of r.Tu.get(e))r.Pu.delete(s),t&&r.hu.pu(s,t);r.Tu.delete(e),r.isPrimaryClient&&r.Au.zr(e).forEach((s=>{r.Au.containsKey(s)||RE(r,s)}))}function RE(r,e){r.Iu.delete(e.path.canonicalString());const t=r.du.get(e);t!==null&&(zf(r.remoteStore,t),r.du=r.du.remove(e),r.Eu.delete(t),Xf(r))}function Y_(r,e,t){for(const s of t)s instanceof EE?(r.Au.addReference(s.key,e),eC(r,s)):s instanceof wE?(ie(Qf,"Document no longer in limbo: "+s.key),r.Au.removeReference(s.key,e),r.Au.containsKey(s.key)||RE(r,s.key)):ve(19791,{yu:s})}function eC(r,e){const t=e.key,s=t.path.canonicalString();r.du.get(t)||r.Iu.has(s)||(ie(Qf,"New document in limbo: "+t),r.Iu.add(s),Xf(r))}function Xf(r){for(;r.Iu.size>0&&r.du.size<r.maxConcurrentLimboResolutions;){const e=r.Iu.values().next().value;r.Iu.delete(e);const t=new me(Xe.fromString(e)),s=r.mu.next();r.Eu.set(s,new $1(t)),r.du=r.du.insert(t,s),pE(r.remoteStore,new ki(Tr(Uv(t.path)),s,"TargetPurposeLimboResolution",Ac.ue))}}async function _l(r,e,t){const s=Se(r),o=[],l=[],h=[];s.Pu.isEmpty()||(s.Pu.forEach(((f,g)=>{h.push(s.gu(g,e,t).then((y=>{var w;if((y||t)&&s.isPrimaryClient){const A=y?!y.fromCache:(w=t==null?void 0:t.targetChanges.get(g.targetId))===null||w===void 0?void 0:w.current;s.sharedClientState.updateQueryState(g.targetId,A?"current":"not-current")}if(y){o.push(y);const A=jf.Es(g.targetId,y);l.push(A)}})))})),await Promise.all(h),s.hu.J_(o),await(async function(g,y){const w=Se(g);try{await w.persistence.runTransaction("notifyLocalViewChanges","readwrite",(A=>q.forEach(y,(R=>q.forEach(R.Is,(F=>w.persistence.referenceDelegate.addReference(A,R.targetId,F))).next((()=>q.forEach(R.ds,(F=>w.persistence.referenceDelegate.removeReference(A,R.targetId,F)))))))))}catch(A){if(!Ho(A))throw A;ie(Bf,"Failed to update sequence numbers: "+A)}for(const A of y){const R=A.targetId;if(!A.fromCache){const F=w.Fs.get(R),B=F.snapshotVersion,K=F.withLastLimboFreeSnapshotVersion(B);w.Fs=w.Fs.insert(R,K)}}})(s.localStore,l))}async function tC(r,e){const t=Se(r);if(!t.currentUser.isEqual(e)){ie(Qf,"User change. New user:",e.toKey());const s=await cE(t.localStore,e);t.currentUser=e,(function(l,h){l.Vu.forEach((f=>{f.forEach((g=>{g.reject(new ne($.CANCELLED,h))}))})),l.Vu.clear()})(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,s.removedBatchIds,s.addedBatchIds),await _l(t,s.Bs)}}function nC(r,e){const t=Se(r),s=t.Eu.get(e);if(s&&s.lu)return Oe().add(s.key);{let o=Oe();const l=t.Tu.get(e);if(!l)return o;for(const h of l){const f=t.Pu.get(h);o=o.unionWith(f.view.tu)}return o}}function CE(r){const e=Se(r);return e.remoteStore.remoteSyncer.applyRemoteEvent=IE.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=nC.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Y1.bind(null,e),e.hu.J_=U1.bind(null,e.eventManager),e.hu.pu=F1.bind(null,e.eventManager),e}function rC(r){const e=Se(r);return e.remoteStore.remoteSyncer.applySuccessfulWrite=J1.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Z1.bind(null,e),e}class gc{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=xc(e.databaseInfo.databaseId),this.sharedClientState=this.bu(e),this.persistence=this.Du(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Cu(e,this.localStore),this.indexBackfillerScheduler=this.Fu(e,this.localStore)}Cu(e,t){return null}Fu(e,t){return null}vu(e){return i1(this.persistence,new t1,e.initialUser,this.serializer)}Du(e){return new uE(Ff.Vi,this.serializer)}bu(e){return new h1}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}gc.provider={build:()=>new gc};class iC extends gc{constructor(e){super(),this.cacheSizeBytes=e}Cu(e,t){ze(this.persistence.referenceDelegate instanceof pc,46915);const s=this.persistence.referenceDelegate.garbageCollector;return new jR(s,e.asyncQueue,t)}Du(e){const t=this.cacheSizeBytes!==void 0?un.withCacheSize(this.cacheSizeBytes):un.DEFAULT;return new uE((s=>pc.Vi(s,t)),this.serializer)}}class lf{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=s=>X_(this.syncEngine,s,1),this.remoteStore.remoteSyncer.handleCredentialChange=tC.bind(null,this.syncEngine),await x1(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return(function(){return new L1})()}createDatastore(e){const t=xc(e.databaseInfo.databaseId),s=(function(l){return new g1(l)})(e.databaseInfo);return(function(l,h,f,g){return new E1(l,h,f,g)})(e.authCredentials,e.appCheckCredentials,s,t)}createRemoteStore(e){return(function(s,o,l,h,f){return new T1(s,o,l,h,f)})(this.localStore,this.datastore,e.asyncQueue,(t=>X_(this.syncEngine,t,0)),(function(){return H_.C()?new H_:new d1})())}createSyncEngine(e,t){return(function(o,l,h,f,g,y,w){const A=new H1(o,l,h,f,g,y);return w&&(A.fu=!0),A})(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await(async function(o){const l=Se(o);ie(Ps,"RemoteStore shutting down."),l.Ia.add(5),await gl(l),l.Ea.shutdown(),l.Aa.set("Unknown")})(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}lf.provider={build:()=>new lf};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sC{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.xu(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.xu(this.observer.error,e):Xr("Uncaught Error in snapshot listener:",e.toString()))}Ou(){this.muted=!0}xu(e,t){setTimeout((()=>{this.muted||e(t)}),0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $i="FirestoreClient";class oC{constructor(e,t,s,o,l){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=s,this.databaseInfo=o,this.user=Wt.UNAUTHENTICATED,this.clientId=Cf.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=l,this.authCredentials.start(s,(async h=>{ie($i,"Received user=",h.uid),await this.authCredentialListener(h),this.user=h})),this.appCheckCredentials.start(s,(h=>(ie($i,"Received new app check token=",h),this.appCheckCredentialListener(h,this.user))))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Vi;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted((async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const s=Gf(t,"Failed to shutdown persistence");e.reject(s)}})),e.promise}}async function Pd(r,e){r.asyncQueue.verifyOperationInProgress(),ie($i,"Initializing OfflineComponentProvider");const t=r.configuration;await e.initialize(t);let s=t.initialUser;r.setCredentialChangeListener((async o=>{s.isEqual(o)||(await cE(e.localStore,o),s=o)})),e.persistence.setDatabaseDeletedListener((()=>{Mi("Terminating Firestore due to IndexedDb database deletion"),r.terminate().then((()=>{ie("Terminating Firestore due to IndexedDb database deletion completed successfully")})).catch((o=>{Mi("Terminating Firestore due to IndexedDb database deletion failed",o)}))})),r._offlineComponents=e}async function J_(r,e){r.asyncQueue.verifyOperationInProgress();const t=await aC(r);ie($i,"Initializing OnlineComponentProvider"),await e.initialize(t,r.configuration),r.setCredentialChangeListener((s=>W_(e.remoteStore,s))),r.setAppCheckTokenChangeListener(((s,o)=>W_(e.remoteStore,o))),r._onlineComponents=e}async function aC(r){if(!r._offlineComponents)if(r._uninitializedComponentsProvider){ie($i,"Using user provided OfflineComponentProvider");try{await Pd(r,r._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!(function(o){return o.name==="FirebaseError"?o.code===$.FAILED_PRECONDITION||o.code===$.UNIMPLEMENTED:!(typeof DOMException<"u"&&o instanceof DOMException)||o.code===22||o.code===20||o.code===11})(t))throw t;Mi("Error using user provided cache. Falling back to memory cache: "+t),await Pd(r,new gc)}}else ie($i,"Using default OfflineComponentProvider"),await Pd(r,new iC(void 0));return r._offlineComponents}async function PE(r){return r._onlineComponents||(r._uninitializedComponentsProvider?(ie($i,"Using user provided OnlineComponentProvider"),await J_(r,r._uninitializedComponentsProvider._online)):(ie($i,"Using default OnlineComponentProvider"),await J_(r,new lf))),r._onlineComponents}function lC(r){return PE(r).then((e=>e.syncEngine))}async function uC(r){const e=await PE(r),t=e.eventManager;return t.onListen=q1.bind(null,e.syncEngine),t.onUnlisten=K1.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=W1.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=Q1.bind(null,e.syncEngine),t}function cC(r,e,t={}){const s=new Vi;return r.asyncQueue.enqueueAndForget((async()=>(function(l,h,f,g,y){const w=new sC({next:R=>{w.Ou(),h.enqueueAndForget((()=>M1(l,A))),R.fromCache&&g.source==="server"?y.reject(new ne($.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):y.resolve(R)},error:R=>y.reject(R)}),A=new j1(f,w,{includeMetadataChanges:!0,ka:!0});return b1(l,A)})(await uC(r),r.asyncQueue,e,t,s))),s.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kE(r){const e={};return r.timeoutSeconds!==void 0&&(e.timeoutSeconds=r.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Z_=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NE="firestore.googleapis.com",ey=!0;class ty{constructor(e){var t,s;if(e.host===void 0){if(e.ssl!==void 0)throw new ne($.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=NE,this.ssl=ey}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:ey;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=lE;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<UR)throw new ne($.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}TA("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=kE((s=e.experimentalLongPollingOptions)!==null&&s!==void 0?s:{}),(function(l){if(l.timeoutSeconds!==void 0){if(isNaN(l.timeoutSeconds))throw new ne($.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (must not be NaN)`);if(l.timeoutSeconds<5)throw new ne($.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (minimum allowed value is 5)`);if(l.timeoutSeconds>30)throw new ne($.INVALID_ARGUMENT,`invalid long polling timeout: ${l.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(s,o){return s.timeoutSeconds===o.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class bc{constructor(e,t,s,o){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=s,this._app=o,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ty({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new ne($.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new ne($.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ty(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(s){if(!s)return new fA;switch(s.type){case"firstParty":return new _A(s.sessionIndex||"0",s.iamToken||null,s.authTokenFactory||null);case"provider":return s.client;default:throw new ne($.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const s=Z_.get(t);s&&(ie("ComponentProvider","Removing Datastore"),Z_.delete(t),s.terminate())})(this),Promise.resolve()}}function hC(r,e,t,s={}){var o;r=Cs(r,bc);const l=Hi(e),h=r._getSettings(),f=Object.assign(Object.assign({},h),{emulatorOptions:r._getEmulatorOptions()}),g=`${e}:${t}`;l&&(df(`https://${g}`),ff("Firestore",!0)),h.host!==NE&&h.host!==g&&Mi("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const y=Object.assign(Object.assign({},h),{host:g,ssl:l,emulatorOptions:s});if(!Is(y,f)&&(r._setSettings(y),s.mockUserToken)){let w,A;if(typeof s.mockUserToken=="string")w=s.mockUserToken,A=Wt.MOCK_USER;else{w=Ry(s.mockUserToken,(o=r._app)===null||o===void 0?void 0:o.options.projectId);const R=s.mockUserToken.sub||s.mockUserToken.user_id;if(!R)throw new ne($.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");A=new Wt(R)}r._authCredentials=new pA(new yv(w,A))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vs{constructor(e,t,s){this.converter=t,this._query=s,this.type="query",this.firestore=e}withConverter(e){return new Vs(this.firestore,e,this._query)}}class Ct{constructor(e,t,s){this.converter=t,this._key=s,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Li(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ct(this.firestore,e,this._key)}toJSON(){return{type:Ct._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,s){if(fl(t,Ct._jsonSchema))return new Ct(e,s||null,new me(Xe.fromString(t.referencePath)))}}Ct._jsonSchemaVersion="firestore/documentReference/1.0",Ct._jsonSchema={type:It("string",Ct._jsonSchemaVersion),referencePath:It("string")};class Li extends Vs{constructor(e,t,s){super(e,t,Uv(s)),this._path=s,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ct(this.firestore,null,new me(e))}withConverter(e){return new Li(this.firestore,e,this._path)}}function kd(r,e,...t){if(r=at(r),Ev("collection","path",e),r instanceof bc){const s=Xe.fromString(e,...t);return p_(s),new Li(r,null,s)}{if(!(r instanceof Ct||r instanceof Li))throw new ne($.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=r._path.child(Xe.fromString(e,...t));return p_(s),new Li(r.firestore,null,s)}}function $a(r,e,...t){if(r=at(r),arguments.length===1&&(e=Cf.newId()),Ev("doc","path",e),r instanceof bc){const s=Xe.fromString(e,...t);return f_(s),new Ct(r,null,new me(s))}{if(!(r instanceof Ct||r instanceof Li))throw new ne($.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const s=r._path.child(Xe.fromString(e,...t));return f_(s),new Ct(r.firestore,r instanceof Li?r.converter:null,new me(s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ny="AsyncQueue";class ry{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new dE(this,"async_queue_retry"),this.oc=()=>{const s=Cd();s&&ie(ny,"Visibility state changed to "+s.visibilityState),this.F_.y_()},this._c=e;const t=Cd();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const t=Cd();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise((()=>{}));const t=new Vi;return this.uc((()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Zu.push(e),this.cc())))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!Ho(e))throw e;ie(ny,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_((()=>this.cc()))}}uc(e){const t=this._c.then((()=>(this.nc=!0,e().catch((s=>{throw this.tc=s,this.nc=!1,Xr("INTERNAL UNHANDLED ERROR: ",iy(s)),s})).then((s=>(this.nc=!1,s))))));return this._c=t,t}enqueueAfterDelay(e,t,s){this.ac(),this.sc.indexOf(e)>-1&&(t=0);const o=Wf.createAndSchedule(this,e,t,s,(l=>this.lc(l)));return this.ec.push(o),o}ac(){this.tc&&ve(47125,{hc:iy(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then((()=>{this.ec.sort(((t,s)=>t.targetTimeMs-s.targetTimeMs));for(const t of this.ec)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Pc()}))}dc(e){this.sc.push(e)}lc(e){const t=this.ec.indexOf(e);this.ec.splice(t,1)}}function iy(r){let e=r.message||"";return r.stack&&(e=r.stack.includes(r.message)?r.stack:r.message+`
`+r.stack),e}class yl extends bc{constructor(e,t,s,o){super(e,t,s,o),this.type="firestore",this._queue=new ry,this._persistenceKey=(o==null?void 0:o.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ry(e),this._firestoreClient=void 0,await e}}}function dC(r,e){const t=typeof r=="object"?r:gf(),s=typeof r=="string"?r:uc,o=vc(t,"firestore").getImmediate({identifier:s});if(!o._initialized){const l=Iy("firestore");l&&hC(o,...l)}return o}function DE(r){if(r._terminated)throw new ne($.FAILED_PRECONDITION,"The client has already been terminated.");return r._firestoreClient||fC(r),r._firestoreClient}function fC(r){var e,t,s;const o=r._freezeSettings(),l=(function(f,g,y,w){return new xA(f,g,y,w.host,w.ssl,w.experimentalForceLongPolling,w.experimentalAutoDetectLongPolling,kE(w.experimentalLongPollingOptions),w.useFetchStreams,w.isUsingEmulator)})(r._databaseId,((e=r._app)===null||e===void 0?void 0:e.options.appId)||"",r._persistenceKey,o);r._componentsProvider||!((t=o.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((s=o.localCache)===null||s===void 0)&&s._onlineComponentProvider)&&(r._componentsProvider={_offline:o.localCache._offlineComponentProvider,_online:o.localCache._onlineComponentProvider}),r._firestoreClient=new oC(r._authCredentials,r._appCheckCredentials,r._queue,l,r._componentsProvider&&(function(f){const g=f==null?void 0:f._online.build();return{_offline:f==null?void 0:f._offline.build(g),_online:g}})(r._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class On{constructor(e){this._byteString=e}static fromBase64String(e){try{return new On(jt.fromBase64String(e))}catch(t){throw new ne($.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new On(jt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:On._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(fl(e,On._jsonSchema))return On.fromBase64String(e.bytes)}}On._jsonSchemaVersion="firestore/bytes/1.0",On._jsonSchema={type:It("string",On._jsonSchemaVersion),bytes:It("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new ne($.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ft(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uc{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sr{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new ne($.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new ne($.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ce(this._lat,e._lat)||Ce(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:Sr._jsonSchemaVersion}}static fromJSON(e){if(fl(e,Sr._jsonSchema))return new Sr(e.latitude,e.longitude)}}Sr._jsonSchemaVersion="firestore/geoPoint/1.0",Sr._jsonSchema={type:It("string",Sr._jsonSchemaVersion),latitude:It("number"),longitude:It("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ar{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(s,o){if(s.length!==o.length)return!1;for(let l=0;l<s.length;++l)if(s[l]!==o[l])return!1;return!0})(this._values,e._values)}toJSON(){return{type:Ar._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(fl(e,Ar._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new Ar(e.vectorValues);throw new ne($.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}Ar._jsonSchemaVersion="firestore/vectorValue/1.0",Ar._jsonSchema={type:It("string",Ar._jsonSchemaVersion),vectorValues:It("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pC=/^__.*__$/;class mC{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return this.fieldMask!==null?new Gi(e,this.data,this.fieldMask,t,this.fieldTransforms):new pl(e,this.data,t,this.fieldTransforms)}}class OE{constructor(e,t,s){this.data=e,this.fieldMask=t,this.fieldTransforms=s}toMutation(e,t){return new Gi(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function xE(r){switch(r){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw ve(40011,{Ec:r})}}class Yf{constructor(e,t,s,o,l,h){this.settings=e,this.databaseId=t,this.serializer=s,this.ignoreUndefinedProperties=o,l===void 0&&this.Ac(),this.fieldTransforms=l||[],this.fieldMask=h||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(e){return new Yf(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(e){var t;const s=(t=this.path)===null||t===void 0?void 0:t.child(e),o=this.Rc({path:s,mc:!1});return o.fc(e),o}gc(e){var t;const s=(t=this.path)===null||t===void 0?void 0:t.child(e),o=this.Rc({path:s,mc:!1});return o.Ac(),o}yc(e){return this.Rc({path:void 0,mc:!0})}wc(e){return _c(e,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(e){return this.fieldMask.find((t=>e.isPrefixOf(t)))!==void 0||this.fieldTransforms.find((t=>e.isPrefixOf(t.field)))!==void 0}Ac(){if(this.path)for(let e=0;e<this.path.length;e++)this.fc(this.path.get(e))}fc(e){if(e.length===0)throw this.wc("Document fields must not be empty");if(xE(this.Ec)&&pC.test(e))throw this.wc('Document fields cannot begin and end with "__"')}}class gC{constructor(e,t,s){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=s||xc(e)}Dc(e,t,s,o=!1){return new Yf({Ec:e,methodName:t,bc:s,path:Ft.emptyPath(),mc:!1,Sc:o},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Jf(r){const e=r._freezeSettings(),t=xc(r._databaseId);return new gC(r._databaseId,!!e.ignoreUndefinedProperties,t)}function _C(r,e,t,s,o,l={}){const h=r.Dc(l.merge||l.mergeFields?2:0,e,t,o);ep("Data must be an object, but it was:",h,s);const f=VE(s,h);let g,y;if(l.merge)g=new yn(h.fieldMask),y=h.fieldTransforms;else if(l.mergeFields){const w=[];for(const A of l.mergeFields){const R=uf(e,A,t);if(!h.contains(R))throw new ne($.INVALID_ARGUMENT,`Field '${R}' is specified in your field mask but missing from your input data.`);bE(w,R)||w.push(R)}g=new yn(w),y=h.fieldTransforms.filter((A=>g.covers(A.field)))}else g=null,y=h.fieldTransforms;return new mC(new cn(f),g,y)}class Fc extends Uc{_toFieldTransform(e){if(e.Ec!==2)throw e.Ec===1?e.wc(`${this._methodName}() can only appear at the top level of your update data`):e.wc(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Fc}}class Zf extends Uc{_toFieldTransform(e){return new sR(e.path,new sl)}isEqual(e){return e instanceof Zf}}function yC(r,e,t,s){const o=r.Dc(1,e,t);ep("Data must be an object, but it was:",o,s);const l=[],h=cn.empty();Wi(s,((g,y)=>{const w=tp(e,g,t);y=at(y);const A=o.gc(w);if(y instanceof Fc)l.push(w);else{const R=vl(y,A);R!=null&&(l.push(w),h.set(w,R))}}));const f=new yn(l);return new OE(h,f,o.fieldTransforms)}function vC(r,e,t,s,o,l){const h=r.Dc(1,e,t),f=[uf(e,s,t)],g=[o];if(l.length%2!=0)throw new ne($.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let R=0;R<l.length;R+=2)f.push(uf(e,l[R])),g.push(l[R+1]);const y=[],w=cn.empty();for(let R=f.length-1;R>=0;--R)if(!bE(y,f[R])){const F=f[R];let B=g[R];B=at(B);const K=h.gc(F);if(B instanceof Fc)y.push(F);else{const z=vl(B,K);z!=null&&(y.push(F),w.set(F,z))}}const A=new yn(y);return new OE(w,A,h.fieldTransforms)}function EC(r,e,t,s=!1){return vl(t,r.Dc(s?4:3,e))}function vl(r,e){if(LE(r=at(r)))return ep("Unsupported field value:",e,r),VE(r,e);if(r instanceof Uc)return(function(s,o){if(!xE(o.Ec))throw o.wc(`${s._methodName}() can only be used with update() and set()`);if(!o.path)throw o.wc(`${s._methodName}() is not currently supported inside arrays`);const l=s._toFieldTransform(o);l&&o.fieldTransforms.push(l)})(r,e),null;if(r===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),r instanceof Array){if(e.settings.mc&&e.Ec!==4)throw e.wc("Nested arrays are not supported");return(function(s,o){const l=[];let h=0;for(const f of s){let g=vl(f,o.yc(h));g==null&&(g={nullValue:"NULL_VALUE"}),l.push(g),h++}return{arrayValue:{values:l}}})(r,e)}return(function(s,o){if((s=at(s))===null)return{nullValue:"NULL_VALUE"};if(typeof s=="number")return nR(o.serializer,s);if(typeof s=="boolean")return{booleanValue:s};if(typeof s=="string")return{stringValue:s};if(s instanceof Date){const l=tt.fromDate(s);return{timestampValue:fc(o.serializer,l)}}if(s instanceof tt){const l=new tt(s.seconds,1e3*Math.floor(s.nanoseconds/1e3));return{timestampValue:fc(o.serializer,l)}}if(s instanceof Sr)return{geoPointValue:{latitude:s.latitude,longitude:s.longitude}};if(s instanceof On)return{bytesValue:tE(o.serializer,s._byteString)};if(s instanceof Ct){const l=o.databaseId,h=s.firestore._databaseId;if(!h.isEqual(l))throw o.wc(`Document reference is for database ${h.projectId}/${h.database} but should be for database ${l.projectId}/${l.database}`);return{referenceValue:Mf(s.firestore._databaseId||o.databaseId,s._key.path)}}if(s instanceof Ar)return(function(h,f){return{mapValue:{fields:{[kv]:{stringValue:Nv},[cc]:{arrayValue:{values:h.toArray().map((y=>{if(typeof y!="number")throw f.wc("VectorValues must only contain numeric values.");return xf(f.serializer,y)}))}}}}}})(s,o);throw o.wc(`Unsupported field value: ${Sc(s)}`)})(r,e)}function VE(r,e){const t={};return Iv(r)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Wi(r,((s,o)=>{const l=vl(o,e.Vc(s));l!=null&&(t[s]=l)})),{mapValue:{fields:t}}}function LE(r){return!(typeof r!="object"||r===null||r instanceof Array||r instanceof Date||r instanceof tt||r instanceof Sr||r instanceof On||r instanceof Ct||r instanceof Uc||r instanceof Ar)}function ep(r,e,t){if(!LE(t)||!wv(t)){const s=Sc(t);throw s==="an object"?e.wc(r+" a custom object"):e.wc(r+" "+s)}}function uf(r,e,t){if((e=at(e))instanceof Mc)return e._internalPath;if(typeof e=="string")return tp(r,e);throw _c("Field path arguments must be of type string or ",r,!1,void 0,t)}const wC=new RegExp("[~\\*/\\[\\]]");function tp(r,e,t){if(e.search(wC)>=0)throw _c(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,r,!1,void 0,t);try{return new Mc(...e.split("."))._internalPath}catch{throw _c(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,r,!1,void 0,t)}}function _c(r,e,t,s,o){const l=s&&!s.isEmpty(),h=o!==void 0;let f=`Function ${e}() called with invalid data`;t&&(f+=" (via `toFirestore()`)"),f+=". ";let g="";return(l||h)&&(g+=" (found",l&&(g+=` in field ${s}`),h&&(g+=` in document ${o}`),g+=")"),new ne($.INVALID_ARGUMENT,f+r+g)}function bE(r,e){return r.some((t=>t.isEqual(e)))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ME{constructor(e,t,s,o,l){this._firestore=e,this._userDataWriter=t,this._key=s,this._document=o,this._converter=l}get id(){return this._key.path.lastSegment()}get ref(){return new Ct(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new TC(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(np("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class TC extends ME{data(){return super.data()}}function np(r,e){return typeof e=="string"?tp(r,e):e instanceof Mc?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IC(r){if(r.limitType==="L"&&r.explicitOrderBy.length===0)throw new ne($.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class rp{}class UE extends rp{}function sy(r,e,...t){let s=[];e instanceof rp&&s.push(e),s=s.concat(t),(function(l){const h=l.filter((g=>g instanceof sp)).length,f=l.filter((g=>g instanceof ip)).length;if(h>1||h>0&&f>0)throw new ne($.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")})(s);for(const o of s)r=o._apply(r);return r}class ip extends UE{constructor(e,t,s){super(),this._field=e,this._op=t,this._value=s,this.type="where"}static _create(e,t,s){return new ip(e,t,s)}_apply(e){const t=this._parse(e);return FE(e._query,t),new Vs(e.firestore,e.converter,Yd(e._query,t))}_parse(e){const t=Jf(e.firestore);return(function(l,h,f,g,y,w,A){let R;if(y.isKeyField()){if(w==="array-contains"||w==="array-contains-any")throw new ne($.INVALID_ARGUMENT,`Invalid Query. You can't perform '${w}' queries on documentId().`);if(w==="in"||w==="not-in"){ly(A,w);const B=[];for(const K of A)B.push(ay(g,l,K));R={arrayValue:{values:B}}}else R=ay(g,l,A)}else w!=="in"&&w!=="not-in"&&w!=="array-contains-any"||ly(A,w),R=EC(f,h,A,w==="in"||w==="not-in");return Tt.create(y,w,R)})(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}class sp extends rp{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new sp(e,t)}_parse(e){const t=this._queryConstraints.map((s=>s._parse(e))).filter((s=>s.getFilters().length>0));return t.length===1?t[0]:nr.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:((function(o,l){let h=o;const f=l.getFlattenedFilters();for(const g of f)FE(h,g),h=Yd(h,g)})(e._query,t),new Vs(e.firestore,e.converter,Yd(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class op extends UE{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new op(e,t)}_apply(e){const t=(function(o,l,h){if(o.startAt!==null)throw new ne($.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(o.endAt!==null)throw new ne($.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new il(l,h)})(e._query,this._field,this._direction);return new Vs(e.firestore,e.converter,(function(o,l){const h=o.explicitOrderBy.concat([l]);return new qo(o.path,o.collectionGroup,h,o.filters.slice(),o.limit,o.limitType,o.startAt,o.endAt)})(e._query,t))}}function oy(r,e="asc"){const t=e,s=np("orderBy",r);return op._create(s,t)}function ay(r,e,t){if(typeof(t=at(t))=="string"){if(t==="")throw new ne($.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Fv(e)&&t.indexOf("/")!==-1)throw new ne($.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const s=e.path.child(Xe.fromString(t));if(!me.isDocumentKey(s))throw new ne($.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${s}' is not because it has an odd number of segments (${s.length}).`);return T_(r,new me(s))}if(t instanceof Ct)return T_(r,t._key);throw new ne($.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Sc(t)}.`)}function ly(r,e){if(!Array.isArray(r)||r.length===0)throw new ne($.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function FE(r,e){const t=(function(o,l){for(const h of o)for(const f of h.getFlattenedFilters())if(l.indexOf(f.op)>=0)return f.op;return null})(r.filters,(function(o){switch(o){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}})(e.op));if(t!==null)throw t===e.op?new ne($.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new ne($.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}class SC{convertValue(e,t="none"){switch(Bi(e)){case 0:return null;case 1:return e.booleanValue;case 2:return _t(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(ji(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw ve(62114,{value:e})}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const s={};return Wi(e,((o,l)=>{s[o]=this.convertValue(l,t)})),s}convertVectorValue(e){var t,s,o;const l=(o=(s=(t=e.fields)===null||t===void 0?void 0:t[cc].arrayValue)===null||s===void 0?void 0:s.values)===null||o===void 0?void 0:o.map((h=>_t(h.doubleValue)));return new Ar(l)}convertGeoPoint(e){return new Sr(_t(e.latitude),_t(e.longitude))}convertArray(e,t){return(e.values||[]).map((s=>this.convertValue(s,t)))}convertServerTimestamp(e,t){switch(t){case"previous":const s=Cc(e);return s==null?null:this.convertValue(s,t);case"estimate":return this.convertTimestamp(tl(e));default:return null}}convertTimestamp(e){const t=Fi(e);return new tt(t.seconds,t.nanos)}convertDocumentKey(e,t){const s=Xe.fromString(e);ze(aE(s),9688,{name:e});const o=new nl(s.get(1),s.get(3)),l=new me(s.popFirst(5));return o.isEqual(t)||Xr(`Document ${l} contains a document reference within a different database (${o.projectId}/${o.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),l}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AC(r,e,t){let s;return s=r?r.toFirestore(e):e,s}class Bu{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Oo extends ME{constructor(e,t,s,o,l,h){super(e,t,s,o,h),this._firestore=e,this._firestoreImpl=e,this.metadata=l}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Zu(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const s=this._document.data.field(np("DocumentSnapshot.get",e));if(s!==null)return this._userDataWriter.convertValue(s,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new ne($.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=Oo._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}Oo._jsonSchemaVersion="firestore/documentSnapshot/1.0",Oo._jsonSchema={type:It("string",Oo._jsonSchemaVersion),bundleSource:It("string","DocumentSnapshot"),bundleName:It("string"),bundle:It("string")};class Zu extends Oo{data(e={}){return super.data(e)}}class xo{constructor(e,t,s,o){this._firestore=e,this._userDataWriter=t,this._snapshot=o,this.metadata=new Bu(o.hasPendingWrites,o.fromCache),this.query=s}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((s=>{e.call(t,new Zu(this._firestore,this._userDataWriter,s.key,s,new Bu(this._snapshot.mutatedKeys.has(s.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new ne($.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(o,l){if(o._snapshot.oldDocs.isEmpty()){let h=0;return o._snapshot.docChanges.map((f=>{const g=new Zu(o._firestore,o._userDataWriter,f.doc.key,f.doc,new Bu(o._snapshot.mutatedKeys.has(f.doc.key),o._snapshot.fromCache),o.query.converter);return f.doc,{type:"added",doc:g,oldIndex:-1,newIndex:h++}}))}{let h=o._snapshot.oldDocs;return o._snapshot.docChanges.filter((f=>l||f.type!==3)).map((f=>{const g=new Zu(o._firestore,o._userDataWriter,f.doc.key,f.doc,new Bu(o._snapshot.mutatedKeys.has(f.doc.key),o._snapshot.fromCache),o.query.converter);let y=-1,w=-1;return f.type!==0&&(y=h.indexOf(f.doc.key),h=h.delete(f.doc.key)),f.type!==1&&(h=h.add(f.doc),w=h.indexOf(f.doc.key)),{type:RC(f.type),doc:g,oldIndex:y,newIndex:w}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new ne($.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=xo._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Cf.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],s=[],o=[];return this.docs.forEach((l=>{l._document!==null&&(t.push(l._document),s.push(this._userDataWriter.convertObjectMap(l._document.data.value.mapValue.fields,"previous")),o.push(l.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function RC(r){switch(r){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return ve(61501,{type:r})}}xo._jsonSchemaVersion="firestore/querySnapshot/1.0",xo._jsonSchema={type:It("string",xo._jsonSchemaVersion),bundleSource:It("string","QuerySnapshot"),bundleName:It("string"),bundle:It("string")};class CC extends SC{constructor(e){super(),this.firestore=e}convertBytes(e){return new On(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ct(this.firestore,null,t)}}function Nd(r){r=Cs(r,Vs);const e=Cs(r.firestore,yl),t=DE(e),s=new CC(e);return IC(r._query),cC(t,r._query).then((o=>new xo(e,s,r,o)))}function uy(r,e,t,...s){r=Cs(r,Ct);const o=Cs(r.firestore,yl),l=Jf(o);let h;return h=typeof(e=at(e))=="string"||e instanceof Mc?vC(l,"updateDoc",r._key,e,t,s):yC(l,"updateDoc",r._key,e),ap(o,[h.toMutation(r._key,er.exists(!0))])}function Dd(r){return ap(Cs(r.firestore,yl),[new Vf(r._key,er.none())])}function cy(r,e){const t=Cs(r.firestore,yl),s=$a(r),o=AC(r.converter,e);return ap(t,[_C(Jf(r.firestore),"addDoc",s._key,o,r.converter!==null,{}).toMutation(s._key,er.exists(!1))]).then((()=>s))}function ap(r,e){return(function(s,o){const l=new Vi;return s.asyncQueue.enqueueAndForget((async()=>X1(await lC(s),o,l))),l.promise})(DE(r),e)}function hy(){return new Zf("serverTimestamp")}(function(e,t=!0){(function(o){zo=o})(Ns),Ss(new bi("firestore",((s,{instanceIdentifier:o,options:l})=>{const h=s.getProvider("app").getImmediate(),f=new yl(new mA(s.getProvider("auth-internal")),new yA(h,s.getProvider("app-check-internal")),(function(y,w){if(!Object.prototype.hasOwnProperty.apply(y.options,["projectId"]))throw new ne($.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new nl(y.options.projectId,w)})(h,o),h);return l=Object.assign({useFetchStreams:t},l),f._setSettings(l),f}),"PUBLIC").setMultipleInstances(!0)),vr(l_,u_,e),vr(l_,u_,"esm2017")})();/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jE="firebasestorage.googleapis.com",BE="storageBucket",PC=120*1e3,kC=600*1e3;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dt extends Cr{constructor(e,t,s=0){super(Od(e),`Firebase Storage: ${t} (${Od(e)})`),this.status_=s,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,dt.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Od(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var ht;(function(r){r.UNKNOWN="unknown",r.OBJECT_NOT_FOUND="object-not-found",r.BUCKET_NOT_FOUND="bucket-not-found",r.PROJECT_NOT_FOUND="project-not-found",r.QUOTA_EXCEEDED="quota-exceeded",r.UNAUTHENTICATED="unauthenticated",r.UNAUTHORIZED="unauthorized",r.UNAUTHORIZED_APP="unauthorized-app",r.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",r.INVALID_CHECKSUM="invalid-checksum",r.CANCELED="canceled",r.INVALID_EVENT_NAME="invalid-event-name",r.INVALID_URL="invalid-url",r.INVALID_DEFAULT_BUCKET="invalid-default-bucket",r.NO_DEFAULT_BUCKET="no-default-bucket",r.CANNOT_SLICE_BLOB="cannot-slice-blob",r.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",r.NO_DOWNLOAD_URL="no-download-url",r.INVALID_ARGUMENT="invalid-argument",r.INVALID_ARGUMENT_COUNT="invalid-argument-count",r.APP_DELETED="app-deleted",r.INVALID_ROOT_OPERATION="invalid-root-operation",r.INVALID_FORMAT="invalid-format",r.INTERNAL_ERROR="internal-error",r.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(ht||(ht={}));function Od(r){return"storage/"+r}function lp(){const r="An unknown error occurred, please check the error payload for server response.";return new dt(ht.UNKNOWN,r)}function NC(r){return new dt(ht.OBJECT_NOT_FOUND,"Object '"+r+"' does not exist.")}function DC(r){return new dt(ht.QUOTA_EXCEEDED,"Quota for bucket '"+r+"' exceeded, please view quota on https://firebase.google.com/pricing/.")}function OC(){const r="User is not authenticated, please authenticate using Firebase Authentication and try again.";return new dt(ht.UNAUTHENTICATED,r)}function xC(){return new dt(ht.UNAUTHORIZED_APP,"This app does not have permission to access Firebase Storage on this project.")}function VC(r){return new dt(ht.UNAUTHORIZED,"User does not have permission to access '"+r+"'.")}function LC(){return new dt(ht.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function bC(){return new dt(ht.CANCELED,"User canceled the upload/download.")}function MC(r){return new dt(ht.INVALID_URL,"Invalid URL '"+r+"'.")}function UC(r){return new dt(ht.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+r+"'.")}function FC(){return new dt(ht.NO_DEFAULT_BUCKET,"No default bucket found. Did you set the '"+BE+"' property when initializing the app?")}function jC(){return new dt(ht.CANNOT_SLICE_BLOB,"Cannot slice blob for upload. Please retry the upload.")}function BC(){return new dt(ht.NO_DOWNLOAD_URL,"The given file does not have any download URLs.")}function zC(r){return new dt(ht.UNSUPPORTED_ENVIRONMENT,`${r} is missing. Make sure to install the required polyfills. See https://firebase.google.com/docs/web/environments-js-sdk#polyfills for more information.`)}function cf(r){return new dt(ht.INVALID_ARGUMENT,r)}function zE(){return new dt(ht.APP_DELETED,"The Firebase app was deleted.")}function $C(r){return new dt(ht.INVALID_ROOT_OPERATION,"The operation '"+r+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}function Xa(r,e){return new dt(ht.INVALID_FORMAT,"String does not match format '"+r+"': "+e)}function Ma(r){throw new dt(ht.INTERNAL_ERROR,"Internal error: "+r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let s;try{s=vn.makeFromUrl(e,t)}catch{return new vn(e,"")}if(s.path==="")return s;throw UC(e)}static makeFromUrl(e,t){let s=null;const o="([A-Za-z0-9.\\-_]+)";function l(de){de.path.charAt(de.path.length-1)==="/"&&(de.path_=de.path_.slice(0,-1))}const h="(/(.*))?$",f=new RegExp("^gs://"+o+h,"i"),g={bucket:1,path:3};function y(de){de.path_=decodeURIComponent(de.path)}const w="v[A-Za-z0-9_]+",A=t.replace(/[.]/g,"\\."),R="(/([^?#]*).*)?$",F=new RegExp(`^https?://${A}/${w}/b/${o}/o${R}`,"i"),B={bucket:1,path:3},K=t===jE?"(?:storage.googleapis.com|storage.cloud.google.com)":t,z="([^?#]*)",pe=new RegExp(`^https?://${K}/${o}/${z}`,"i"),le=[{regex:f,indices:g,postModify:l},{regex:F,indices:B,postModify:y},{regex:pe,indices:{bucket:1,path:2},postModify:y}];for(let de=0;de<le.length;de++){const je=le[de],we=je.regex.exec(e);if(we){const N=we[je.indices.bucket];let T=we[je.indices.path];T||(T=""),s=new vn(N,T),je.postModify(s);break}}if(s==null)throw MC(e);return s}}class HC{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qC(r,e,t){let s=1,o=null,l=null,h=!1,f=0;function g(){return f===2}let y=!1;function w(...z){y||(y=!0,e.apply(null,z))}function A(z){o=setTimeout(()=>{o=null,r(F,g())},z)}function R(){l&&clearTimeout(l)}function F(z,...pe){if(y){R();return}if(z){R(),w.call(null,z,...pe);return}if(g()||h){R(),w.call(null,z,...pe);return}s<64&&(s*=2);let le;f===1?(f=2,le=0):le=(s+Math.random())*1e3,A(le)}let B=!1;function K(z){B||(B=!0,R(),!y&&(o!==null?(z||(f=2),clearTimeout(o),A(0)):z||(f=1)))}return A(0),l=setTimeout(()=>{h=!0,K(!0)},t),K}function WC(r){r(!1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GC(r){return r!==void 0}function KC(r){return typeof r=="object"&&!Array.isArray(r)}function up(r){return typeof r=="string"||r instanceof String}function dy(r){return cp()&&r instanceof Blob}function cp(){return typeof Blob<"u"}function fy(r,e,t,s){if(s<e)throw cf(`Invalid value for '${r}'. Expected ${e} or greater.`);if(s>t)throw cf(`Invalid value for '${r}'. Expected ${t} or less.`)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jc(r,e,t){let s=e;return t==null&&(s=`https://${e}`),`${t}://${s}/v0${r}`}function $E(r){const e=encodeURIComponent;let t="?";for(const s in r)if(r.hasOwnProperty(s)){const o=e(s)+"="+e(r[s]);t=t+o+"&"}return t=t.slice(0,-1),t}var Ts;(function(r){r[r.NO_ERROR=0]="NO_ERROR",r[r.NETWORK_ERROR=1]="NETWORK_ERROR",r[r.ABORT=2]="ABORT"})(Ts||(Ts={}));/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QC(r,e){const t=r>=500&&r<600,o=[408,429].indexOf(r)!==-1,l=e.indexOf(r)!==-1;return t||o||l}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XC{constructor(e,t,s,o,l,h,f,g,y,w,A,R=!0,F=!1){this.url_=e,this.method_=t,this.headers_=s,this.body_=o,this.successCodes_=l,this.additionalRetryCodes_=h,this.callback_=f,this.errorCallback_=g,this.timeout_=y,this.progressCallback_=w,this.connectionFactory_=A,this.retry=R,this.isUsingEmulator=F,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((B,K)=>{this.resolve_=B,this.reject_=K,this.start_()})}start_(){const e=(s,o)=>{if(o){s(!1,new zu(!1,null,!0));return}const l=this.connectionFactory_();this.pendingConnection_=l;const h=f=>{const g=f.loaded,y=f.lengthComputable?f.total:-1;this.progressCallback_!==null&&this.progressCallback_(g,y)};this.progressCallback_!==null&&l.addUploadProgressListener(h),l.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&l.removeUploadProgressListener(h),this.pendingConnection_=null;const f=l.getErrorCode()===Ts.NO_ERROR,g=l.getStatus();if(!f||QC(g,this.additionalRetryCodes_)&&this.retry){const w=l.getErrorCode()===Ts.ABORT;s(!1,new zu(!1,null,w));return}const y=this.successCodes_.indexOf(g)!==-1;s(!0,new zu(y,l))})},t=(s,o)=>{const l=this.resolve_,h=this.reject_,f=o.connection;if(o.wasSuccessCode)try{const g=this.callback_(f,f.getResponse());GC(g)?l(g):l()}catch(g){h(g)}else if(f!==null){const g=lp();g.serverResponse=f.getErrorText(),this.errorCallback_?h(this.errorCallback_(f,g)):h(g)}else if(o.canceled){const g=this.appDelete_?zE():bC();h(g)}else{const g=LC();h(g)}};this.canceled_?t(!1,new zu(!1,null,!0)):this.backoffId_=qC(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&WC(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class zu{constructor(e,t,s){this.wasSuccessCode=e,this.connection=t,this.canceled=!!s}}function YC(r,e){e!==null&&e.length>0&&(r.Authorization="Firebase "+e)}function JC(r,e){r["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function ZC(r,e){e&&(r["X-Firebase-GMPID"]=e)}function eP(r,e){e!==null&&(r["X-Firebase-AppCheck"]=e)}function tP(r,e,t,s,o,l,h=!0,f=!1){const g=$E(r.urlParams),y=r.url+g,w=Object.assign({},r.headers);return ZC(w,e),YC(w,t),JC(w,l),eP(w,s),new XC(y,r.method,w,r.body,r.successCodes,r.additionalRetryCodes,r.handler,r.errorHandler,r.timeout,r.progressCallback,o,h,f)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nP(){return typeof BlobBuilder<"u"?BlobBuilder:typeof WebKitBlobBuilder<"u"?WebKitBlobBuilder:void 0}function rP(...r){const e=nP();if(e!==void 0){const t=new e;for(let s=0;s<r.length;s++)t.append(r[s]);return t.getBlob()}else{if(cp())return new Blob(r);throw new dt(ht.UNSUPPORTED_ENVIRONMENT,"This browser doesn't seem to support creating Blobs")}}function iP(r,e,t){return r.webkitSlice?r.webkitSlice(e,t):r.mozSlice?r.mozSlice(e,t):r.slice?r.slice(e,t):null}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sP(r){if(typeof atob>"u")throw zC("base-64");return atob(r)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yr={RAW:"raw",BASE64:"base64",BASE64URL:"base64url",DATA_URL:"data_url"};class xd{constructor(e,t){this.data=e,this.contentType=t||null}}function oP(r,e){switch(r){case yr.RAW:return new xd(HE(e));case yr.BASE64:case yr.BASE64URL:return new xd(qE(r,e));case yr.DATA_URL:return new xd(lP(e),uP(e))}throw lp()}function HE(r){const e=[];for(let t=0;t<r.length;t++){let s=r.charCodeAt(t);if(s<=127)e.push(s);else if(s<=2047)e.push(192|s>>6,128|s&63);else if((s&64512)===55296)if(!(t<r.length-1&&(r.charCodeAt(t+1)&64512)===56320))e.push(239,191,189);else{const l=s,h=r.charCodeAt(++t);s=65536|(l&1023)<<10|h&1023,e.push(240|s>>18,128|s>>12&63,128|s>>6&63,128|s&63)}else(s&64512)===56320?e.push(239,191,189):e.push(224|s>>12,128|s>>6&63,128|s&63)}return new Uint8Array(e)}function aP(r){let e;try{e=decodeURIComponent(r)}catch{throw Xa(yr.DATA_URL,"Malformed data URL.")}return HE(e)}function qE(r,e){switch(r){case yr.BASE64:{const o=e.indexOf("-")!==-1,l=e.indexOf("_")!==-1;if(o||l)throw Xa(r,"Invalid character '"+(o?"-":"_")+"' found: is it base64url encoded?");break}case yr.BASE64URL:{const o=e.indexOf("+")!==-1,l=e.indexOf("/")!==-1;if(o||l)throw Xa(r,"Invalid character '"+(o?"+":"/")+"' found: is it base64 encoded?");e=e.replace(/-/g,"+").replace(/_/g,"/");break}}let t;try{t=sP(e)}catch(o){throw o.message.includes("polyfill")?o:Xa(r,"Invalid character found")}const s=new Uint8Array(t.length);for(let o=0;o<t.length;o++)s[o]=t.charCodeAt(o);return s}class WE{constructor(e){this.base64=!1,this.contentType=null;const t=e.match(/^data:([^,]+)?,/);if(t===null)throw Xa(yr.DATA_URL,"Must be formatted 'data:[<mediatype>][;base64],<data>");const s=t[1]||null;s!=null&&(this.base64=cP(s,";base64"),this.contentType=this.base64?s.substring(0,s.length-7):s),this.rest=e.substring(e.indexOf(",")+1)}}function lP(r){const e=new WE(r);return e.base64?qE(yr.BASE64,e.rest):aP(e.rest)}function uP(r){return new WE(r).contentType}function cP(r,e){return r.length>=e.length?r.substring(r.length-e.length)===e:!1}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pi{constructor(e,t){let s=0,o="";dy(e)?(this.data_=e,s=e.size,o=e.type):e instanceof ArrayBuffer?(t?this.data_=new Uint8Array(e):(this.data_=new Uint8Array(e.byteLength),this.data_.set(new Uint8Array(e))),s=this.data_.length):e instanceof Uint8Array&&(t?this.data_=e:(this.data_=new Uint8Array(e.length),this.data_.set(e)),s=e.length),this.size_=s,this.type_=o}size(){return this.size_}type(){return this.type_}slice(e,t){if(dy(this.data_)){const s=this.data_,o=iP(s,e,t);return o===null?null:new Pi(o)}else{const s=new Uint8Array(this.data_.buffer,e,t-e);return new Pi(s,!0)}}static getBlob(...e){if(cp()){const t=e.map(s=>s instanceof Pi?s.data_:s);return new Pi(rP.apply(null,t))}else{const t=e.map(h=>up(h)?oP(yr.RAW,h).data:h.data_);let s=0;t.forEach(h=>{s+=h.byteLength});const o=new Uint8Array(s);let l=0;return t.forEach(h=>{for(let f=0;f<h.length;f++)o[l++]=h[f]}),new Pi(o,!0)}}uploadData(){return this.data_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function GE(r){let e;try{e=JSON.parse(r)}catch{return null}return KC(e)?e:null}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hP(r){if(r.length===0)return null;const e=r.lastIndexOf("/");return e===-1?"":r.slice(0,e)}function dP(r,e){const t=e.split("/").filter(s=>s.length>0).join("/");return r.length===0?t:r+"/"+t}function KE(r){const e=r.lastIndexOf("/",r.length-2);return e===-1?r:r.slice(e+1)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fP(r,e){return e}class Zt{constructor(e,t,s,o){this.server=e,this.local=t||e,this.writable=!!s,this.xform=o||fP}}let $u=null;function pP(r){return!up(r)||r.length<2?r:KE(r)}function QE(){if($u)return $u;const r=[];r.push(new Zt("bucket")),r.push(new Zt("generation")),r.push(new Zt("metageneration")),r.push(new Zt("name","fullPath",!0));function e(l,h){return pP(h)}const t=new Zt("name");t.xform=e,r.push(t);function s(l,h){return h!==void 0?Number(h):h}const o=new Zt("size");return o.xform=s,r.push(o),r.push(new Zt("timeCreated")),r.push(new Zt("updated")),r.push(new Zt("md5Hash",null,!0)),r.push(new Zt("cacheControl",null,!0)),r.push(new Zt("contentDisposition",null,!0)),r.push(new Zt("contentEncoding",null,!0)),r.push(new Zt("contentLanguage",null,!0)),r.push(new Zt("contentType",null,!0)),r.push(new Zt("metadata","customMetadata",!0)),$u=r,$u}function mP(r,e){function t(){const s=r.bucket,o=r.fullPath,l=new vn(s,o);return e._makeStorageReference(l)}Object.defineProperty(r,"ref",{get:t})}function gP(r,e,t){const s={};s.type="file";const o=t.length;for(let l=0;l<o;l++){const h=t[l];s[h.local]=h.xform(s,e[h.server])}return mP(s,r),s}function XE(r,e,t){const s=GE(e);return s===null?null:gP(r,s,t)}function _P(r,e,t,s){const o=GE(e);if(o===null||!up(o.downloadTokens))return null;const l=o.downloadTokens;if(l.length===0)return null;const h=encodeURIComponent;return l.split(",").map(y=>{const w=r.bucket,A=r.fullPath,R="/b/"+h(w)+"/o/"+h(A),F=jc(R,t,s),B=$E({alt:"media",token:y});return F+B})[0]}function yP(r,e){const t={},s=e.length;for(let o=0;o<s;o++){const l=e[o];l.writable&&(t[l.server]=r[l.local])}return JSON.stringify(t)}class hp{constructor(e,t,s,o){this.url=e,this.method=t,this.handler=s,this.timeout=o,this.urlParams={},this.headers={},this.body=null,this.errorHandler=null,this.progressCallback=null,this.successCodes=[200],this.additionalRetryCodes=[]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function YE(r){if(!r)throw lp()}function vP(r,e){function t(s,o){const l=XE(r,o,e);return YE(l!==null),l}return t}function EP(r,e){function t(s,o){const l=XE(r,o,e);return YE(l!==null),_P(l,o,r.host,r._protocol)}return t}function JE(r){function e(t,s){let o;return t.getStatus()===401?t.getErrorText().includes("Firebase App Check token is invalid")?o=xC():o=OC():t.getStatus()===402?o=DC(r.bucket):t.getStatus()===403?o=VC(r.path):o=s,o.status=t.getStatus(),o.serverResponse=s.serverResponse,o}return e}function ZE(r){const e=JE(r);function t(s,o){let l=e(s,o);return s.getStatus()===404&&(l=NC(r.path)),l.serverResponse=o.serverResponse,l}return t}function wP(r,e,t){const s=e.fullServerUrl(),o=jc(s,r.host,r._protocol),l="GET",h=r.maxOperationRetryTime,f=new hp(o,l,EP(r,t),h);return f.errorHandler=ZE(e),f}function TP(r,e){const t=e.fullServerUrl(),s=jc(t,r.host,r._protocol),o="DELETE",l=r.maxOperationRetryTime;function h(g,y){}const f=new hp(s,o,h,l);return f.successCodes=[200,204],f.errorHandler=ZE(e),f}function IP(r,e){return r&&r.contentType||e&&e.type()||"application/octet-stream"}function SP(r,e,t){const s=Object.assign({},t);return s.fullPath=r.path,s.size=e.size(),s.contentType||(s.contentType=IP(null,e)),s}function AP(r,e,t,s,o){const l=e.bucketOnlyServerUrl(),h={"X-Goog-Upload-Protocol":"multipart"};function f(){let le="";for(let de=0;de<2;de++)le=le+Math.random().toString().slice(2);return le}const g=f();h["Content-Type"]="multipart/related; boundary="+g;const y=SP(e,s,o),w=yP(y,t),A="--"+g+`\r
Content-Type: application/json; charset=utf-8\r
\r
`+w+`\r
--`+g+`\r
Content-Type: `+y.contentType+`\r
\r
`,R=`\r
--`+g+"--",F=Pi.getBlob(A,s,R);if(F===null)throw jC();const B={name:y.fullPath},K=jc(l,r.host,r._protocol),z="POST",pe=r.maxUploadRetryTime,ae=new hp(K,z,vP(r,t),pe);return ae.urlParams=B,ae.headers=h,ae.body=F.uploadData(),ae.errorHandler=JE(e),ae}class RP{constructor(){this.sent_=!1,this.xhr_=new XMLHttpRequest,this.initXhr(),this.errorCode_=Ts.NO_ERROR,this.sendPromise_=new Promise(e=>{this.xhr_.addEventListener("abort",()=>{this.errorCode_=Ts.ABORT,e()}),this.xhr_.addEventListener("error",()=>{this.errorCode_=Ts.NETWORK_ERROR,e()}),this.xhr_.addEventListener("load",()=>{e()})})}send(e,t,s,o,l){if(this.sent_)throw Ma("cannot .send() more than once");if(Hi(e)&&s&&(this.xhr_.withCredentials=!0),this.sent_=!0,this.xhr_.open(t,e,!0),l!==void 0)for(const h in l)l.hasOwnProperty(h)&&this.xhr_.setRequestHeader(h,l[h].toString());return o!==void 0?this.xhr_.send(o):this.xhr_.send(),this.sendPromise_}getErrorCode(){if(!this.sent_)throw Ma("cannot .getErrorCode() before sending");return this.errorCode_}getStatus(){if(!this.sent_)throw Ma("cannot .getStatus() before sending");try{return this.xhr_.status}catch{return-1}}getResponse(){if(!this.sent_)throw Ma("cannot .getResponse() before sending");return this.xhr_.response}getErrorText(){if(!this.sent_)throw Ma("cannot .getErrorText() before sending");return this.xhr_.statusText}abort(){this.xhr_.abort()}getResponseHeader(e){return this.xhr_.getResponseHeader(e)}addUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.addEventListener("progress",e)}removeUploadProgressListener(e){this.xhr_.upload!=null&&this.xhr_.upload.removeEventListener("progress",e)}}class CP extends RP{initXhr(){this.xhr_.responseType="text"}}function dp(){return new CP}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{constructor(e,t){this._service=e,t instanceof vn?this._location=t:this._location=vn.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new ks(e,t)}get root(){const e=new vn(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return KE(this._location.path)}get storage(){return this._service}get parent(){const e=hP(this._location.path);if(e===null)return null;const t=new vn(this._location.bucket,e);return new ks(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw $C(e)}}function PP(r,e,t){r._throwIfRoot("uploadBytes");const s=AP(r.storage,r._location,QE(),new Pi(e,!0),t);return r.storage.makeRequestWithTokens(s,dp).then(o=>({metadata:o,ref:r}))}function kP(r){r._throwIfRoot("getDownloadURL");const e=wP(r.storage,r._location,QE());return r.storage.makeRequestWithTokens(e,dp).then(t=>{if(t===null)throw BC();return t})}function NP(r){r._throwIfRoot("deleteObject");const e=TP(r.storage,r._location);return r.storage.makeRequestWithTokens(e,dp)}function DP(r,e){const t=dP(r._location.path,e),s=new vn(r._location.bucket,t);return new ks(r.storage,s)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function OP(r){return/^[A-Za-z]+:\/\//.test(r)}function xP(r,e){return new ks(r,e)}function ew(r,e){if(r instanceof fp){const t=r;if(t._bucket==null)throw FC();const s=new ks(t,t._bucket);return e!=null?ew(s,e):s}else return e!==void 0?DP(r,e):r}function VP(r,e){if(e&&OP(e)){if(r instanceof fp)return xP(r,e);throw cf("To use ref(service, url), the first argument must be a Storage instance.")}else return ew(r,e)}function py(r,e){const t=e==null?void 0:e[BE];return t==null?null:vn.makeFromBucketSpec(t,r)}function LP(r,e,t,s={}){r.host=`${e}:${t}`;const o=Hi(e);o&&(df(`https://${r.host}/b`),ff("Storage",!0)),r._isUsingEmulator=!0,r._protocol=o?"https":"http";const{mockUserToken:l}=s;l&&(r._overrideAuthToken=typeof l=="string"?l:Ry(l,r.app.options.projectId))}class fp{constructor(e,t,s,o,l,h=!1){this.app=e,this._authProvider=t,this._appCheckProvider=s,this._url=o,this._firebaseVersion=l,this._isUsingEmulator=h,this._bucket=null,this._host=jE,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=PC,this._maxUploadRetryTime=kC,this._requests=new Set,o!=null?this._bucket=vn.makeFromBucketSpec(o,this._host):this._bucket=py(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=vn.makeFromBucketSpec(this._url,e):this._bucket=py(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){fy("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){fy("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(Dn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new ks(this,e)}_makeRequest(e,t,s,o,l=!0){if(this._deleted)return new HC(zE());{const h=tP(e,this._appId,s,o,t,this._firebaseVersion,l,this._isUsingEmulator);return this._requests.add(h),h.getPromise().then(()=>this._requests.delete(h),()=>this._requests.delete(h)),h}}async makeRequestWithTokens(e,t){const[s,o]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,s,o).getPromise()}}const my="@firebase/storage",gy="0.13.14";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tw="storage";function bP(r,e,t){return r=at(r),PP(r,e,t)}function MP(r){return r=at(r),kP(r)}function _y(r){return r=at(r),NP(r)}function Vd(r,e){return r=at(r),VP(r,e)}function UP(r=gf(),e){r=at(r);const s=vc(r,tw).getImmediate({identifier:e}),o=Iy("storage");return o&&FP(s,...o),s}function FP(r,e,t,s={}){LP(r,e,t,s)}function jP(r,{instanceIdentifier:e}){const t=r.getProvider("app").getImmediate(),s=r.getProvider("auth-internal"),o=r.getProvider("app-check-internal");return new fp(t,s,o,e,Ns)}function BP(){Ss(new bi(tw,jP,"PUBLIC").setMultipleInstances(!0)),vr(my,gy,""),vr(my,gy,"esm2017")}BP();const zP={apiKey:"AIzaSyAHtMlMvNJzqFdcriNX0KOw-uaIzTpuRZw",authDomain:"wanderlust-gallery.firebaseapp.com",projectId:"wanderlust-gallery",storageBucket:"wanderlust-gallery.firebasestorage.app",messagingSenderId:"582205452363",appId:"1:582205452363:web:e294c1367e8517bb1f5dce",measurementId:"G-LLS3PSM4GB"},pp=ky(zP),Ld=hA(pp),vs=dC(pp),bd=UP(pp);function $P(r,e=2e3,t=.82){return new Promise(s=>{const o=new Image;o.onload=()=>{let{width:l,height:h}=o;if(l>e||h>e){const g=Math.min(e/l,e/h);l=Math.round(l*g),h=Math.round(h*g)}const f=document.createElement("canvas");f.width=l,f.height=h,f.getContext("2d").drawImage(o,0,0,l,h),f.toBlob(g=>s(g),"image/jpeg",t)},o.src=URL.createObjectURL(r)})}function HP(){const[r,e]=Ge.useState(null),[t,s]=Ge.useState(!0),[o,l]=Ge.useState(""),[h,f]=Ge.useState(""),[g,y]=Ge.useState(""),[w,A]=Ge.useState(!1),[R,F]=Ge.useState([]),[B,K]=Ge.useState(null),[z,pe]=Ge.useState([]),[ae,le]=Ge.useState(!1),[de,je]=Ge.useState(!1),[we,N]=Ge.useState(!1),[T,C]=Ge.useState({done:0,total:0}),[k,O]=Ge.useState(!1),[V,S]=Ge.useState(""),[nt,yt]=Ge.useState(""),[Ye,Ne]=Ge.useState(null),[ee,fe]=Ge.useState(null),[te,x]=Ge.useState("grid"),[H,ce]=Ge.useState(!1),Ie=Ge.useRef();Ge.useEffect(()=>ZI(Ld,W=>{e(W),s(!1)}),[]),Ge.useEffect(()=>{r&&Ue()},[r]),Ge.useEffect(()=>{if(!B||!r){pe([]);return}xn(B)},[B,r]),Ge.useEffect(()=>{const W=Ae=>{Ye&&(Ae.key==="Escape"&&Ne(null),Ae.key==="ArrowLeft"&&Ln(-1),Ae.key==="ArrowRight"&&Ln(1))};return window.addEventListener("keydown",W),()=>window.removeEventListener("keydown",W)});const Re=async()=>{y(""),A(!0);try{await XI(Ld,o,h)}catch(W){const Ae=W.code==="auth/invalid-credential"?"Invalid email or password":W.code==="auth/too-many-requests"?"Too many attempts — try again later":"Login failed";y(Ae)}A(!1)},ke=()=>kd(vs,"users",r.uid,"trips"),Ue=async()=>{le(!0);try{const W=sy(ke(),oy("createdAt","desc")),Ae=await Nd(W);F(Ae.docs.map(xe=>({id:xe.id,...xe.data()})))}catch(W){console.error("Load trips error:",W)}le(!1)},Le=async()=>{if(!V.trim())return;const W={name:V.trim(),date:nt||null,cover:null,photoCount:0,createdAt:hy()},Ae=await cy(ke(),W);F(xe=>[{id:Ae.id,...W},...xe]),S(""),yt(""),O(!1)},qe=async W=>{const Ae=await Nd(kd(vs,"users",r.uid,"trips",W,"photos"));for(const xe of Ae.docs){const ut=xe.data();if(ut.storagePath)try{await _y(Vd(bd,ut.storagePath))}catch{}await Dd(xe.ref)}await Dd($a(vs,"users",r.uid,"trips",W)),F(xe=>xe.filter(ut=>ut.id!==W)),B===W&&(K(null),pe([])),fe(null)},ft=W=>kd(vs,"users",r.uid,"trips",W,"photos"),xn=async W=>{je(!0);try{const Ae=sy(ft(W),oy("createdAt","asc")),xe=await Nd(Ae);pe(xe.docs.map(ut=>({id:ut.id,...ut.data()})))}catch(Ae){console.error("Load photos error:",Ae)}je(!1)},Pr=Ge.useCallback(async W=>{if(!B||!W.length)return;const Ae=Array.from(W).filter(Je=>Je.type.startsWith("image/"));if(!Ae.length)return;N(!0),C({done:0,total:Ae.length});const xe=[];for(let Je=0;Je<Ae.length;Je++){const Mn=Ae[Je];try{const $e=await $P(Mn),pt=`${Date.now()}_${Mn.name.replace(/[^a-zA-Z0-9._-]/g,"_")}`,En=`users/${r.uid}/trips/${B}/${pt}`,Zr=Vd(bd,En);await bP(Zr,$e);const ir=await MP(Zr),sr={name:Mn.name,url:ir,storagePath:En,createdAt:hy()},Dr=await cy(ft(B),sr);xe.push({id:Dr.id,...sr})}catch($e){console.error("Upload error:",$e)}C($e=>({...$e,done:Je+1}))}pe(Je=>[...Je,...xe]);const ut=R.find(Je=>Je.id===B);if(ut){const Je={photoCount:(ut.photoCount||0)+xe.length};!ut.cover&&xe.length&&(Je.cover=xe[0].url),await uy($a(vs,"users",r.uid,"trips",B),Je),F(Mn=>Mn.map($e=>$e.id===B?{...$e,...Je}:$e))}N(!1)},[B,r,R]),rr=async W=>{if(W.storagePath)try{await _y(Vd(bd,W.storagePath))}catch{}await Dd($a(vs,"users",r.uid,"trips",B,"photos",W.id)),pe(xe=>xe.filter(ut=>ut.id!==W.id));const Ae=R.find(xe=>xe.id===B);if(Ae){const xe=Math.max(0,(Ae.photoCount||1)-1);await uy($a(vs,"users",r.uid,"trips",B),{photoCount:xe}),F(ut=>ut.map(Je=>Je.id===B?{...Je,photoCount:xe}:Je))}Ne(null)},Vn=Ye?z.findIndex(W=>W.id===Ye.id):-1,Ln=W=>{const Ae=Vn+W;Ae>=0&&Ae<z.length&&Ne(z[Ae])},kr=W=>{W.preventDefault(),ce(!0)},Nr=()=>ce(!1),Jr=W=>{W.preventDefault(),ce(!1),Pr(W.dataTransfer.files)};if(t)return X.jsx("div",{className:"login-page",children:X.jsx("div",{className:"spinner",style:{width:28,height:28}})});if(!r)return X.jsx("div",{className:"login-page",children:X.jsxs("div",{className:"login-card fade-scale",children:[X.jsx("img",{src:"/logo.png",alt:"Pepini per il mondo",className:"login-logo-img"}),X.jsx("p",{className:"login-sub",children:"Sign in to access your private gallery"}),X.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[X.jsx("input",{type:"email",value:o,onChange:W=>l(W.target.value),onKeyDown:W=>W.key==="Enter"&&Re(),placeholder:"Email",className:"input",style:{textAlign:"center"},autoComplete:"email"}),X.jsx("input",{type:"password",value:h,onChange:W=>f(W.target.value),onKeyDown:W=>W.key==="Enter"&&Re(),placeholder:"Password",className:"input",style:{textAlign:"center"},autoComplete:"current-password"}),X.jsx("button",{onClick:Re,className:"btn btn-accent",disabled:w,style:{justifyContent:"center",opacity:w?.6:1},children:w?X.jsxs(X.Fragment,{children:[X.jsx("span",{className:"spinner",style:{width:14,height:14}})," Signing in…"]}):"Unlock"})]}),g&&X.jsx("p",{className:"login-error",children:g})]})});const bn=R.find(W=>W.id===B);return X.jsxs("div",{children:[X.jsxs("header",{className:"header",children:[X.jsxs("div",{style:{display:"flex",alignItems:"center",gap:14},children:[B&&X.jsx("button",{className:"btn btn-sm",onClick:()=>K(null),children:"← Trips"}),X.jsxs("div",{className:"header-logo-wrap",onClick:()=>K(null),children:[X.jsx("img",{src:"/logo.png",alt:"Pepini per il mondo",className:"header-logo-img"}),X.jsx("span",{className:"header-logo heading",children:"Pepini per il mondo"})]})]}),X.jsxs("div",{className:"header-actions",children:[!B&&X.jsx("button",{className:"btn btn-accent",onClick:()=>O(!0),children:"+ New Trip"}),B&&X.jsx("button",{className:"btn btn-accent",onClick:()=>{var W;return(W=Ie.current)==null?void 0:W.click()},disabled:we,children:we?`Uploading ${T.done}/${T.total}…`:"+ Add Photos"}),X.jsx("button",{className:"btn btn-sm",onClick:()=>eS(Ld),title:"Sign out",children:"↪ Out"})]}),X.jsx("input",{ref:Ie,type:"file",accept:"image/*",multiple:!0,style:{display:"none"},onChange:W=>{Pr(W.target.files),W.target.value=""}})]}),X.jsxs("div",{className:"content",children:[!B&&X.jsxs("div",{className:"fade-in",children:[k&&X.jsxs("div",{className:"new-trip-form fade-scale",children:[X.jsxs("div",{className:"form-group",children:[X.jsx("label",{children:"Trip Name"}),X.jsx("input",{value:V,onChange:W=>S(W.target.value),onKeyDown:W=>W.key==="Enter"&&Le(),placeholder:"e.g. Patagonia 2024",className:"input",autoFocus:!0})]}),X.jsxs("div",{className:"form-group",style:{flex:"0 0 160px"},children:[X.jsx("label",{children:"Date (optional)"}),X.jsx("input",{type:"date",value:nt,onChange:W=>yt(W.target.value),className:"input"})]}),X.jsx("button",{onClick:Le,className:"btn btn-accent",children:"Create"}),X.jsx("button",{onClick:()=>{O(!1),S(""),yt("")},className:"btn btn-sm",children:"Cancel"})]}),ae&&X.jsx("div",{style:{textAlign:"center",padding:60},children:X.jsx("span",{className:"spinner"})}),!ae&&R.length===0&&!k&&X.jsxs("div",{className:"empty",children:[X.jsx("div",{className:"empty-icon",children:"✈"}),X.jsx("p",{className:"empty-title heading",children:"No trips yet"}),X.jsx("p",{className:"empty-sub",children:"Create your first trip to start uploading photos."}),X.jsx("button",{className:"btn btn-accent",onClick:()=>O(!0),children:"+ New Trip"})]}),X.jsx("div",{className:"trips-grid",children:R.map((W,Ae)=>X.jsxs("div",{className:"trip-card fade-in",style:{animationDelay:`${Ae*60}ms`},onClick:()=>K(W.id),children:[X.jsxs("div",{className:`trip-cover ${W.cover?"":"trip-cover-empty"}`,style:W.cover?{backgroundImage:`url(${W.cover})`}:{},children:[!W.cover&&X.jsx("span",{children:"🗺"}),X.jsx("button",{className:"trip-delete",onClick:xe=>{xe.stopPropagation(),fe(W.id)},children:"✕"})]}),X.jsxs("div",{className:"trip-info",children:[X.jsx("div",{className:"trip-name",children:W.name}),X.jsxs("div",{className:"trip-meta",children:[W.date||"",W.date?" · ":"",W.photoCount||0," photo",(W.photoCount||0)!==1?"s":""]})]})]},W.id))})]}),B&&bn&&X.jsxs("div",{className:"fade-in",children:[X.jsxs("div",{className:"gallery-header",children:[X.jsxs("div",{children:[X.jsx("span",{className:"gallery-title heading",children:bn.name}),bn.date&&X.jsx("span",{className:"gallery-date",children:bn.date})]}),X.jsxs("div",{className:"view-toggle",children:[X.jsx("button",{className:`view-btn ${te==="grid"?"active":""}`,onClick:()=>x("grid"),children:"Grid"}),X.jsx("button",{className:`view-btn ${te==="list"?"active":""}`,onClick:()=>x("list"),children:"List"})]})]}),we&&X.jsxs("div",{className:"upload-progress",children:[X.jsx("span",{className:"spinner"}),"Uploading ",T.done," of ",T.total," photos…"]}),de&&X.jsx("div",{style:{textAlign:"center",padding:60},children:X.jsx("span",{className:"spinner"})}),!de&&z.length===0&&!we&&X.jsxs("div",{className:`drop-zone ${H?"dragging":""}`,onClick:()=>{var W;return(W=Ie.current)==null?void 0:W.click()},onDragOver:kr,onDragLeave:Nr,onDrop:Jr,children:[X.jsx("div",{className:"drop-zone-icon",children:"📷"}),X.jsx("p",{style:{fontSize:15,marginBottom:4},children:"Drag & drop photos here"}),X.jsx("p",{style:{fontSize:12},children:"or click to browse"})]}),z.length>0&&te==="grid"&&X.jsxs("div",{className:"photo-grid",onDragOver:kr,onDragLeave:Nr,onDrop:Jr,children:[z.map((W,Ae)=>X.jsx("div",{className:"photo-thumb fade-in",style:{animationDelay:`${Ae*30}ms`},onClick:()=>Ne(W),children:X.jsx("img",{src:W.url,alt:W.name,loading:"lazy"})},W.id)),X.jsx("div",{className:"add-tile",onClick:()=>{var W;return(W=Ie.current)==null?void 0:W.click()},children:"+"})]}),z.length>0&&te==="list"&&X.jsx("div",{className:"photo-list",onDragOver:kr,onDragLeave:Nr,onDrop:Jr,children:z.map((W,Ae)=>{var xe;return X.jsxs("div",{className:"photo-list-item fade-in",style:{animationDelay:`${Ae*25}ms`},onClick:()=>Ne(W),children:[X.jsx("img",{src:W.url,alt:W.name,loading:"lazy"}),X.jsxs("div",{children:[X.jsx("div",{className:"photo-list-name",children:W.name}),((xe=W.createdAt)==null?void 0:xe.seconds)&&X.jsx("div",{className:"photo-list-date",children:new Date(W.createdAt.seconds*1e3).toLocaleDateString()})]})]},W.id)})})]})]}),Ye&&X.jsxs("div",{className:"lightbox fade-scale",onClick:()=>Ne(null),children:[X.jsxs("div",{onClick:W=>W.stopPropagation(),style:{position:"relative"},children:[X.jsx("img",{src:Ye.url,alt:Ye.name,className:"lightbox-img"}),X.jsxs("div",{className:"lightbox-bar",children:[X.jsx("span",{className:"lightbox-name",children:Ye.name}),X.jsxs("div",{className:"lightbox-nav",children:[Vn>0&&X.jsx("button",{className:"btn btn-sm",onClick:()=>Ln(-1),children:"← Prev"}),Vn<z.length-1&&X.jsx("button",{className:"btn btn-sm",onClick:()=>Ln(1),children:"Next →"}),X.jsx("button",{className:"btn btn-sm btn-danger",onClick:()=>rr(Ye),children:"Delete"})]})]})]}),X.jsx("button",{className:"lightbox-close",onClick:()=>Ne(null),children:"✕"})]}),ee&&X.jsx("div",{className:"modal-overlay fade-scale",onClick:()=>fe(null),children:X.jsxs("div",{className:"modal",onClick:W=>W.stopPropagation(),children:[X.jsx("p",{className:"modal-title",children:"Delete this trip?"}),X.jsx("p",{className:"modal-sub",children:"All photos will be permanently deleted from storage."}),X.jsxs("div",{className:"modal-actions",children:[X.jsx("button",{className:"btn btn-sm",onClick:()=>fe(null),children:"Cancel"}),X.jsx("button",{className:"btn btn-danger",onClick:()=>qe(ee),children:"Delete"})]})]})})]})}mT.createRoot(document.getElementById("root")).render(X.jsx(lT.StrictMode,{children:X.jsx(HP,{})}));
