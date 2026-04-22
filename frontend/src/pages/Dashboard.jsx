import { Card, CardContent } from "@/components/ui/card";

function Dashboard() {
  return (
    <div>
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Cards Grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Revenue Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Total Revenue</h2>
            <p className="text-2xl font-bold mt-2">₹50,000</p>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Pending</h2>
            <p className="text-2xl font-bold mt-2 text-yellow-500">₹10,000</p>
          </CardContent>
        </Card>

        {/* Overdue Card */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Overdue</h2>
            <p className="text-2xl font-bold mt-2 text-red-500">₹5,000</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default Dashboard;