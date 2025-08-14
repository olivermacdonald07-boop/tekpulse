"use client";

import { ProtectedLayout } from "@/components/layout/protected-layout";

export default function CampusMapPage() {
  return (
    <ProtectedLayout>
      <div className="h-full">
        <iframe
          src="https://virtualtour.knust.edu.gh/"
          className="w-full h-screen border-0"
          title="KNUST Virtual Tour"
        />
      </div>
    </ProtectedLayout>
  );
}
