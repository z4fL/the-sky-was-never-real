"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { journey, sceneState, seededRandom } from "@/lib/journey";
import Garden from "./Garden";
import { Beyond, Corruption, FalseSky, Sanctuary } from "./Heavens";
import { particleFragment, particleVertex, skyFragment, skyVertex } from "./shaders";

const cameraStops = [
  { at:0, pos:[0,3.5,29], look:[0,8,-12] },
  { at:.13, pos:[-2,26,30], look:[1,31,-18] },
  { at:.25, pos:[1,52,29], look:[0,55,-22] },
  { at:.38, pos:[-2,81,26], look:[0,102,-18] },
  { at:.5, pos:[0,108,19], look:[0,126,-20] },
  { at:.61, pos:[1,133,22], look:[0,146,-26] },
  { at:.73, pos:[-1,164,29], look:[-1,171,-25] },
  { at:.86, pos:[0,201,40], look:[0,215,-39] },
  { at:1, pos:[0,218,43], look:[0,223,-42] },
];

const path = new THREE.CatmullRomCurve3(cameraStops.map(s=>new THREE.Vector3(...s.pos as [number,number,number])),false,"catmullrom",.25);
const lookPath = new THREE.CatmullRomCurve3(cameraStops.map(s=>new THREE.Vector3(...s.look as [number,number,number])),false,"catmullrom",.25);

function cameraT(p:number) {
  for(let i=1;i<cameraStops.length;i++) {
    if(p<=cameraStops[i].at) return ((i-1)+(p-cameraStops[i-1].at)/(cameraStops[i].at-cameraStops[i-1].at))/(cameraStops.length-1);
  }
  return 1;
}

function CameraRig({ onReady }: {onReady:()=>void}) {
  const { setDpr, invalidate } = useThree();
  const position=useMemo(()=>new THREE.Vector3(),[]);
  const look=useMemo(()=>new THREE.Vector3(),[]);
  const fogColor=useMemo(()=>new THREE.Color(),[]);
  const warm=useMemo(()=>new THREE.Color("#b5a77c"),[]);
  const dark=useMemo(()=>new THREE.Color("#110c1d"),[]);
  const final=useMemo(()=>new THREE.Color("#060e13"),[]);
  const stats=useRef({time:0,frames:0,ready:false});
  useEffect(()=>{stats.current.ready=false;invalidate();},[onReady,invalidate]);
  useEffect(()=>{
    const update=()=>{journey.active=!document.hidden;invalidate();};
    document.addEventListener("visibilitychange",update);
    return ()=>document.removeEventListener("visibilitychange",update);
  },[invalidate]);
  useFrame((state,delta)=>{
    const {camera,gl,scene}=state;
    const step=Math.min(delta,.06);
    const lerp=journey.reducedMotion?1:1-Math.exp(-step*6.5);
    journey.progress=THREE.MathUtils.lerp(journey.progress,journey.target,lerp);
    if(Math.abs(journey.target-journey.progress)<.00001) journey.progress=journey.target;
    const p=journey.progress,t=cameraT(p),env=sceneState(p);
    path.getPoint(t,position);lookPath.getPoint(t,look);
    const parallax=journey.reducedMotion?0:1;
    position.setX(position.x+journey.pointerX*.7*parallax);
    position.setY(position.y+journey.pointerY*.3*parallax);
    camera.position.copy(position);
    look.setX(look.x+journey.pointerX*.25*parallax);
    camera.lookAt(look);
    const perspective=camera as THREE.PerspectiveCamera;
    const fov=(state.size.width<650?59:48)-env.quiet*3;
    if(perspective.fov!==fov){perspective.fov=fov;perspective.updateProjectionMatrix();}
    fogColor.copy(warm).lerp(dark,env.night).lerp(final,env.quiet);
    const fog=scene.fog as THREE.FogExp2;
    fog.color.copy(fogColor);fog.density=THREE.MathUtils.lerp(.0085,.0022,env.night);
    gl.toneMappingExposure=THREE.MathUtils.lerp(1.1,.88,env.night);
    journey.frames++;
    journey.drawCalls=gl.info.render.calls;
    journey.geometries=gl.info.memory.geometries;
    journey.textures=gl.info.memory.textures;
    gl.info.reset();
    stats.current.time+=delta;stats.current.frames++;
    if(stats.current.time>=3){
      journey.fps=Math.round(stats.current.frames/stats.current.time);
      gl.domElement.dataset.fps=String(journey.fps);
      gl.domElement.dataset.drawCalls=String(journey.drawCalls);
      gl.domElement.dataset.geometries=String(journey.geometries);
      gl.domElement.dataset.textures=String(journey.textures);
      if(journey.fps<33&&!journey.lowQuality&&stats.current.ready&&!journey.reducedMotion&&delta<.2){
        setDpr(Math.max(.65,Math.min(gl.getPixelRatio()*.72,1)));journey.lowQuality=true;
      }
      stats.current.time=0;stats.current.frames=0;
    }
    if(!stats.current.ready&&journey.ready){stats.current.ready=true;onReady();}
  }, -100);
  return null;
}

