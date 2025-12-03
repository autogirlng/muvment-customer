import { ReactNode, useState } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import cn from "classnames";

type Props = {
    title: string | ReactNode;
    openText: string | ReactNode;
    closeText: string | ReactNode;
    children: ReactNode;
    isDefaultOpen?: boolean;
    className?: string;
};

const Collapse = ({
    title,
    openText,
    closeText,
    children,
    isDefaultOpen = false,
    className,
}: Props) => {
    const [open, setOpen] = useState<boolean>(isDefaultOpen || false);

    return (
        <Collapsible.Root
            open={open}
            onOpenChange={setOpen}
            className={cn("space-y-2", className)}
        >
            <div className="flex justify-between items-center">
                {title}

                <Collapsible.Trigger asChild>
                    <button className="">{open ? openText : closeText}</button>
                </Collapsible.Trigger>
            </div>

            <Collapsible.Content className="space-y-3">
                {children}
            </Collapsible.Content>
        </Collapsible.Root>
    );
};

export default Collapse;
