"use strict";(self.webpackChunktower_defense=self.webpackChunktower_defense||[]).push([[343],{29174:(e,t,s)=>{s.d(t,{ConfigCtrl:()=>C,zv:()=>m,uA:()=>y,ExplorerCtrl:()=>H,jb:()=>z,OptionsCtrl:()=>v,AV:()=>f,ThemeCtrl:()=>Y,ToastCtrl:()=>ee}),Symbol();const o=Symbol(),n=Object.getPrototypeOf,a=new WeakMap,r=(e,t=!0)=>{a.set(e,t)},i=e=>"object"==typeof e&&null!==e,l=new WeakMap,c=new WeakSet,[d]=((e=Object.is,t=((e,t)=>new Proxy(e,t)),s=(e=>i(e)&&!c.has(e)&&(Array.isArray(e)||!(Symbol.iterator in e))&&!(e instanceof WeakMap)&&!(e instanceof WeakSet)&&!(e instanceof Error)&&!(e instanceof Number)&&!(e instanceof Date)&&!(e instanceof String)&&!(e instanceof RegExp)&&!(e instanceof ArrayBuffer)),d=(e=>{switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:throw e}}),p=new WeakMap,u=((e,t,s=d)=>{const o=p.get(e);if((null==o?void 0:o[0])===t)return o[1];const n=Array.isArray(e)?[]:Object.create(Object.getPrototypeOf(e));return r(n,!0),p.set(e,[t,n]),Reflect.ownKeys(e).forEach((t=>{if(Object.getOwnPropertyDescriptor(n,t))return;const o=Reflect.get(e,t),a={value:o,enumerable:!0,configurable:!0};if(c.has(o))r(o,!1);else if(o instanceof Promise)delete a.value,a.get=()=>s(o);else if(l.has(o)){const[e,t]=l.get(o);a.value=u(e,t(),s)}Object.defineProperty(n,t,a)})),Object.preventExtensions(n)}),h=new WeakMap,f=[1,1],m=(r=>{if(!i(r))throw new Error("object required");const d=h.get(r);if(d)return d;let p=f[0];const b=new Set,y=(e,t=++f[0])=>{p!==t&&(p=t,b.forEach((s=>s(e,t))))};let g=f[1];const v=e=>(t,s)=>{const o=[...t];o[1]=[e,...o[1]],y(o,s)},w=new Map,C=e=>{var t;const s=w.get(e);s&&(w.delete(e),null==(t=s[1])||t.call(s))},I=Array.isArray(r)?[]:Object.create(Object.getPrototypeOf(r)),O=t(I,{deleteProperty(e,t){const s=Reflect.get(e,t);C(t);const o=Reflect.deleteProperty(e,t);return o&&y(["delete",[t],s]),o},set(t,r,d,p){const u=Reflect.has(t,r),f=Reflect.get(t,r,p);if(u&&(e(f,d)||h.has(d)&&e(f,h.get(d))))return!0;var g;C(r),i(d)&&(d=(e=>e&&(a.has(e)?a.get(e):n(e)===Object.prototype||n(e)===Array.prototype))(g=d)&&g[o]||null||d);let I=d;if(d instanceof Promise)d.then((e=>{d.status="fulfilled",d.value=e,y(["resolve",[r],e])})).catch((e=>{d.status="rejected",d.reason=e,y(["reject",[r],e])}));else{!l.has(d)&&s(d)&&(I=m(d));const e=!c.has(I)&&l.get(I);e&&((e,t)=>{if(w.has(e))throw new Error("prop listener already exists");if(b.size){const s=t[3](v(e));w.set(e,[t,s])}else w.set(e,[t])})(r,e)}return Reflect.set(t,r,I,p),y(["set",[r],d,f]),!0}});h.set(r,O);const W=[I,(e=++f[1])=>(g===e||b.size||(g=e,w.forEach((([t])=>{const s=t[1](e);s>p&&(p=s)}))),p),u,e=>(b.add(e),1===b.size&&w.forEach((([e,t],s)=>{if(t)throw new Error("remove already exists");const o=e[3](v(s));w.set(s,[e,o])})),()=>{b.delete(e),0===b.size&&w.forEach((([e,t],s)=>{t&&(t(),w.set(s,[e]))}))})];return l.set(O,W),Reflect.ownKeys(r).forEach((e=>{const t=Object.getOwnPropertyDescriptor(r,e);"value"in t&&(O[e]=r[e],delete t.value,delete t.writable),Object.defineProperty(I,e,t)})),O}))=>[m,l,c,e,t,s,d,p,u,h,f])();function p(e={}){return d(e)}function u(e,t,s){const o=l.get(e);let n;o||console.warn("Please use proxy object");const a=[],r=o[3];let i=!1;const c=r((e=>{a.push(e),s?t(a.splice(0)):n||(n=Promise.resolve().then((()=>{n=void 0,i&&t(a.splice(0))})))}));return i=!0,()=>{i=!1,c()}}const h=p({history:["ConnectWallet"],view:"ConnectWallet",data:void 0}),f={state:h,subscribe:e=>u(h,(()=>e(h))),push(e,t){e!==h.view&&(h.view=e,t&&(h.data=t),h.history.push(e))},reset(e){h.view=e,h.history=[e]},replace(e){h.history.length>1&&(h.history[h.history.length-1]=e,h.view=e)},goBack(){if(h.history.length>1){h.history.pop();const[e]=h.history.slice(-1);h.view=e}},setData(e){h.data=e}},m={WALLETCONNECT_DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",WCM_VERSION:"WCM_VERSION",RECOMMENDED_WALLET_AMOUNT:9,isMobile:()=>typeof window<"u"&&Boolean(window.matchMedia("(pointer:coarse)").matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)),isAndroid:()=>m.isMobile()&&navigator.userAgent.toLowerCase().includes("android"),isIos(){const e=navigator.userAgent.toLowerCase();return m.isMobile()&&(e.includes("iphone")||e.includes("ipad"))},isHttpUrl:e=>e.startsWith("http://")||e.startsWith("https://"),isArray:e=>Array.isArray(e)&&e.length>0,formatNativeUrl(e,t,s){if(m.isHttpUrl(e))return this.formatUniversalUrl(e,t,s);let o=e;return o.includes("://")||(o=e.replaceAll("/","").replaceAll(":",""),o=`${o}://`),o.endsWith("/")||(o=`${o}/`),this.setWalletConnectDeepLink(o,s),`${o}wc?uri=${encodeURIComponent(t)}`},formatUniversalUrl(e,t,s){if(!m.isHttpUrl(e))return this.formatNativeUrl(e,t,s);let o=e;return o.endsWith("/")||(o=`${o}/`),this.setWalletConnectDeepLink(o,s),`${o}wc?uri=${encodeURIComponent(t)}`},wait:async e=>new Promise((t=>{setTimeout(t,e)})),openHref(e,t){window.open(e,t,"noreferrer noopener")},setWalletConnectDeepLink(e,t){try{localStorage.setItem(m.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:e,name:t}))}catch{console.info("Unable to set WalletConnect deep link")}},setWalletConnectAndroidDeepLink(e){try{const[t]=e.split("?");localStorage.setItem(m.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:t,name:"Android"}))}catch{console.info("Unable to set WalletConnect android deep link")}},removeWalletConnectDeepLink(){try{localStorage.removeItem(m.WALLETCONNECT_DEEPLINK_CHOICE)}catch{console.info("Unable to remove WalletConnect deep link")}},setModalVersionInStorage(){try{typeof localStorage<"u"&&localStorage.setItem(m.WCM_VERSION,"2.6.2")}catch{console.info("Unable to set Web3Modal version in storage")}},getWalletRouterData(){var e;const t=null==(e=f.state.data)?void 0:e.Wallet;if(!t)throw new Error('Missing "Wallet" view data');return t}},b=p({enabled:typeof location<"u"&&(location.hostname.includes("localhost")||location.protocol.includes("https")),userSessionId:"",events:[],connectedWalletId:void 0}),y={state:b,subscribe:e=>u(b.events,(()=>e(function(e,t){const s=l.get(e);s||console.warn("Please use proxy object");const[o,n,a]=s;return a(o,n(),void 0)}(b.events[b.events.length-1])))),initialize(){b.enabled&&typeof(null==crypto?void 0:crypto.randomUUID)<"u"&&(b.userSessionId=crypto.randomUUID())},setConnectedWalletId(e){b.connectedWalletId=e},click(e){if(b.enabled){const t={type:"CLICK",name:e.name,userSessionId:b.userSessionId,timestamp:Date.now(),data:e};b.events.push(t)}},track(e){if(b.enabled){const t={type:"TRACK",name:e.name,userSessionId:b.userSessionId,timestamp:Date.now(),data:e};b.events.push(t)}},view(e){if(b.enabled){const t={type:"VIEW",name:e.name,userSessionId:b.userSessionId,timestamp:Date.now(),data:e};b.events.push(t)}}},g=p({chains:void 0,walletConnectUri:void 0,isAuth:!1,isCustomDesktop:!1,isCustomMobile:!1,isDataLoaded:!1,isUiLoaded:!1}),v={state:g,subscribe:e=>u(g,(()=>e(g))),setChains(e){g.chains=e},setWalletConnectUri(e){g.walletConnectUri=e},setIsCustomDesktop(e){g.isCustomDesktop=e},setIsCustomMobile(e){g.isCustomMobile=e},setIsDataLoaded(e){g.isDataLoaded=e},setIsUiLoaded(e){g.isUiLoaded=e},setIsAuth(e){g.isAuth=e}},w=p({projectId:"",mobileWallets:void 0,desktopWallets:void 0,walletImages:void 0,chains:void 0,enableAuthMode:!1,enableExplorer:!0,explorerExcludedWalletIds:void 0,explorerRecommendedWalletIds:void 0,termsOfServiceUrl:void 0,privacyPolicyUrl:void 0}),C={state:w,subscribe:e=>u(w,(()=>e(w))),setConfig(e){var t,s;y.initialize(),v.setChains(e.chains),v.setIsAuth(Boolean(e.enableAuthMode)),v.setIsCustomMobile(Boolean(null==(t=e.mobileWallets)?void 0:t.length)),v.setIsCustomDesktop(Boolean(null==(s=e.desktopWallets)?void 0:s.length)),m.setModalVersionInStorage(),Object.assign(w,e)}};var I=Object.defineProperty,O=Object.getOwnPropertySymbols,W=Object.prototype.hasOwnProperty,E=Object.prototype.propertyIsEnumerable,j=(e,t,s)=>t in e?I(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;const A="https://explorer-api.walletconnect.com",L="wcm",k="js-2.6.2";async function M(e,t){const s=((e,t)=>{for(var s in t||(t={}))W.call(t,s)&&j(e,s,t[s]);if(O)for(var s of O(t))E.call(t,s)&&j(e,s,t[s]);return e})({sdkType:L,sdkVersion:k},t),o=new URL(e,A);return o.searchParams.append("projectId",C.state.projectId),Object.entries(s).forEach((([e,t])=>{t&&o.searchParams.append(e,String(t))})),(await fetch(o)).json()}const U=async e=>M("/w3m/v1/getDesktopListings",e),P=async e=>M("/w3m/v1/getMobileListings",e),D=async e=>M("/w3m/v1/getAllListings",e),S=e=>`${A}/w3m/v1/getWalletImage/${e}?projectId=${C.state.projectId}&sdkType=${L}&sdkVersion=${k}`,N=e=>`${A}/w3m/v1/getAssetImage/${e}?projectId=${C.state.projectId}&sdkType=${L}&sdkVersion=${k}`;var T=Object.defineProperty,x=Object.getOwnPropertySymbols,R=Object.prototype.hasOwnProperty,_=Object.prototype.propertyIsEnumerable,$=(e,t,s)=>t in e?T(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;const V=m.isMobile(),B=p({wallets:{listings:[],total:0,page:1},search:{listings:[],total:0,page:1},recomendedWallets:[]}),H={state:B,async getRecomendedWallets(){const{explorerRecommendedWalletIds:e,explorerExcludedWalletIds:t}=C.state;if("NONE"===e||"ALL"===t&&!e)return B.recomendedWallets;if(m.isArray(e)){const t={recommendedIds:e.join(",")},{listings:s}=await D(t),o=Object.values(s);o.sort(((t,s)=>e.indexOf(t.id)-e.indexOf(s.id))),B.recomendedWallets=o}else{const{chains:e,isAuth:s}=v.state,o=e?.join(","),n=m.isArray(t),a={page:1,sdks:s?"auth_v1":void 0,entries:m.RECOMMENDED_WALLET_AMOUNT,chains:o,version:2,excludedIds:n?t.join(","):void 0},{listings:r}=V?await P(a):await U(a);B.recomendedWallets=Object.values(r)}return B.recomendedWallets},async getWallets(e){const t=((e,t)=>{for(var s in t||(t={}))R.call(t,s)&&$(e,s,t[s]);if(x)for(var s of x(t))_.call(t,s)&&$(e,s,t[s]);return e})({},e),{explorerRecommendedWalletIds:s,explorerExcludedWalletIds:o}=C.state,{recomendedWallets:n}=B;if("ALL"===o)return B.wallets;n.length?t.excludedIds=n.map((e=>e.id)).join(","):m.isArray(s)&&(t.excludedIds=s.join(",")),m.isArray(o)&&(t.excludedIds=[t.excludedIds,o].filter(Boolean).join(",")),v.state.isAuth&&(t.sdks="auth_v1");const{page:a,search:r}=e,{listings:i,total:l}=V?await P(t):await U(t),c=Object.values(i),d=r?"search":"wallets";return B[d]={listings:[...B[d].listings,...c],total:l,page:a??1},{listings:c,total:l}},getWalletImageUrl:e=>S(e),getAssetImageUrl:e=>N(e),resetSearch(){B.search={listings:[],total:0,page:1}}},K=p({open:!1}),z={state:K,subscribe:e=>u(K,(()=>e(K))),open:async e=>new Promise((t=>{const{isUiLoaded:s,isDataLoaded:o}=v.state;if(m.removeWalletConnectDeepLink(),v.setWalletConnectUri(e?.uri),v.setChains(e?.chains),f.reset("ConnectWallet"),s&&o)K.open=!0,t();else{const e=setInterval((()=>{const s=v.state;s.isUiLoaded&&s.isDataLoaded&&(clearInterval(e),K.open=!0,t())}),200)}})),close(){K.open=!1}};var J=Object.defineProperty,q=Object.getOwnPropertySymbols,F=Object.prototype.hasOwnProperty,G=Object.prototype.propertyIsEnumerable,Q=(e,t,s)=>t in e?J(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;const X=p({themeMode:typeof matchMedia<"u"&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}),Y={state:X,subscribe:e=>u(X,(()=>e(X))),setThemeConfig(e){const{themeMode:t,themeVariables:s}=e;t&&(X.themeMode=t),s&&(X.themeVariables=((e,t)=>{for(var s in t||(t={}))F.call(t,s)&&Q(e,s,t[s]);if(q)for(var s of q(t))G.call(t,s)&&Q(e,s,t[s]);return e})({},s))}},Z=p({open:!1,message:"",variant:"success"}),ee={state:Z,subscribe:e=>u(Z,(()=>e(Z))),openToast(e,t){Z.open=!0,Z.message=e,Z.variant=t},closeToast(){Z.open=!1}}},59343:(e,t,s)=>{s.d(t,{WalletConnectModal:()=>n});var o=s(29174);class n{constructor(e){this.openModal=o.jb.open,this.closeModal=o.jb.close,this.subscribeModal=o.jb.subscribe,this.setTheme=o.ThemeCtrl.setThemeConfig,o.ThemeCtrl.setThemeConfig(e),o.ConfigCtrl.setConfig(e),this.initUi()}async initUi(){if(typeof window<"u"){await s.e(868).then(s.bind(s,56868));const e=document.createElement("wcm-modal");document.body.insertAdjacentElement("beforeend",e),o.OptionsCtrl.setIsUiLoaded(!0)}}}}}]);
//# sourceMappingURL=343.bundle.59180ea0e8e5c4313c78.js.map