function Sky() {
  const mesh=useRef<THREE.Mesh>(null);
  const material=useRef<THREE.ShaderMaterial>(null);
  const uniforms=useMemo(()=>({uNight:{value:0},uQuiet:{value:0}}),[]);
  useFrame(({camera})=>{
    mesh.current!.position.copy(camera.position);
    const env=sceneState(journey.progress);
    material.current!.uniforms.uNight.value=env.night;
    material.current!.uniforms.uQuiet.value=env.quiet;
  });
  return <mesh ref={mesh} renderOrder={-100} frustumCulled={false}><sphereGeometry args={[420,32,16]}/><shaderMaterial ref={material} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} side={THREE.BackSide} depthWrite={false}/></mesh>;
}

function Particles({ low }: {low:boolean}) {
  const material=useRef<THREE.ShaderMaterial>(null);
  const count=low?480:1100;
  const geometry=useMemo(()=>{
    const random=seededRandom(111),positions=[],seeds=[];
    for(let i=0;i<count;i++){
      positions.push((random()-.5)*100,random()*245,-70+random()*110);
      seeds.push(random());
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));g.setAttribute("aSeed",new THREE.Float32BufferAttribute(seeds,1));return g;
  },[count]);
  const uniforms=useMemo(()=>({uTime:{value:0},uMotion:{value:1},uPixelRatio:{value:1},uCorruption:{value:0}}),[]);
  useLayoutEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(({clock,gl})=>{
    const m=material.current;if(!m)return;
    m.uniforms.uTime.value=clock.elapsedTime;
    m.uniforms.uMotion.value=journey.reducedMotion?0:1;
    m.uniforms.uPixelRatio.value=gl.getPixelRatio();
    m.uniforms.uCorruption.value=sceneState(journey.progress).corruption;
  });
  return <points geometry={geometry}><shaderMaterial ref={material} uniforms={uniforms} vertexShader={particleVertex} fragmentShader={particleFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></points>;
}

