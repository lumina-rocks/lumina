import { useSeoMeta } from '@unhead/react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditProfileForm } from '@/components/EditProfileForm';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { User } from 'lucide-react';

export function ProfileSettings() {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Profile Settings - Lumina',
    description: 'Edit your Nostr profile information',
  });

  return (
    <Layout>
      <div className="container max-w-2xl py-8 px-4 space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your Nostr profile information
            </p>
          </div>
        </div>

        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Login Required</CardTitle>
              <CardDescription>
                You need to be logged in to edit your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoginArea className="max-w-60" />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your profile information. Changes will be published to Nostr relays.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EditProfileForm />
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default ProfileSettings;
