
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Asset } from '@/types/asset';
import { mockAssets } from '@/utils/mockData';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter assets based on user role and search term
  const filteredAssets = mockAssets.filter(asset => {
    // For technicians, show only their assigned assets
    if (user?.role === 'technician' && asset.assignedTo !== user.id) {
      return false;
    }
    
    // Apply search filter
    return (
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.classification.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
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
            <div className="text-2xl font-bold text-status-active">
              {activeAssets}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Near Due Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-neardue">
              {nearDueAssets}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expired Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-expired">
              {expiredAssets}
            </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
