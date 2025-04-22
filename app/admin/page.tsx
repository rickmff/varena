import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DashboardPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to your dashboard! Here you can manage your content.</p>
          <div className="mt-4">
            <Button className="mr-2">Add New Content</Button>
            <Button variant="secondary">View All Content</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
