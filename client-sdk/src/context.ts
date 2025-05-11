import { DeviceInfo, SessionInfo, Breadcrumb } from './types';

export class ContextManager {
  private static instance: ContextManager;
  private deviceInfo: DeviceInfo;
  private sessionInfo: SessionInfo;
  private breadcrumbs: Breadcrumb[] = [];
  private readonly MAX_BREADCRUMBS = 100;

  private constructor() {
    this.deviceInfo = this.collectDeviceInfo();
    this.sessionInfo = this.createSession();
    this.setupActivityTracking();
  }

  static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager();
    }
    return ContextManager.instance;
  }

  private collectDeviceInfo(): DeviceInfo {
    const ua = navigator.userAgent;
    return {
      browser: this.getBrowserInfo(ua),
      browserVersion: this.getBrowserVersion(ua),
      os: this.getOSInfo(ua),
      osVersion: this.getOSVersion(ua),
      deviceType: this.getDeviceType(ua),
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
  }

  private createSession(): SessionInfo {
    return {
      id: this.generateSessionId(),
      startTime: Date.now(),
      lastActivity: Date.now(),
    };
  }

  private setupActivityTracking() {
    const updateActivity = () => {
      this.sessionInfo.lastActivity = Date.now();
    };

    ['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });
  }

  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: Date.now(),
    });

    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }
  }

  getContext() {
    return {
      device: this.deviceInfo,
      session: this.sessionInfo,
      breadcrumbs: this.breadcrumbs,
    };
  }

  private getBrowserInfo(ua: string): string {
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
    return 'Unknown';
  }

  private getBrowserVersion(ua: string): string {
    const match = ua.match(/(chrome|firefox|safari|edge|msie|trident(?=\/))\/?\s*(\d+)/i);
    return match ? match[2] : 'Unknown';
  }

  private getOSInfo(ua: string): string {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'MacOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getOSVersion(ua: string): string {
    const match = ua.match(/(windows nt|mac os x|android|ios)\s*([\d._]+)/i);
    return match ? match[2] : 'Unknown';
  }

  private getDeviceType(ua: string): string {
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
} 