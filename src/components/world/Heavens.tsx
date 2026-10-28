"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { journey, sceneState, seededRandom, smoothRange } from "@/lib/journey";
import { veilFragment, veilVertex } from "./shaders";

const stone = "#a7a89b";
const gold = "#bda36a";

function Column({ height = 9 }: {height?:number}) {
  return <group>
    <mesh position={[0,height/2,0]}><cylinderGeometry args={[.46,.64,height,10]}/><meshStandardMaterial color={stone} roughness={.85}/></mesh>
    <mesh position={[0,.2,0]}><boxGeometry args={[1.55,.4,1.55]}/><meshStandardMaterial color="#868c81"/></mesh>
    <mesh position={[0,height-.65,0]}><cylinderGeometry args={[.51,.51,.12,10]}/><meshStandardMaterial color={gold} metalness={.6} roughness={.3}/></mesh>
    <mesh position={[0,height,0]}><boxGeometry args={[1.4,.5,1.4]}/><meshStandardMaterial color={stone}/></mesh>
  </group>;
}

export function Sanctuary() {
  const root = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Group>(null);
  useFrame(({clock})=>{
    if(root.current) root.current.visible=journey.progress>.08&&journey.progress<.64;
    if(ring.current) ring.current.rotation.z=journey.reducedMotion?.16:.16+Math.sin(clock.elapsedTime*.06)*.025;
  });
  return <group ref={root} position={[0,48,-20]}>
    <group position={[-13,-5,0]} rotation={[0,.18,0]}>
      <mesh position={[0,-1,0]} rotation={[0,.3,0]} scale={[11,2.2,7]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#737e74" roughness={.96}/></mesh>
      <mesh position={[0,0,0]}><boxGeometry args={[18,.6,7]}/><meshStandardMaterial color="#90978b" roughness={.8}/></mesh>
      {[-7,-3.5,0,3.5,7].map((x,i)=><group key={x} position={[x,.3,-2]}><Column height={i===4?5:10}/></group>)}
      <mesh position={[-1.7,10.4,-2]} rotation={[0,0,.015]}><boxGeometry args={[15,.85,1.6]}/><meshStandardMaterial color={stone}/></mesh>
      <mesh position={[0,10.95,-2]}><boxGeometry args={[18,.15,1.85]}/><meshStandardMaterial color={gold} metalness={.5} roughness={.35}/></mesh>
    </group>
    <group position={[15,3,-8]} rotation={[0,-.25,0]}>
      <mesh position={[0,-1.4,0]} scale={[6,2.1,5]} rotation={[.1,.5,0]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#788479"/></mesh>
      <mesh><boxGeometry args={[10,.5,6]}/><meshStandardMaterial color={stone}/></mesh>
      <group position={[-3,0,0]}><Column height={8}/></group>
      <group position={[3,0,0]}><Column height={8}/></group>
      <mesh position={[0,8,0]}><torusGeometry args={[3,.6,8,40,Math.PI]}/><meshStandardMaterial color={stone}/></mesh>
      <mesh position={[0,8,.05]}><torusGeometry args={[3.7,.045,6,40,Math.PI]}/><meshBasicMaterial color={[1.9,1.3,.5]}/></mesh>
    </group>
    <group ref={ring} position={[1,11,-23]} rotation={[.1,.35,.16]}>
      <mesh><torusGeometry args={[15,1.05,8,120,Math.PI*1.83]}/><meshStandardMaterial color="#929e93" roughness={.82}/></mesh>
      <mesh position={[0,0,1.1]}><torusGeometry args={[15,.035,4,120,Math.PI*1.83]}/><meshBasicMaterial color={[2,1.4,.5]}/></mesh>
      {Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2; return <mesh key={i} position={[Math.cos(a)*15,Math.sin(a)*15,0]} rotation={[0,0,a]}><boxGeometry args={[2.4,.18,2.4]}/><meshStandardMaterial color={gold} metalness={.55} roughness={.45}/></mesh>;})}
    </group>
    <group position={[-32,16,-34]} rotation={[0,.4,-.12]}><Column height={17}/></group>
    <group position={[35,24,-45]} rotation={[0,0,.2]}><Column height={11}/></group>
    <mesh position={[9,20,-8]} rotation={[.4,.6,.15]}><boxGeometry args={[.3,.3,.3]}/><meshBasicMaterial color={[1.6,1.05,.4]}/></mesh>
    <CloudStrata/>
  </group>;
}

