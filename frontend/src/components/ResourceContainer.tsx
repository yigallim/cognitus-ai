import { MemoryStick, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const monitorResources = [
    {
        name: "RAM Usage",
        metric: "/2GB",
        icon: MemoryStick,
    },
    {
        name: "CPU Utilization",
        metric: "%",
        icon: Cpu,
    },
];

type currentMetricProps = {
    name: string;
    value: string;
}

function ResourceContainer({ currentMetric, isConnected }: { currentMetric: currentMetricProps[]; isConnected: boolean }) {
    const maxBars = 60;
    let ramBars, cpuBars = 0;
    if (isConnected) {
        // Calculate the number of bars for CPU and RAM usage
        ramBars = Math.round(parseFloat(currentMetric.find((metric) => metric.name === "RAM Usage")?.value || "0") * maxBars / 2);
        cpuBars = Math.round(parseFloat(currentMetric.find((metric) => metric.name === "CPU Utilization")?.value || "0") * maxBars / 100);
    }

    const metricBars = [
        { name: "RAM Usage", bar: ramBars },
        { name: "CPU Utilization", bar: cpuBars }
    ];

    return (
        <>
            <div className="flex flex-col gap-1 pb-3">
                <p className={cn("text-base font-medium text-foreground", isConnected ? "" : "mb-0 pt-0")}>
                    Cognitus Resource Monitor
                </p>
                {!isConnected && (
                    <span className="text-sm font-medium py-0 text-amber-500">
                        Connecting...
                    </span>
                )}
            </div>

            <div className={cn("flex flex-col gap-4 pb-3", isConnected ? "" : "opacity-50")}>
                {monitorResources.map((resource) => (
                    <div key={resource.name} className="flex gap-3 items-center min-w-0">
                        <div className="w-fit h-fit border border-muted rounded-lg p-3 ">
                            <resource.icon className="w-4 h-4 " />
                        </div>
                        <div className="grow flex flex-col gap-1 min-w-0">
                            <div className="grow flex justify-between items-center">
                                <p className="text-sm font-medium truncate text-[var(--foreground)]">
                                    {resource.name}
                                </p>
                                {isConnected && (
                                    <p className="text-muted-secondary text-sm font-normal whitespace-nowrap ml-2">
                                        {currentMetric.find((metric) => metric.name === resource.name)?.value}
                                        {resource.metric}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-[1px]">
                                {[...Array(metricBars.find(bar => bar.name === resource.name)?.bar || 0)].map((_, index) => (
                                    <div
                                        key={index}
                                        className="w-[3px] h-3 transition-all duration-100 bg-green-500"
                                    ></div>
                                ))}

                                {[...Array(maxBars - (metricBars.find(bar => bar.name === resource.name)?.bar || 0))].map((_, index) => (
                                    <div
                                        key={index}
                                        className="w-[3px] h-3 transition-all duration-100 bg-muted"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col justify-between gap-2 pt-1">
                <Button className="w-full border border-gray-300" disabled={!isConnected}>Reboot</Button>
                <Button className="w-full bg-gray-50 text-black border border-gray-300 hover:bg-gray-100">
                    Reset
                </Button>
            </div>
        </>
    );
}

export default ResourceContainer;