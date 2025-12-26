import { ShareSettings as ShareSettingsType } from '../types';

interface ShareSettingsProps {
  settings: ShareSettingsType;
  onChange: (settings: ShareSettingsType) => void;
}

export const ShareSettings = ({ settings, onChange }: ShareSettingsProps) => {
  const handleChange = (field: keyof ShareSettingsType, value: string | number) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="share-settings">
      <h3>Share Settings</h3>
      <div className="settings-grid">
        <div className="setting-group">
          <label>Expiration</label>
          <select
            value={settings.expiration}
            onChange={(e) => handleChange('expiration', e.target.value)}
          >
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="never">Never Expire</option>
          </select>
        </div>
        <div className="setting-group">
          <label>Privacy</label>
          <select
            value={settings.privacy}
            onChange={(e) => handleChange('privacy', e.target.value)}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="password">Password Protected</option>
          </select>
        </div>
        <div className="setting-group">
          <label>Max Views</label>
          <input
            type="number"
            min="1"
            value={settings.maxViews}
            onChange={(e) => handleChange('maxViews', parseInt(e.target.value) || 100)}
            placeholder="Unlimited"
          />
        </div>
      </div>
      {settings.privacy === 'password' && (
        <div className="setting-group" style={{ marginTop: '1rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={settings.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Enter password"
          />
        </div>
      )}
    </div>
  );
};

