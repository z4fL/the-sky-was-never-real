"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { journey, seededRandom } from "@/lib/journey";
import { grassFragment, grassVertex } from "./shaders";

export function groundHeight(x: number, z: number) {
  return -1.4 + Math.sin(x * 0.058 + z * 0.021) * 1.3 + Math.cos(z * 0.063) * 0.8;
}

function Grass({ low }: { low: boolean }) {
  const count = low ? 11000 : 26000;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([
      -0.055,0,0, 0.055,0,0, -0.035,0.5,0.01,
      0.055,0,0, 0.035,0.5,0.01, -0.035,0.5,0.01,
      -0.035,0.5,0.01, 0.035,0.5,0.01, 0.015,1,0.05,
    ], 3));
    return g;
  }, []);
  const uniforms = useMemo(() => ({ uTime:{value:0}, uMotion:{value:1}, uFog:{value:new THREE.Color("#b5a77c")} }), []);
  useLayoutEffect(() => {
    const random = seededRandom(819);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const x = (random() - 0.5) * 210;
      const z = 27 - Math.pow(random(), 1.25) * 175;
      dummy.position.set(x, groundHeight(x,z), z);
      dummy.rotation.set(0,random()*Math.PI, (random()-0.5)*0.12);
      const size = 0.6 + random() * 1.3;
      dummy.scale.setScalar(size);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i,dummy.matrix);
    }
    mesh.current!.instanceMatrix.needsUpdate = true;
    return () => geometry.dispose();
  }, [count, geometry]);
  useFrame(({clock}) => {
    if (!material.current) return;
    material.current.uniforms.uTime.value = clock.elapsedTime;
    material.current.uniforms.uMotion.value = journey.reducedMotion ? 0 : 1;
    mesh.current!.visible = journey.progress < 0.33;
  });
  return <instancedMesh ref={mesh} args={[geometry,undefined,count]} frustumCulled={false}>
    <shaderMaterial ref={material} vertexShader={grassVertex} fragmentShader={grassFragment} uniforms={uniforms} side={THREE.DoubleSide} />
  </instancedMesh>;
}

function branchGeometry(points: THREE.Vector3[], radius: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const g = new THREE.TubeGeometry(curve, 14, radius, 7, false);
  const pos = g.getAttribute("position");
  for (let i=0;i<pos.count;i++) {
    const t = Math.floor(i / 8) / 14;
    const center = curve.getPointAt(t);
    const v = new THREE.Vector3().fromBufferAttribute(pos,i).sub(center).multiplyScalar(1-t*0.88).add(center);
    pos.setXYZ(i,v.x,v.y,v.z);
  }
  g.computeVertexNormals();
  return g;
}