function CloudStrata() {
  const mesh=useRef<THREE.InstancedMesh>(null);
  const count=65;
  useLayoutEffect(()=>{
    const random=seededRandom(183),dummy=new THREE.Object3D();
    for(let i=0;i<count;i++) {
      const a=random()*Math.PI*2,r=20+random()*80;
      dummy.position.set(Math.cos(a)*r,-15-random()*10,-20+Math.sin(a)*r);
      dummy.scale.set(22+random()*24,4+random()*7,1);
      dummy.rotation.set(0,(random()-.5)*.4,(random()-.5)*.15);dummy.updateMatrix();
      mesh.current!.setMatrixAt(i,dummy.matrix);
    }
    mesh.current!.instanceMatrix.needsUpdate=true;
  },[]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,count]}>
    <planeGeometry args={[1,1]}/>
    <shaderMaterial transparent depthWrite={false} side={THREE.DoubleSide} vertexShader={`
      varying vec2 vUv;
      void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}
    `} fragmentShader={`
      varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);}
      void main(){
        vec2 p=(vUv-.5)*2.0;
        float body=1.0-smoothstep(.25,1.0,length(p)+noise(vUv*9.0)*.2);
        float alpha=body*(.12+noise(vUv*5.0)*.12);
        gl_FragColor=vec4(vec3(.67,.72,.64),alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `}/>
  </instancedMesh>;
}

function createShell() {
  const random=seededRandom(996);
  const positions:number[]=[],centers:number[]=[],bary:number[]=[],seeds:number[]=[];
  const side=13, height=side*Math.sqrt(3)/2;
  const add=(points:number[][])=>{
    const center=[(points[0][0]+points[1][0]+points[2][0])/3,0,(points[0][1]+points[1][1]+points[2][1])/3];
    if(Math.hypot(center[0],center[2])>115) return;
    const seed=random();
    const triangle=(a:number[],b:number[],c:number[])=>{
      [a,b,c].forEach((p,i)=>{
        positions.push(...p);centers.push(...center);seeds.push(seed);
        bary.push(i===0?1:0,i===1?1:0,i===2?1:0);
      });
    };
    const top=points.map(p=>[p[0],.24,p[1]]),bottom=points.map(p=>[p[0],-.24,p[1]]);
    triangle(top[0],top[1],top[2]);triangle(bottom[2],bottom[1],bottom[0]);
    for(let i=0;i<3;i++) {
      const j=(i+1)%3;
      triangle(top[i],bottom[i],top[j]);triangle(top[j],bottom[i],bottom[j]);
    }
  };
  for(let row=-11;row<12;row++) for(let col=-12;col<12;col++) {
    const x=col*side+(row%2)*side/2,z=row*height;
    const nextOffset=row%2===0?side/2:-side/2;
    if(row%2===0) {
      add([[x,z],[x+side,z],[x+nextOffset,z+height]]);
      add([[x+side,z],[x+nextOffset+side,z+height],[x+nextOffset,z+height]]);
    } else {
      add([[x,z],[x+side,z],[x+nextOffset+side,z+height]]);
      add([[x,z],[x+nextOffset+side,z+height],[x+nextOffset,z+height]]);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute("aCenter",new THREE.Float32BufferAttribute(centers,3));
  g.setAttribute("aBary",new THREE.Float32BufferAttribute(bary,3));
  g.setAttribute("aSeed",new THREE.Float32BufferAttribute(seeds,1));
  g.computeVertexNormals();
  return g;
}

export function FalseSky() {
  const material=useRef<THREE.ShaderMaterial>(null);
  const root=useRef<THREE.Group>(null);
  const geometry=useMemo(()=>createShell(),[]);
  const uniforms=useMemo(()=>({uFracture:{value:0},uPresence:{value:0}}),[]);
  useLayoutEffect(()=>()=>geometry.dispose(),[geometry]);
  useFrame(()=>{
    if(material.current) {
      material.current.uniforms.uFracture.value=sceneState(journey.progress).fracture;
      material.current.uniforms.uPresence.value=smoothRange(.3,.39,journey.progress);
    }
    if(root.current) root.current.visible=journey.progress>.29&&journey.progress<.82;
  });
  return <group ref={root} position={[0,112,10]}>
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={veilVertex} fragmentShader={veilFragment} side={THREE.DoubleSide} transparent/>
    </mesh>
    <mesh position={[0,-2,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[52,.2,8,180]}/><meshBasicMaterial color={[2.5,1.7,.65]}/></mesh>
    <mesh position={[0,-3.5,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[56,.06,5,180]}/><meshBasicMaterial color="#c9ba8e"/></mesh>
    {Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*52,-5,Math.sin(a)*52]} rotation={[0,-a,0]}><boxGeometry args={[.35,7,3]}/><meshStandardMaterial color="#acac96"/></mesh>;})}
  </group>;
}

