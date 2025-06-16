"use client";

import React, { useRef, useLayoutEffect, memo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ────────── shaders ────────── */
const vertexShader = /* glsl */`
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */`
precision highp float;

uniform float uTime;
uniform vec2  uResolution;

/* --- helpers ---------------------------------------------------- */
float gradient(float p){
  vec2 pt0 = vec2(0.00,0.0);
  vec2 pt1 = vec2(0.86,0.1);
  vec2 pt2 = vec2(0.955,0.40);
  vec2 pt3 = vec2(0.99,1.0);
  vec2 pt4 = vec2(1.00,0.0);
  if (p < pt0.x) return pt0.y;
  if (p < pt1.x) return mix(pt0.y, pt1.y,(p-pt0.x)/(pt1.x-pt0.x));
  if (p < pt2.x) return mix(pt1.y, pt2.y,(p-pt1.x)/(pt2.x-pt1.x));
  if (p < pt3.x) return mix(pt2.y, pt3.y,(p-pt2.x)/(pt3.x-pt2.x));
  if (p < pt4.x) return mix(pt3.y, pt4.y,(p-pt3.x)/(pt4.x-pt3.x));
  return pt4.y;
}

float waveN(vec2 uv, vec2 s12, vec2 t12, vec2 f12, vec2 h12){
  vec2 x12 = sin((uTime*s12 + t12 + uv.x)*f12)*h12;
  return gradient(uv.y/(0.5 + x12.x + x12.y))*0.27;
}

float wave1(vec2 uv){ return waveN(vec2(uv.x,uv.y-0.25), vec2(0.03,0.06), vec2(0.00, 0.02), vec2(8.0,3.7), vec2(0.06,0.05)); }
float wave2(vec2 uv){ return waveN(vec2(uv.x,uv.y-0.25), vec2(0.04,0.07), vec2(0.16,-0.37), vec2(6.7,2.89), vec2(0.06,0.05)); }
float wave3(vec2 uv){ return waveN(vec2(uv.x,0.75-uv.y), vec2(0.035,0.055),vec2(-0.09,0.27), vec2(7.4,2.51), vec2(0.06,0.05)); }
float wave4(vec2 uv){ return waveN(vec2(uv.x,0.75-uv.y), vec2(0.032,0.09), vec2(0.08,-0.22), vec2(6.5,3.89), vec2(0.06,0.05)); }

/* --- main ------------------------------------------------------- */
void mainImage(out vec4 fragColor,in vec2 fragCoord){
  vec2 uv = fragCoord/uResolution;

  /* ocean-like waves */
  float waves = wave1(uv)+wave2(uv)+wave3(uv)+wave4(uv);

  /* darker base gradient */
  float x = uv.x, y = 1.0-uv.y;
  vec3  bg = mix(vec3(0.02,0.02,0.12), vec3(0.04,0.20,0.40), (x+y)*0.55);

  /* cooler highlight, half strength */
  vec3  col = bg + vec3(0.6,0.7,0.9)*waves;

  /* vignette (darken edges) */
  float d   = length(uv-0.5);
  float vig = smoothstep(0.8,0.3,d);
  col *= mix(0.1,1.0,vig);

  /* slight gamma */
  col = pow(col, vec3(0.9));

  fragColor = vec4(col,1.0);
}

void main(){
  vec4 c; mainImage(c, gl_FragCoord.xy); gl_FragColor = c;
}
`;

/* ────────── React mesh wrapper ────────── */
function ShaderMesh(){
  const mat = useRef();
  const { size, camera, invalidate } = useThree();

  useLayoutEffect(()=>{
    if(!mat.current) return;
    mat.current.uniforms.uResolution.value.set(size.width,size.height);
    camera.aspect = size.width/size.height;
    camera.updateProjectionMatrix();
    invalidate();
  },[size,camera,invalidate]);

  useFrame(({clock})=>{
    if(mat.current){
      mat.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return(
    <mesh>
      <planeGeometry args={[2,2]}/>
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime:{value:0.0},
          uResolution:{value:new THREE.Vector2(window.innerWidth,window.innerHeight)}
        }}
      />
    </mesh>
  );
}

/* ────────── top-level component ────────── */
function CleanNguyenBackground(){
  return(
    <Canvas
      frameloop="always"
      onCreated={({gl})=>{gl.domElement.style.touchAction="none";}}
      style={{
        position:"fixed",top:0,left:0,width:"100%",height:"100%",
        pointerEvents:"none",zIndex:-1
      }}
      gl={{antialias:true}}
      camera={{position:[0,0,1],fov:75}}
    >
      <ShaderMesh/>
    </Canvas>
  );
}

export default memo(CleanNguyenBackground);
