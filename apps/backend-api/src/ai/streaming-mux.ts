import { Injectable } from '@nestjs/common';

export type SseEvent = {
  event: 'token' | 'done' | 'error';
  data: Record<string, unknown>;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class StreamingMux {
  async *streamText(
    text: string,
    done: { messageId: string; usage: { tokensIn: number; tokensOut: number } },
  ): AsyncGenerator<SseEvent> {
    const chunks = text.match(/.{1,28}/g) ?? [];

    for (const chunk of chunks) {
      yield {
        event: 'token',
        data: { t: chunk },
      };
      await sleep(20);
    }

    yield {
      event: 'done',
      data: done,
    };
  }
}
