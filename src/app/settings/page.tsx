
import dynamic from 'next/dynamic';

const SettingsForm = dynamic(() => import('./components/settings-form'), { ssr: false });

export default function SettingsPage() {
  return (
    <div className="space-y-4">
        <SettingsForm />
    </div>
  );
}
