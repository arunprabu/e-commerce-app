import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

interface Options extends Omit<RenderOptions, "wrapper"> {
  /** Initial history entry, e.g. "/cart". Defaults to "/". */
  route?: string;
}

// Renders a component inside a MemoryRouter so router-aware components
// (Link, useNavigate, useParams) work without a real browser history.
export function renderWithRouter(ui: ReactElement, { route = "/", ...options }: Options = {}) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
