import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramBotService } from './telegram-bot.service';
import { TelegramBotUpdateController } from './telegram-bot.update';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [TelegramBotUpdateController],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
