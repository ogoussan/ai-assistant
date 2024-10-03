'use client';
import { LEFT_PANEL, RIGHT_PANEL } from "@/constants/storage-keys";
import { PropsWithChildren, ReactNode, useCallback, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { FileExplorer } from "./file-explorer/file-explorer";
import { useUser } from "@stackframe/stack";
import { ChatHistory } from "./chat-history";

interface containerStatus {
    leftPanelOpened: boolean,
    rightPanelOpened: boolean,
}

interface ContentContainerProps {
    children: ReactNode,
    isAuthenticated?: boolean,
    containerClassName?: string,
}

const ContentContainer = ({ children, isAuthenticated, containerClassName = "flex flex-1 w-screen justify-between" }: ContentContainerProps) => {
    const [status, setStatus] = useState<containerStatus>({
        leftPanelOpened
            : localStorage.getItem(LEFT_PANEL) === 'true',
        rightPanelOpened: localStorage.getItem(RIGHT_PANEL) === 'true',
    });

    const user = useUser();

    const toggleLeftPanel = useCallback(() => {
        setStatus(({ leftPanelOpened
            , ...rest }) => {
            localStorage.setItem(LEFT_PANEL, (!leftPanelOpened).toString());

            return {
                ...rest,
                leftPanelOpened
                    : !leftPanelOpened,
            }
        })
    }, [status.leftPanelOpened]);

    const toggleRightPanel = useCallback(() => {
        setStatus(({ rightPanelOpened, ...rest }) => {
            localStorage.setItem(RIGHT_PANEL, (!rightPanelOpened).toString());

            return {
                ...rest,
                rightPanelOpened: !rightPanelOpened,
            }
        })
    }, [status.rightPanelOpened]);

    console.log("authenticated: ", isAuthenticated)

    return (
        <div className="flex flex-col justify-between items-center h-screen">
            <Header 
                toggleLeftPanel={toggleLeftPanel} 
                toggleRightPanel={toggleRightPanel}
                showItems={isAuthenticated}
            />
            <div className={containerClassName}>
                {status.leftPanelOpened && isAuthenticated && (
                    <Sidebar>
                        <ChatHistory />
                    </Sidebar>
                )}
                {children}
                {status.rightPanelOpened && isAuthenticated && user && (
                    <Sidebar>
                        <FileExplorer userId={user.id} />
                    </Sidebar>
                )}
            </div>
        </div>
    )
}

export default ContentContainer;