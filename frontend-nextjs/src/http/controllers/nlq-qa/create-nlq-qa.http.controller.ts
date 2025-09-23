import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IController } from "../IController.http.controller";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { ICreateNlqQaUseCase } from "@/core/application/usecases/nlq/nlq-qa/create-nlq-qa.usecase";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";

export class CreateNlqQaController implements IController {
  constructor(
    private readonly logger: ILogger,
    private readonly createNlqQaUseCase: ICreateNlqQaUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}

  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    try {
      // ==== INPUT OF REQUEST ====
      this.logger.info("[CreateNlqQaController] handling request", httpRequest);

      //   ==== INPUT HEADERS ====
      //   1. Check headers
      const headers = httpRequest.header as Record<string, string>;
      this.logger.info("[CreateNlqQaController] Headers:", headers);
      //   2. Check authorization
      const authHeader =
        headers["Authorization"] || headers["authorization"] || "";
      if (!authHeader.startsWith("Bearer ")) {
        this.logger.error(
          "[CreateNlqQaController] No token provided",
          httpRequest
        );
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      const token = authHeader.replace("Bearer ", "");
      this.logger.info("[CreateNlqQaController] Token:", token);

      //   3. Decode token
      //   4. Retrieve roles
      //   5. Check roles permissions

      //   ==== INPUT BODY ====
      //   1. Check body
      this.logger.info("[CreateNlqQaController] Body:", httpRequest.body);
      if (!httpRequest.body) {
        this.logger.error("[CreateNlqQaController] No body provided");
        const error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      const body = httpRequest.body as {
        question: string;
      };

      //   2. Check required params
      const bodyParams = Object.keys(body);
      const requiredParams = ["question"];
      for (const param of requiredParams) {
        if (!bodyParams.includes(param)) {
          this.logger.error(`[CreateNlqQaController] Missing param: ${param}`);
          const error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, error.body);
        }
      }
      this.logger.info("[CreateNlqQaController] Body params:", bodyParams);

      // ==== BUSINESS LOGIC USE CASES ====
      const useCase = await this.createNlqQaUseCase.execute({
        question: body.question,
        createdBy: "",
      });

      // ==== OUTPUT RESPONSE ====
      const success = this.httpSuccess.success_200({
        message: "NLQ QA created successfully",
        data: useCase.data,
      });
      return new HttpResponse(success.statusCode, success.body);
    } catch (err) {
      this.logger.error("[CreateNlqQaController] Unexpected error", err);
      const error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
