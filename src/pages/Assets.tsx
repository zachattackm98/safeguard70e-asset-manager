
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAssets } from '@/utils/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Assets = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [classificationFilter, setClassificationFilter] = useState<string>('all');

  // Get unique classifications for filter
  const classifications = Array.from(
    new Set(mockAssets.map((asset) => asset.classification))
  );

  // Filter assets based on user role, search term, and filters
  const filteredAssets = mockAssets.filter((asset) => {
    // For technicians, show only their assigned assets
    if (user?.role === 'technician' && asset.assignedTo !== user.id) {
      return false;
    }

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
            {filteredAssets.length === 0 && (
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
