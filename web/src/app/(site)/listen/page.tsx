import type { Metadata } from "next";
import { ListenPanel } from "@/components/radio/ListenPanel";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Listen Live",
  description: "Listen to Angel 96.1 FM online.",
  alternates: { canonical: "/listen" },
};

export default function ListenPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SectionHeading title="Listen Live" as="h1" />
      <ListenPanel />
    </div>
  );
}
