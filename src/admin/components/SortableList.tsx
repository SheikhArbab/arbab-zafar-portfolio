import type { ReactNode } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props<T extends { id: string }> {
  items: T[]
  onReorder: (items: T[]) => void
  disabled?: boolean
  render: (item: T, handle: ReactNode) => ReactNode
}

export function SortableList<T extends { id: string }>({ items, onReorder, disabled, render }: Props<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    const from = items.findIndex((i) => i.id === e.active.id)
    const to = items.findIndex((i) => i.id === e.over!.id)
    onReorder(arrayMove(items, from, to))
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {items.map((item) => (
            <Row key={item.id} id={item.id} disabled={disabled}>
              {(handle) => render(item, handle)}
            </Row>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function Row({ id, disabled, children }: { id: string; disabled?: boolean; children: (handle: ReactNode) => ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const handle = (
    <button
      type="button"
      className={cn('grid h-8 w-6 shrink-0 place-items-center rounded text-dim hover:text-fg', disabled ? 'cursor-not-allowed opacity-30' : 'cursor-grab active:cursor-grabbing')}
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn('relative', isDragging && 'z-10 opacity-80')}>
      {children(handle)}
    </li>
  )
}
