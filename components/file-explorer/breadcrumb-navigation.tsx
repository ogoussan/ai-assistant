import { Fragment } from "react";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "../ui/breadcrumb";

interface BreadcrumbNavigationProps {
  navigationFolderStack: any[];
  displayStatus: string;
  clearSelectedItems: () => void;
  navigateToFolderAtIndex: (index: number) => void;
}

const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  navigationFolderStack,
  displayStatus,
  clearSelectedItems,
  navigateToFolderAtIndex
}) => {
  return (
    <div className="bg-muted mr-4 px-2 rounded-md">
      <Breadcrumb>
        <BreadcrumbList>
          {navigationFolderStack.map((folder, index) => (
            <Fragment key={folder.path}>
              <BreadcrumbItem className="cursor-pointer" onClick={() => {
                if (index + 1 !== navigationFolderStack.length) {
                  if (displayStatus !== 'move') {
                    clearSelectedItems();
                  }
                  navigateToFolderAtIndex(index);
                }
              }}>
                {index === navigationFolderStack.length - 1 ? (
                  <BreadcrumbPage>
                    <small>
                      <b>{folder?.name}</b>
                    </small>
                  </BreadcrumbPage>
                ) : (
                  <small>{folder?.name}</small>
                )}
              </BreadcrumbItem>
              {index < navigationFolderStack.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default BreadcrumbNavigation;