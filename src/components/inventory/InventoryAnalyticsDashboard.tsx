import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useInventoryIntegration } from "@/hooks/useInventoryIntegration";
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

const InventoryAnalyticsDashboard = () => {
  const { inventory } = useInventoryIntegration();

  // Calculate analytics
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => 
    item.current_quantity > 0 && item.current_quantity <= item.min_threshold
  ).length;
  const outOfStockItems = inventory.filter(item => item.current_quantity === 0).length;
  const totalValue = inventory.reduce((sum, item) => 
    sum + (item.current_quantity * item.cost_per_unit), 0
  );

  const categoryStats = inventory.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0, lowStock: 0 };
    }
    acc[category].count++;
    acc[category].value += item.current_quantity * item.cost_per_unit;
    if (item.current_quantity <= item.min_threshold) {
      acc[category].lowStock++;
    }
    return acc;
  }, {} as Record<string, { count: number; value: number; lowStock: number }>);

  const getStockHealthColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const stockHealth = ((totalItems - lowStockItems - outOfStockItems) / totalItems) * 100;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStockHealthColor(stockHealth)}`}>
              {stockHealth.toFixed(1)}%
            </div>
            <Progress value={stockHealth} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems + lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryStats).map(([category, stats]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {stats.count} items
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      ${stats.value.toFixed(0)}
                    </span>
                    {stats.lowStock > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {stats.lowStock} low
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Stock Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Well Stocked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {totalItems - lowStockItems - outOfStockItems}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({((totalItems - lowStockItems - outOfStockItems) / totalItems * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Low Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-yellow-600">
                    {lowStockItems}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(lowStockItems / totalItems * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Out of Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-red-600">
                    {outOfStockItems}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(outOfStockItems / totalItems * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventory Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Most Active Categories</h4>
              <div className="space-y-1">
                {Object.entries(categoryStats)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 3)
                  .map(([category, stats]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <Badge variant="secondary">{stats.count} items</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">High Value Categories</h4>
              <div className="space-y-1">
                {Object.entries(categoryStats)
                  .sort((a, b) => b[1].value - a[1].value)
                  .slice(0, 3)
                  .map(([category, stats]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <Badge variant="secondary">${stats.value.toFixed(0)}</Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Categories Needing Attention</h4>
              <div className="space-y-1">
                {Object.entries(categoryStats)
                  .filter(([, stats]) => stats.lowStock > 0)
                  .sort((a, b) => b[1].lowStock - a[1].lowStock)
                  .slice(0, 3)
                  .map(([category, stats]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category}</span>
                      <Badge variant="destructive">{stats.lowStock} low</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryAnalyticsDashboard;