import { IReadAllUserAppUseCase } from "@/core/application/usecases/user/read-all-user.app.usecase.inter";
import { IController } from "../IController.http.controller";
import { HttpErrors } from "@/http/helpers/HttpErrors.http";
import { HttpSuccess } from "@/http/helpers/HttpSuccess.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";

export class ReadAllUserController implements IController {
  constructor(
    private readAllUserUseCase: IReadAllUserAppUseCase,
    private httpErrors: IHttpErrors = new HttpErrors(),
    private httpSuccess: IHttpSuccess = new HttpSuccess()
  ) {}
  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error: IHttpResponse | null = null;
    let response: IHttpResponse | null = null;
    try {
      const { query } = httpRequest;
      const users = await this.readAllUserUseCase.execute();
      if (!users.success) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      response = this.httpSuccess.success_200(users);
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      console.error(err);
      error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
