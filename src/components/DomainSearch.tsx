import type { FormEvent } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

export function DomainSearch() {
  const [inputValue, setInputValue] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = inputValue.trim()
    if (trimmed) {
      navigate(`/domain/${encodeURIComponent(trimmed.toLowerCase())}`)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">Find a domain</CardTitle>
        <CardDescription>
          Look up ownership history, marketplace listings, and outstanding offers for any tokenized domain on Doma.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="text-sm font-medium text-muted-foreground" htmlFor="dashboard-domain-search">
            Domain name
          </label>
          <div className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" aria-hidden />
            <input
              id="dashboard-domain-search"
              className="w-full rounded-full border border-transparent bg-muted/70 py-3 pl-12 pr-6 text-base transition focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              placeholder="e.g. greenekazakh1991.ai"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              aria-label="Search for a domain"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Enter the full domain, including the TLD. Results open in a dedicated detail view with the filters applied.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              Search registry
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
