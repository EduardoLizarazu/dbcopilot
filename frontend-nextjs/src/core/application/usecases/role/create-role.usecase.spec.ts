// Importá tus tipos reales si los tenés
// import { TCreateRoleDto, TRoleOutRequestDto, TResponseDto } from '...';

import { RoleAppEnum } from "../../enums/role.app.enum";
import { CreateRoleUseCase } from "./create-role.usecase";

describe("CreateRoleUseCase (unit)", () => {
  const logger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const repo = {
    findByName: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const makeSut = () => new CreateRoleUseCase(repo as any, logger as any);

  const validDto = {
    name: "Admin",
    description: "Full access",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("debe fallar cuando la validación (zod) no pasa", async () => {
    // Usá un dto inválido (por ejemplo, sin name)
    const sut = makeSut();
    const badDto = { name: "", description: "X" } as any;

    // Asumiendo que tu zod marca error por name vacío
    const out = await sut.execute(badDto);

    expect(out.success).toBe(false);
    expect(out.data).toBeNull();
    expect(out.message).toMatch(/name/i); // mensaje de zod
    expect(logger.error).toHaveBeenCalled();
    // No debe consultar repos
    expect(repo.findByName).not.toHaveBeenCalled();
  });

  it("debe fallar si el rol YA existe (condición corregida)", async () => {
    const sut = makeSut();

    // Arrange: existe un rol con ese nombre
    repo.findByName.mockResolvedValue({ id: "r-1", name: "Admin" });

    const out = await sut.execute(validDto as any);

    // Con tu código actual esta prueba FALLA. Tras corregir la condición, pasa.
    expect(repo.findByName).toHaveBeenCalledWith("Admin");
    expect(out.success).toBe(false);
    expect(out.message).toBe(RoleAppEnum.roleAlreadyExists);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("debe crear y devolver el rol cuando NO existe", async () => {
    const sut = makeSut();

    repo.findByName.mockResolvedValue(null); // no existe
    repo.create.mockResolvedValue("new-id"); // id creado
    const createdRole = {
      id: "new-id",
      name: "Admin",
      description: "Full access",
    };
    repo.findById.mockResolvedValue(createdRole); // lectura post-crear

    const out = await sut.execute(validDto as any);

    expect(out.success).toBe(true);
    expect(out.data).toEqual(createdRole);
    expect(out.message).toBe(RoleAppEnum.roleCreatedSuccessfully);

    expect(repo.findByName).toHaveBeenCalledWith("Admin");
    expect(repo.create).toHaveBeenCalledWith(validDto);
    expect(repo.findById).toHaveBeenCalledWith("new-id");
  });

  it("debe fallar si después de crear no encuentra el rol por id", async () => {
    const sut = makeSut();

    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue("new-id");
    repo.findById.mockResolvedValue(null); // no lo encuentra

    const out = await sut.execute(validDto as any);

    expect(out.success).toBe(false);
    expect(out.data).toBeNull();
    expect(out.message).toBe(RoleAppEnum.roleNotFound);
    expect(logger.error).toHaveBeenCalled();
  });

  it("debe capturar errores inesperados del repositorio y devolver failure", async () => {
    const sut = makeSut();

    repo.findByName.mockRejectedValue(new Error("DB down"));

    const out = await sut.execute(validDto as any);

    expect(out.success).toBe(false);
    expect(out.data).toBeNull();
    expect(out.message).toMatch(/DB down/);
    expect(logger.error).toHaveBeenCalled();
  });
});
