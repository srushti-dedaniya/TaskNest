export default function Placeholder({ title, note }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface font-sans text-primary">
      <div className="rounded-lg bg-secondary-container px-6 py-4 text-center">
        <h1 className="font-display text-xl font-semibold">{title}</h1>
        {note ? <p className="mt-2 text-sm text-secondary">{note}</p> : null}
      </div>
    </div>
  )
}
