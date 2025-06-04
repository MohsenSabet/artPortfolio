"use client";

// src/components/ThreeBackground.js
import React, { useRef, useLayoutEffect, memo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Cloud } from '@react-three/drei'
import { bgSpeed } from '@/lib/bgSpeed'

// —————— vertex ——————
const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
`;


// —————— fragment (original colour version) ——————
const fragmentShader = /* glsl */ `
  uniform vec2 u_resolution;
  uniform float u_time;

  const int octaves = 6;
  const float seed  = 43758.5453123;
  const float seed2 = 73156.8473192;

  vec2 random2(vec2 st, float seed){
    st = vec2(dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)));
    return -1.0 + 2.0 * fract(sin(st) * seed);
  }

  float noise(vec2 st, float seed) {
    vec2 i = floor(st), f = fract(st);
    vec2 u = f*f*(3.0 - 2.0*f);
    return mix(
      mix(dot(random2(i + vec2(0.0), seed), f - vec2(0.0)),
          dot(random2(i + vec2(1.0,0.0), seed), f - vec2(1.0,0.0)), u.x),
      mix(dot(random2(i + vec2(0.0,1.0), seed), f - vec2(0.0,1.0)),
          dot(random2(i + vec2(1.0,1.0), seed), f - vec2(1.0,1.0)), u.x),
      u.y
    );
  }

  float fbm1(in vec2 _st, float seed) {
    float v = 0.0, a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for(int i = 0; i < octaves; ++i){
      v += a * noise(_st, seed);
      _st = rot * _st * 2.0 + shift;
      a *= 0.4;
    }
    return v;
  }

  float pattern(vec2 uv, float seed, float time, inout vec2 q, inout vec2 r) {
    q = vec2(fbm1(uv, seed),
             fbm1(uv + vec2(5.2,1.3), seed));
    r = vec2(fbm1(uv + 4.0*q + vec2(1.7 - time/2.,9.2), seed),
             fbm1(uv + 4.0*q + vec2(8.3 - time/2.,2.8), seed));
    vec2 s = vec2(fbm1(uv + 4.0*r + vec2(21.7 - time/2.,90.2), seed),
                  fbm1(uv + 4.0*r + vec2(80.3 - time/2.,20.8), seed));
    vec2 t = vec2(fbm1(uv + 4.0*s + vec2(121.7 - time/2.,90.2), seed),
                  fbm1(uv + 4.0*s + vec2(180.3 - time/2.,20.8), seed));
    return clamp(fbm1(uv + 4.0*t, seed), 0.0, 0.5);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy) / u_resolution.y;
    float time = u_time / 20.0;
    // Just scale UVs slightly, no rotation or translation
    uv = uv * 1.4;


    vec2 q = vec2(0.0), r = vec2(0.0);
    float v = pattern(uv, seed, time, q, r);

    // reconstruct full colour
    vec3 colour = vec3(v);
    float QR = clamp(dot(q, r), -1.0, 1.0);
    colour += vec3(
      (q.x + q.y) + QR * 30.0,
      QR * 15.0,
      r.x * r.y + QR * 5.0
    );
    colour += 0.1;
    colour = clamp(colour, 0.05, 1.0);

    gl_FragColor = vec4(colour + abs(colour)*0.5, 1.0);
  }
`;


function ShaderBackground() {
   const mat = useRef()
   const { size, invalidate, camera } = useThree()
   
   // set initial resolution and camera aspect on mount/resize, then force render
   useLayoutEffect(() => {
     if (!mat.current) return
     mat.current.uniforms.u_resolution.value.set(size.width, size.height)
     camera.aspect = size.width / size.height
     camera.updateProjectionMatrix()
     invalidate()
   }, [size, camera, invalidate])
   
   // update time every frame, accumulating speed multiplier
   useFrame((state, delta) => {
     if (!mat.current) return
     // accumulate custom time scaled by bgSpeed
     mat.current.uniforms.u_time.value += delta * bgSpeed.get()
   })

   return (
     <mesh rotation={[0, 0, 0]} frustumCulled={false}>
       <planeGeometry args={[2, 2]} />
       <shaderMaterial
         ref={mat}
         uniforms={{
           u_time:       { value: 0 },
           u_resolution: { value: new THREE.Vector2(size.width, size.height) }
         }}
         vertexShader={vertexShader}
         fragmentShader={fragmentShader}
       />
     </mesh>
   )
}

function ThreeBackground() {
    return (
      <Canvas
         frameloop="always"
         onCreated={({ gl }) => { gl.domElement.style.touchAction = 'none' }}
         style={{
         position: 'fixed', top: 0, left: 0,
         width: '100%', height: '100%',
         pointerEvents: 'none', touchAction: 'none',
         zIndex: -1
         }}
       gl={{ antialias: true }}
         camera={{ position: [0, 0, 1], fov: 75 }}
       >
      <ShaderBackground />
        {/* nebula clouds for depth and atmosphere */}
      <Cloud
        position={[0, 0, -5]}
        opacity={0.9}
        speed={0.2}
        width={20}
        depth={1}
        segments={20}
      />
      {/* keep your clouds, stars, lights here if you like */}
    </Canvas>
  )
}
// memoize canvas to avoid re-rendering/flipping
export default memo(ThreeBackground)

