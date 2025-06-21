# Security Documentation

## Overview

StudyMentor is an AI-powered study assistant with comprehensive security measures to protect user data and prevent common web vulnerabilities.

## Security Features

### 🔐 Authentication & Authorization
- **Session-based authentication** using express-session
- **Route-level authorization** with `isAuthenticated` middleware
- **Resource ownership validation** - users can only access their own data
- **Canvas OAuth integration** for secure LMS access

### 🛡️ Input Validation & Sanitization
- **Zod schema validation** for all API inputs
- **HTML sanitization** using DOMPurify
- **File upload validation** with type and size restrictions
- **Parameter validation** for URL and query parameters

### 🚦 Rate Limiting
- **Global rate limiting** (100 requests per 15 minutes)
- **Sensitive operation limiting** (10 requests per 15 minutes)
- **OpenAI API limiting** (50 requests per 15 minutes)
- **Configurable limits** via environment variables

### 🔒 Security Headers
- **Helmet.js** for comprehensive security headers
- **Content Security Policy (CSP)** with strict directives
- **CORS configuration** with allowed origins
- **XSS protection** headers

### 📁 File Upload Security
- **File type validation** (PDF, DOCX, TXT only)
- **File size limits** (10MB max)
- **Secure file storage** in uploads directory
- **File cleanup** after processing

### 🌍 Environment Security
- **Environment variable validation** with Zod
- **Secure defaults** for all configuration
- **No hardcoded secrets** in source code
- **Environment-specific settings**

## Security Checklist

### Before Deployment
- [ ] Set strong `SESSION_SECRET` and `COOKIE_SECRET`
- [ ] Configure `DATABASE_URL` with proper credentials
- [ ] Set `OPENAI_API_KEY` for AI features
- [ ] Configure Canvas OAuth credentials
- [ ] Set `NODE_ENV=production`
- [ ] Review and update `ALLOWED_ORIGINS` for CORS
- [ ] Run security audit: `npm run security-audit`

### Regular Maintenance
- [ ] Run `npm audit` weekly
- [ ] Update dependencies regularly
- [ ] Monitor application logs for suspicious activity
- [ ] Review rate limiting effectiveness
- [ ] Check for new security vulnerabilities

## Security Audit

Run the comprehensive security audit:

```bash
npm run security-audit
```

This will check for:
- Hardcoded secrets
- SQL injection vulnerabilities
- XSS vulnerabilities
- Missing security headers
- Authentication gaps
- Input validation issues
- Rate limiting configuration
- CORS setup
- Environment variable usage
- File upload security
- Dependency vulnerabilities

## Common Security Issues & Solutions

### 1. SQL Injection Prevention
**Issue**: User input directly concatenated into SQL queries
**Solution**: Use parameterized queries with Drizzle ORM

```typescript
// ❌ Vulnerable
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Secure
const user = await db.query.users.findFirst({
  where: eq(users.id, userId)
});
```

### 2. XSS Prevention
**Issue**: User input rendered without sanitization
**Solution**: Sanitize all user input with DOMPurify

```typescript
// ❌ Vulnerable
element.innerHTML = userInput;

// ✅ Secure
element.innerHTML = DOMPurify.sanitize(userInput);
```

### 3. File Upload Security
**Issue**: Malicious file uploads
**Solution**: Validate file type, size, and content

```typescript
const upload = multer({
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
```

### 4. Authentication Bypass
**Issue**: Routes accessible without authentication
**Solution**: Apply authentication middleware to all protected routes

```typescript
// ✅ Secure
app.get('/api/protected', isAuthenticated, (req, res) => {
  // Route logic
});
```

## Environment Variables

### Required Variables
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/studymentor
OPENAI_API_KEY=your-openai-api-key
SESSION_SECRET=your-super-secret-session-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars
```

### Optional Variables
```bash
NODE_ENV=production
PORT=3000
CANVAS_CLIENT_ID=your-canvas-client-id
CANVAS_CLIENT_SECRET=your-canvas-client-secret
CANVAS_REDIRECT_URI=http://localhost:3000/api/canvas/callback
```

### Security Variables
```bash
RATE_LIMIT_MAX_REQUESTS=100
SENSITIVE_OPERATION_LIMIT=10
OPENAI_REQUEST_LIMIT=50
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

## API Security

### Authentication Required
All API routes except health check require authentication:
- `GET /health` - Public health check
- All other `/api/*` routes - Require authentication

### Rate Limiting
- **Global**: 100 requests per 15 minutes
- **Sensitive operations**: 10 requests per 15 minutes
- **OpenAI operations**: 50 requests per 15 minutes

### Input Validation
All API inputs are validated using Zod schemas:
- Request body validation
- URL parameter validation
- Query parameter validation
- File upload validation

## Database Security

### Connection Security
- Use SSL connections in production
- Implement connection pooling
- Use read-only connections where possible

### Query Security
- All queries use parameterized statements
- No dynamic SQL construction
- Input validation before database operations

### Data Protection
- Sensitive data not logged
- User data isolation by user ID
- Regular backup procedures

## Monitoring & Logging

### Security Logging
- Authentication attempts
- Failed authorization attempts
- Rate limit violations
- File upload attempts
- Error details (in debug mode only)

### Production Logging
- Request/response logging (without sensitive data)
- Error logging with sanitized messages
- Performance metrics
- Health check monitoring

## Incident Response

### Security Breach Response
1. **Immediate Actions**
   - Isolate affected systems
   - Preserve evidence
   - Notify stakeholders

2. **Investigation**
   - Review logs and audit trails
   - Identify root cause
   - Assess impact

3. **Recovery**
   - Patch vulnerabilities
   - Restore from backups if needed
   - Update security measures

4. **Post-Incident**
   - Document lessons learned
   - Update security procedures
   - Conduct security review

## Security Best Practices

### Development
- Never commit secrets to version control
- Use environment variables for configuration
- Validate all user inputs
- Implement proper error handling
- Use HTTPS in production

### Deployment
- Use secure hosting providers
- Enable HTTPS with valid certificates
- Configure firewall rules
- Regular security updates
- Monitor application health

### Maintenance
- Regular dependency updates
- Security patch management
- Log monitoring and analysis
- Backup verification
- Security training for team

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** create a public issue
2. **Email** security@yourdomain.com
3. **Include** detailed description and steps to reproduce
4. **Wait** for acknowledgment and response

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)

## Compliance

This application follows security best practices for:
- **OWASP Top 10** compliance
- **GDPR** data protection requirements
- **FERPA** educational privacy standards
- **SOC 2** security controls (when applicable)

---

**Last Updated**: December 2024
**Version**: 1.0.0 