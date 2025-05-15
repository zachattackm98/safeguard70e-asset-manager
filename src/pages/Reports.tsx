
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', active: 40, neardue: 8, expired: 4 },
  { month: 'Feb', active: 42, neardue: 9, expired: 3 },
  { month: 'Mar', active: 45, neardue: 7, expired: 2 },
  { month: 'Apr', active: 50, neardue: 5, expired: 1 },
  { month: 'May', active: 48, neardue: 6, expired: 2 },
  { month: 'Jun', active: 52, neardue: 4, expired: 0 },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          View and generate compliance reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              56
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-active">
              92.8%
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tests Due This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-neardue">
              4
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Asset Compliance Status (6 Month Trend)</CardTitle>
          <CardDescription>
            Overview of asset compliance trends for the past 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" name="Active" fill="#22c55e" />
                <Bar dataKey="neardue" name="Near Due" fill="#f59e0b" />
                <Bar dataKey="expired" name="Expired" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tests</CardTitle>
            <CardDescription>
              Assets requiring testing in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-4 py-2">Asset</th>
                  <th scope="col" className="px-4 py-2">Serial</th>
                  <th scope="col" className="px-4 py-2">Next Test</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-card border-b hover:bg-muted/50">
                  <td className="px-4 py-2">Class 0 Gloves</td>
                  <td className="px-4 py-2">GL-2023-491</td>
                  <td className="px-4 py-2">2025-05-25</td>
                </tr>
                <tr className="bg-card border-b hover:bg-muted/50">
                  <td className="px-4 py-2">Safety Harness</td>
                  <td className="px-4 py-2">SH-2022-312</td>
                  <td className="px-4 py-2">2025-05-27</td>
                </tr>
                <tr className="bg-card border-b hover:bg-muted/50">
                  <td className="px-4 py-2">Insulating Blanket</td>
                  <td className="px-4 py-2">IB-2024-019</td>
                  <td className="px-4 py-2">2025-06-03</td>
                </tr>
                <tr className="bg-card hover:bg-muted/50">
                  <td className="px-4 py-2">FR Clothing Set</td>
                  <td className="px-4 py-2">FR-2023-187</td>
                  <td className="px-4 py-2">2025-06-12</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Expired Assets</CardTitle>
            <CardDescription>
              Assets with overdue testing requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted">
                <tr>
                  <th scope="col" className="px-4 py-2">Asset</th>
                  <th scope="col" className="px-4 py-2">Serial</th>
                  <th scope="col" className="px-4 py-2">Due Date</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-card border-b hover:bg-muted/50">
                  <td className="px-4 py-2">Hot Stick</td>
                  <td className="px-4 py-2">HS-2022-223</td>
                  <td className="px-4 py-2">2025-05-01</td>
                  <td className="px-4 py-2 text-status-expired">14 days overdue</td>
                </tr>
                <tr className="bg-card hover:bg-muted/50">
                  <td className="px-4 py-2">Voltage Detector</td>
                  <td className="px-4 py-2">VD-2023-118</td>
                  <td className="px-4 py-2">2025-04-22</td>
                  <td className="px-4 py-2 text-status-expired">23 days overdue</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
