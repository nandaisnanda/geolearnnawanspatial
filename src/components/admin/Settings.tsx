
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Settings as SettingsIcon, Key, User, Save } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Password Updated!",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Password Change Failed",
        description: error.message || "There was an error changing your password.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-geo-accent flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Admin Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Manage your admin account settings and preferences.
          </p>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Username</label>
              <Input value={profile?.username || ''} disabled />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input value={profile?.full_name || ''} disabled />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Input value={profile?.role || ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium mb-2 block">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={isChangingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="bg-gradient-to-r from-geo-accent to-geo-highlight hover:from-geo-accent/90 hover:to-geo-highlight/90 text-black"
            >
              <Save className="h-4 w-4 mr-2" />
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="glass-effect glow-border">
        <CardHeader>
          <CardTitle className="text-lg">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Platform:</span>
              <span className="ml-2 text-muted-foreground">GeoLearn Admin</span>
            </div>
            <div>
              <span className="font-medium">Version:</span>
              <span className="ml-2 text-muted-foreground">1.0.0</span>
            </div>
            <div>
              <span className="font-medium">Last Login:</span>
              <span className="ml-2 text-muted-foreground">
                {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium">Account Created:</span>
              <span className="ml-2 text-muted-foreground">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
