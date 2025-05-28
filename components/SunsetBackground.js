"use client";

import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ———— original noise/fbm/pattern utilities ————
const random2 = /* glsl */`
  vec2 random2(vec2 st, float seed){
    st = vec2(dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)));
    return -1.0 + 2.0 * fract(sin(st) * seed);
  }
`;
const noise2 = /* glsl */`
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
`;
const fbm1 = /* glsl */`
  float fbm1(in vec2 _st, float seed) {
    float v = 0.0, a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for(int i = 0; i < 6; ++i){
      v += a * noise(_st, seed);
      _st = rot * _st * 2.0 + shift;
      a *= 0.4;
    }
    return v;
  }
`;
const patternFn = /* glsl */`
  float pattern(vec2 uv, float seed, float time, out vec2 q, out vec2 r) {
    q = vec2(fbm1(uv, seed),
             fbm1(uv + vec2(5.2,1.3), seed));
    r = vec2(fbm1(uv + 4.0*q + vec2(1.7 - time/2.0,9.2), seed),
             fbm1(uv + 4.0*q + vec2(8.3 - time/2.0,2.8), seed));
    vec2 s = vec2(fbm1(uv + 4.0*r + vec2(21.7 - time/2.0,90.2), seed),
                  fbm1(uv + 4.0*r + vec2(80.3 - time/2.0,20.8), seed));
    vec2 t = vec2(fbm1(uv + 4.0*s + vec2(121.7 - time/2.0,90.2), seed),
                  fbm1(uv + 4.0*s + vec2(180.3 - time/2.0,20.8), seed));
    return clamp(fbm1(uv + 4.0*t, seed), 0.0, 0.5);
  }
`;

// ———— Nguyen2007 fractal + palette modulation ————
const vertexShader = /* glsl */`
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;

  ${random2}
  ${noise2}
  ${fbm1}
  ${patternFn}

  // exact Nguyen2007 fractal loop (flashes at half speed)
  void mainImage(out vec4 o, vec2 u) {
    vec2 v = uResolution.xy;
         u = .2 * (u + u - v) / v.y;
    o = vec4(1.0, 2.0, 3.0, 0.0);
    vec4 z = o;
    for (float a = .5, t = uTime * 0.5, i; ++i < 19.0; ) {
      o += (1.0 + cos(z + t)) /
           length((1.0 + i * dot(v, v)) *
                  sin(1.5 * u / (.5 - dot(u, u)) - 9.0 * u.yx + t));
      v = cos(++t - 7.0 * u * pow(a += .03, i)) - 5.0 * u;
      u += tanh(40.0 * dot(u *= mat2(
                    cos(i + .02 * t),
                    sin(i + .02 * t),
                    -sin(i + .02 * t),
                    cos(i + .02 * t)
                  ), u)
                  * cos(100.0 * u.yx + t)
                ) / 200.0
         + .2 * a * u
         + cos(4.0 / exp(dot(o, o) / 100.0) + t) / 300.0;
    }
    o = 25.6 / (min(o, 13.0) + 164.0 / o) - dot(u, u) / 250.0;
  }

  void main() {
    // 1) raw fractal brightness (slow flashes)
    vec4 raw;
    mainImage(raw, gl_FragCoord.xy);
    float b = raw.r;

    // 2) palette vectors (fast bg movement)
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
    float tBg = uTime * 0.1;
    vec2 q, r;
    pattern(uv, 43758.5453123, tBg, q, r);

    // 3) reconstruct your original palette
    float QR = clamp(dot(q, r), -1.0, 1.0);
    vec3 c = vec3(
      (q.x + q.y) + QR * 30.0,
      QR * 15.0,
      r.x * r.y + QR * 5.0
    );
    // clamp palette alone, no ambient lift
    c = clamp(c, 0.0, 1.0);

    // 4) modulate fully by brightness → black background where b≈0
    c *= b;

    // 5) slight saturation boost, clamp to avoid clipping
    c *= 1.4;
    c = clamp(c, 0.0, 1.0);

    gl_FragColor = vec4(c, 1.0);
  }
`;

function ShaderMesh() {
  const mat = useRef();
  const { size, camera, invalidate } = useThree();

  useLayoutEffect(() => {
    if (!mat.current) return;
    mat.current.uniforms.uResolution.value.set(size.width, size.height);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size, camera, invalidate]);

  useFrame(({ clock }) => {
    if (mat.current) {
      mat.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime:       { value: 0 },
          uResolution: { value: new THREE.Vector2(size.width, size.height) }
        }}
      />
    </mesh>
  );
}

export default function CleanNguyenBackground() {
  return (
    <Canvas
      frameloop="always"
      onCreated={({ gl }) => (gl.domElement.style.touchAction = 'none')}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
      }}
      gl={{ antialias: true }}
      camera={{ position: [0, 0, 1], fov: 75 }}
    >
      <ShaderMesh />
    </Canvas>
  );
}
