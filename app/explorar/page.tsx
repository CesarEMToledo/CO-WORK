import { Suspense } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { ExplorePage } from "@/components/ExplorePage";

export default function Page() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <ExplorePage />
      </Suspense>
    </>
  );
}
