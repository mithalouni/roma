import { useState, useEffect } from 'react'
import { Bell, Trash2, Edit, Save, X, Mail, Calendar, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'
import { supabase, type UserAlert } from '../lib/supabase'

interface AlertsTabProps {
  walletAddress: string
}

export function AlertsTab({ walletAddress }: AlertsTabProps) {
  const [alerts, setAlerts] = useState<UserAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    track_favorites: false,
    track_my_domains: false,
    track_trends: false,
    track_other: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
  })
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', message: string} | null>(null)

  useEffect(() => {
    loadAlerts()
  }, [walletAddress])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_alerts')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlerts(data || [])
    } catch (error) {
      console.error('Error loading alerts:', error)
      setSaveStatus({ type: 'error', message: 'Failed to load alerts' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaveStatus(null)
      setSaving(true)

      // Validate at least one option is selected
      if (!formData.track_favorites && !formData.track_my_domains && !formData.track_trends && !formData.track_other) {
        setSaveStatus({ type: 'error', message: 'Please select at least one alert type' })
        setSaving(false)
        return
      }

      if (!formData.email) {
        setSaveStatus({ type: 'error', message: 'Please enter your email address' })
        setSaving(false)
        return
      }

      // Calculate next send time
      const now = new Date()
      const nextSend = new Date(now)
      if (formData.frequency === 'daily') {
        nextSend.setDate(nextSend.getDate() + 1)
      } else if (formData.frequency === 'weekly') {
        nextSend.setDate(nextSend.getDate() + 7)
      } else {
        nextSend.setMonth(nextSend.getMonth() + 1)
      }

      const alertData = {
        wallet_address: walletAddress,
        email: formData.email,
        track_favorites: formData.track_favorites,
        track_my_domains: formData.track_my_domains,
        track_trends: formData.track_trends,
        track_other: formData.track_other || null,
        frequency: formData.frequency,
        next_send_at: nextSend.toISOString(),
        active: true,
      }

      if (editingId) {
        // Update existing alert
        const { error } = await supabase
          .from('user_alerts')
          .update(alertData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        // Create new alert
        const { error } = await supabase
          .from('user_alerts')
          .insert([alertData])

        if (error) throw error

        // Trigger immediate email by calling the edge function
        await triggerImmediateEmail(walletAddress, formData.email, formData)
      }

      setSaveStatus({ type: 'success', message: editingId ? 'Alert updated successfully!' : 'Alert created! Check your email.' })
      setShowNewForm(false)
      setEditingId(null)
      setFormData({
        email: '',
        track_favorites: false,
        track_my_domains: false,
        track_trends: false,
        track_other: '',
        frequency: 'weekly',
      })
      await loadAlerts()
    } catch (error) {
      console.error('Error saving alert:', error)
      setSaveStatus({ type: 'error', message: 'Failed to save alert. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const triggerImmediateEmail = async (wallet: string, email: string, preferences: typeof formData) => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      const response = await fetch(`${supabaseUrl}/functions/v1/send-domain-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          wallet_address: wallet,
          email,
          preferences,
          immediate: true,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Edge function error:', errorText)
        throw new Error('Failed to send immediate email')
      }
    } catch (error) {
      console.error('Error sending immediate email:', error)
      // Don't throw - the alert is still saved
    }
  }

  const handleEdit = (alert: UserAlert) => {
    setEditingId(alert.id)
    setShowNewForm(true)
    setFormData({
      email: alert.email,
      track_favorites: alert.track_favorites,
      track_my_domains: alert.track_my_domains,
      track_trends: alert.track_trends,
      track_other: alert.track_other || '',
      frequency: alert.frequency,
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return

    try {
      const { error } = await supabase
        .from('user_alerts')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadAlerts()
      setSaveStatus({ type: 'success', message: 'Alert deleted successfully' })
    } catch (error) {
      console.error('Error deleting alert:', error)
      setSaveStatus({ type: 'error', message: 'Failed to delete alert' })
    }
  }

  const handleCancel = () => {
    setShowNewForm(false)
    setEditingId(null)
    setFormData({
      email: '',
      track_favorites: false,
      track_my_domains: false,
      track_trends: false,
      track_other: '',
      frequency: 'weekly',
    })
    setSaveStatus(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {saveStatus && (
        <div className={`p-4 rounded-lg border ${
          saveStatus.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {saveStatus.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <p className="text-black dark:text-white font-medium">
              {saveStatus.message}
            </p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Domain Recommendation Alerts
          </CardTitle>
          <CardDescription>
            Get personalized domain recommendations delivered to your email based on your preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showNewForm && alerts.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Alerts Set Up</h3>
              <p className="text-muted-foreground mb-4">
                Create your first alert to receive AI-powered domain recommendations
              </p>
              <button
                onClick={() => setShowNewForm(true)}
                className="px-6 py-3 bg-[#163C6D] text-white rounded-lg hover:bg-[#1a4a85] transition-colors font-medium"
              >
                Create Alert
              </button>
            </div>
          )}

          {showNewForm && (
            <div className="space-y-6 border rounded-lg p-6 bg-muted/30">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  What to track? *
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.track_favorites}
                      onChange={(e) => setFormData({ ...formData, track_favorites: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">My Favorites</p>
                      <p className="text-sm text-muted-foreground">Get updates on your favorited domains</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.track_my_domains}
                      onChange={(e) => setFormData({ ...formData, track_my_domains: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">My Domains</p>
                      <p className="text-sm text-muted-foreground">Track performance of domains you own</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.track_trends}
                      onChange={(e) => setFormData({ ...formData, track_trends: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">Market Trends</p>
                      <p className="text-sm text-muted-foreground">Discover trending domains and keywords</p>
                    </div>
                  </label>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={!!formData.track_other}
                      onChange={(e) => {
                        if (!e.target.checked) {
                          setFormData({ ...formData, track_other: '' })
                        }
                      }}
                      className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="flex-1">
                      <p className="font-medium mb-2">Other (Custom)</p>
                      <input
                        type="text"
                        value={formData.track_other}
                        onChange={(e) => setFormData({ ...formData, track_other: e.target.value })}
                        placeholder="e.g., crypto, AI, DeFi keywords..."
                        className="w-full px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Delivery Frequency *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <label
                      key={freq}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.frequency === freq
                          ? 'border-[#163C6D] bg-[#163C6D] text-white font-bold'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[#163C6D]/50 font-medium'
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={freq}
                        checked={formData.frequency === freq}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                        className="sr-only"
                      />
                      <Calendar className="w-4 h-4" />
                      <span className="capitalize">{freq}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#163C6D] text-white rounded-lg hover:bg-[#1a4a85] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingId ? 'Update Alert' : 'Create Alert & Send Now'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showNewForm && alerts.length > 0 && (
            <>
              <div className="space-y-4 mb-6">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{alert.email}</span>
                          {alert.active && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-[#CDEFD8] text-black font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span className="capitalize">{alert.frequency}</span>
                          {alert.next_send_at && (
                            <span>" Next: {new Date(alert.next_send_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(alert)}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                          title="Edit alert"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(alert.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title="Delete alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {alert.track_favorites && (
                        <span className="px-2 py-1 text-xs rounded bg-[#E6EEFF] text-black font-medium">
                          Favorites
                        </span>
                      )}
                      {alert.track_my_domains && (
                        <span className="px-2 py-1 text-xs rounded bg-[#EFE6FF] text-black font-medium">
                          My Domains
                        </span>
                      )}
                      {alert.track_trends && (
                        <span className="px-2 py-1 text-xs rounded bg-[#E6F7EB] text-black font-medium">
                          Trends
                        </span>
                      )}
                      {alert.track_other && (
                        <span className="px-2 py-1 text-xs rounded bg-[#FFEFD6] text-black font-medium">
                          Custom: {alert.track_other}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowNewForm(true)}
                className="w-full px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors font-medium text-muted-foreground hover:text-primary"
              >
                + Add Another Alert
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
