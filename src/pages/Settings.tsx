import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Save, Shield, Sliders, Wifi } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import { useToast } from '../components/toastContext';
import { USDT_TO_BDT_RATE } from '../components/ui';
import { defaultAppSettings, type AppSettings } from '../store/appSettings';
import { useStore } from '../store/useStore';

type SettingsTab = 'general' | 'payments' | 'networks' | 'security';

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10';

const Settings = () => {
  const { showToast } = useToast();
  const appSettings = useStore((state) => state.appSettings);
  const setAppSettings = useStore((state) => state.setAppSettings);
  const [settings, setSettings] = useState<AppSettings>(() => appSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [resetOpen, setResetOpen] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(appSettings),
    [appSettings, settings],
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  const handleSave = () => {
    setAppSettings(settings);
    showToast('Settings saved');
  };

  const handleRevert = () => {
    setSettings(appSettings);
    showToast('Changes reverted', 'info');
  };

  const stats = useMemo(() => {
    const networksEnabled = Number(settings.networks.trc20Enabled) + Number(settings.networks.erc20Enabled) + Number(settings.networks.bep20Enabled);
    return {
      networksEnabled,
      autoConfirm: settings.payments.autoConfirm ? 'On' : 'Off',
      sessionTimeout: `${settings.security.sessionTimeout}m`,
      rateLimit: `${settings.security.rateLimitPerMinute}/min`,
    };
  }, [settings]);

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-40"
              disabled={!dirty}
              onClick={handleRevert}
              type="button"
            >
              <RefreshCcw size={16} />
              Revert
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-rose-400/20 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
              onClick={() => setResetOpen(true)}
              type="button"
            >
              <RefreshCcw size={16} />
              Reset Defaults
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-40"
              disabled={!dirty}
              onClick={handleSave}
              type="button"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        }
        breadcrumbs={['CryptoGate', 'Settings']}
        description="Frontend-only configuration panels with enterprise-style validation and change tracking."
        title="Settings"
      />

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wifi} subtitle="Enabled networks" title="Networks" tone="cyan" value={stats.networksEnabled} />
        <StatCard icon={Sliders} subtitle="Payments automation" title="Auto Confirm" tone="blue" value={stats.autoConfirm} />
        <StatCard icon={Shield} subtitle="Session duration" title="Session Timeout" tone="violet" value={stats.sessionTimeout} />
        <StatCard icon={Shield} subtitle="Security throttling" title="Rate Limit" tone="amber" value={stats.rateLimit} />
      </section>

      <Tabs
        ariaLabel="Settings tabs"
        items={[
          { value: 'general', label: 'General' },
          { value: 'payments', label: 'Payments' },
          { value: 'networks', label: 'Networks' },
          { value: 'security', label: 'Security' },
        ]}
        onChange={(value) => setActiveTab(value as SettingsTab)}
        value={activeTab}
      />

      <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-5">
        {activeTab === 'general' && (
          <Section title="General">
            <Field label="Site Name">
              <input className={inputClass} onChange={(event) => setSettings({ ...settings, general: { ...settings.general, siteName: event.target.value } })} value={settings.general.siteName} />
            </Field>
            <Field label="Site URL">
              <input className={inputClass} onChange={(event) => setSettings({ ...settings, general: { ...settings.general, siteUrl: event.target.value } })} value={settings.general.siteUrl} />
            </Field>
            <Field label="Support Email">
              <input className={inputClass} onChange={(event) => setSettings({ ...settings, general: { ...settings.general, supportEmail: event.target.value } })} type="email" value={settings.general.supportEmail} />
            </Field>
            <Field label="Timezone">
              <select className={inputClass} onChange={(event) => setSettings({ ...settings, general: { ...settings.general, timezone: event.target.value } })} value={settings.general.timezone}>
                {['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Europe/Berlin', 'Asia/Dhaka', 'Asia/Tokyo'].map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Display Currency">
              <select
                className={inputClass}
                onChange={(event) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, displayCurrency: event.target.value as AppSettings['general']['displayCurrency'] },
                  })
                }
                value={settings.general.displayCurrency}
              >
                <option value="USD">USD ($)</option>
                <option value="USDT">USDT</option>
                <option value="BDT">BDT (Taka)</option>
              </select>
              <p className="mt-2 text-xs text-slate-500">FX (mock): 1 USDT = {USDT_TO_BDT_RATE} BDT</p>
            </Field>
          </Section>
        )}

        {activeTab === 'payments' && (
          <Section title="Payments">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Min Deposit ($)">
                <input className={inputClass} min={0} onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, minDeposit: Number(event.target.value) } })} type="number" value={settings.payments.minDeposit} />
              </Field>
              <Field label="Max Deposit ($)">
                <input className={inputClass} min={0} onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, maxDeposit: Number(event.target.value) } })} type="number" value={settings.payments.maxDeposit} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Deposit Timeout (minutes)">
                <input className={inputClass} min={1} onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, depositTimeout: Number(event.target.value) } })} type="number" value={settings.payments.depositTimeout} />
              </Field>
              <Field label="Callback Retries">
                <input className={inputClass} min={0} onChange={(event) => setSettings({ ...settings, payments: { ...settings.payments, callbackRetries: Number(event.target.value) } })} type="number" value={settings.payments.callbackRetries} />
              </Field>
            </div>
            <ToggleRow
              description="Automatically marks deposits as completed when confirmations are satisfied."
              enabled={settings.payments.autoConfirm}
              label="Auto Confirm"
              onChange={(enabled) => setSettings({ ...settings, payments: { ...settings.payments, autoConfirm: enabled } })}
            />
          </Section>
        )}

        {activeTab === 'networks' && (
          <Section title="Networks">
            <NetworkCard
              enabled={settings.networks.trc20Enabled}
              fee={settings.networks.trc20Fee}
              label="TRC20"
              onChange={(next) => setSettings({ ...settings, networks: { ...settings.networks, trc20Enabled: next } })}
              onFeeChange={(fee) => setSettings({ ...settings, networks: { ...settings.networks, trc20Fee: fee } })}
              onRequiredChange={(value) => setSettings({ ...settings, networks: { ...settings.networks, trc20Confirmations: value } })}
              required={settings.networks.trc20Confirmations}
            />
            <NetworkCard
              enabled={settings.networks.erc20Enabled}
              fee={settings.networks.erc20Fee}
              label="ERC20"
              onChange={(next) => setSettings({ ...settings, networks: { ...settings.networks, erc20Enabled: next } })}
              onFeeChange={(fee) => setSettings({ ...settings, networks: { ...settings.networks, erc20Fee: fee } })}
              onRequiredChange={(value) => setSettings({ ...settings, networks: { ...settings.networks, erc20Confirmations: value } })}
              required={settings.networks.erc20Confirmations}
            />
            <NetworkCard
              enabled={settings.networks.bep20Enabled}
              fee={settings.networks.bep20Fee}
              label="BEP20"
              onChange={(next) => setSettings({ ...settings, networks: { ...settings.networks, bep20Enabled: next } })}
              onFeeChange={(fee) => setSettings({ ...settings, networks: { ...settings.networks, bep20Fee: fee } })}
              onRequiredChange={(value) => setSettings({ ...settings, networks: { ...settings.networks, bep20Confirmations: value } })}
              required={settings.networks.bep20Confirmations}
            />
          </Section>
        )}

        {activeTab === 'security' && (
          <Section title="Security">
            <ToggleRow
              description="Require two-factor authentication for privileged actions."
              enabled={settings.security.twoFactorRequired}
              label="Require 2FA"
              onChange={(enabled) => setSettings({ ...settings, security: { ...settings.security, twoFactorRequired: enabled } })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Session Timeout (minutes)">
                <input className={inputClass} min={1} onChange={(event) => setSettings({ ...settings, security: { ...settings.security, sessionTimeout: Number(event.target.value) } })} type="number" value={settings.security.sessionTimeout} />
              </Field>
              <Field label="Max Login Attempts">
                <input className={inputClass} min={1} onChange={(event) => setSettings({ ...settings, security: { ...settings.security, maxLoginAttempts: Number(event.target.value) } })} type="number" value={settings.security.maxLoginAttempts} />
              </Field>
              <Field label="Rate Limit (per minute)">
                <input className={inputClass} min={1} onChange={(event) => setSettings({ ...settings, security: { ...settings.security, rateLimitPerMinute: Number(event.target.value) } })} type="number" value={settings.security.rateLimitPerMinute} />
              </Field>
            </div>
            <Field label="IP Whitelist (comma separated)">
              <textarea
                className={`${inputClass} h-24 resize-none font-mono`}
                onChange={(event) => setSettings({ ...settings, security: { ...settings.security, ipWhitelist: event.target.value } })}
                placeholder="192.168.1.100, 10.0.0.1"
                value={settings.security.ipWhitelist}
              />
            </Field>
          </Section>
        )}
      </div>

      <ConfirmDialog
        confirmLabel="Reset"
        isOpen={resetOpen}
        message="Reset settings to defaults? This will discard any unsaved changes."
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          setSettings(defaultAppSettings);
          setAppSettings(defaultAppSettings);
          setResetOpen(false);
          showToast('Settings reset', 'info');
        }}
        title="Reset Settings"
        tone="warning"
      />
    </PageContainer>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <div>
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
    <div className="grid grid-cols-1 gap-4">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
    {children}
  </label>
);

