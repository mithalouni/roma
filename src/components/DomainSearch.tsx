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
    <Card>
      <CardHeader>
        <CardTitle>Domain Lookup</CardTitle>
        <CardDescription>
          Search Doma's on-chain registry to inspect ownership, listings, and offers for any tokenized domain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="e.g. greenekazakh1991.ai"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Search
          </button>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter a full domain name (including the TLD) to view complete details on a dedicated page.
        </p>
      </CardContent>
    </Card>
  )
}
