import { Link } from "react-router-dom";

export function StorefrontFooter() {
  return (
    <footer className="border-t py-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-xs text-muted-foreground">
        <span>
          &copy; {new Date().getFullYear()} ShopEasy &mdash; demo store
        </span>
        <Link to="/admin/login" className="hover:text-foreground">
          Admin
        </Link>
      </div>
    </footer>
  );
}
