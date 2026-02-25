import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PublicContentController } from './public-content.controller';

@Module({
  controllers: [ContentController, PublicContentController],
  providers: [ContentService],
})
export class ContentModule {}