export function Corruption() {
  const fragments=useRef<THREE.InstancedMesh>(null);
  const seams=useRef<THREE.InstancedMesh>(null);
  const root=useRef<THREE.Group>(null);
  const material=useRef<THREE.MeshStandardMaterial>(null);
  const count=420;
  const data=useMemo(()=>{
    const random=seededRandom(666);
    return Array.from({length:count},(_,i)=>{
      const tower=Math.floor(i/70),cell=i%70;
      const x=(tower%3-1)*24+(Math.floor(cell/10)-3)*1.8;
      const y=Math.floor(tower/3)*22+cell%10*1.85;
      const z=-22-Math.floor(tower/3)*18+Math.sin(tower)*8;
      return {x,y,z,phase:cell%10*.055+tower*.025,seed:random(),rx:random(),rz:random(),size:.65+random()*.3};
    });
  },[]);
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const wire=useMemo(()=>{
    const points:number[]=[];
    for(let x=-55;x<=55;x+=5) for(let z=-60;z<30;z+=5) {
      const y=Math.sin(x*.09+z*.08)*2;
      points.push(x,y,z,x+5,Math.sin((x+5)*.09+z*.08)*2,z);
      points.push(x,y,z,x,Math.sin(x*.09+(z+5)*.08)*2,z+5);
    }
    const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(points,3));return g;
  },[]);
  useLayoutEffect(()=>()=>wire.dispose(),[wire]);
  useFrame(({clock})=>{
    const p=journey.progress,c=sceneState(p).corruption;
    if(root.current) root.current.visible=p>.48&&p<.96;
    if(!fragments.current||!seams.current||p<.48||p>.96) return;
    const time=journey.reducedMotion?0:clock.elapsedTime;
    for(let i=0;i<count;i++) {
      const d=data[i];
      const spread=smoothRange(d.phase,.7+d.phase*.25,c);
      const force=spread*(4+d.seed*12);
      dummy.position.set(d.x+force*(.48+Math.sin(d.y*.12)*.18)+Math.sin(time*.17+d.seed*12)*spread*.4,d.y+force*.6,d.z-force*.55);
      dummy.rotation.set(spread*d.rx*1.5,spread*d.seed*2,spread*d.rz);
      dummy.scale.setScalar(d.size*(1-spread*.22));dummy.updateMatrix();
      fragments.current.setMatrixAt(i,dummy.matrix);
      dummy.scale.set(d.size*1.012,d.size*.055,d.size*1.012);dummy.updateMatrix();
      seams.current.setMatrixAt(i,dummy.matrix);
    }
    fragments.current.instanceMatrix.needsUpdate=true;
    seams.current.instanceMatrix.needsUpdate=true;
    if(material.current) material.current.emissiveIntensity=.08+c*.18;
  });
  return <group ref={root} position={[0,147,-6]} rotation={[.08,.05,.13]}>
    <instancedMesh ref={fragments} args={[undefined,undefined,count]} frustumCulled={false}><boxGeometry args={[1.8,1.8,1.8]}/><meshStandardMaterial ref={material} color="#24202d" roughness={.74} metalness={.3} emissive="#881b38" emissiveIntensity={.16}/></instancedMesh>
    <instancedMesh ref={seams} args={[undefined,undefined,count]} frustumCulled={false}><boxGeometry args={[1.8,1.8,1.8]}/><meshBasicMaterial color={[2.4,.04,.12]}/></instancedMesh>
    <lineSegments geometry={wire} position={[0,5,0]}><lineBasicMaterial color="#982339" transparent opacity={.3}/></lineSegments>
    <mesh position={[-7,30,-38]} rotation={[.2,-.2,-.5]}><torusGeometry args={[21,1.4,4,7,Math.PI*1.55]}/><meshStandardMaterial color="#1d1b28" roughness={.5} metalness={.5}/></mesh>
    <mesh position={[-7,30,-36.4]} rotation={[.2,-.2,-.5]}><torusGeometry args={[21,.045,4,7,Math.PI*1.55]}/><meshBasicMaterial color={[3,.04,.1]}/></mesh>
  </group>;
}

