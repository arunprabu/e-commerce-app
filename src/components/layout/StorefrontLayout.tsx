import { Outlet } from "react-router-dom";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontFooter } from "./StorefrontFooter";

export function StorefrontLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <StorefrontHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <StorefrontFooter />
    </div>
  );
}
