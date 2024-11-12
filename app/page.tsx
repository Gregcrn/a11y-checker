import { Accessibility } from "lucide-react";
import { AuditForm } from "@/components/audit-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="flex items-center space-x-2">
            <Accessibility className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter">Wearequattro - Web Accessibility Auditor</h1>
          </div>
          
          <p className="text-xl text-muted-foreground max-w-[600px]">
            Analyze web accessibility compliance using RGAA standards
          </p>

          <div className="w-full max-w-xl mx-auto mt-8">
            <AuditForm />
          </div>
        </div>
      </div>
    </main>
  );
}
