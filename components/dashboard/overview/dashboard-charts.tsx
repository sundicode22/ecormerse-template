"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type {
  DeliveryPoint,
  RevenueDayPoint,
  StatusPoint,
} from "@/lib/dashboard-stats"

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
  orders: {
    label: "Orders",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

const statusConfig = {
  count: {
    label: "Orders",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const deliveryConfig = {
  pickup: { label: "Pickup", color: "var(--chart-1)" },
  local: { label: "Local DHL", color: "var(--chart-2)" },
  international: { label: "International", color: "var(--chart-3)" },
} satisfies ChartConfig

export function RevenueChart({ data }: { data: RevenueDayPoint[] }) {
  const hasData = data.some((d) => d.revenue > 0 || d.orders > 0)

  if (!hasData) {
    return (
      <EmptyChart message="No revenue in the last 14 days yet." />
    )
  }

  return (
    <ChartContainer config={revenueConfig} className="aspect-auto h-[260px] w-full">
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.28} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={48}
          tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => payload?.[0]?.payload?.label}
              formatter={(value, name) => (
                <div className="flex flex-1 items-center justify-between gap-8">
                  <span className="text-muted-foreground">
                    {name === "revenue" ? "Revenue" : "Orders"}
                  </span>
                  <span className="font-mono font-medium tabular-nums text-foreground">
                    {name === "revenue"
                      ? `$${Number(value).toFixed(2)}`
                      : Number(value)}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="url(#fillRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function OrdersStatusChart({ data }: { data: StatusPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart message="No orders to chart yet." />
  }

  return (
    <ChartContainer config={statusConfig} className="aspect-auto h-[260px] w-full">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
        <YAxis
          dataKey="label"
          type="category"
          width={88}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export function DeliveryChart({ data }: { data: DeliveryPoint[] }) {
  if (data.length === 0) {
    return <EmptyChart message="No delivery data yet." />
  }

  return (
    <ChartContainer
      config={deliveryConfig}
      className="mx-auto aspect-square h-[260px] w-full"
    >
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="type" hideLabel />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="type"
          innerRadius={58}
          outerRadius={90}
          strokeWidth={2}
        >
          {data.map((entry) => (
            <Cell key={entry.type} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="type" />} />
      </PieChart>
    </ChartContainer>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-md bg-muted/60 text-sm text-muted-foreground">
      {message}
    </div>
  )
}
