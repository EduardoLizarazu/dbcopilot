import { TNlqQaErrorOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-error.app.dto";
import { TNlqQaFeedbackOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa-feedback.app.dto";
import { TNlqQaOutRequestDto } from "@/core/application/dtos/nlq/nlq-qa.app.dto";
import { TUserOutputRequestDto } from "@/core/application/dtos/user.app.dto";
import { TResponseDto } from "@/core/application/dtos/utils/response.app.dto";
import { IUserRepository } from "@/core/application/interfaces/auth/user.app.inter";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { INlqQaErrorRepository } from "@/core/application/interfaces/nlq/nlq-qa-error.app.inter";
import { INlqQaFeedbackRepository } from "@/core/application/interfaces/nlq/nlq-qa-feedback.app.inter";
import { INlqQaRepository } from "@/core/application/interfaces/nlq/nlq-qa.app.inter";

type TUser = TUserOutputRequestDto;
type TNlq = TNlqQaOutRequestDto;
type TNlqError = TNlqQaErrorOutRequestDto;
type TNlqFb = TNlqQaFeedbackOutRequestDto;

type TByFeedback = TNlq & TUser & TNlqFb;
type TByError = TUser & TNlqError;
export type TReadNlqQaBadOutRequestDto = {
  byFeedback: TByFeedback | null;
  byError: TByError | null;
};

export interface IReadAllBadForCorrectionUseCase {
  execute(query?: string): Promise<TResponseDto<TReadNlqQaBadOutRequestDto[]>>;
}

export class ReadAllBadForCorrectionUseCase
  implements IReadAllBadForCorrectionUseCase
{
  constructor(
    private readonly logger: ILogger,
    private readonly nlqQaRepo: INlqQaRepository,
    private readonly nlqFbRepo: INlqQaFeedbackRepository,
    private readonly nlqErrorRepo: INlqQaErrorRepository,
    private readonly userRepo: IUserRepository
  ) {}
  async execute(
    query?: string
  ): Promise<TResponseDto<TReadNlqQaBadOutRequestDto[]>> {
    try {
      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Reading all bad NLQ QAs for correction",
        { query }
      );
      const [users, nlqQas, nlqFbs, nlqErrors] = await Promise.all([
        this.userRepo.findAll(),
        this.nlqQaRepo.findAll(),
        this.nlqFbRepo.findAll(),
        this.nlqErrorRepo.findAll(),
      ]);
      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Successfully read all bad NLQ QAs for correction",
        {
          users: users.length,
          nlqQas: nlqQas.length,
          nlqFbs: nlqFbs.length,
          nlqErrors: nlqErrors.length,
        }
      );

      //  ==== FILTERING NLQ = BAD ====
      const nlqBad = nlqQas.filter((nlq) => nlq.isGood === false);
      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Filtered bad NLQ QAs for correction",
        { nlqBad: nlqBad.length }
      );

      //   ==== JOIN NLQ BAD WITH NLQ BAD WITH FEEDBACK BY NLQBAD.feedbackId AND USERS BY NLQBAD.createdBy ====
      //  You must join them in a single object without nesting them.
      const nlqBadWithFbAndUser: TByFeedback[] = nlqBad
        .map((nlq) => {
          const fb = nlqFbs.find((f) => f.id === nlq.feedbackId);
          const user = users.find((u) => u.id === nlq.createdBy);
          return {
            ...nlq,
            feedback: fb || null,
            user: user || null,
          };
        })
        .filter((nlq) => nlq.feedback && nlq.user);

      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Successfully joined bad NLQ QAs with feedback and user",
        { nlqBadWithFbAndUser: nlqBadWithFbAndUser.length }
      );

      //   ==== JOIN NLQ BAD WITH ERRORS BY NLQBAD.id AND USERS BY NLQBAD.createdBy ====
      //  You must join them in a single object without nesting them.
      const nlqBadWithErrorAndUser: TByError[] = nlqBad
        .map((nlq) => {
          const error = nlqErrors.find((e) => e.id === nlq.id);
          const user = users.find((u) => u.id === nlq.createdBy);
          return {
            ...nlq,
            error: error || null,
            user: user || null,
          };
        })
        .filter((nlq) => nlq.error && nlq.user);

      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Successfully joined bad NLQ QAs with error and user",
        { nlqBadWithErrorAndUser: nlqBadWithErrorAndUser.length }
      );

      //   ==== COMBINE BOTH ARRAYS ====
      const combined: TReadNlqQaBadOutRequestDto[] = [
        ...nlqBadWithFbAndUser.map((item) => ({
          byFeedback: item,
          byError: null,
        })),
        ...nlqBadWithErrorAndUser.map((item) => ({
          byFeedback: null,
          byError: item,
        })),
      ];
      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Successfully combined bad NLQ QAs with feedback and error",
        { combined: combined.length, structure: combined[0] }
      );

      //   Now on the query you are going to filter by the following fields:
      //   - user.email
      //   - nlq.question
      //   - nlq.feedback.type
      //   - nlq.feedback.comment
      //   - nlq.error.message
      const filteredByQuery = query
        ? combined.filter((item) => {
            const q = query.toLowerCase();
            return (
              item.byFeedback?.email?.toLowerCase().includes(q) ||
              item.byError?.email?.toLowerCase().includes(q) ||
              item.byFeedback?.question?.toLowerCase().includes(q) ||
              item.byFeedback?.comment?.toLowerCase().includes(q) ||
              item.byError?.errorMessage?.toLowerCase().includes(q)
            );
          })
        : combined;
      this.logger.info(
        "ReadAllBadForCorrectionUseCase: Successfully filtered bad NLQ QAs with feedback and error by query",
        {
          filteredByQuery: filteredByQuery.length,
          structure: filteredByQuery[0],
        }
      );
      return {
        success: true,
        message: "Successfully read all bad NLQ QAs for correction",
        data: filteredByQuery,
      };
    } catch (error) {
      this.logger.error(
        "ReadAllBadForCorrectionUseCase: Error reading all bad NLQ QAs for correction:",
        error.message
      );
      return {
        success: false,
        message: `Error reading all bad NLQ QAs for correction: ${error.message}`,
        data: null,
      };
    }
  }
}
