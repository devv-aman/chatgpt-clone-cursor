import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthContext, type AuthContextType } from "@/providers/AuthProvider";

interface AllProvidersProps {
  children: ReactNode;
  authValue?: Partial<AuthContextType>;
}

const defaultAuthValue: AuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  register: async () => ({ confirmationRequired: false }),
  logout: async () => {},
  checkAuth: async () => {},
};

function AllProviders({ children, authValue }: AllProvidersProps) {
  const mergedAuthValue = { ...defaultAuthValue, ...authValue };

  return (
    <ThemeProvider defaultTheme="light">
      <AuthContext.Provider value={mergedAuthValue}>
        <BrowserRouter>{children}</BrowserRouter>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  authValue?: Partial<AuthContextType>;
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const { authValue, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders authValue={authValue}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { customRender as render };
export { defaultAuthValue };
