import{H as A,j as x,o as y,c as N,a as n,K as G,u as a,I as Y,F as me,a8 as ye,ah as P,Q as K,W as ee,T as C,U as J,V as r,P as c,O as R,B as ne,aw as se,ax as ie,e as T,S as j,s as oe,i as pe,Z as Le,n as be,a3 as ue,ar as Pe,a9 as Se,J as de,as as Ve}from"./_@vue-e00bfe83.js";import{M as _e,Q as we,R as Te,S as te,T as xe,U as Ie,P as $e,V as Me}from"./_@element-plus-0c795a89.js";import{E as Z,a as ke,i as Ne}from"./_element-plus-9fd6eb85.js";import"./__vendor-6a03e462.js";import"./_@popperjs-c45de710.js";(function(){const p=document.createElement("link").relList;if(p&&p.supports&&p.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))v(s);new MutationObserver(s=>{for(const _ of s)if(_.type==="childList")for(const e of _.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&v(e)}).observe(document,{childList:!0,subtree:!0});function u(s){const _={};return s.integrity&&(_.integrity=s.integrity),s.referrerPolicy&&(_.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?_.credentials="include":s.crossOrigin==="anonymous"?_.credentials="omit":_.credentials="same-origin",_}function v(s){if(s.ep)return;s.ep=!0;const _=u(s);fetch(s.href,_)}})();const Ce={class:"rect-jump-comp"},Oe=A({__name:"reactJump",props:{running:{type:Boolean,default:!0}},setup(d){const p=d,u=x(()=>p.running?"running":"paused"),v=x(h=>({animation:".5s linear .8s infinite alternate slidein "+u.value})),s=x(h=>({animation:".5s linear .6s infinite alternate slidein "+u.value})),_=x(h=>({animation:".5s linear .4s infinite alternate slidein "+u.value})),e=x(h=>({animation:".5s linear 0s infinite alternate slidein "+u.value}));return(h,o)=>(y(),N("div",Ce,[n("div",{class:"a",ref:"aRef",style:G(a(v))},null,4),n("div",{class:"b",style:G(a(s))},null,4),n("div",{class:"c",style:G(a(_))},null,4),n("div",{class:"d",style:G(a(e))},null,4)]))}});const U=(d,p)=>{const u=d.__vccOpts||d;for(const[v,s]of p)u[v]=s;return u},ze=U(Oe,[["__scopeId","data-v-fed152e0"]]),Be={class:"music-list-container"},Re={class:"searchResult"},Ee=["onClick"],He=["onClick"],De={class:"musicName textHiddenEllipsis"},Je={class:"artist"},Ae={class:"right"},je=A({__name:"musicList",props:{modelValue:{default:()=>[]},currentPlayingObj:{default:()=>({})},hideListNumResult:{type:Boolean,default:!1}},emits:["getLrc"],setup(d,{emit:p}){const u=d,v=x(()=>u.modelValue),s=e=>{p("getLrc",e)},_=e=>{console.log(e)};return(e,h)=>{const o=P("el-skeleton-item"),V=P("el-skeleton"),t=P("el-image"),S=P("MoreFilled"),L=P("el-icon");return y(),N("div",Be,[Y(e.$slots,"listNumResult",{},()=>[K(n("div",Re,[C("共 "),n("b",null,J(a(v).length),1),C(" 个搜索结果")],512),[[ee,!d.hideListNumResult]])],!0),(y(!0),N(me,null,ye(a(v),(b,O)=>(y(),N("div",{class:"lists",key:b.id+b.name},[Y(e.$slots,"content",{row:b},()=>[Y(e.$slots,"leftContent",{row:b},()=>[(y(),N("div",{class:"left cursorPointer",onClick:D=>s(b),key:b.id+b.name},[r(t,{src:b.poster,style:{width:"44px",height:"44px","border-radius":"50%"},onError:_},{error:c(()=>[r(V,{class:"imgIsError",style:{width:"44px",height:"44px"}},{template:c(()=>[r(o,{variant:"circle"})]),_:1})]),placeholder:c(()=>[r(V,{animated:"",class:"imgIsLoading"},{template:c(()=>[r(o,{class:"defaultImg",variant:"image",style:{width:"44px",height:"44px"}})]),_:1})]),_:2},1032,["src"]),K(r(ze,{running:!d.currentPlayingObj.needLoadDuration&&b.id===d.currentPlayingObj.id&&d.currentPlayingObj.isPlaying},null,8,["running"]),[[ee,b.id===d.currentPlayingObj.id]])],8,Ee))],!0),Y(e.$slots,"centerContent",{row:b},()=>[n("div",{class:"center cursorPointer",onClick:D=>s(b)},[n("div",De,J(b.name),1),n("div",Je,J(b.artist),1)],8,He)],!0),Y(e.$slots,"rightContent",{row:b},()=>[n("div",Ae,[r(L,null,{default:c(()=>[r(S)]),_:1})])],!0)],!0)]))),128))])}}});const ve=U(je,[["__scopeId","data-v-44dbd7cc"]]),Ue=d=>(se("data-v-34de13eb"),d=d(),ie(),d),We=Ue(()=>n("div",{class:"loading-circle-container"},[n("div",{class:"left"},[n("div",{class:"outer-circle"},[n("div",{class:"inner-circle"})])]),n("div",{class:"right"},"搜索中...")],-1)),Fe=A({__name:"loadingGlobal",props:{loading:{type:Boolean,default:!0},value:{type:Number,default:0},max:{type:Number,default:1}},emits:["update:modelValue"],setup(d,{emit:p}){const u=d,v=x({get:()=>u.loading,set:s=>{p("update:modelValue",s)}});return(s,_)=>{const e=P("el-dialog");return y(),R(e,{class:"loading-circle-dialog",modelValue:a(v),"onUpdate:modelValue":_[0]||(_[0]=h=>ne(v)?v.value=h:null),width:"100px","close-on-click-modal":!1,"show-close":!1,top:"40vh"},{default:c(()=>[We]),_:1},8,["modelValue"])}}});const Ge=U(Fe,[["__scopeId","data-v-34de13eb"]]),le=d=>(se("data-v-dbd899f8"),d=d(),ie(),d),Ke={class:"volumn-comp"},Qe={class:"icon-origin"},Xe=le(()=>n("svg",{focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"VolumeOffIcon"},[n("path",{d:"M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"})],-1)),qe=le(()=>n("svg",{focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"VolumeUpIcon"},[n("path",{d:"M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"})],-1)),Ye={class:"volumn-comp vertical"},Ze={class:"volumn-comp progress"},et={class:"icon"},tt=le(()=>n("svg",{focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"VolumeOffIcon"},[n("path",{d:"M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"})],-1)),lt=le(()=>n("svg",{focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"VolumeUpIcon"},[n("path",{d:"M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"})],-1)),at=A({__name:"volume",emits:["change"],setup(d,{emit:p}){let v=localStorage.getItem("_volume");const s=v?T(Number(JSON.parse(v))):T(.4),_=T(0),e=V=>{localStorage.setItem("_volume",String(V)),p("change",String(V)),_.value=Number(V)||.4},h=(V=!0)=>{if(!V)p("change",String(0)),s.value=0,e(0);else{p("change",String(_.value||.4));let t=_.value?_.value:.4;s.value=t,e(t)}},o=V=>V*100;return(V,t)=>{const S=P("el-icon"),L=P("el-slider"),b=P("el-dropdown");return y(),N("div",Ke,[r(b,{trigger:"click"},{dropdown:c(()=>[n("div",Ye,[n("div",Ze,[r(L,{modelValue:a(s),"onUpdate:modelValue":[t[0]||(t[0]=O=>ne(s)?s.value=O:null),e],max:1,step:.1,vertical:"",height:"100px","format-tooltip":o},null,8,["modelValue","step"])]),n("div",et,[a(s)?(y(),R(S,{key:1,onClick:t[2]||(t[2]=O=>h(!1)),class:"icon-m colorBlack"},{default:c(()=>[lt]),_:1})):(y(),R(S,{key:0,onClick:t[1]||(t[1]=O=>h(!0)),class:"icon-m colorBlack"},{default:c(()=>[tt]),_:1}))])])]),default:c(()=>[n("span",Qe,[a(s)?(y(),R(S,{key:1,class:"icon-m"},{default:c(()=>[qe]),_:1})):(y(),R(S,{key:0,class:"icon-m"},{default:c(()=>[Xe]),_:1}))])]),_:1})])}}});const ot=U(at,[["__scopeId","data-v-dbd899f8"]]),re=d=>(se("data-v-3ede5a77"),d=d(),ie(),d),nt={class:"repeat-mode-container"},st=re(()=>n("path",{d:"M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"},null,-1)),it=[st],rt=re(()=>n("path",{d:"M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"},null,-1)),ct=[rt],ut=re(()=>n("path",{d:"M10.59 9.17 5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"},null,-1)),dt=[ut],_t=A({__name:"modeOfRepeat",props:{repeatMode:{type:Number,default:0}},emits:["change"],setup(d,{emit:p}){const u=d;let v=x(()=>u.repeatMode);const s=_=>{p("change",_)};return(_,e)=>{const h=P("el-tooltip");return y(),N("div",nt,[a(v)==0?(y(),R(h,{key:0,content:"列表循环",placement:"top"},{default:c(()=>[(y(),N("svg",{onClick:e[0]||(e[0]=o=>s(1)),class:"icon-m",focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"LoopIcon"},it))]),_:1})):j("",!0),a(v)==1?(y(),R(h,{key:1,content:"单曲循环",placement:"top"},{default:c(()=>[(y(),N("svg",{onClick:e[1]||(e[1]=o=>s(2)),class:"icon-m",focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"RepeatOneIcon"},ct))]),_:1})):j("",!0),a(v)==2?(y(),R(h,{key:2,content:"随机播放",placement:"top"},{default:c(()=>[(y(),N("svg",{onClick:e[2]||(e[2]=o=>s(0)),class:"icon-m",focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"ShuffleIcon"},dt))]),_:1})):j("",!0)])}}});const vt=U(_t,[["__scopeId","data-v-3ede5a77"]]),mt=A({__name:"timeProgress",props:{value:{type:Number,default:0},cacheWidth:{type:Number,default:0},totalTime:{type:Number,default:0}},emits:["change","emitEnd"],setup(d,{emit:p}){const u=d;let v=x(()=>u.totalTime);const s=$=>{let M=parseInt(String($)),H=String(Math.floor(M/60)).padStart(2,"0"),i=String(Math.floor(M%60)).padStart(2,"0");return H+":"+i},_=$=>(o.value==100&&p("emitEnd"),s($)+" / "+v.value),e=oe(),h=oe(),o=x(()=>u.value||0);let V=x(()=>u.cacheWidth>100?100:u.cacheWidth);const t=T("0%"),S=$=>{be(()=>{let M=$.target,H=M.classList?.contains("el-slider__button-wrapper"),i=M.classList?.contains("el-slider__button"),m=H?M.offsetLeft:i?M.offsetParent.offsetLeft:$.offsetX;b.value=!0;let l=Number(m/(h.value?.clientWidth||1))||0,k=Number(v.value)*l;t.value=s(k)+"/ "+s(v.value)})},L=$=>{b.value=!1},b=T(!1),O=T({getBoundingClientRect(){return D.value}}),D=T({top:0,left:0,bottom:0,right:0}),E=$=>{let M=DOMRect.fromRect({width:0,height:0,x:$.clientX,y:$.clientY});D.value=M};pe(()=>{document.addEventListener("mousemove",E)}),Le(()=>{document.removeEventListener("mousemove",E)});const Q=$=>{p("change",$)};return($,M)=>{const H=P("el-tooltip"),i=P("el-slider");return y(),N("div",{class:"time-progress-container",ref_key:"timeProgressContainerRef",ref:h},[r(H,{visible:b.value,"onUpdate:visible":M[0]||(M[0]=m=>b.value=m),content:t.value,placement:"top",effect:"dark",trigger:"click","virtual-triggering":"","virtual-ref":O.value},null,8,["visible","content","virtual-ref"]),r(i,{class:"slider-ref",ref_key:"sliderRef",ref:e,"show-tooltip":!1,onMouseenter:S,onMousemove:S,onMouseleave:L,modelValue:a(o),"onUpdate:modelValue":Q,formatTooltip:_},null,8,["modelValue"]),n("div",{class:"cache-pro",style:G({width:a(V)+"%"})},null,4)],512)}}});const pt=U(mt,[["__scopeId","data-v-00eebcfe"]]),ft={class:"music-time-container"},gt=A({__name:"musicTime",props:{currentTime:{type:Number,default:0},totalTime:{type:Number,default:0}},setup(d){const p=d;let u=x(()=>s(p.currentTime)),v=x(()=>s(p.totalTime));T(0);const s=_=>{let e=parseInt(String(_)),h=String(Math.floor(e/60)).padStart(2,"0"),o=String(Math.floor(e%60)).padStart(2,"0");return h+":"+o};return(_,e)=>(y(),N("div",ft,J(a(u))+" / "+J(a(v)),1))}});const ht=U(gt,[["__scopeId","data-v-76ec8dcd"]]),yt={key:0,class:"cur-music-container"},Lt={class:"center"},bt={class:"musicName"},Pt={class:"long long-cur"},St={class:"long-name"},Vt={class:"artist"},wt={class:"time-progress"},Tt={class:"time-pro-left"},xt=["src"],It={class:"time-pro-right flexcenter"},$t={class:"to-play-list"},Mt=n("path",{d:"M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm13-1v8l6-4z"},null,-1),kt=[Mt],Nt=A({__name:"curMusic",props:{modelValue:null,currentTime:{default:0},totalTime:{default:0},repeatMode:{default:0}},emits:["getLrc","update:modelValue","update:currentTime","update:totalTime","update:repeatMode","playNextOne","setPlayedListVisible"],setup(d,{expose:p,emit:u}){const v=d,s=/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),_=g=>{u("setPlayedListVisible")},e=x({get:()=>v.modelValue,set:g=>{u("update:modelValue",g)}}),h=x({get:()=>v.currentTime,set:g=>{u("update:currentTime",g)}}),o=x({get:()=>v.totalTime,set:g=>{u("update:totalTime",g)}}),V=x({get:()=>v.repeatMode,set:g=>{u("update:repeatMode",g)}}),t=g=>{V.value=g,localStorage.setItem("__repeat_mode",String(g))},S=async g=>{e.value.needLoadDuration=!0,u("getLrc",g)},L=oe();let b=localStorage.getItem("_volume");L.value&&L.value?.volume&&(b||localStorage.setItem("_volume","0.4"),L.value.volume=Number(JSON.parse(b)));const O=g=>{L.value&&L.value.currentTime&&(h.value=L.value.currentTime);let I=-1;L.value&&L.value.currentTime&&typeof L.value.currentTime=="number"&&e.value.lrc&&e.value.lrc.length&&(I=JSON.parse(JSON.stringify(e.value.lrc)).reverse().findIndex(B=>B.time<=L.value.currentTime)),I!=-1&&(e.value.currentLong=e.value.lrc[I].text)},D=x(()=>{let g=Math.ceil(h.value),I=Math.ceil(o.value),B=Number((g/I).toFixed(2))*100;return B||0}),E=T(0),Q=g=>{let I=parseInt(String(g*o.value/100));h.value=I,L.value&&(L.value.currentTime=I)},$=g=>{const I=L.value?.buffered;let B;try{B=I.end(I.length-1)}catch{B=0}E.value=B/o.value*100},M=()=>{Z.error(`"${e.value.name}"播放错误,已移除`),e.value.hasError=!0,u("playNextOne",!0)},H=g=>{e.value.isPlaying=!0},i=g=>{e.value.isPlaying=!1},m=g=>{L.value.volume=Number(g)},l=g=>{try{L.value?.play()}catch{}},k=g=>{L.value?.pause(),e.value.isPlaying=!1},f=g=>{},X=g=>{console.log("durationchange~~"),h.value=0;let I=L.value.duration;o.value=typeof I=="number"?I:0;let B=localStorage.getItem("_volume");B?L.value.volume=Number(JSON.parse(B)):(localStorage.setItem("_volume","0.4"),L.value.volume=.4),z()},z=async()=>{try{await L.value?.play(),H()}catch(g){console.log("auto play failed because of browser security policy. ",g),M()}e.value.needLoadDuration=!1},W=T(0),F=g=>{clearTimeout(W.value),W.value=setTimeout(()=>{u("playNextOne",!1)},3e3)},w=x(()=>!e.value.needLoadDuration&&e.value.isPlaying?"running":"paused"),q=g=>({backgroundImage:`url(${g.poster})`,animation:"7s linear infinite rotate360 "+w.value});return p({toPlayAudio:l,toPauseAudio:k,tryToAutoPlay:z}),(g,I)=>{const B=P("VideoPlay"),ae=P("el-icon"),fe=P("VideoPause"),ge=P("el-tooltip"),he=Pe("loading");return a(e).id?(y(),N("div",yt,[n("div",{class:"left",onClick:I[0]||(I[0]=jt=>S(a(e)))},[K(n("div",{class:"bgImg",style:G(q(a(e)))},null,4),[[he,a(e).needLoadDuration]]),a(e).needLoadDuration?j("",!0):(y(),N(me,{key:0},[a(e).isPlaying?K((y(),R(ae,{key:1,class:"upIcon VideoPause cursorPointer",onClick:ue(k,["stop"])},{default:c(()=>[r(fe)]),_:1},8,["onClick"])),[[ee,!a(e).hasError]]):K((y(),R(ae,{key:0,class:"upIcon VideoPlay cursorPointer",onClick:ue(l,["stop"])},{default:c(()=>[r(B)]),_:1},8,["onClick"])),[[ee,!a(e).hasError]])],64))]),n("div",Lt,[n("div",bt,[n("div",Pt,J(a(e).loadingLrc?"正在下载歌词..":!a(e).lrc||!a(e).lrc.length?"暂无歌词":a(e).currentLong),1),n("div",St,[C(J(a(e).name)+"  ",1),n("span",Vt,J(a(e).artist),1)])]),n("div",wt,[n("div",Tt,[r(pt,{currentTime:a(h),onEmitEnd:F,totalTime:a(o),value:a(D),cacheWidth:E.value,onChange:Q},null,8,["currentTime","totalTime","value","cacheWidth"]),n("audio",{style:{height:"0",opacity:"0"},ref_key:"audioRef",ref:L,src:a(e).url,onProgress:$,onLoadedmetadata:f,onDurationchange:X,preload:"auto",onTimeupdate:O,onError:M,onPlay:H,onEnded:F,onPause:i},null,40,xt),r(ht,{currentTime:a(h),totalTime:a(o)},null,8,["currentTime","totalTime"])]),n("div",It,[a(s)?j("",!0):K((y(),R(ot,{key:0,class:"cur-op-right",onChange:m},null,512)),[[ee,!a(e).hasError]]),r(ge,{class:"cur-op-right",content:"播放列表",placement:"top"},{default:c(()=>[n("div",$t,[(y(),N("svg",{onClick:_,class:"icon-m MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root",focusable:"false","aria-hidden":"true",viewBox:"0 0 24 24","data-testid":"PlaylistPlayIcon"},kt))])]),_:1}),r(vt,{class:"mode-repeat cur-op-right",repeatMode:a(V),onChange:t},null,8,["repeatMode"])])])])])):j("",!0)}}});const Ct={class:"music-container"},Ot={class:"music-inner"},zt={class:"search-container"},Bt={key:0,class:"playedList-container"},Rt={class:"title"},Et={class:"dropdownSearchName textHiddenEllipsis"},Ht={class:"dropdownSearchName textHiddenEllipsis"},Dt=A({__name:"music",setup(d){const p=T(!1),u=T(""),v=T(0),s=T(0);let _=localStorage.getItem("__repeat_mode"),e=T(_?JSON.parse(_):0);const h=T([]),o=T([]),V=T(),t=T({id:"",name:"",artist:"",poster:"",lrc:[],loadingLrc:!1,needLoadDuration:!0}),S=T(!1),L=i=>{S.value=!S.value};let b=JSON.parse(localStorage.getItem("_playedList"))||[];b.length&&(S.value=!0,t.value={...b[0],isPlaying:!1,loadingLrc:!1,needLoadDuration:!0},o.value=b),pe(()=>{E(t.value)});const O=()=>{if(!u.value.trim()){Z.warning("关键词不能为空!");return}p.value=!0,fetch("/api/music/list?s="+encodeURIComponent(u.value)).then(i=>{if(i.ok)return i.json()}).then(i=>{h.value=i?i.data:[]}).finally(()=>{p.value=!1})},D=(i,m)=>{try{let l=JSON.parse(localStorage.getItem("_playedList"))||[];if(m){l=l.filter(f=>f.id!=m),l.length?localStorage.setItem("_playedList",JSON.stringify(l)):(localStorage.removeItem("_playedList"),S.value=!1,t.value.id=""),o.value=o.value.filter(f=>f.id).filter(f=>f.id!=m),o.value.length&&(t.value={...o.value[0],isPlaying:!0,lrc:t.value.lrc,loadingLrc:!1});return}if(l=l.some(f=>f.id==i.id)?l:[{...i,lrc:[],isPlaying:!1},...l].filter(f=>f.id),l.length)localStorage.setItem("_playedList",JSON.stringify(l));else{localStorage.removeItem("_playedList"),S.value=!1,t.value.id="";return}let k=[];l.length?k=o.value.some(f=>f.id==i.id)?o.value.map(f=>({...f,lrc:(f.id==i.id?i.lrc:f.lrc)||[]})):i?[i,...o.value]:l[0]:k=i?[i]:[],o.value=k.filter(f=>f.id)}catch{}},E=async i=>{if(!i.id)return;t.value.hasError=!1,t.value.loadingLrc=!0;let m=o.value.filter(l=>l.id).filter(l=>l.id==i.id);if(m.length)if(i.id===t.value.id){if(document.title=t.value.name,t.value.isPlaying?(t.value.isPlaying=!1,V.value?.toPauseAudio()):(t.value.isPlaying=!0,V.value?.tryToAutoPlay()),t.value.loadingLrc=!1,m[0].lrc&&m[0].lrc.length)return}else{v.value=0,s.value=0;let l=m[0].lrc,k=l&&l.length?l:[];t.value={...m[0],isPlaying:!0,lrc:k,loadingLrc:!1,needLoadDuration:!0},document.title=t.value.name}else D(t.value);(!i.lrc||!i.lrc.length||!t.value.lrc||!t.value.lrc.length)&&(t.value={...i,lrc:[],isPlaying:!1,loadingLrc:!0,needLoadDuration:!0},await fetch("/api/music/lrc/"+i.id).then(l=>{if(console.log("getLrc res",l),l.ok)return l.json()}).then(l=>{t.value.lrc=l?l.data:[],t.value.isPlaying=!0,document.title=t.value.name,D(t.value)}).catch(l=>{console.log("catch lrc",l),t.value.isPlaying=!1}).finally(()=>{t.value.loadingLrc=!1}))},Q=i=>{t.value.isPlaying=!1;let m=t.value.id;if(!i&&(o.value.length==1||e.value==1)){E(t.value);return}let l=o.value.findIndex(f=>f.id==m);if(i){D(t.value,m),o.value.length?(t.value={...o.value[0],hasError:!1,isPlaying:!0,lrc:t.value.lrc},S.value=!0):(t.value.id="",S.value=!1);return}let k=l+1;if(l==o.value.length-1&&(k=0),e.value==0)t.value={...o.value[k],lrc:t.value.lrc};else if(e.value==2){let f=JSON.parse(JSON.stringify(o.value));f.sort(()=>Math.random()-.5),f[0].id==m?t.value=f[1]:t.value=f[0]}t.value.needLoadDuration=!0,E(t.value)},$=i=>{o.value=i},M=()=>{ke.confirm("confirm?","tooltip",{confirmButtonText:"OK",cancelButtonText:"Cancel",type:"warning"}).then(()=>{Z({type:"success",message:"Delete completed"}),u.value="",o.value=[],localStorage.removeItem("_playedList"),t.value={id:"",name:"",artist:"",poster:"",lrc:[],loadingLrc:!1},S.value=!1,h.value=[],p.value=!1}).catch(()=>{})},H=(i,m)=>{if(i=="removeAllHistory")M();else if(m){let l=m,k=encodeURIComponent(l.name);i=="removeById"?D(l,l.id):i=="beTop"?(o.value=[l,...o.value.filter(f=>f.id!=l.id)],localStorage.setItem("_playedList",JSON.stringify(o.value))):i=="downLong"?window.open(`/api/music/download/${l.id}?name=encodeComponent(${l.name})`):i=="downLrc"?!l.lrc||!l.lrc.length?Z.warning(`"${l.name}"暂无相关歌词~`):window.open(`/api/music/lrc/download/${l.id}?name=${k}`):i=="addToPlayList"?o.value.some(f=>f.id==l.id)?Z.warning(`"${l.name}"已存在播放列表中~`):(o.value=[l,...o.value],localStorage.setItem("_playedList",JSON.stringify(o.value))):i=="searchArtist"?(u.value=l.artist,O()):i=="searchLongName"&&(u.value=l.name,O())}};return(i,m)=>{const l=P("el-button"),k=P("el-input"),f=P("MoreFilled"),X=P("el-icon"),z=P("el-dropdown-item"),W=P("el-dropdown-menu"),F=P("el-dropdown");return y(),N("div",Ct,[r(Ge,{loading:p.value,"onUpdate:loading":m[0]||(m[0]=w=>p.value=w)},null,8,["loading"]),n("div",Ot,[n("div",zt,[r(k,{modelValue:u.value,"onUpdate:modelValue":m[1]||(m[1]=w=>u.value=w),clearable:"",placeholder:"输入歌名/歌手名开始搜索",onKeyup:Se(O,["enter"])},{append:c(()=>[r(l,{type:"primary",disabled:!u.value.trim(),icon:a(_e),onClick:O},null,8,["disabled","icon"])]),_:1},8,["modelValue","onKeyup"]),r(F,{class:"op-global",trigger:"click",onCommand:H},{dropdown:c(()=>[r(W,null,{default:c(()=>[r(z,{command:"removeAllHistory",icon:a(we)},{default:c(()=>[C("清空缓存数据")]),_:1},8,["icon"])]),_:1})]),default:c(()=>[r(X,{class:"more-action black"},{default:c(()=>[r(f)]),_:1})]),_:1})]),n("div",{class:de(["list-container",{activeHeight:t.value.id}])},[h.value.length?(y(),R(ve,{key:0,currentPlayingObj:t.value,modelValue:h.value,onGetLrc:E},{rightContent:c(({row:w})=>[r(F,{trigger:"click",onCommand:q=>H(q,w)},{dropdown:c(()=>[r(W,null,{default:c(()=>[r(z,{command:"addToPlayList",icon:a(Te)},{default:c(()=>[C("加入播放列表")]),_:1},8,["icon"]),r(z,{command:"downLong",icon:a(te)},{default:c(()=>[C("下载歌曲")]),_:1},8,["icon"]),r(z,{command:"downLrc",icon:a(te)},{default:c(()=>[C("下载歌词")]),_:1},8,["icon"])]),_:1})]),default:c(()=>[r(X,{class:"more-action black"},{default:c(()=>[r(f)]),_:1})]),_:2},1032,["onCommand"])]),_:1},8,["currentPlayingObj","modelValue"])):j("",!0),n("div",{class:de(["bottom-list",{active:o.value.length&&S.value}])},[r(Nt,{ref_key:"curMusicRef",ref:V,onSetPlayedListVisible:L,onGetLrc:E,onSetMusicPlayed:$,onPlayNextOne:Q,modelValue:t.value,"onUpdate:modelValue":m[2]||(m[2]=w=>t.value=w),currentTime:v.value,"onUpdate:currentTime":m[3]||(m[3]=w=>v.value=w),totalTime:s.value,"onUpdate:totalTime":m[4]||(m[4]=w=>s.value=w),repeatMode:a(e),"onUpdate:repeatMode":m[5]||(m[5]=w=>ne(e)?e.value=w:e=w)},null,8,["modelValue","currentTime","totalTime","repeatMode"]),o.value.length&&S.value?(y(),N("div",Bt,[n("div",Rt,"播放列表("+J(o.value.length)+")",1),r(ve,{hideListNumResult:"",currentPlayingObj:t.value,class:"playedList-lists",modelValue:o.value,onGetLrc:E},{rightContent:c(({row:w})=>[r(F,{trigger:"click",onCommand:q=>H(q,w)},{dropdown:c(()=>[r(W,null,{default:c(()=>[r(z,{command:"beTop",icon:a(xe)},{default:c(()=>[C("置顶")]),_:1},8,["icon"]),r(z,{command:"searchArtist",icon:a(Ie)},{default:c(()=>[C("搜索【"),n("div",Et,J(w.artist),1),C(" 】")]),_:2},1032,["icon"]),r(z,{command:"searchLongName",icon:a(_e)},{default:c(()=>[C("搜索【"),n("div",Ht,J(w.name),1),C(" 】")]),_:2},1032,["icon"]),r(z,{command:"removeById",icon:a($e)},{default:c(()=>[C("移除")]),_:1},8,["icon"]),r(z,{command:"downLong",icon:a(te)},{default:c(()=>[C("下载歌曲")]),_:1},8,["icon"]),r(z,{command:"downLrc",icon:a(te)},{default:c(()=>[C("下载歌词")]),_:1},8,["icon"])]),_:2},1024)]),default:c(()=>[r(X,{class:"more-action"},{default:c(()=>[r(f)]),_:1})]),_:2},1032,["onCommand"])]),_:1},8,["currentPlayingObj","modelValue"])])):j("",!0)],2)],2)])])}}});const Jt=A({__name:"App",setup(d){return(p,u)=>(y(),R(Dt))}});const At=U(Jt,[["__scopeId","data-v-a7970884"]]),ce=Ve(At);ce.use(Ne);for(const[d,p]of Object.entries(Me))ce.component(d,p);ce.mount("#app");