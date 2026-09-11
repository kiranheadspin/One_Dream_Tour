import Link from "next/link";
import { TreePalm, Waves } from "lucide-react";

type GoaNavLinkProps = {
  mobile?: boolean;
};

export function GoaNavLink({ mobile = false }: GoaNavLinkProps) {
  return (
    <Link
      href="/road-to-goa"
      data-testid={mobile ? "mobile-road-to-goa-link" : "road-to-goa-link"}
      className={`goa-nav-link ${mobile ? "goa-nav-link--mobile" : "goa-nav-link--desktop"}`}
    >
      <span className="goa-nav-scene" aria-hidden="true">
        <span className="goa-nav-sun" />
        <TreePalm className="goa-nav-palm" strokeWidth={1.8} />
        <Waves className="goa-nav-wave" strokeWidth={1.9} />
      </span>
      <span className="goa-nav-label">Road to Goa</span>
    </Link>
  );
}
