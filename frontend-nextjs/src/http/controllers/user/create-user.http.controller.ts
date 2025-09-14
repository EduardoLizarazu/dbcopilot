import { ICreateUserAppUseCase } from "@/core/application/usecases/interfaces/user/create-user.app.usecase.inter";
import { IController } from "../IController.http.controller";
import { HttpRequest } from "@/http/helpers/HttpRequest.http";
import { IHttpResponse } from "@/http/helpers/IHttResponse.http";
import { IHttpErrors } from "@/http/helpers/IHttpErrors.http";
import { IHttpSuccess } from "@/http/helpers/IHttpSuccess.http";
import { TCreateUserDto } from "@/core/application/dtos/user.domain.dto";
import { HttpResponse } from "@/http/helpers/HttpResponse.http";

export class CreateUserController implements IController {
  constructor(
    private createUserUseCase: ICreateUserAppUseCase,
    private httpErrors: IHttpErrors,
    private httpSuccess: IHttpSuccess
  ) {}
  async handle(httpRequest: HttpRequest): Promise<IHttpResponse> {
    let error: IHttpResponse | null = null;
    let response: IHttpResponse | null = null;
    try {
      if (!httpRequest.body) {
        error = this.httpErrors.error_400();
        return new HttpResponse(error.statusCode, error.body);
      }
      const { body } = httpRequest;
      const bodyParams = Object.keys(body);
      const requiredParams = ["email", "password", "name", "roles"];
      for (const param of requiredParams) {
        if (!bodyParams.includes(param)) {
          error = this.httpErrors.error_400();
          return new HttpResponse(error.statusCode, error.body);
        }
      }

      const createUserDto = body as TCreateUserDto;
      const user = await this.createUserUseCase.execute(createUserDto);
      response = this.httpSuccess.success_201(user);
      return new HttpResponse(response.statusCode, response.body);
    } catch (err) {
      console.error(err);
      error = this.httpErrors.error_500();
      return new HttpResponse(error.statusCode, error.body);
    }
  }
}
