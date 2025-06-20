interface CanvasConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at?: string;
  end_at?: string;
}

interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at?: string;
  points_possible?: number;
  submission_types: string[];
  workflow_state: string;
  course_id: number;
}

interface CanvasTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export class CanvasService {
  private config: CanvasConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.CANVAS_BASE_URL || 'https://canvas.instructure.com',
      clientId: process.env.CANVAS_CLIENT_ID || '',
      clientSecret: process.env.CANVAS_CLIENT_SECRET || '',
      redirectUri: process.env.CANVAS_REDIRECT_URI || '',
    };
  }

  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      response_type: 'code',
      redirect_uri: this.config.redirectUri,
      state,
      scope: 'url:GET|/api/v1/courses url:GET|/api/v1/assignments url:GET|/api/v1/users/self',
    });

    return `${this.config.baseUrl}/login/oauth2/auth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<CanvasTokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/login/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    return await response.json();
  }

  async refreshToken(refreshToken: string): Promise<CanvasTokenResponse> {
    const response = await fetch(`${this.config.baseUrl}/login/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  }

  async getCourses(accessToken: string): Promise<CanvasCourse[]> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/courses?enrollment_state=active&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return await response.json();
  }

  async getAssignments(accessToken: string, courseId: string): Promise<CanvasAssignment[]> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/courses/${courseId}/assignments?per_page=100`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }

    return await response.json();
  }

  async getAllAssignments(accessToken: string, courseIds: string[]): Promise<CanvasAssignment[]> {
    const assignmentPromises = courseIds.map(courseId => 
      this.getAssignments(accessToken, courseId)
    );

    const assignmentArrays = await Promise.all(assignmentPromises);
    return assignmentArrays.flat();
  }

  async getUserProfile(accessToken: string) {
    const response = await fetch(`${this.config.baseUrl}/api/v1/users/self`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  }
}

export const canvasService = new CanvasService();
