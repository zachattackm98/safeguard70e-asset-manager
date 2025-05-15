
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const AssetNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    classification: '',
    issueDate: '',
    lastTestDate: '',
    nextTestDate: '',
    status: 'active',
    assignedTo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication error',
        description: 'You must be logged in to create an asset.',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([
          {
            name: formData.name,
            serial_number: formData.serialNumber,
            classification: formData.classification,
            issue_date: formData.issueDate,
            last_test_date: formData.lastTestDate,
            next_test_date: formData.nextTestDate,
            status: formData.status,
            assigned_to: formData.assignedTo || null,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Asset created',
        description: 'The asset has been successfully added.',
      });
      
      // Navigate to the asset detail page
      navigate(`/assets/${data.id}`);
    } catch (error: any) {
      console.error('Error creating asset:', error);
      toast({
        variant: 'destructive',
        title: 'Error creating asset',
        description: error.message || 'Could not create the asset.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Asset</h1>
        <p className="text-muted-foreground">
          Add a new safety equipment asset to the system.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="E.g., Rubber Insulating Gloves"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  placeholder="E.g., SN12345678"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classification">Classification</Label>
                <Input
                  id="classification"
                  name="classification"
                  placeholder="E.g., Class 0, Type I"
                  value={formData.classification}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="neardue">Near Due</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="issueDate">Issue Date</Label>
                <Input
                  id="issueDate"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastTestDate">Last Test Date</Label>
                <Input
                  id="lastTestDate"
                  name="lastTestDate"
                  type="date"
                  value={formData.lastTestDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nextTestDate">Next Test Date</Label>
                <Input
                  id="nextTestDate"
                  name="nextTestDate"
                  type="date"
                  value={formData.nextTestDate}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To (Optional)</Label>
                <Input
                  id="assignedTo"
                  name="assignedTo"
                  placeholder="User ID"
                  value={formData.assignedTo}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/assets')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Asset'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AssetNew;
