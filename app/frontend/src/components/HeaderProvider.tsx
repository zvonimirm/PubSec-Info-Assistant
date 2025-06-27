import { createContext, useContext, useState, ReactNode } from "react";

interface HeaderContextType {
  showHeader: boolean;
  setShowHeader: (value: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [showHeader, setShowHeader] = useState(false);

  return (
    <HeaderContext.Provider value={{ showHeader, setShowHeader }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useHeader must be used within a HeaderProvider");
  }
  return context;
};
