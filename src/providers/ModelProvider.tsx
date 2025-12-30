import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { CHAT_CONFIG } from "@/pages/Chat/constants";

interface ModelContextType {
  model: string;
  setModel: (model: string) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

interface ModelProviderProps {
  children: ReactNode;
}

export function ModelProvider({ children }: ModelProviderProps) {
  const [model, setModel] = useState<string>(CHAT_CONFIG.DEFAULT_MODEL);

  const value = useMemo(
    () => ({
      model,
      setModel,
    }),
    [model]
  );

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}

export { ModelContext };
export type { ModelContextType };
