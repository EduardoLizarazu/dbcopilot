// Importá tus tipos reales si los tenés
// import { TCreateRoleDto, TRoleOutRequestDto, TResponseDto } from '...';

import { TCreateRoleDto } from "../../dtos/role.app.dto";
import { RoleAppEnum } from "../../enums/role.app.enum";
import { IRoleRepository } from "../../interfaces/auth/role.app.inter";
import { ILogger } from "../../interfaces/ilog.app.inter";
import { CreateRoleUseCase } from "./create-role.usecase";

describe("CreateRoleUseCase (unit)", () => {
  const logger: Partial<ILogger> = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const repo: {
    findByName: jest.Mock;
    create: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findAll: jest.Mock;
  } = {
    findByName: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
  };

  const makeSut = () =>
    new CreateRoleUseCase(repo as IRoleRepository, logger as ILogger);

  // A valid DTO example to create a role
  const validDto: TCreateRoleDto = {
    name: "Admin",
    description: "Full access",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "system",
    updatedBy: "system",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should fail when validation (zod) does not pass", async () => {
    // Use an invalid DTO (for example, without name)
    const sut = makeSut();
    const badDto: TCreateRoleDto = {
      name: "",
      description: "X",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
    };

    // Assuming your zod marks error for empty name
    const out = await sut.execute(badDto);

    expect(out.success).toBe(false); // success = false
    expect(out.data).toBeNull(); // data = null
    expect(out.message).toMatch(/name/i); // zod error message mentions 'name'
    expect(logger.error).toHaveBeenCalled(); // logs the validation error
    // No debe consultar repos
    expect(repo.findByName).not.toHaveBeenCalled(); // no repo calls, it stop at validation
  });

  it("should fail if the role already exists (condition fixed)", async () => {
    const sut = makeSut();

    // Arrange: already exists the role, this is output from repo (out)
    repo.findByName.mockResolvedValue({
      id: "r-1",
      name: "Admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
    });

    const out = await sut.execute(validDto);

    // Your current code has a bug in the existence check condition.
    expect(repo.findByName).toHaveBeenCalledWith("Admin"); // specific argument
    expect(out.success).toBe(false);
    expect(out.message).toBe(RoleAppEnum.roleAlreadyExists);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("should create and return the role when it does NOT exist", async () => {
    const sut = makeSut();

    repo.findByName.mockResolvedValue(null); // does not exist
    repo.create.mockResolvedValue("new-id"); // created id
    const createdRole: TCreateRoleDto = {
      name: "Admin",
      description: "Full access",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
    };
    repo.findById.mockResolvedValue(createdRole); // lectura post-crear

    const out = await sut.execute(validDto);

    expect(out.success).toBe(true);
    expect(out.data).toEqual(createdRole);
    expect(out.message).toBe(RoleAppEnum.roleCreatedSuccessfully);

    expect(repo.findByName).toHaveBeenCalledWith("Admin");
    expect(repo.create).toHaveBeenCalledWith(validDto);
    expect(repo.findById).toHaveBeenCalledWith("new-id");
  });

  it("should fail if the role is not found by id after creation", async () => {
    const sut = makeSut();

    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue("new-id");
    repo.findById.mockResolvedValue(null); // does not find it

    const out = await sut.execute(validDto);

    expect(out.success).toBe(false);
    expect(out.data).toBeNull();
    expect(out.message).toBe(RoleAppEnum.roleNotFound);
    expect(logger.error).toHaveBeenCalled();
  });

  it("debe capturar errores inesperados del repositorio y devolver failure", async () => {
    const sut = makeSut();

    repo.findByName.mockRejectedValue(new Error("DB down"));

    const out = await sut.execute(validDto);

    expect(out.success).toBe(false);
    expect(out.data).toBeNull();
    expect(out.message).toMatch(/DB down/);
    expect(logger.error).toHaveBeenCalled();
  });
});
