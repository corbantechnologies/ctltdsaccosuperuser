import SuperuserNavbar from "@/components/superuser/Navbar";
import React from "react";

function SuperuserLayout({ children }) {
  return (
    <div className="superuser-theme min-h-screen bg-slate-50">
      <SuperuserNavbar />
      <main className="p-6">{children}</main>
    </div>
  );
}

export default SuperuserLayout;
