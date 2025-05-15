
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-status-active">Active</Badge>;
    case 'neardue':
      return <Badge className="bg-status-neardue">Near Due</Badge>;
    case 'expired':
      return <Badge className="bg-status-expired">Expired</Badge>;
    default:
      return <Badge className="bg-gray-400">Unknown</Badge>;
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Create query for assets
        let query = supabase
          .from('assets')
          .select(`
            id,
            name,
            serial_number,
            classification,
            issue_date,
            last_test_date,
            next_test_date,
            status,
            assigned_to
          `);
        
        // If user is a technician, only show their assigned assets
        if (user?.role === 'technician') {
          query = query.eq('assigned_to', user.id);
        }
        
        const { data, error } = await query;

        if (error) throw error;
        
        if (data) {
          // Format the asset data to match our Asset type
          const formattedAssets = data.map(asset => ({
            id: asset.id,
            name: asset.name,
            serialNumber: asset.serial_number,
            classification: asset.classification,
            issueDate: new Date(asset.issue_date).toLocaleDateString(),
            lastTestDate: new Date(asset.last_test_date).toLocaleDateString(),
            nextTestDate: new Date(asset.next_test_date).toLocaleDateString(),
            status: asset.status as 'active' | 'neardue' | 'expired',
            assignedTo: asset.assigned_to || '',
            documents: []
          }));
          
          setAssets(formattedAssets);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load assets.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAssets();
    }
  }, [user, toast]);
  
  // Filter assets based on search term
  const filteredAssets = assets.filter(asset => (
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.classification.toLowerCase().includes(searchTerm.toLowerCase())
  ));
  
  // Count assets by status
  const activeAssets = filteredAssets.filter(a => a.status === 'active').length;
  const nearDueAssets = filteredAssets.filter(a => a.status === 'neardue').length;
  const expiredAssets = filteredAssets.filter(a => a.status === 'expired').length;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}. Here's an overview of your assets.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-status-active">
                {activeAssets}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Near Due Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-status-neardue">
                {nearDueAssets}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse h-8 bg-muted rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-status-expired">
                {expiredAssets}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Asset Compliance Status</CardTitle>
          <CardDescription>
            {user?.role === 'admin' 
              ? 'Overview of all assets in the system' 
              : 'Your assigned assets'}
          </CardDescription>
          
          <div className="mt-2">
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="neardue">Near Due</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
              </TabsList>
              
              {['all', 'active', 'neardue', 'expired'].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs uppercase bg-muted">
                        <tr>
                          <th scope="col" className="px-6 py-3">Name</th>
                          <th scope="col" className="px-6 py-3">Serial Number</th>
                          <th scope="col" className="px-6 py-3">Classification</th>
                          <th scope="col" className="px-6 py-3">Last Test</th>
                          <th scope="col" className="px-6 py-3">Next Test</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                          <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAssets
                          .filter(asset => tab === 'all' || asset.status === tab)
                          .map((asset) => (
                            <tr key={asset.id} className="bg-card border-b hover:bg-muted/50">
                              <td className="px-6 py-4 font-medium whitespace-nowrap">
                                {asset.name}
                              </td>
                              <td className="px-6 py-4">{asset.serialNumber}</td>
                              <td className="px-6 py-4">{asset.classification}</td>
                              <td className="px-6 py-4">{asset.lastTestDate}</td>
                              <td className="px-6 py-4">{asset.nextTestDate}</td>
                              <td className="px-6 py-4">
                                <StatusBadge status={asset.status} />
                              </td>
                              <td className="px-6 py-4">
                                <Link 
                                  to={`/assets/${asset.id}`}
                                  className="text-primary hover:underline"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {filteredAssets.filter(asset => tab === 'all' || asset.status === tab).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No assets found
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
