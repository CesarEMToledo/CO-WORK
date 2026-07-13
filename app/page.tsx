import { Suspense } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Home } from "@/components/Home";

export default function Page() {
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <Home />
      </Suspense>
    </>
  );
}