const ToggleRow = ({ label, description, enabled, onChange }: { label: string; description: string; enabled: boolean; onChange: (next: boolean) => void }) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        aria-pressed={enabled}
        className={`relative h-7 w-12 rounded-full border transition ${enabled ? 'border-cyan-400/30 bg-cyan-400/20' : 'border-slate-700 bg-slate-900'}`}
        onClick={() => onChange(!enabled)}
        type="button"
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white/90 transition ${enabled ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  </div>
);

const NetworkCard = ({
  label,
  enabled,
  required,
  fee,
  onChange,
  onRequiredChange,
  onFeeChange,
}: {
  label: string;
  enabled: boolean;
  required: number;
  fee: number;
  onChange: (next: boolean) => void;
  onRequiredChange: (next: number) => void;
  onFeeChange: (next: number) => void;
}) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-slate-500">Mock network configuration</p>
      </div>
      <button
        aria-pressed={enabled}
        className={`relative h-7 w-12 rounded-full border transition ${enabled ? 'border-cyan-400/30 bg-cyan-400/20' : 'border-slate-700 bg-slate-900'}`}
        onClick={() => onChange(!enabled)}
        type="button"
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white/90 transition ${enabled ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Required Confirmations">
        <input className={inputClass} disabled={!enabled} min={0} onChange={(event) => onRequiredChange(Number(event.target.value))} type="number" value={required} />
      </Field>
      <Field label="Fee ($)">
        <input className={inputClass} disabled={!enabled} min={0} onChange={(event) => onFeeChange(Number(event.target.value))} step="0.1" type="number" value={fee} />
      </Field>
    </div>
  </div>
);

export default Settings;
