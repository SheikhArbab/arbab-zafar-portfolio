import { useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useInViewFrameloop } from './ThreeSlot'

export interface OrbitNode {
  id: string
  name: string
  cat: number
  featured: boolean
}

interface Props {
  nodes: OrbitNode[]
  colors: string[]
  accent: string
}

const RADIUS = 2.45

/** Evenly spread points on a sphere (golden-angle spiral). */
function fibonacciSphere(n: number, r: number) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: n }, (_, i) => {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const t = golden * i
    return new THREE.Vector3(Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r)
  })
}

function Constellation({ nodes, colors, accent }: Props) {
  const group = useRef<THREE.Group>(null)
  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const [hover, setHover] = useState<string | null>(null)

  // Interleave categories around the sphere so colours mix nicely, then place.
  const placed = useMemo(() => {
    const order = [...nodes].sort((a, b) => a.cat - b.cat)
    const pts = fibonacciSphere(order.length, RADIUS)
    return order.map((n, i) => ({ ...n, pos: pts[(i * 7) % pts.length] }))
  }, [nodes])

  const lines = useMemo(() => {
    const seg: number[] = []
    const col: number[] = []
    const push = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Color, k = 1) => {
      seg.push(a.x, a.y, a.z, b.x, b.y, b.z)
      col.push(c.r * k, c.g * k, c.b * k, c.r * k, c.g * k, c.b * k)
    }
    // Each skill links to its nearest neighbour in the same category (each pair drawn once).
    const seen = new Set<string>()
    placed.forEach((n, i) => {
      let best = -1
      let d = Infinity
      placed.forEach((o, j) => {
        if (i === j || o.cat !== n.cat) return
        const dist = n.pos.distanceTo(o.pos)
        if (dist < d) {
          d = dist
          best = j
        }
      })
      const key = `${Math.min(i, best)}-${Math.max(i, best)}`
      if (best >= 0 && !seen.has(key)) {
        seen.add(key)
        push(n.pos, placed[best].pos, new THREE.Color(colors[n.cat]), 0.55)
      }
    })
    // The core stack connects to the centre.
    placed.filter((n) => n.featured).forEach((n) => push(new THREE.Vector3(), n.pos, new THREE.Color(accent), 0.35))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
    return g
  }, [placed, colors, accent])

  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((state) => {
    // Fade labels on the far side of the sphere so the front stays readable.
    placed.forEach((n, i) => {
      const el = labels.current[i]
      if (!el || !group.current) return
      tmp.copy(n.pos).applyMatrix4(group.current.matrixWorld)
      const facing = tmp.clone().normalize().dot(state.camera.position.clone().normalize())
      el.style.opacity = String(hover === n.id ? 1 : Math.max(0.12, (facing + 0.35) / 1.35))
    })
  })

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.32, 2]} />
        <meshBasicMaterial color={accent} wireframe transparent opacity={0.6} />
      </mesh>
      <lineSegments geometry={lines}>
        <lineBasicMaterial vertexColors transparent opacity={0.55} depthWrite={false} />
      </lineSegments>
      {placed.map((n, i) => {
        const active = hover === n.id
        return (
          <group key={n.id} position={n.pos}>
            <mesh
              scale={active ? 1.8 : 1}
              onPointerOver={(e) => {
                e.stopPropagation()
                setHover(n.id)
              }}
              onPointerOut={() => setHover((h) => (h === n.id ? null : h))}
            >
              <sphereGeometry args={[n.featured ? 0.1 : 0.07, 16, 16]} />
              <meshBasicMaterial color={colors[n.cat]} />
            </mesh>
            <Html center distanceFactor={5.2} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
              <span
                ref={(el) => {
                  labels.current[i] = el
                }}
                className="block translate-y-4 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] text-fg transition-[background] duration-200"
                style={{ background: active ? 'rgb(0 0 0 / 0.6)' : 'transparent', color: active ? colors[n.cat] : undefined }}
              >
                {n.name}
              </span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

export default function SkillsOrbit(props: Props) {
  const { ref, visible } = useInViewFrameloop()
  return (
    <div ref={ref} className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <Canvas frameloop={visible ? 'always' : 'never'} dpr={[1, 1.75]} camera={{ position: [0, 0.4, 8.2], fov: 42 }} gl={{ antialias: true, alpha: true }} aria-hidden>
        <Constellation {...props} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.7} enableDamping dampingFactor={0.08} rotateSpeed={0.55} />
      </Canvas>
    </div>
  )
}