function Debris({low}:{low:boolean}) {
  const mesh=useRef<THREE.InstancedMesh>(null);
  const count=low?65:140;
  const data=useMemo(()=>{
    const random=seededRandom(57);
    return Array.from({length:count},()=>({x:(random()-.5)*100,y:65+random()*170,z:-65+random()*65,scale:.15+random()*1.2,seed:random()}));
  },[count]);
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  useFrame(({clock})=>{
    const p=journey.progress;mesh.current!.visible=p>.15;
    const time=journey.reducedMotion?0:clock.elapsedTime;
    const corruption=sceneState(p).corruption;
    data.forEach((d,i)=>{
      const force=corruption*d.seed*7;
      dummy.position.set(d.x+force,d.y+Math.sin(time*.11+d.seed*6)*.7,d.z-force);
      dummy.rotation.set(d.seed*3+time*.012,d.seed*5,d.seed*2+time*.009);
      dummy.scale.set(d.scale,d.scale*(.4+d.seed),d.scale*.7);dummy.updateMatrix();mesh.current!.setMatrixAt(i,dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate=true;
  });
  return <instancedMesh ref={mesh} args={[undefined,undefined,count]} frustumCulled={false}><octahedronGeometry args={[1,0]}/><meshStandardMaterial color="#5c5d59" roughness={.7} metalness={.3}/></instancedMesh>;
}

function Lighting() {
  const sun=useRef<THREE.DirectionalLight>(null);
  const ambient=useRef<THREE.HemisphereLight>(null);
  const color=useMemo(()=>new THREE.Color(),[]);
  useFrame(()=>{
    const env=sceneState(journey.progress);
    if(sun.current){sun.current.intensity=2.4-env.night*1.6;sun.current.color.setRGB(1,.84-env.corruption*.5,.57-env.corruption*.32);}
    if(ambient.current){ambient.current.intensity=.95-env.night*.5;ambient.current.color.copy(color.setRGB(.72-env.corruption*.25,.81-env.corruption*.5,.74));}
  });
  return <><hemisphereLight ref={ambient} args={["#b9ccbd","#57452c",.95]}/><directionalLight ref={sun} position={[30,80,-55]} intensity={2.4} color="#ffdc9b"/><directionalLight position={[-20,140,30]} intensity={1.4} color="#838ab0"/></>;
}

function RenderControl({ paused, reduced }: {paused:boolean;reduced:boolean}) {
  const {invalidate,setFrameloop}=useThree();
  useEffect(()=>{setFrameloop(paused||reduced?"demand":"always");invalidate();},[paused,reduced,setFrameloop,invalidate]);
  useEffect(()=>{
    if(!reduced)return;
    const update=()=>invalidate();
    window.addEventListener("scroll",update,{passive:true});
    window.addEventListener("resize",update);
    return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update);};
  },[reduced,invalidate]);
  return null;
}

function ContextHealth({onFailure}:{onFailure:()=>void}) {
  const gl=useThree(state=>state.gl);
  useEffect(()=>{
    const canvas=gl.domElement;
    const lost=(event:Event)=>{event.preventDefault();onFailure();};
    canvas.addEventListener("webglcontextlost",lost);
    return()=>canvas.removeEventListener("webglcontextlost",lost);
  },[gl,onFailure]);
  return null;
}

export default function World({ low, reduced, paused, onReady, onFailure }: {low:boolean;reduced:boolean;paused:boolean;onReady:()=>void;onFailure:()=>void}) {
  return <Canvas camera={{position:[0,3.5,29],fov:48,near:.1,far:600}} dpr={[.75,low?1.15:1.5]} gl={{antialias:low,powerPreference:"high-performance",alpha:false,stencil:false}} performance={{min:.65}} onCreated={({gl})=>{
    gl.toneMapping=THREE.ACESFilmicToneMapping;
    gl.info.autoReset=false;
    gl.domElement.setAttribute("aria-hidden","true");
  }} fallback={null}>
    <fogExp2 attach="fog" args={["#b5a77c",.0085]}/>
    <RenderControl paused={paused} reduced={reduced}/><ContextHealth onFailure={onFailure}/>
    <CameraRig onReady={onReady}/><Sky/><Lighting/>
    <Suspense fallback={null}>
      <Garden low={low}/><Sanctuary/><FalseSky/><Corruption/><Beyond/><Debris low={low}/><Particles low={low}/>
    </Suspense>
    {!low&&<EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom intensity={.4} luminanceThreshold={1.2} luminanceSmoothing={.4} mipmapBlur/>
      <Vignette eskil={false} offset={.15} darkness={.43}/>
    </EffectComposer>}
  </Canvas>;
}
