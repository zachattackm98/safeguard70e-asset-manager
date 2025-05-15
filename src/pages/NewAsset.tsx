
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const NewAsset = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    classification: 'Class 00',
    issueDate: '',
    lastTestDate: '',
    nextTestDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For now, just show a success toast and navigate back
    // In a real implementation, this would save to a database
    toast({
      title: "Asset Created",
      description: `Asset ${formData.name} was created successfully.`,
    });
    
    navigate('/assets');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add New Asset</h1>
          <p className="text-muted-foreground">
            Create a new safety asset in the system.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/assets')}>
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asset Information</CardTitle>
          <CardDescription>
            Enter the details for the new safety asset.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input
                  id="serialNumber"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="classification">Classification</Label>
                <Select 
                  value={formData.classification}
                  onValueChange={(value) => handleSelectChange('classification', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 00">Class 00</SelectItem>
                    <SelectItem value="Class 0">Class 0</SelectItem>
                    <SelectItem value="Class 1">Class 1</SelectItem>
                    <SelectItem value="Class 2">Class 2</SelectItem>
                    <SelectItem value="Class 3">Class 3</SelectItem>
                    <SelectItem value="Class 4">Class 4</SelectItem>
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
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
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit">Create Asset</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAsset;
