
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Asset, Document } from '@/types/asset';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
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
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (data) {
          // Format the asset data to match our Asset type
          setAsset({
            id: data.id,
            name: data.name,
            serialNumber: data.serial_number,
            classification: data.classification,
            issueDate: new Date(data.issue_date).toLocaleDateString(),
            lastTestDate: new Date(data.last_test_date).toLocaleDateString(),
            nextTestDate: new Date(data.next_test_date).toLocaleDateString(),
            status: data.status as 'active' | 'neardue' | 'expired',
            assignedTo: data.assigned_to || '',
            documents: []
          });
          
          // Fetch documents for this asset
          const { data: documentData, error: documentError } = await supabase
            .from('documents')
            .select('*')
            .eq('asset_id', id);
            
          if (documentError) throw documentError;
          
          if (documentData) {
            const formattedDocuments = documentData.map(doc => ({
              id: doc.id,
              name: doc.name,
              dateUploaded: new Date(doc.date_uploaded).toLocaleDateString(),
              url: doc.url
            }));
            
            setDocuments(formattedDocuments);
            setAsset(prev => prev ? {...prev, documents: formattedDocuments} : null);
          }
        }
      } catch (error) {
        console.error('Error fetching asset:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load asset details.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAsset();
  }, [id, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-status-active">Active</Badge>;
      case 'neardue':
        return <Badge className="bg-status-neardue">Near Due</Badge>;
      case 'expired':
        return <Badge className="bg-status-expired">Expired</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold">Asset not found</h2>
        <p className="text-muted-foreground mt-2">The asset you're looking for doesn't exist or has been removed.</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/assets')}
        >
          Back to Assets
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            {getStatusBadge(asset.status)}
          </div>
          <p className="text-muted-foreground">
            Serial Number: {asset.serialNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/assets')}>
            Back to Assets
          </Button>
          <Button>
            Edit Asset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Classification</h3>
                <p>{asset.classification}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
                <p>{asset.issueDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Test Date</h3>
                <p>{asset.lastTestDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Next Test Date</h3>
                <p>{asset.nextTestDate}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Assigned To</h3>
                <p>{asset.assignedTo || 'Unassigned'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p>{getStatusBadge(asset.status)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documents</span>
                <Button size="sm">Upload Document</Button>
              </CardTitle>
              <CardDescription>
                Documents and certificates for this asset
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">Uploaded on {doc.dateUploaded}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents available for this asset.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Testing History</CardTitle>
              <CardDescription>
                Previous test results and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Detailed test history coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetDetail;
