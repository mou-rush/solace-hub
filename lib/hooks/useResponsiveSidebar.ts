import { useEffect, useState } from "react";

export const useResponsiveSidebar = () => {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setExpanded(false);
      } else {
        setExpanded(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    expanded,
    setExpanded,
    mobileOpen,
    setMobileOpen,
    toggleSidebar: () => setExpanded(!expanded),
    toggleMobileSidebar: () => setMobileOpen(!mobileOpen),
    closeMobileSidebar: () => setMobileOpen(false),
  };
};
