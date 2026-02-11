// DO NOT MODIFY THIS FILE
import { ReactNode } from "react";

interface PhoneFrameProps {
    children: ReactNode;
    width?: number;
    height?: number;
}

export function PhoneFrame({
    children,
    width = 375,
    height = 812
}: PhoneFrameProps) {
    return (
        <div id="phone-frame-container" className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 overflow-hidden">
            <div
                className="bg-white dark:bg-black shadow-2xl rounded-[3rem] border-[8px] border-zinc-900 overflow-hidden relative"
                style={{
                    width: width,
                    height: height,
                }}
            >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-zinc-900 rounded-b-2xl z-50" />

                {children}
            </div>
        </div>
    );
}
