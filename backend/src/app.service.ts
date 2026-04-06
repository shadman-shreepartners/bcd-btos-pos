import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'bcd-japan-integration-service',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
