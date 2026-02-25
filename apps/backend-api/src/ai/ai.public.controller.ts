import { Controller, Get } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('/api/v1/ai')
export class AiPublicController {
  constructor(private readonly ai: AiService) {}

  @Get('scenarios')
  async scenarios() {
    return this.ai.listScenarios();
  }
}
