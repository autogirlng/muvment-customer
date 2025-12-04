import Icons from "./forms/icons";
import cn from "classnames";

type Props = { className?: string };

export function FullPageSpinner({ className }: Props) {
    return (
        <div
            className={cn(
                "w-full min-h-screen flex justify-center items-center",
                className
            )}
        >
            <div className="animate-spin w-fit *:w-8 *:h-8 text-grey-500">
                {Icons.ic_spinner}
            </div>
        </div>
    );
}

export function Spinner({ className }: Props) {
    return (
        <div
            className={cn("animate-spin w-fit *:w-6 *:h-6 text-grey-500", className)}
        >
            {Icons.ic_spinner}
        </div>
    );
}
