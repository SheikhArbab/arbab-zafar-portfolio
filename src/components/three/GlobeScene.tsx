import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useInViewFrameloop } from './ThreeSlot'

export interface GlobePoint {
  lat: number
  lon: number
  label: string
}

interface Props {
  from: GlobePoint
  to: GlobePoint
  accent: string
  accent2: string
}

const R = 1.55

function toVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat)
  const theta = THREE.MathUtils.degToRad(lon + 180)
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

function Graticule({ color }: { color: string }) {
  const geo = useMemo(() => {
    const pts: number[] = []
    const seg = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z)
    for (let lat = -75; lat <= 75; lat += 15) {
      for (let lon = -180; lon < 180; lon += 5) seg(toVec(lat, lon), toVec(lat, lon + 5))
    }
    for (let lon = -180; lon < 180; lon += 20) {
      for (let lat = -85; lat < 85; lat += 5) seg(toVec(lat, lon), toVec(lat + 5, lon))
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
    </lineSegments>
  )
}

function Marker({ point, color }: { point: GlobePoint; color: string }) {
  const ring = useRef<THREE.Mesh>(null)
  const pos = useMemo(() => toVec(point.lat, point.lon, R * 1.005), [point])
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize()), [pos])
  useFrame((state) => {
    if (!ring.current) return
    const t = (state.clock.elapsedTime * 0.6) % 1
    ring.current.scale.setScalar(1 + t * 2.2)
    ;(ring.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t)
  })
  return (
    <group position={pos} quaternion={quat}>
      <mesh>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring}>
        <ringGeometry args={[0.05, 0.065, 40]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={2.2} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <span className="block -translate-y-5 whitespace-nowrap rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px]" style={{ color }}>
          {point.label}
        </span>
      </Html>
    </group>
  )
}

function Arc({ from, to, accent, accent2 }: Props) {
  const packet = useRef<THREE.Mesh>(null)
  const curve = useMemo(() => {
    const a = toVec(from.lat, from.lon).normalize()
    const b = toVec(to.lat, to.lon).normalize()
    const pts = Array.from({ length: 64 }, (_, i) => {
      const t = i / 63
      const v = new THREE.Vector3().copy(a).lerp(b, t).normalize()
      return v.multiplyScalar(R * (1 + 0.32 * Math.sin(Math.PI * t)))
    })
    return new THREE.CatmullRomCurve3(pts)
  }, [from, to])
  const points = useMemo(() => curve.getPoints(80), [curve])
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.25) % 1
    packet.current?.position.copy(curve.getPoint(t))
  })
  return (
    <group>
      <Line points={points} color={accent} lineWidth={1.6} transparent opacity={0.85} />
      <Line points={points} color={accent2} lineWidth={5} transparent opacity={0.12} />
      <mesh ref={packet}>
        <sphereGeometry args={[0.03, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

function Globe(props: Props) {
  const group = useRef<THREE.Group>(null)
  // Yaw then pitch (no roll) so the middle of the route faces the camera with north up.
  const base = useMemo(() => {
    const mid = toVec(props.from.lat, props.from.lon).normalize().add(toVec(props.to.lat, props.to.lon).normalize()).normalize()
    const yaw = -Math.atan2(mid.x, mid.z)
    const z = Math.hypot(mid.x, mid.z)
    const pitch = Math.atan2(mid.y, z) - 0.12
    return new THREE.Euler(pitch, yaw, 0, 'XYZ')
  }, [props.from, props.to])
  const dots = useMemo(() => {
    const n = 1400
    const golden = Math.PI * (3 - Math.sqrt(5))
    const arr = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      arr.set([Math.cos(golden * i) * r * R, y * R, Math.sin(golden * i) * r * R], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [])
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = base.y + Math.sin(state.clock.elapsedTime * 0.25) * 0.22
  })
  return (
    <group ref={group} rotation={base}>
      {/* solid core hides the back half of the grid */}
      <mesh>
        <sphereGeometry args={[R * 0.99, 48, 48]} />
        <meshBasicMaterial color="#05090a" transparent opacity={0.92} />
      </mesh>
      <points geometry={dots}>
        <pointsMaterial color={props.accent2} size={0.012} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
      </points>
      <Graticule color={props.accent2} />
      <Arc {...props} />
      <Marker point={props.from} color={props.accent} />
      <Marker point={props.to} color={props.accent2} />
    </group>
  )
}

export default function GlobeScene(props: Props) {
  const { ref, visible } = useInViewFrameloop()
  return (
    <div ref={ref} className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 1.75]} camera={{ position: [0, 0, 4.4], fov: 42 }} gl={{ antialias: true, alpha: true }} aria-hidden>
        <Globe {...props} />
        <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} rotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
