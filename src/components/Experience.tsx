"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Ambience } from "@/lib/ambience";
import { ascensionProgress, chapterIndex, CHAPTERS, clamp01, journey, scrollPosition } from "@/lib/journey";

const World = dynamic(() => import("./world/World"), { ssr: false });
const mediaSubscribe = (query: string, cb: () => void) => {
  const match = window.matchMedia(query);
  match.addEventListener("change", cb);
  return () => match.removeEventListener("change", cb);
};
const subscribeMotion = (cb: () => void) => mediaSubscribe("(prefers-reduced-motion: reduce)", cb);
const subscribeMobile = (cb: () => void) => mediaSubscribe("(max-width: 760px), (pointer: coarse)", cb);
const subscribeHidden = (cb: () => void) => { document.addEventListener("visibilitychange", cb); return () => document.removeEventListener("visibilitychange", cb); };
const serverFalse = () => false;

function Icon({ name }: { name: "sound" | "muted" | "book" | "motion" | "up" | "down" | "close" }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "sound" && <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></>}
    {name === "muted" && <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></>}
    {name === "book" && <><path d="M12 6C9 4 5 4 2 5v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-3-1-7-1-10 1Z"/><path d="M12 6v14"/></>}
    {name === "motion" && <><path d="M3 8h8a3 3 0 1 0-3-3m-5 7h15a3 3 0 1 1-3 3M3 16h5"/></>}
    {name === "up" && <><path d="M12 20V4m-6 6 6-6 6 6"/></>}
    {name === "down" && <><path d="M12 4v16m-6-6 6 6 6-6"/></>}
    {name === "close" && <path d="m6 6 12 12M6 18 18 6"/>}
  </svg>;
}

function Sigil() {
  return <svg className="sigil" width="31" height="38" viewBox="0 0 32 40" fill="none" aria-hidden="true"><path d="M16 1v38M2 20h28M16 5 5 20l11 15 11-15L16 5Z" stroke="currentColor" strokeWidth=".8"/><circle cx="16" cy="20" r="6" stroke="currentColor" strokeWidth=".8"/><circle cx="16" cy="20" r="1.4" fill="currentColor"/></svg>;
}

