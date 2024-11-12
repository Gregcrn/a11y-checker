/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { chromium } from 'playwright';

// Stockage temporaire des résultats (en mémoire)
const auditResults = new Map();

// Définition des types pour les résultats d'axe
interface AxeResults {
    violations: Array<{
        help: string;
        description: string;
        impact: string;
        helpUrl: string;
        nodes: Array<{
            html: string;
            target: string[];
            failureSummary: string;
        }>;
        tags: string[];
    }>;
    passes: Array<{
        help: string;
        description: string;
    }>;
    incomplete: Array<{
        help: string;
        description: string;
    }>;
    inapplicable: Array<{
        help: string;
        description: string;
    }>;
}

// Get audit results
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: "ID is required" },
                { status: 400 }
            );
        }

        // Get stored audit results
        const results = auditResults.get(id);
        
        if (!results) {
            return NextResponse.json(
                { error: "Results not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Error fetching audit results:", error);
        return NextResponse.json(
            { error: "Failed to fetch audit results" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    const browser = await chromium.launch();
    try {
        const { url } = await request.json();
        
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Inject axe-core via CDN
        await page.addScriptTag({
            url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.0/axe.min.js'
        });

        // Simplified axe-core configuration
        const axeConfig = {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'best-practice']
            },
            reporter: 'v2'
        };

        // Run axe-core
        const results = await page.evaluate((config) => {
            return new Promise<AxeResults>((resolve) => {
                // @ts-expect-error - axe est injecté globalement
                window.axe.run(document, config, (err: Error, results: AxeResults) => {
                    if (err) throw err;
                    resolve(results);
                });
            });
        }, axeConfig);

        // Analyze results with correct typing
        const accessibilityReport = {
            violations: results.violations,
            passes: results.passes,
            incomplete: results.incomplete,
            inapplicable: results.inapplicable,
            timestamp: new Date().toISOString(),
            url: url
        };

        const id = crypto.randomUUID();
        
        // Store results with ID
        auditResults.set(id, accessibilityReport);

        // Automatic cleanup after 1 hour
        setTimeout(() => {
            auditResults.delete(id);
        }, 3600000);

        return NextResponse.json({ id, results: accessibilityReport });
    } catch (error) {
        console.error("Error during accessibility audit:", error);
        return NextResponse.json(
            { error: "Failed to perform accessibility audit" },
            { status: 500 }
        );
    } finally {
        await browser.close();
    }
}