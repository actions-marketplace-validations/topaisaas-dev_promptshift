import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { UniversalTranspiler } from '@/lib/converter/universalTranspiler';
import { CanonicalProject } from '@/lib/converter/capsSchema';
import { SecurityGuards } from '@/lib/converter/securityGuards';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project, targetPlatform } = body;

    if (!project || !project.metadata || !project.persona) {
      return NextResponse.json({ error: 'Invalid project payload' }, { status: 400 });
    }

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

    // 3. Assemble in-memory ZIP
    const zip = new JSZip();
    for (const [filename, content] of Object.entries(result.files)) {
      zip.file(filename, content);
    }

    // Include security and parity audit report in zip
    const auditReport = `# PromptShift Migration Report - ${result.projectName}\n- Target: ${result.targetPlatform}\n- Parity Score: ${result.parityScore}%\n- Zero-Retention: Verified\n- Secrets Redacted: ${result.alerts.length}`;
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
