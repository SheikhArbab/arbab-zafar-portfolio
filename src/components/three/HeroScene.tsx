import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { AdaptiveDpr, Float, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'

/**
 * "The Core": a wireframe compute core wrapped in a node network,
 * orbit rings carrying data packets, and a quiet particle field.
 * Everything is procedural, so there are no models or textures to download.
 */

interface SceneProps {
  accent: string
  accent2: string
  lite?: boolean
}

// Global pointer so the scene reacts even though text sits on top of the canvas.
const pointer = { x: 0, y: 0 }
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

function Core({ accent, accent2 }: SceneProps) {
  const group = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.LineSegments>(null)
  const outer = useRef<THREE.LineSegments>(null)

  const shellGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.2, 1)), [])
  const outerGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.75, 0)), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.55, 0.04)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -pointer.y * 0.35, 0.04)
    if (shell.current) shell.current.rotation.y += dt * 0.18
    if (outer.current) {
      outer.current.rotation.y -= dt * 0.08
      outer.current.rotation.z += dt * 0.05
    }
    if (inner.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.035
      inner.current.scale.setScalar(s)
      inner.current.rotation.y -= dt * 0.25
    }
  })

  return (
    <group ref={group}>
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.72, 2]} />
        <meshStandardMaterial color="#07110c" emissive={accent} emissiveIntensity={0.22} roughness={0.3} metalness={0.9} flatShading />
      </mesh>
      <lineSegments ref={shell} geometry={shellGeo}>
        <lineBasicMaterial color={accent} transparent opacity={0.85} />
      </lineSegments>
      <lineSegments ref={outer} geometry={outerGeo}>
        <lineBasicMaterial color={accent2} transparent opacity={0.28} />
      </lineSegments>
    </group>
  )
}

function Network({ accent, accent2, lite }: SceneProps) {
  const ref = useRef<THREE.Group>(null)
  const { points, lines } = useMemo(() => {
    const count = lite ? 70 : 140
    const radius = 2.75
    const pts: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = golden * i
      const jitter = 1 + (Math.sin(i * 12.9898) * 0.5 + 0.5) * 0.22
      pts.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius * jitter))
    }
    const positions = new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]))
    const segs: number[] = []
    const max = lite ? 0.95 : 0.82
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < max) segs.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z)
      }
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs), 3))
    return { points: pGeo, lines: lGeo }
  }, [lite])

  useFrame((_, dt) => {
    if (!ref.current) return
    ref.current.rotation.y += dt * 0.04
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pointer.y * 0.15, 0.03)
  })

  return (
    <group ref={ref}>
      <points geometry={points}>
        <pointsMaterial color={accent} size={0.045} sizeAttenuation transparent opacity={0.9} depthWrite={false} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={accent2} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

function Orbit({ radius, tilt, speed, color, offset = 0 }: { radius: number; tilt: [number, number, number]; speed: number; color: string; offset?: number }) {
  const packet = useRef<THREE.Mesh>(null)
  const trail = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    const t = state.clock.elapsedTime * speed + offset
    packet.current?.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0)
    trail.current?.position.set(Math.cos(t - 0.12) * radius, Math.sin(t - 0.12) * radius, 0)
  })
  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.004, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <mesh ref={packet}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={trail}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  )
}

function Particles({ color, count }: { color: string; count: number }) {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 22
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12 - 3
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={color} size={0.025} sizeAttenuation transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

function Rig() {
  useFrame((state) => {
    const cam = state.camera
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, pointer.x * 0.45, 0.03)
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, pointer.y * 0.3, 0.03)
    cam.lookAt(0, 0, 0)
  })
  return null
}

export default function HeroScene({ accent, accent2, lite = false }: SceneProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)
  const [dpr, setDpr] = useState<[number, number]>(lite ? [1, 1.25] : [1, 1.75])

  // Pause rendering when the hero is scrolled out of view or the tab is hidden.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 })
    io.observe(el)
    const onVis = () => setVisible(!document.hidden && el.getBoundingClientRect().bottom > 0)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={dpr}
        camera={{ position: [0, 0, 7.2], fov: 45 }}
        gl={{ antialias: !lite, alpha: true, powerPreference: 'high-performance' }}
        aria-hidden
      >
        <PerformanceMonitor onDecline={() => setDpr([1, 1])} />
        <AdaptiveDpr pixelated={false} />
        <ambientLight intensity={0.35} />
        <pointLight position={[4, 3, 4]} intensity={30} color={accent} />
        <pointLight position={[-4, -2, 3]} intensity={18} color={accent2} />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
          <Core accent={accent} accent2={accent2} />
          <Orbit radius={2.1} tilt={[1.2, 0.2, 0]} speed={0.6} color={accent} />
          <Orbit radius={2.45} tilt={[0.4, -0.7, 0.3]} speed={-0.42} color={accent2} offset={2} />
          {!lite && <Orbit radius={1.55} tilt={[-0.9, 0.5, 0.2]} speed={0.85} color={accent2} offset={4} />}
        </Float>
        <Network accent={accent} accent2={accent2} lite={lite} />
        <Particles color={accent2} count={lite ? 350 : 900} />
        <Rig />
      </Canvas>
    </div>
  )
}