export function Beyond() {
  const root=useRef<THREE.Group>(null);
  const middle=useRef<THREE.Group>(null);
  const inner=useRef<THREE.Group>(null);
  const material=useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({clock})=>{
    const p=journey.progress;
    if(root.current) root.current.visible=p>.52;
    const motion=journey.reducedMotion?0:clock.elapsedTime;
    if(middle.current) middle.current.rotation.z=.25+motion*.007;
    if(inner.current) inner.current.rotation.y=-.35+motion*.009;
    if(material.current) material.current.opacity=smoothRange(.65,.92,p)*.65;
  });
  return <group ref={root} position={[0,223,-42]} rotation={[.08,-.18,-.12]}>
    <mesh><torusGeometry args={[34,1.05,8,160,Math.PI*1.91]}/><meshStandardMaterial color="#344247" metalness={.65} roughness={.45}/></mesh>
    <mesh position={[0,0,1.11]}><torusGeometry args={[34,.035,4,180,Math.PI*1.91]}/><meshBasicMaterial color={[1.2,1.6,1.6]}/></mesh>
    {Array.from({length:36},(_,i)=>{const a=i/36*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*34,Math.sin(a)*34,0]} rotation={[0,0,a]}><boxGeometry args={[3.1,.17,2.8]}/><meshStandardMaterial color="#757b73" metalness={.65} roughness={.5}/></mesh>;})}
    <group ref={middle} rotation={[.4,.4,.25]}>
      <mesh><torusGeometry args={[23,.8,8,128]}/><meshStandardMaterial color="#394549" metalness={.7} roughness={.35}/></mesh>
      <mesh position={[0,0,.86]}><torusGeometry args={[23,.045,4,150]}/><meshBasicMaterial color={[1.5,1.8,1.65]}/></mesh>
      {Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*23,Math.sin(a)*23,0]} rotation={[0,0,a]}><boxGeometry args={[2.6,.55,1.8]}/><meshStandardMaterial color="#6e756c" metalness={.5}/></mesh>;})}
    </group>
    <group ref={inner} rotation={[-.65,-.35,.5]}>
      <mesh><torusGeometry args={[13,.6,8,110]}/><meshStandardMaterial color="#8d927b" roughness={.4} metalness={.7}/></mesh>
      <mesh><torusGeometry args={[12.25,.035,4,110]}/><meshBasicMaterial color={[1.9,1.8,1.3]}/></mesh>
    </group>
    <mesh><sphereGeometry args={[3.4,40,40]}/><meshBasicMaterial color={[2.8,2.5,1.6]}/></mesh>
    <mesh rotation={[0,0,.25]}><torusGeometry args={[5,.055,5,90]}/><meshBasicMaterial color={[1.8,2,1.6]}/></mesh>
    <mesh position={[0,0,-3]}><circleGeometry args={[10,90]}/><meshBasicMaterial ref={material} color="#1d3037" transparent opacity={.65}/></mesh>
    <pointLight intensity={80} distance={80} color="#b8d2c8"/>
  </group>;
}
