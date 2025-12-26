import { TrendingDown, TrendingUp, DollarSign, Users, Package, Activity } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const stats = [
  {
    title: "Revenu Total",
    value: "$12,450.00",
    description: "vs le mois dernier",
    trend: "+12.5%",
    trendUp: true,
    icon: DollarSign,
  },
  {
    title: "Nouveaux Engins",
    value: "+45",
    description: "ces 30 derniers jours",
    trend: "+18%",
    trendUp: true,
    icon: Package,
  },
  {
    title: "Personnel Actif",
    value: "1,234",
    description: "vs le mois dernier",
    trend: "-3%",
    trendUp: false,
    icon: Users,
  },
  {
    title: "Taux d'Utilisation",
    value: "89.2%",
    description: "performance moyenne",
    trend: "+5.4%",
    trendUp: true,
    icon: Activity,
  },
]

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="overflow-hidden border-border/50 bg-card/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge
                variant={stat.trendUp ? "success" : "destructive"}
                className={stat.trendUp ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/10"}
              >
                {stat.trendUp ? <TrendingUp className="mr-1 h-3 w-3" /> : <TrendingDown className="mr-1 h-3 w-3" />}
                {stat.trend}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

