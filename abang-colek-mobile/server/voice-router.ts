import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { publicProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";

export const voiceRouter = router({
  transcribe: publicProcedure
    .input(
      z.object({
        audioUrl: z.string().url(),
        language: z.string().optional(),
        prompt: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await transcribeAudio(input);
      if ("error" in result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error,
        });
      }
      return result;
    }),
});
