/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { XCircle, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { AuditResults } from "@/types/audit";


export default function ResultsPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<AuditResults | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
        const fetchResults = async () => {
            try {
                const response = await fetch(`/api/audit?id=${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch results");
                }
                const data = await response.json();
                console.log(data.results);
                setResults(data.results);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Audit
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Accessibility Audit Results</h1>
        </div>

        <Tabs defaultValue="violations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="violations">
              Violations
              <Badge variant="destructive" className="ml-2">
                {results?.violations?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="warnings">
              Warnings
              <Badge variant="secondary" className="ml-2">
                {results?.incomplete?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="passed">
              Passed
              <Badge variant="secondary" className="ml-2">
                {results?.passes?.length || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="violations" className="space-y-4">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              {results?.violations?.map((violation: any, index: number) => (
                <Card key={index} className="p-4 mb-4">
                  <div className="flex items-start space-x-4">
                    <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-1" />
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{violation.help}</h3>
                        <p className="text-sm text-muted-foreground">
                          {violation.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Impact: {violation.impact}</h4>
                        
                        {/* Standards WCAG */}
                        <div className="flex flex-wrap gap-2 my-2">
                          {violation.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* HTML elements with issues */}
                        {violation.nodes?.map((node: any, nodeIndex: number) => (
                          <div key={nodeIndex} className="space-y-2 bg-muted p-4 rounded-md">
                            <h5 className="font-medium">Problematic Element:</h5>
                            <code className="block bg-background p-2 rounded text-sm">
                              {node.html}
                            </code>
                            
                            <h5 className="font-medium mt-2">Selector:</h5>
                            <code className="block bg-background p-2 rounded text-sm">
                              {node.target.join(', ')}
                            </code>

                            {node.failureSummary && (
                              <Alert className="mt-2">
                                <AlertTitle>How to fix:</AlertTitle>
                                <AlertDescription className="whitespace-pre-line">
                                  {node.failureSummary}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        ))}

                        <Alert>
                          <AlertTitle>Documentation:</AlertTitle>
                          <AlertDescription>
                            <a 
                              href={violation.helpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Learn more about this rule
                            </a>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                </Card>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="warnings" className="space-y-4">
            {results?.incomplete?.map((incomplete: any, index: number) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex items-start space-x-4">
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">{incomplete.help}</h3>
                    <p className="text-sm text-muted-foreground">
                      {incomplete.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
          <TabsContent value="passed" className="space-y-4">
            {results?.passes?.map((passed: any, index: number) => (
              <Card key={index} className="p-4 mb-4">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-semibold">{passed.help}</h3>
                    <p className="text-sm text-muted-foreground">
                      {passed.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}