import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RelayListManager } from '@/components/RelayListManager';
import { useTheme } from '@/hooks/useTheme';
import { useAppContext } from '@/hooks/useAppContext';
import { Moon, Sun, LayoutGrid } from 'lucide-react';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { config, updateConfig } = useAppContext();

  useSeoMeta({
    title: 'Settings - Lumina',
    description: 'Manage your app settings and relay configuration',
  });

  return (
    <Layout>
      <div className="container max-w-2xl py-8 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your preferences and relay configuration
          </p>
        </div>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <Label htmlFor="theme-toggle" className="text-base cursor-pointer">
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LayoutGrid className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="minimal-cards-toggle" className="text-base cursor-pointer">
                    Minimal Cards
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show compact picture-only cards in feed
                  </p>
                </div>
              </div>
              <Switch
                id="minimal-cards-toggle"
                checked={config.preferMinimalCards}
                onCheckedChange={(checked) => 
                  updateConfig((current) => ({ ...current, preferMinimalCards: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Relay Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Relay Configuration</CardTitle>
            <CardDescription>
              Manage your Nostr relay connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RelayListManager />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default Settings;
