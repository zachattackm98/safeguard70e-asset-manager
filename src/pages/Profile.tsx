
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error.message || 'Could not update profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input 
                  id="role" 
                  value={user?.role} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Contact an administrator to change your role.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled>
              Change Password
            </Button>
            <p className="ml-2 text-sm text-muted-foreground">
              Password changes coming soon.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
