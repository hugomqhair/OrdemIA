"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

type OverviewChartProps = {
  data: {
    status: string;
    value: number;
    fill: string;
  }[];
}

const chartConfig = {
  value: {
    label: "Orçamentos",
  },
  Abertos: {
    label: "Abertos",
    color: "hsl(var(--chart-1))",
  },
  Aceitos: {
    label: "Aceitos",
    color: "hsl(var(--chart-2))",
  },
  Finalizados: {
    label: "Finalizados",
    color: "hsl(var(--color-finalized))",
  },
  Recusados: {
    label: "Recusados",
    color: "hsl(var(--color-refused))",
  },
} satisfies ChartConfig

export function OverviewChart({ data }: OverviewChartProps) {
  return (
     <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-headline">Visão Geral</CardTitle>
        <CardDescription>Resumo dos orçamentos por status.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <style>
                {`
                :root {
                    --color-open: hsl(214 90% 65%);
                    --color-accepted: hsl(120 60% 70%);
                    --color-finalized: hsl(262 80% 75%);
                    --color-refused: hsl(0 84% 60%);
                }
                .dark {
                    --color-open: hsl(214 80% 65%);
                    --color-accepted: hsl(120 50% 60%);
                    --color-finalized: hsl(262 70% 65%);
                    --color-refused: hsl(0 70% 55%);
                }
                `}
            </style>
          <BarChart data={data} accessibilityLayer>
            <XAxis
              dataKey="status"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
