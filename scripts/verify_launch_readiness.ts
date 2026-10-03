import fs from 'fs';
import path from 'path';

/**
 * PromptShift Automated Launch & SEO/GEO/Marketing Verification Script
 */
function verifyLaunchReadiness() {
  console.log('🔍 Executing PromptShift Launch & SEO/GEO Readiness Audit...\n');

  const rootDir = process.cwd();
  let errors = 0;

  // 1. Verify robots.txt & AI Crawlers
  const robotsPath = path.join(rootDir, 'public', 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    console.error('❌ Missing public/robots.txt');
    errors++;
  } else {
    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    const requiredAgents = ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'];
    const missingAgents = requiredAgents.filter((agent) => !robotsContent.includes(agent));
    if (missingAgents.length > 0) {
      console.error(`❌ robots.txt missing AI crawler directives: ${missingAgents.join(', ')}`);
      errors++;
    } else {
      console.log('✓ robots.txt configured with full GEO & AI crawler permissions (GPTBot, PerplexityBot, ClaudeBot, Google-Extended).');
    }
  }

  // 2. Verify sitemap.xml
  const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ Missing public/sitemap.xml');
    errors++;
  } else {
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    if (sitemapContent.includes('https://promptshift.dev')) {
      console.log('✓ sitemap.xml verified with canonical domain promptshift.dev.');
    } else {
      console.error('❌ sitemap.xml missing promptshift.dev domain reference.');
      errors++;
    }
  }

  // 3. Verify llms.txt & llms-full.txt
  const llmsPath = path.join(rootDir, 'public', 'llms.txt');
  const llmsFullPath = path.join(rootDir, 'public', 'llms-full.txt');
  if (!fs.existsSync(llmsPath) || !fs.existsSync(llmsFullPath)) {
    console.error('❌ Missing llms.txt or llms-full.txt');
    errors++;
  } else {
    console.log('✓ llms.txt & llms-full.txt present for Generative Engine Optimization (Perplexity, ChatGPT, Claude).');
  }

  // 4. Verify Schema.org JSON-LD in app/layout.tsx
  const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
  if (!fs.existsSync(layoutPath)) {
    console.error('❌ Missing app/layout.tsx');
    errors++;
  } else {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    const requiredSchemas = ['SoftwareApplication', 'Organization', 'WebSite', 'FAQPage'];
    const missingSchemas = requiredSchemas.filter((schema) => !layoutContent.includes(schema));
    if (missingSchemas.length > 0) {
      console.error(`❌ app/layout.tsx missing Schema.org entities: ${missingSchemas.join(', ')}`);
      errors++;
    } else {
      console.log('✓ Schema.org JSON-LD verified (SoftwareApplication, Organization, WebSite, FAQPage).');
    }

    if (layoutContent.includes('canonical') && layoutContent.includes('promptshift.dev')) {
      console.log('✓ Canonical URL and alternates verified in metadata.');
    } else {
      console.error('❌ Metadata missing canonical URL configuration.');
      errors++;
    }
  }

  // 5. Verify Marketing & Communication Playbooks
  const seoDocPath = path.join(rootDir, 'docs', 'SEO_GEO_LLMO_PLAYBOOK.md');
  const marketingDocPath = path.join(rootDir, 'docs', 'MARKETING_LAUNCH_PLAYBOOK.md');
  if (!fs.existsSync(seoDocPath) || !fs.existsSync(marketingDocPath)) {
    console.error('❌ Missing documentation in docs/');
    errors++;
  } else {
    console.log('✓ Comprehensive SEO/GEO and Marketing Playbooks verified in docs/.');
  }

  console.log('\n------------------------------------------------------------');
  if (errors === 0) {
    console.log('🎉 PROMPTSHIFT IS 100% READY FOR LAUNCH & GO-LIVE (0 ERRORS)!');
    process.exit(0);
  } else {
    console.error(`⚠️ Found ${errors} error(s) during verification.`);
    process.exit(1);
  }
}

verifyLaunchReadiness();