class WorldBoundary extends Component<{ children: React.ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function Experience() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [sound, setSound] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [motionOverride, setMotionOverride] = useState<boolean | null>(null);
  const [reading, setReading] = useState(false);
  const systemReduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, serverFalse);
  const mobile = useSyncExternalStore(subscribeMobile, () => window.matchMedia("(max-width: 760px), (pointer: coarse)").matches, serverFalse);
  const hidden = useSyncExternalStore(subscribeHidden, () => document.hidden, serverFalse);
  const reduced = motionOverride ?? systemReduced;
  const root = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const ambience = useRef<Ambience | null>(null);
  const previousChapter = useRef(0);
  const hasReady = useRef(false);

  const onReady = useCallback(() => { hasReady.current = true; setReady(true); }, []);
  const onFailure = useCallback(() => { hasReady.current = true; setFailed(true); setReady(true); }, []);

  const goTo = useCallback((progress: number, immediate = false) => {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if(immediate||journey.reducedMotion) {journey.progress=clamp01(progress);journey.target=journey.progress;}
    window.scrollTo({ top: scrollPosition(progress, max), behavior: immediate || journey.reducedMotion ? "instant" : "smooth" });
  }, []);

  useEffect(() => {
    journey.reducedMotion = reduced;
    window.dispatchEvent(new Event("scroll"));
  }, [reduced]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const oldRestoration = history.scrollRestoration;
    history.scrollRestoration = "manual";
    const hash = window.location.hash.slice(1);
    const initial = CHAPTERS.find(c => c.id === hash)?.at ?? 0;
    journey.target = initial; journey.progress = initial;
    const position = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: scrollPosition(initial, max), behavior: "instant" });
      journey.ready = true;
      // An unchanged initial scroll position emits no native event in demand mode.
      window.dispatchEvent(new Event("scroll"));
      ScrollTrigger.refresh();
    };
    const frame = requestAnimationFrame(position);
    let lastMax = document.documentElement.scrollHeight - window.innerHeight;
    let lastWidth=window.innerWidth, lastHeight=window.innerHeight;
    let resizing=false, resizeFrame=0;
    const nativeUpdate = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      // Browser chrome and orientation changes can emit scroll before resize.
      if (resizing||window.innerWidth!==lastWidth||window.innerHeight!==lastHeight||Math.abs(max-lastMax)>1) return;
      journey.target = ascensionProgress(window.scrollY,max);
    };
    const trigger = ScrollTrigger.create({
      start: 0, end: () => ScrollTrigger.maxScroll(window),
      onUpdate: nativeUpdate,
    });
    window.addEventListener("scroll", nativeUpdate, { passive: true });
    const resize = () => {
      const preserved=journey.target;
      resizing=true;
      cancelAnimationFrame(resizeFrame);
      resizeFrame=requestAnimationFrame(()=>{
        lastMax=document.documentElement.scrollHeight-window.innerHeight;
        window.scrollTo({top:scrollPosition(preserved,lastMax),behavior:"instant"});
        ScrollTrigger.refresh();
        // Let viewport units and the browser's scroll anchoring settle together.
        resizeFrame=requestAnimationFrame(()=>{
          lastMax=document.documentElement.scrollHeight-window.innerHeight;
          lastWidth=window.innerWidth;lastHeight=window.innerHeight;
          window.scrollTo({top:scrollPosition(preserved,lastMax),behavior:"instant"});
          journey.target=preserved;resizing=false;
          window.dispatchEvent(new Event("scroll"));
        });
      });
    };
    window.addEventListener("resize",resize);
    const hashChange = () => {
      const target = CHAPTERS.find(c => c.id === window.location.hash.slice(1));
      if (target) goTo(target.at);
    };
    window.addEventListener("hashchange",hashChange);
    const key = (event: KeyboardEvent) => {
      if (event.code !== "Space" || dialog.current?.open || (event.target as HTMLElement).closest("button,a,input,select,textarea")) return;
      event.preventDefault();
      window.scrollBy({top: (event.shiftKey ? 1 : -1) * window.innerHeight * .75, behavior: journey.reducedMotion ? "instant" : "smooth"});
    };
    window.addEventListener("keydown",key);
    const pointer = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      journey.pointerX = (event.clientX / window.innerWidth - .5) * 2;
      journey.pointerY = -((event.clientY / window.innerHeight - .5) * 2);
    };
    const leave = () => { journey.pointerX = 0; journey.pointerY = 0; };
    window.addEventListener("pointermove",pointer,{passive:true});
    document.addEventListener("pointerleave",leave);
    ambience.current = new Ambience();
    const timeout = window.setTimeout(() => { if(!hasReady.current) onFailure(); }, 25000);
    return () => {
      cancelAnimationFrame(frame);cancelAnimationFrame(resizeFrame); clearTimeout(timeout); trigger.kill();
      history.scrollRestoration = oldRestoration;
      window.removeEventListener("scroll",nativeUpdate); window.removeEventListener("resize",resize);
      window.removeEventListener("keydown",key);window.removeEventListener("hashchange",hashChange);
      window.removeEventListener("pointermove",pointer);document.removeEventListener("pointerleave",leave);
      ambience.current?.dispose();journey.ready=false;
    };
  }, [goTo,onFailure]);

  useEffect(() => {
    let frame = 0, lastAudio = 0;
    const update = (time: number) => {
      const p = journey.progress;
      if(root.current) {
        root.current.style.setProperty("--progress",String(p));
        root.current.style.setProperty("--intro",String(Math.max(0,1-p/.115)));
        root.current.style.setProperty("--ending",String(Math.max(0,Math.min(1,(p-.89)/.09))));
      }
      if(meter.current) meter.current.textContent=String(Math.round(p*214)).padStart(3,"0");
      const next=chapterIndex(p);
      if(next!==previousChapter.current){previousChapter.current=next;setChapter(next);}
      if(time-lastAudio>200){ambience.current?.update(p);lastAudio=time;}
      frame=requestAnimationFrame(update);
    };
    frame=requestAnimationFrame(update);
    return()=>cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    void ambience.current?.pause(hidden || reading).catch(()=>{});
  }, [hidden,reading]);

  useEffect(() => {
    if(!ready||reduced)return;
    const animation=gsap.fromTo(".opening-title span",{y:24,opacity:0},{y:0,opacity:1,duration:1.7,stagger:.14,ease:"expo.out",delay:.15});
    return()=>{animation.kill();};
  },[ready,reduced]);

  const openReader=()=>{dialog.current?.showModal();setReading(true);};
  const toggleSound=async()=>{
    try { setSound(await ambience.current!.toggle());setAudioError(false); }
    catch {setAudioError(true);setSound(false);}
  };
  const current=CHAPTERS[chapter];

  return <div ref={root} className={`experience ${ready?"is-ready":""} ${failed?"has-failed":""} ${reduced?"reduced-motion":""}`} data-chapter={current.id}>
    <a className="skip-link" href="#narrative" onClick={e=>{e.preventDefault();openReader();}}>Read the accessible narrative</a>
    <div className="scroll-space" aria-hidden="true"/>
    <div className="world" aria-label="An original three-dimensional world, explored by ascending through five chapters">
      <WorldBoundary onFailure={onFailure}>
        {!failed&&<World low={mobile} reduced={reduced} paused={hidden||reading} onReady={onReady} onFailure={onFailure}/>}
      </WorldBoundary>
    </div>
    <div className="film-shade" aria-hidden="true"/>
    {!ready&&<div className="loading" role="status"><Sigil/><p>A world is remembering itself<span className="loading-dot">.</span></p></div>}
    <header className="top-bar">
      <a className="identity" href="#garden" onClick={e=>{e.preventDefault();goTo(0);}} aria-label="Return to The Garden Below"><Sigil/><span>An impossible ascent</span></a>
      <div className="tools">
        {(chapter===2||chapter===3)&&<button className="skip-intensity" onClick={()=>goTo(1,true)}>Skip to stillness</button>}
        <button onClick={()=>setMotionOverride(!reduced)} aria-pressed={reduced} aria-label={reduced?"Enable full motion":"Reduce motion"} title={reduced?"Enable full motion":"Reduce motion"}><Icon name="motion"/><span>{reduced?"Motion reduced":"Full motion"}</span></button>
        <button onClick={openReader} aria-label="Read the narrative" title="Read the narrative"><Icon name="book"/><span>Read the world</span></button>
        <button onClick={toggleSound} aria-pressed={sound} aria-label={sound?"Mute ambient sound":"Enable ambient sound"} title={sound?"Mute ambient sound":"Enable ambient sound"}><Icon name={sound?"sound":"muted"}/><span>Sound {sound?"on":"off"}</span></button>
      </div>
    </header>
    <main className="presentation" aria-label="The Sky Was Never Real">
      <div className="opening" aria-hidden={chapter!==0}>
        <h1 className="opening-title"><span>The sky</span><span className="serif-italic">was never</span><span>real.</span></h1>
        <p className="tagline">An ascension through a world<br className="desktop-break"/> that was never meant to be understood.</p>
        <div className="opening-rule" aria-hidden="true"/>
      </div>
      {chapter>0&&chapter<4&&<div className="chapter-copy" key={current.id}>
        <h2>{current.title}</h2><p>{current.line}</p>
      </div>}
      <div className="ending" aria-hidden={chapter!==4}>
        <p>You were never beneath the sky.<br/><em>You were inside it.</em></p>
        <button onClick={()=>goTo(0)} tabIndex={chapter===4?0:-1}><Icon name="down"/>Descend again</button>
      </div>
      {failed&&<div className="fallback-message" role="status"><h2>The world is out of reach.</h2><p>This browser could not open the 3D experience. All five chapters are available as a quiet reading.</p><button onClick={openReader}>Read the world<Icon name="book"/></button><button onClick={()=>window.location.reload()}>Try the 3D experience again</button></div>}
    </main>
    <nav className="chapter-nav" aria-label="Ascension chapters">
      {[...CHAPTERS].reverse().map((c,reverseIndex)=>{
        const i=CHAPTERS.length-1-reverseIndex;
        return <button key={c.id} className={i===chapter?"active":""} onClick={()=>goTo(c.at)} aria-current={i===chapter?"step":undefined} aria-label={`${c.roman}: ${c.title}`} title={c.title}>
          <span className="nav-name">{c.title}</span><span className="nav-mark" aria-hidden="true"/><span className="nav-roman" aria-hidden="true">{c.roman}</span>
        </button>;
      })}
    </nav>
    <footer className="bottom-bar">
      <div className="chapter-label" aria-live="polite" aria-atomic="true"><span className="chapter-number">{current.roman}</span><span>{current.title}</span></div>
      <button className={`ascent-hint ${chapter===4?"at-end":""}`} onClick={()=>goTo(Math.min(1,journey.target+.13))} aria-label="Ascend further" disabled={chapter===4}><Icon name="up"/><span className="desktop-hint">Scroll up to ascend</span><span className="touch-hint">Swipe down to ascend</span><span className="key-hint">or press Space</span></button>
      <div className="altitude" aria-hidden="true"><span className="altitude-label">Elevation</span><div><span ref={meter}>000</span><span className="unit">m</span><span className="altitude-line"/></div></div>
    </footer>
    {audioError&&<p className="audio-error" role="status">Sound is unavailable in this browser.</p>}
    <dialog ref={dialog} id="narrative" className="narrative" aria-labelledby="narrative-title" onClose={()=>setReading(false)}>
      <div className="reader-top"><Sigil/><button onClick={()=>dialog.current?.close()} autoFocus aria-label="Return to the world">Return to the world<Icon name="close"/></button></div>
      <div className="reader-body"><h2 id="narrative-title">The sky was<br/><em>never real.</em></h2><p className="reader-intro">An ascension through a world that was never meant to be understood.</p>
        {CHAPTERS.map(c=><section key={c.id}><span className="reader-number">{c.roman}</span><h3>{c.title}</h3><p>{c.description}</p><button onClick={()=>{dialog.current?.close();goTo(c.at,true);}}>Visit this chapter<Icon name="up"/></button></section>)}
        <p className="reader-ending">You were never beneath the sky.<br/><em>You were inside it.</em></p>
        <p className="reader-help">Scroll upward to ascend, downward to descend. Arrow Up, Page Up, Home, and Space ascend. Arrow Down, Page Down, End, and Shift+Space descend. Chapter controls offer direct navigation. Reduced motion removes ambient movement, pointer parallax, and camera easing.</p>
      </div>
    </dialog>
    <noscript><article className="no-script"><h1>The Sky Was Never Real</h1><p>Enable JavaScript to explore the 3D world. The story remains here.</p>{CHAPTERS.map(c=><section key={c.id}><h2>{c.title}</h2><p>{c.description}</p></section>)}</article></noscript>
  </div>;
}
