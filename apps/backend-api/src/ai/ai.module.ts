import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiPublicController } from './ai.public.controller';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiRouter } from './ai-router';
import { PromptRegistry } from './prompt-registry';
import { SafetyLayer } from './safety-layer';
import { StreamingMux } from './streaming-mux';
import { CostManager } from './cost-manager';

@Module({
  imports: [AuthModule],
  controllers: [AiController, AiPublicController],
  providers: [AiService, AiRouter, PromptRegistry, SafetyLayer, StreamingMux, CostManager],
})
export class AiModule {}
