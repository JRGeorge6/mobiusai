import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
// Dynamic import to avoid initialization issues
let pdfParse: any;

export interface ProcessedDocument {
  content: string;
  chunks: string[];
  wordCount: number;
}

export class DocumentProcessor {
  private chunkSize = 500; // Words per chunk
  private chunkOverlap = 50; // Words overlap between chunks

  async processFile(filePath: string, mimeType: string): Promise<ProcessedDocument> {
    let content = '';

    try {
      switch (mimeType) {
        case 'application/pdf':
          content = await this.processPDF(filePath);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          content = await this.processDOCX(filePath);
          break;
        case 'text/plain':
          content = await this.processTXT(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }

      const chunks = this.chunkText(content);
      const wordCount = content.split(/\s+/).length;

      return {
        content,
        chunks,
        wordCount
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error('Failed to process document');
    }
  }

  private async processPDF(filePath: string): Promise<string> {
    try {
      if (!pdfParse) {
        pdfParse = (await import('pdf-parse')).default;
      }
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  private async processDOCX(filePath: string): Promise<string> {
    // For DOCX processing, we'd normally use mammoth
    // For now, returning a placeholder since mammoth requires additional setup
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } catch (error) {
      // Fallback if mammoth is not available
      console.warn('DOCX processing not available, using fallback');
      return 'DOCX content extraction not available';
    }
  }

  private async processTXT(filePath: string): Promise<string> {
    return fs.readFileSync(filePath, 'utf8');
  }

  private chunkText(text: string): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunk = words.slice(i, i + this.chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }

    return chunks;
  }

  cleanupFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }
}

export const documentProcessor = new DocumentProcessor();
