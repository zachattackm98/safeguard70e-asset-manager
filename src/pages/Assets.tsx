
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';

const Assets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [classifications, setClassifications] = useState<string[]>([]);
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
          
          // Extract unique classifications for filter
          const uniqueClassifications = Array.from(
            new Set(data.map((asset) => asset.classification))
          );
          
          setClassifications(uniqueClassifications);
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

    fetchAssets();
  }, [user, toast]);

  // Filter assets based on search term, status filter, and classification filter
  const filteredAssets = assets.filter((asset) => {
    // Apply status filter
    if (statusFilter !== 'all' && asset.status !== statusFilter) {
      return false;
    }

    // Apply classification filter
    if (classificationFilter !== 'all' && asset.classification !== classificationFilter) {
      return false;
    }

    // Apply search filter
    return (
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-muted-foreground">
            Manage and view all safety equipment assets.
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button asChild>
            <Link to="/assets/new">Add New Asset</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Asset Inventory</CardTitle>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="w-full md:w-auto">
                <Input
                  placeholder="Search by name or serial"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="w-full md:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="neardue">Near Due</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-auto">
                <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classifications</SelectItem>
                    {classifications.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Serial Number</th>
                  <th scope="col" className="px-6 py-3">Classification</th>
                  <th scope="col" className="px-6 py-3">Next Test</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="bg-card border-b hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4">{asset.serialNumber}</td>
                    <td className="px-6 py-4">{asset.classification}</td>
                    <td className="px-6 py-4">{asset.nextTestDate}</td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          asset.status === 'active'
                            ? 'bg-status-active'
                            : asset.status === 'neardue'
                            ? 'bg-status-neardue'
                            : 'bg-status-expired'
                        }
                      >
                        {asset.status === 'active'
                          ? 'Active'
                          : asset.status === 'neardue'
                          ? 'Near Due'
                          : 'Expired'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/assets/${asset.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAssets.length === 0 && !isLoading && (
              <div className="text-center py-4 text-muted-foreground">
                No assets found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Assets;
