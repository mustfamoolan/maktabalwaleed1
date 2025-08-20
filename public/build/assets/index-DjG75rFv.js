import{c as z}from"./createLucideIcon-OegKdwhO.js";import{r as p}from"./app-C7cjIxtJ.js";/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]],xt=z("save",L);/**
 * @license lucide-react v0.540.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],wt=z("x",M);let C={data:""},D=t=>typeof window=="object"?((t?t.querySelector("#_goober"):window._goober)||Object.assign((t||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:t||C,H=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,P=/\/\*[^]*?\*\/|  +/g,A=/\n+/g,g=(t,e)=>{let a="",o="",s="";for(let i in t){let r=t[i];i[0]=="@"?i[1]=="i"?a=i+" "+r+";":o+=i[1]=="f"?g(r,i):i+"{"+g(r,i[1]=="k"?"":e)+"}":typeof r=="object"?o+=g(r,e?e.replace(/([^,])+/g,n=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):i):r!=null&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=g.p?g.p(i,r):i+":"+r+";")}return a+(e&&s?e+"{"+s+"}":s)+o},u={},I=t=>{if(typeof t=="object"){let e="";for(let a in t)e+=a+I(t[a]);return e}return t},T=(t,e,a,o,s)=>{let i=I(t),r=u[i]||(u[i]=(l=>{let d=0,m=11;for(;d<l.length;)m=101*m+l.charCodeAt(d++)>>>0;return"go"+m})(i));if(!u[r]){let l=i!==t?t:(d=>{let m,b,h=[{}];for(;m=H.exec(d.replace(P,""));)m[4]?h.shift():m[3]?(b=m[3].replace(A," ").trim(),h.unshift(h[0][b]=h[0][b]||{})):h[0][m[1]]=m[2].replace(A," ").trim();return h[0]})(t);u[r]=g(s?{["@keyframes "+r]:l}:l,a?"":"."+r)}let n=a&&u.g?u.g:null;return a&&(u.g=u[r]),((l,d,m,b)=>{b?d.data=d.data.replace(b,l):d.data.indexOf(l)===-1&&(d.data=m?l+d.data:d.data+l)})(u[r],e,o,n),r},V=(t,e,a)=>t.reduce((o,s,i)=>{let r=e[i];if(r&&r.call){let n=r(a),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;r=l?"."+l:n&&typeof n=="object"?n.props?"":g(n,""):n===!1?"":n}return o+s+(r??"")},"");function w(t){let e=this||{},a=t.call?t(e.p):t;return T(a.unshift?a.raw?V(a,[].slice.call(arguments,1),e.p):a.reduce((o,s)=>Object.assign(o,s&&s.call?s(e.p):s),{}):a,D(e.target),e.g,e.o,e.k)}let N,$,k;w.bind({g:1});let f=w.bind({k:1});function Z(t,e,a,o){g.p=e,N=t,$=a,k=o}function y(t,e){let a=this||{};return function(){let o=arguments;function s(i,r){let n=Object.assign({},i),l=n.className||s.className;a.p=Object.assign({theme:$&&$()},n),a.o=/ *go\d+/.test(l),n.className=w.apply(a,o)+(l?" "+l:"");let d=t;return t[0]&&(d=n.as||t,delete n.as),k&&d[0]&&k(n),N(d,n)}return s}}var q=t=>typeof t=="function",E=(t,e)=>q(t)?t(e):t,Q=(()=>{let t=0;return()=>(++t).toString()})(),R=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let e=matchMedia("(prefers-reduced-motion: reduce)");t=!e||e.matches}return t}})(),W=20,O="default",_=(t,e)=>{let{toastLimit:a}=t.settings;switch(e.type){case 0:return{...t,toasts:[e.toast,...t.toasts].slice(0,a)};case 1:return{...t,toasts:t.toasts.map(r=>r.id===e.toast.id?{...r,...e.toast}:r)};case 2:let{toast:o}=e;return _(t,{type:t.toasts.find(r=>r.id===o.id)?1:0,toast:o});case 3:let{toastId:s}=e;return{...t,toasts:t.toasts.map(r=>r.id===s||s===void 0?{...r,dismissed:!0,visible:!1}:r)};case 4:return e.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(r=>r.id!==e.toastId)};case 5:return{...t,pausedAt:e.time};case 6:let i=e.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(r=>({...r,pauseDuration:r.pauseDuration+i}))}}},X=[],Y={toasts:[],pausedAt:void 0,settings:{toastLimit:W}},v={},S=(t,e=O)=>{v[e]=_(v[e]||Y,t),X.forEach(([a,o])=>{a===e&&o(v[e])})},F=t=>Object.keys(v).forEach(e=>S(t,e)),B=t=>Object.keys(v).find(e=>v[e].toasts.some(a=>a.id===t)),j=(t=O)=>e=>{S(e,t)},G=(t,e="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:e,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...a,id:a?.id||Q()}),x=t=>(e,a)=>{let o=G(e,t,a);return j(o.toasterId||B(o.id))({type:2,toast:o}),o.id},c=(t,e)=>x("blank")(t,e);c.error=x("error");c.success=x("success");c.loading=x("loading");c.custom=x("custom");c.dismiss=(t,e)=>{let a={type:3,toastId:t};e?j(e)(a):F(a)};c.dismissAll=t=>c.dismiss(void 0,t);c.remove=(t,e)=>{let a={type:4,toastId:t};e?j(e)(a):F(a)};c.removeAll=t=>c.remove(void 0,t);c.promise=(t,e,a)=>{let o=c.loading(e.loading,{...a,...a?.loading});return typeof t=="function"&&(t=t()),t.then(s=>{let i=e.success?E(e.success,s):void 0;return i?c.success(i,{id:o,...a,...a?.success}):c.dismiss(o),s}).catch(s=>{let i=e.error?E(e.error,s):void 0;i?c.error(i,{id:o,...a,...a?.error}):c.dismiss(o)}),t};var J=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,K=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,U=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,tt=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${J} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${K} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,et=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,at=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${et} 1s linear infinite;
`,rt=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,ot=f`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,it=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${rt} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${ot} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,st=y("div")`
  position: absolute;
`,nt=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,lt=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ct=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${lt} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,dt=({toast:t})=>{let{icon:e,type:a,iconTheme:o}=t;return e!==void 0?typeof e=="string"?p.createElement(ct,null,e):e:a==="blank"?null:p.createElement(nt,null,p.createElement(at,{...o}),a!=="loading"&&p.createElement(st,null,a==="error"?p.createElement(tt,{...o}):p.createElement(it,{...o})))},pt=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,mt=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,ut="0%{opacity:0;} 100%{opacity:1;}",ft="0%{opacity:1;} 100%{opacity:0;}",gt=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,yt=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,bt=(t,e)=>{let a=t.includes("top")?1:-1,[o,s]=R()?[ut,ft]:[pt(a),mt(a)];return{animation:e?`${f(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};p.memo(({toast:t,position:e,style:a,children:o})=>{let s=t.height?bt(t.position||e||"top-center",t.visible):{opacity:0},i=p.createElement(dt,{toast:t}),r=p.createElement(yt,{...t.ariaProps},E(t.message,t));return p.createElement(gt,{className:t.className,style:{...s,...a,...t.style}},typeof o=="function"?o({icon:i,message:r}):p.createElement(p.Fragment,null,i,r))});Z(p.createElement);w`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;export{xt as S,wt as X,c as n};
