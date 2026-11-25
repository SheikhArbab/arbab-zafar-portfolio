import { useEffect, useMemo, useState } from 'react'
import { Archive, ArchiveRestore, Mail, MailOpen, Reply, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { requireSupabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import type { ContactMessage, MessageStatus } from '@/types/content'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState, PageHeader } from '../components/PageHeader'
import { SingletonEditor } from '../components/SingletonEditor'
import { useConfirm } from '../components/Confirm'

type Filter = 'inbox' | 'unread' | 'archived' | 'all'

function NotificationSettings() {
  const [open, setOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const test = async () => {
    setTesting(true)
    try {
      const { data } = await requireSupabase().auth.getSession()
      const res = await fetch('/api/notify-test', { method: 'POST', headers: { Authorization: `Bearer ${data.session?.access_token}` } })
      const body = (await res.json().catch(() => ({}))) as { error?: string; to?: string; provider?: string }
      if (!res.ok) throw new Error(body.error || `Failed (${res.status})`)
      toast.success(`Test email sent to ${body.to} via ${body.provider}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setTesting(false)
    }
  }
  return (
    <div className="mb-6">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 font-mono text-xs text-muted hover:text-accent" aria-expanded={open}>
        <Mail className="h-3.5 w-3.5" /> {open ? '▾' : '▸'} email notifications
      </button>
      {open && (
        <div className="mt-3">
          <SingletonEditor
            table="private_settings"
            groups={[
              {
                title: 'Email notifications',
                description: 'Every new contact message is emailed here (reply-to = the sender). Private: never visible to visitors.',
                fields: [
                  { name: 'notify_email', label: 'Send new messages to', type: 'email', placeholder: 'you@gmail.com' },
                  { name: 'notify_enabled', label: 'Email me for every new message', type: 'switch' },
                ],
              },
            ]}
            footer={
              <div className="-mt-3 flex flex-wrap items-center gap-3">
                <Button variant="outline" size="sm" onClick={test} disabled={testing}>
                  {testing ? <Spinner /> : <Mail className="h-3.5 w-3.5" />} Send test email
                </Button>
                <p className="text-xs text-dim">Requires GMAIL_USER + GMAIL_APP_PASSWORD (or RESEND_API_KEY) in Netlify; see README.</p>
              </div>
            }
          />
        </div>
      )}
    </div>
  )
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [filter, setFilter] = useState<Filter>('inbox')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const confirm = useConfirm()

  useEffect(() => {
    requireSupabase()
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) toast.error(error.message)
        setMessages((data ?? []) as ContactMessage[])
      })
  }, [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (messages ?? []).filter((m) => {
      if (filter === 'inbox' && m.status === 'archived') return false
      if (filter === 'unread' && m.status !== 'unread') return false
      if (filter === 'archived' && m.status !== 'archived') return false
      return !q || [m.name, m.email, m.subject, m.message].join(' ').toLowerCase().includes(q)
    })
  }, [messages, filter, query])

  const current = messages?.find((m) => m.id === selected) ?? null

  const setStatus = async (m: ContactMessage, status: MessageStatus) => {
    setMessages((ms) => ms!.map((x) => (x.id === m.id ? { ...x, status } : x)))
    const { error } = await requireSupabase().from('contact_messages').update({ status }).eq('id', m.id)
    if (error) toast.error(error.message)
  }

  const open = (m: ContactMessage) => {
    setSelected(m.id)
    if (m.status === 'unread') void setStatus(m, 'read')
  }

  const remove = async (m: ContactMessage) => {
    if (!(await confirm({ title: 'Delete this message?', description: `From ${m.name} <${m.email}>` }))) return
    const { error } = await requireSupabase().from('contact_messages').delete().eq('id', m.id)
    if (error) return toast.error(error.message)
    setMessages((ms) => ms!.filter((x) => x.id !== m.id))
    setSelected(null)
    toast.success('Message deleted')
  }

  if (!messages)
    return (
      <div className="flex justify-center py-24 text-muted">
        <Spinner className="h-5 w-5" />
      </div>
    )

  const counts = {
    inbox: messages.filter((m) => m.status !== 'archived').length,
    unread: messages.filter((m) => m.status === 'unread').length,
    archived: messages.filter((m) => m.status === 'archived').length,
    all: messages.length,
  }

  return (
    <div>
      <PageHeader title="Messages" description="Submissions from the contact form. Opening a message marks it as read." />
      <NotificationSettings />
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="flex gap-1 rounded-lg border border-line p-1">
          {(['inbox', 'unread', 'archived', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('rounded-md px-3 py-1.5 font-mono text-xs capitalize', filter === f ? 'bg-accent text-black' : 'text-muted hover:text-fg')}
            >
              {f} <span className="opacity-60">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-dim" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, subject, message…" className="pl-9" aria-label="Search messages" />
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState title="No messages here" description="New contact form submissions will appear in the inbox." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
          <ul className={cn('space-y-1.5', current && 'max-lg:hidden')}>
            {list.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => open(m)}
                  className={cn(
                    'w-full rounded-xl border p-3 text-left transition-colors',
                    selected === m.id ? 'border-accent/40 bg-accent/[0.05]' : 'border-line hover:border-line-strong',
                  )}
                >
                  <div className="flex items-center gap-2">
                    {m.status === 'unread' && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                    <span className={cn('truncate text-sm', m.status === 'unread' ? 'font-semibold text-white' : 'text-fg')}>{m.name}</span>
                    <span className="ml-auto shrink-0 font-mono text-[0.62rem] text-dim">{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-fg">{m.subject}</p>
                  <p className="mt-0.5 truncate text-xs text-dim">{m.message}</p>
                </button>
              </li>
            ))}
          </ul>

          {current ? (
            <article className="rounded-2xl border border-line bg-white/[0.015]">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line p-5">
                <div className="min-w-0">
                  <button onClick={() => setSelected(null)} className="mb-2 font-mono text-xs text-muted hover:text-accent lg:hidden">
                    ← back
                  </button>
                  <h2 className="text-lg font-semibold break-words text-white">{current.subject}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {current.name} · <span className="font-mono text-xs text-accent-2">{current.email}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-[0.65rem] text-dim">{new Date(current.created_at).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <a
                    href={`mailto:${encodeURIComponent(current.email)}?subject=${encodeURIComponent('Re: ' + current.subject)}`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-medium text-black"
                  >
                    <Reply className="h-3.5 w-3.5" /> Reply
                  </a>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(current, current.status === 'unread' ? 'read' : 'unread')}>
                    {current.status === 'unread' ? <MailOpen className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                    {current.status === 'unread' ? 'Mark read' : 'Mark unread'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setStatus(current, current.status === 'archived' ? 'read' : 'archived')}>
                    {current.status === 'archived' ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                    {current.status === 'archived' ? 'Restore' : 'Archive'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(current)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </header>
              {/* Rendered as text, never as HTML */}
              <p className="p-5 text-sm leading-relaxed break-words whitespace-pre-wrap text-fg">{current.message}</p>
            </article>
          ) : (
            <div className="hidden items-center justify-center rounded-2xl border border-dashed border-line-strong text-sm text-dim lg:flex">Select a message</div>
          )}
        </div>
      )}
    </div>
  )
}
