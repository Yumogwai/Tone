/* "Your AI" — the optional bring-your-own-key settings screen.
   Off by default (Tone uses its calm built-in engine). Turn it on and paste a
   key to get real, unlimited answers. The key stays in this browser and the
   calls go straight to the provider — nothing passes through us. */
import { useState } from 'react'
import { I } from '../../lib/icons'
import { testConnection } from '../../lib/ai/advisor'
import { isAiConfigured, PROVIDER_IDS, PROVIDERS } from '../../lib/ai/settings'
import type { AiProviderId, AiSettings } from '../../lib/ai/settings'

interface Props {
  settings: AiSettings
  onChange: (next: AiSettings) => void
}

export function SettingsView({ settings, onChange }: Props) {
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  const set = (patch: Partial<AiSettings>) => {
    onChange({ ...settings, ...patch })
    setResult(null)
  }
  const pickProvider = (id: AiProviderId) => set({ provider: id, model: PROVIDERS[id].defaultModel })
  const meta = PROVIDERS[settings.provider]
  const ready = isAiConfigured(settings)

  const runTest = async () => {
    setTesting(true)
    setResult(null)
    const r = await testConnection(settings)
    setResult(r)
    setTesting(false)
  }

  return (
    <div className="main-pad">
      <div className="page-head fade-up">
        <h1 className="page-title">Your AI</h1>
        <p className="page-sub">
          By default Tone uses its calm, built-in guidance — no setup, nothing to pay. Add your own AI key for
          real, unlimited answers tuned to your exact situation.
        </p>
      </div>

      <div className="settings-card card fade-up">
        <label className="ai-toggle">
          <span className={'switch' + (settings.enabled ? ' on' : '')} />
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => set({ enabled: e.target.checked })}
            style={{ display: 'none' }}
          />
          <span className="tg-label">
            <b>Use my own AI</b>
            <span>
              {settings.enabled
                ? 'Tone will use the model below to write your safe move.'
                : "Off — Tone uses its built-in guidance (works great, no key needed)."}
            </span>
          </span>
        </label>

        {settings.enabled && (
          <div className="ai-config fade-in">
            <div className="fld">
              <div className="field-label">Provider</div>
              <div className="trait-row">
                {PROVIDER_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className={'opt' + (settings.provider === id ? ' on' : '')}
                    onClick={() => pickProvider(id)}
                  >
                    {PROVIDERS[id].name}
                    {PROVIDERS[id].free && <span className="free-tag">free</span>}
                  </button>
                ))}
              </div>
              <p className="prov-blurb">{meta.blurb}</p>
            </div>

            <div className="fld">
              <div className="field-label">
                API key{' '}
                <a className="key-link" href={meta.keyUrl} target="_blank" rel="noreferrer noopener">
                  {meta.free ? 'Get a free key' : 'Get a key'} <I.arrowRight size={12} style={{ verticalAlign: '-2px' }} />
                </a>
              </div>
              <div className="key-row">
                <input
                  className="soft-input"
                  type={showKey ? 'text' : 'password'}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={meta.keyPlaceholder}
                  value={settings.apiKey}
                  onChange={(e) => set({ apiKey: e.target.value })}
                />
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setShowKey((v) => !v)}>
                  {showKey ? 'Hide' : 'Show'}
                </button>
                {settings.apiKey && (
                  <button className="btn btn-quiet btn-sm" type="button" onClick={() => set({ apiKey: '' })}>
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="fld">
              <div className="field-label">Model</div>
              <input
                className="soft-input"
                spellCheck={false}
                placeholder={meta.defaultModel}
                value={settings.model}
                onChange={(e) => set({ model: e.target.value })}
              />
              <p className="prov-blurb">
                Default is <b>{meta.defaultModel}</b>. Change it if your provider renames models.
              </p>
            </div>

            <div className="fld">
              <button
                className="btn btn-soft btn-sm"
                type="button"
                disabled={!ready || testing}
                onClick={runTest}
              >
                {testing ? (
                  <>
                    <I.sparkle size={14} /> Testing…
                  </>
                ) : (
                  <>
                    <I.check size={14} /> Test connection
                  </>
                )}
              </button>
              {result && (
                <div className={'ai-status ' + (result.ok ? 'ok' : 'err')}>
                  {result.ok ? <I.check size={14} /> : <I.x size={14} />} {result.message}
                </div>
              )}
            </div>
          </div>
        )}

        <p className="disclosure">
          <I.shield size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
          Your key stays in this browser only. When AI is on, your question and answers go directly from your
          browser to {settings.enabled ? meta.name : 'your chosen provider'} — never through us (Tone has no
          server). Turn it off any time to go back to fully on-device, built-in guidance.
        </p>
      </div>
    </div>
  )
}
