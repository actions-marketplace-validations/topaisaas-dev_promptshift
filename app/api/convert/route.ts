import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { UniversalTranspiler } from '@/lib/converter/universalTranspiler';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { SecurityGuards } from '@/lib/converter/securityGuards';
import { MonetizationManager } from '@/lib/config/monetizationConfig';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project, targetPlatform } = body;

    if (!project || !project.metadata || !project.persona) {
      return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization') || req.headers.get('X-PromptShift-Key');
    const isAgentCall = req.headers.get('X-Agent-Client') || req.headers.get('User-Agent')?.includes('Agent') || body.client === 'cli';
    const fileCount = (project.knowledge_base?.length || 0) + (project.rules?.length || 0) + 1;
    const freeLimit = MonetizationManager.getFreeLimit();

    // 1. In-RAM Magic Bytes check if any binary attachments are passed
    if (body.rawFiles) {
      for (const [name, b64] of Object.entries(body.rawFiles as Record<string, string>)) {
        const buf = Buffer.from(b64, 'base64');
        const validation = SecurityGuards.validateMagicBytes(name, new Uint8Array(buf));
        if (!validation.isSafe) {
          return NextResponse.json({ error: validation.reason }, { status: 422 });
        }
      }
    }

    // 2. Transpile in memory
    const result = UniversalTranspiler.transpile(
      project as CanonicalProject,
      targetPlatform || 'claude'
    );

    // x402O: Deterministic In-Flow Paywall (HTTP 402 Payment Required) for CLI/Agent calls exceeding free quota
    if (isAgentCall && fileCount > freeLimit && !authHeader) {
      const previewLines = result.diff.targetCode.split('\n').slice(0, 12).join('\n');
      return NextResponse.json(
        {
          status: 'PAYMENT_REQUIRED',
          code: 402,
          error: `Quota Exceeded: Multi-file architecture detected (${fileCount} files > ${freeLimit} free limit).`,
          ast_verification: {
            project_name: result.projectName,
            source_platform: result.sourcePlatform,
            target_platform: result.targetPlatform,
            certified_parity_score: `${result.parityScore}%`,
            secrets_redacted_in_ram: result.alerts.length,
            locked_files: Object.keys(result.files),
            preview_head: previewLines,
          },
          in_flow_checkout: {
            currency: 'USD',
            single_pass: {
              price_usd: 1.99,
              product_id: '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25',
              instant_checkout_url: 'https://polar.sh/checkout/3e74e0dd-27da-4b78-8dee-f2e0fa36ed25',
            },
            pro_developer_ci_cd: {
              price_usd: 5.99,
              product_id: 'f646306b-cddd-4478-8aba-ec282a93397a',
              instant_checkout_url: 'https://polar.sh/checkout/f646306b-cddd-4478-8aba-ec282a93397a',
            },
            team_agency: {
              price_usd: 19.99,
              product_id: '9e8ca309-7881-4d7e-bfb0-6e6eda85505b',
              instant_checkout_url: 'https://polar.sh/checkout/9e8ca309-7881-4d7e-bfb0-6e6eda85505b',
            },
            unlock_instructions: 'Pass your Polar Order ID or License Key via header "X-PromptShift-Key: <KEY>" or CLI flag "--key=<KEY>".',
          },
        },
        {
          status: 402,
          headers: {
            'X-Payment-Required': 'true',
            'X-Pricing-Currency': 'USD',
            'X-Pricing-Single-Usd': '1.99',
            'X-Pricing-Pro-Usd': '5.99',
            'X-Polar-Checkout-Single': 'https://polar.sh/checkout/3e74e0dd-27da-4b78-8dee-f2e0fa36ed25',
            'X-Polar-Checkout-Pro': 'https://polar.sh/checkout/f646306b-cddd-4478-8aba-ec282a93397a',
            'X-Polar-Product-Id': '3e74e0dd-27da-4b78-8dee-f2e0fa36ed25',
          },
        }
      );
    }

    // 3. Assemble in-memory ZIP
    const zip = new JSZip();
    for (const [filename, content] of Object.entries(result.files)) {
      zip.file(filename, content);
    }

    // Include security and parity audit report in zip
    const auditReport = `# PromptShift Migration Report - ${result.projectName}\n- Target: ${result.targetPlatform}\n- Parity Score: ${result.parityScore}%\n- Zero-Retention: Verified (In-RAM Execution)\n- Secrets Redacted: ${result.alerts.length}\n- Transpiled via: https://promptshift.dev`;
    zip.file('MIGRATION_AUDIT_REPORT.md', auditReport);

    const zipBase64 = await zip.generateAsync({ type: 'base64' });

    return NextResponse.json({
      success: true,
      transpileResult: result,
      zipBase64,
    });
  } catch (error: any) {
    console.error('Conversion Route Error:', error);
    return NextResponse.json({ error: error.message || 'Conversion failed' }, { status: 500 });
  }
}