function AncientTree({ low }: {low:boolean}) {
  const foliage = useRef<THREE.InstancedMesh>(null);
  const leaves = useRef<THREE.InstancedMesh>(null);
  const crown = useRef<THREE.Group>(null);
  const count = low ? 1050 : 1800;
  const branches = useMemo(() => {
    const random = seededRandom(72);
    const result: THREE.BufferGeometry[] = [];
    result.push(branchGeometry([new THREE.Vector3(0,0,0),new THREE.Vector3(-0.7,4,0),new THREE.Vector3(0.5,8,-0.3),new THREE.Vector3(1.2,13,0)],1.25));
    for (let i=0;i<18;i++) {
      const a = i * 2.399;
      const start = 3.7 + random()*5;
      const reach = 3.7 + random()*5.5;
      const end = new THREE.Vector3(Math.cos(a)*reach, 11 + random()*4, Math.sin(a)*reach*0.65);
      result.push(branchGeometry([new THREE.Vector3(0,start,0),new THREE.Vector3(end.x*0.2,start+2,end.z*0.25),new THREE.Vector3(end.x*0.65,end.y-1,end.z*0.7),end],0.23+random()*0.33));
      for (let j=0;j<2;j++) {
        result.push(branchGeometry([end.clone().multiplyScalar(0.75).add(new THREE.Vector3(0,2,0)), end.clone(), end.clone().add(new THREE.Vector3((random()-.5)*4,2,(random()-.5)*3))],0.1));
      }
    }
    for (let i=0;i<7;i++) {
      const a = i/7*Math.PI*2;
      result.push(branchGeometry([new THREE.Vector3(0,0.5,0),new THREE.Vector3(Math.cos(a)*1.9,0,Math.sin(a)*1.9),new THREE.Vector3(Math.cos(a)*3.8,-0.5,Math.sin(a)*3.8)],0.45));
    }
    return result;
  }, []);
  useLayoutEffect(() => {
    const random = seededRandom(247);
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    for (let i=0;i<count;i++) {
      const a=random()*Math.PI*2;
      const r=Math.sqrt(random())*9;
      const x=Math.cos(a)*r, z=Math.sin(a)*r*0.65;
      const y=12.3+Math.cos(r/9*Math.PI/2)*3.2+(random()-.5)*2.6;
      dummy.position.set(x,y,z);
      dummy.rotation.set(random()*2,random()*3,random()*2);
      dummy.scale.set(0.35+random()*0.65,0.12+random()*0.3,0.32+random()*0.7);
      dummy.updateMatrix();
      foliage.current!.setMatrixAt(i,dummy.matrix);
      color.setHSL(0.025 + random()*0.065,0.38+random()*0.28,0.56+random()*0.22);
      foliage.current!.setColorAt(i,color);
    }
    for (let i=0;i<count*3;i++) {
      const a=random()*Math.PI*2, r=Math.sqrt(random())*10;
      dummy.position.set(Math.cos(a)*r,12+Math.cos(r/10*Math.PI/2)*3.5+(random()-.5)*3.3,Math.sin(a)*r*.7);
      dummy.scale.set(.12+random()*.22,.035+random()*.06,.22+random()*.35);
      dummy.rotation.set(random()*3,random()*3,random()*3);
      dummy.updateMatrix();
      leaves.current!.setMatrixAt(i,dummy.matrix);
      color.setHSL(.035+random()*.055,.5,.64+random()*.17);
      leaves.current!.setColorAt(i,color);
    }
    foliage.current!.instanceMatrix.needsUpdate=true;
    leaves.current!.instanceMatrix.needsUpdate=true;
    return () => branches.forEach(g=>g.dispose());
  }, [branches,count]);
  useFrame(({clock}) => {
    if(crown.current) crown.current.rotation.z=journey.reducedMotion?0:Math.sin(clock.elapsedTime*.24)*.009;
  });
  return <group position={[8,-0.7,-10]} rotation={[0,-.3,0]}>
    {branches.map((g,i)=><mesh key={i} geometry={g}><meshStandardMaterial color={i%3===0?"#ae9970":"#7e7556"} roughness={.91}/></mesh>)}
    <group ref={crown}>
      <instancedMesh ref={foliage} args={[undefined,undefined,count]}>
        <icosahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={.8} emissive="#c87e58" emissiveIntensity={.2}/>
      </instancedMesh>
      <instancedMesh ref={leaves} args={[undefined,undefined,count*3]}>
        <octahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={.7} emissive="#e5aa72" emissiveIntensity={.27}/>
      </instancedMesh>
    </group>
    <mesh position={[0,7.5,.9]}><sphereGeometry args={[.09,12,12]}/><meshBasicMaterial color={[3,1.5,.4]}/></mesh>
  </group>;
}

function GardenRuins() {
  const locations = [[-32,-1,-69],[-25,-1,-75],[-18,-1,-81],[37,-1,-89],[45,-1,-84],[53,-1,-90]];
  return <group>
    {locations.map(([x,y,z],i)=><group key={i} position={[x,y,z]}>
      <mesh position={[0,5.4,0]}><cylinderGeometry args={[.7,1,11,8]}/><meshStandardMaterial color="#a7a589" roughness={1}/></mesh>
      <mesh position={[0,11,0]}><boxGeometry args={[2.4,.6,2.2]}/><meshStandardMaterial color="#b4ad8f"/></mesh>
      {i%2===0&&<mesh position={[3.4,11,0]}><boxGeometry args={[7.5,.8,2]}/><meshStandardMaterial color="#b4ad8f"/></mesh>}
    </group>)}
    <mesh position={[-46,10,-125]} rotation={[0,.5,.35]}><torusGeometry args={[14,.65,6,90,Math.PI*1.7]}/><meshStandardMaterial color="#a3aa97"/></mesh>
    {[[-4,-1,-2],[19,-1,-5],[-17,-1,8]].map((pos,i)=><mesh key={i} position={pos as [number,number,number]} rotation={[.2,i*2,.15]}><dodecahedronGeometry args={[1.8+i*.4,0]}/><meshStandardMaterial color="#65674b" roughness={1}/></mesh>)}
  </group>;
}

export default function Garden({ low }: {low:boolean}) {
  const group = useRef<THREE.Group>(null);
  const terrain = useMemo(()=>{
    const g=new THREE.PlaneGeometry(420,420,75,75);
    g.rotateX(-Math.PI/2);
    const p=g.getAttribute("position");
    for(let i=0;i<p.count;i++) p.setY(i,groundHeight(p.getX(i),p.getZ(i)));
    g.computeVertexNormals();
    return g;
  },[]);
  useLayoutEffect(()=>()=>terrain.dispose(),[terrain]);
  useFrame(()=>{if(group.current) group.current.visible=journey.progress<.4;});
  return <group ref={group}>
    <mesh geometry={terrain}><meshStandardMaterial color="#69633b" roughness={1}/></mesh>
    <Grass low={low}/><AncientTree low={low}/><GardenRuins/>
    <mesh position={[11,17,-37]} rotation={[0,0,.13]}>
      <torusGeometry args={[12,.035,6,128]}/><meshBasicMaterial color={[1.8,1.3,.6]} transparent opacity={.65}/>
    </mesh>
  </group>;
}
