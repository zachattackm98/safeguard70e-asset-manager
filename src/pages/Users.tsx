
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load user data.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage all users in the system.
          </CardDescription>
          <div className="mt-4 flex justify-between items-center">
            <Input
              placeholder="Search users..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button>Invite User</Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Role</th>
                    <th scope="col" className="px-6 py-3">Joined</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className="bg-card border-b hover:bg-muted/50">
                      <td className="px-6 py-4 font-medium">
                        {user.name}
                      </td>
                      <td className="px-6 py-4">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No users match your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
