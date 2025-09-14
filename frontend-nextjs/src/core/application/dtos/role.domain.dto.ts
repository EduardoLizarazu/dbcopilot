export type TCreateRoleDto = {
  name: string;
  description: string;
};

export type TUpdateRoleDto = {
  id: string;
  name: string;
  description: string;
};

export type TRoleInRequestDto = TCreateRoleDto & {
  id: string;
};

export type TRoleOutRequestDto = TRoleInRequestDto;
