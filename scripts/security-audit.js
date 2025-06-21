#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Running Security Audit for StudyMentor...\n');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

// Security checks
const securityChecks = {
  // Check for hardcoded secrets
  checkHardcodedSecrets: () => {
    log.header('Checking for hardcoded secrets...');
    const patterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /password\s*[:=]\s*['"][^'"]{5,}['"]/gi,
      /secret\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /token\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /private[_-]?key\s*[:=]\s*['"][^'"]{10,}['"]/gi,
    ];

    const files = getAllFiles('.');
    let foundSecrets = false;

    files.forEach(file => {
      if (file.includes('node_modules') || file.includes('.git')) return;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        patterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            foundSecrets = true;
            log.error(`Potential secret found in ${file}:`);
            matches.forEach(match => {
              console.log(`  ${match.substring(0, 50)}...`);
            });
          }
        });
      } catch (err) {
        // Skip binary files
      }
    });

    if (!foundSecrets) {
      log.success('No hardcoded secrets found');
    }
  },

  // Check for SQL injection vulnerabilities
  checkSQLInjection: () => {
    log.header('Checking for SQL injection vulnerabilities...');
    const patterns = [
      /query\s*\(\s*[^)]*\+\s*req\./gi,
      /execute\s*\(\s*[^)]*\+\s*req\./gi,
      /sql\s*\+\s*req\./gi,
    ];

    const files = getAllFiles('.');
    let foundVulnerabilities = false;

    files.forEach(file => {
      if (file.includes('node_modules') || file.includes('.git')) return;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        patterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            foundVulnerabilities = true;
            log.error(`Potential SQL injection in ${file}:`);
            matches.forEach(match => {
              console.log(`  ${match}`);
            });
          }
        });
      } catch (err) {
        // Skip binary files
      }
    });

    if (!foundVulnerabilities) {
      log.success('No obvious SQL injection vulnerabilities found');
    }
  },

  // Check for XSS vulnerabilities
  checkXSS: () => {
    log.header('Checking for XSS vulnerabilities...');
    const patterns = [
      /innerHTML\s*=\s*req\./gi,
      /outerHTML\s*=\s*req\./gi,
      /document\.write\s*\(\s*req\./gi,
      /eval\s*\(\s*req\./gi,
    ];

    const files = getAllFiles('.');
    let foundVulnerabilities = false;

    files.forEach(file => {
      if (file.includes('node_modules') || file.includes('.git')) return;
      
      try {
        const content = fs.readFileSync(file, 'utf8');
        patterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            foundVulnerabilities = true;
            log.error(`Potential XSS vulnerability in ${file}:`);
            matches.forEach(match => {
              console.log(`  ${match}`);
            });
          }
        });
      } catch (err) {
        // Skip binary files
      }
    });

    if (!foundVulnerabilities) {
      log.success('No obvious XSS vulnerabilities found');
    }
  },

  // Check for missing security headers
  checkSecurityHeaders: () => {
    log.header('Checking for security headers...');
    const serverFile = path.join(__dirname, '../server/index.ts');
    
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      
      const requiredHeaders = [
        'helmet',
        'Content-Security-Policy',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'X-XSS-Protection'
      ];

      let missingHeaders = [];
      requiredHeaders.forEach(header => {
        if (!content.includes(header)) {
          missingHeaders.push(header);
        }
      });

      if (missingHeaders.length > 0) {
        log.warning(`Missing security headers: ${missingHeaders.join(', ')}`);
      } else {
        log.success('Security headers properly configured');
      }
    }
  },

  // Check for proper authentication
  checkAuthentication: () => {
    log.header('Checking authentication implementation...');
    const routesFile = path.join(__dirname, '../server/routes.ts');
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      // Check for routes without authentication
      const apiRoutes = content.match(/app\.(get|post|put|patch|delete)\s*\(\s*['"]\/api\/[^'"]*['"]/g);
      const authenticatedRoutes = content.match(/app\.(get|post|put|patch|delete)\s*\(\s*['"]\/api\/[^'"]*['"][^)]*isAuthenticated/g);
      
      if (apiRoutes && authenticatedRoutes) {
        const totalRoutes = apiRoutes.length;
        const authRoutes = authenticatedRoutes.length;
        
        if (authRoutes < totalRoutes) {
          log.warning(`${totalRoutes - authRoutes} API routes may not be properly authenticated`);
        } else {
          log.success('All API routes appear to be properly authenticated');
        }
      }
    }
  },

  // Check for proper input validation
  checkInputValidation: () => {
    log.header('Checking input validation...');
    const routesFile = path.join(__dirname, '../server/routes.ts');
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      // Check for Zod validation usage
      const zodUsage = content.match(/\.parse\(/g);
      const reqBodyUsage = content.match(/req\.body/g);
      
      if (zodUsage && reqBodyUsage) {
        const validationCount = zodUsage.length;
        const bodyUsageCount = reqBodyUsage.length;
        
        if (validationCount < bodyUsageCount / 2) {
          log.warning('Some request body usage may not be properly validated');
        } else {
          log.success('Input validation appears to be properly implemented');
        }
      }
    }
  },

  // Check for rate limiting
  checkRateLimiting: () => {
    log.header('Checking rate limiting...');
    const serverFile = path.join(__dirname, '../server/index.ts');
    
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      
      if (content.includes('rateLimit')) {
        log.success('Rate limiting is implemented');
      } else {
        log.warning('Rate limiting may not be implemented');
      }
    }
  },

  // Check for CORS configuration
  checkCORS: () => {
    log.header('Checking CORS configuration...');
    const serverFile = path.join(__dirname, '../server/index.ts');
    
    if (fs.existsSync(serverFile)) {
      const content = fs.readFileSync(serverFile, 'utf8');
      
      if (content.includes('cors')) {
        log.success('CORS is configured');
      } else {
        log.warning('CORS may not be properly configured');
      }
    }
  },

  // Check for environment variables
  checkEnvironmentVariables: () => {
    log.header('Checking environment variable usage...');
    const configFile = path.join(__dirname, '../server/config.ts');
    
    if (fs.existsSync(configFile)) {
      log.success('Environment configuration file exists');
    } else {
      log.warning('No environment configuration file found');
    }

    const envExampleFile = path.join(__dirname, '../.env.example');
    if (fs.existsSync(envExampleFile)) {
      log.success('.env.example file exists');
    } else {
      log.warning('No .env.example file found');
    }
  },

  // Check for file upload security
  checkFileUploadSecurity: () => {
    log.header('Checking file upload security...');
    const routesFile = path.join(__dirname, '../server/routes.ts');
    
    if (fs.existsSync(routesFile)) {
      const content = fs.readFileSync(routesFile, 'utf8');
      
      const securityChecks = [
        'fileFilter',
        'limits',
        'fileSize',
        'mimetype'
      ];
      
      let implementedChecks = 0;
      securityChecks.forEach(check => {
        if (content.includes(check)) {
          implementedChecks++;
        }
      });
      
      if (implementedChecks >= 3) {
        log.success('File upload security measures are implemented');
      } else {
        log.warning('File upload security may be insufficient');
      }
    }
  },

  // Run npm audit
  runNpmAudit: () => {
    log.header('Running npm audit...');
    try {
      const result = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(result);
      
      if (audit.metadata.vulnerabilities.total > 0) {
        log.error(`Found ${audit.metadata.vulnerabilities.total} vulnerabilities:`);
        log.error(`  Critical: ${audit.metadata.vulnerabilities.critical}`);
        log.error(`  High: ${audit.metadata.vulnerabilities.high}`);
        log.error(`  Moderate: ${audit.metadata.vulnerabilities.moderate}`);
        log.error(`  Low: ${audit.metadata.vulnerabilities.low}`);
      } else {
        log.success('No vulnerabilities found in dependencies');
      }
    } catch (error) {
      log.error('Failed to run npm audit');
    }
  }
};

// Helper function to get all files recursively
function getAllFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      getAllFiles(fullPath, files);
    } else if (stat.isFile() && /\.(js|ts|jsx|tsx)$/.test(item)) {
      files.push(fullPath);
    }
  });
  
  return files;
}

// Run all security checks
async function runSecurityAudit() {
  try {
    securityChecks.checkHardcodedSecrets();
    securityChecks.checkSQLInjection();
    securityChecks.checkXSS();
    securityChecks.checkSecurityHeaders();
    securityChecks.checkAuthentication();
    securityChecks.checkInputValidation();
    securityChecks.checkRateLimiting();
    securityChecks.checkCORS();
    securityChecks.checkEnvironmentVariables();
    securityChecks.checkFileUploadSecurity();
    securityChecks.runNpmAudit();
    
    log.header('Security audit completed!');
    log.info('Review any warnings or errors above and address them as needed.');
    
  } catch (error) {
    log.error(`Security audit failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the audit
runSecurityAudit(); 