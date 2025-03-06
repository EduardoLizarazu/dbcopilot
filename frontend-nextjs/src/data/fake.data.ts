import {
  Role,
  UserWithRoles,
  UserWithRolesAndPermissions,
} from "@/app/auth/users/_types/user.type";

export const fakeUserRoles: UserWithRoles[] = [
  {
    id: 1,
    fullName: "Snow Jon",
    email: "snow@ex.com",
    accountStatus: 0,
    roles: [{ id: 1, name: "admin" }],
  },
  {
    id: 2,
    fullName: "Lannister Cersei",
    email: "cersei@gmail.com",
    accountStatus: 1,
    roles: [{ id: 2, name: "finance" }],
  },
  {
    id: 3,
    fullName: "Lannister Jaime",
    email: "jaime@ex.com",
    accountStatus: 0,
    roles: [{ id: 3, name: "guest" }],
  },
  {
    id: 4,
    fullName: "Stark Arya",
    email: "arya@ex.com",
    accountStatus: 0,
    roles: [{ id: 4, name: "RRHH" }],
  },
  {
    id: 5,
    fullName: "Targaryen Daenerys",
    email: "dae@ex.com",
    accountStatus: 0,
    roles: [{ id: 5, name: "admin" }],
  },
  {
    id: 6,
    fullName: "Melisandre Hello",
    email: "hello@ex.com",
    accountStatus: 0,
    roles: [{ id: 6, name: "finance" }],
  },
  {
    id: 7,
    fullName: "Clifford Ferrara",
    email: "ferrera@ex.com",
    accountStatus: 1,
    roles: [{ id: 7, name: "guest" }],
  },
  {
    id: 8,
    fullName: "Frances Rossini",
    email: "rossini@ex.com",
    accountStatus: 1,
    roles: [{ id: 8, name: "RRHH" }],
  },
  {
    id: 9,
    fullName: "Roxie Harvey",
    email: "harvey@ex.com",
    accountStatus: 1,
    roles: [{ id: 9, name: "admin" }],
  },
];

export const fakeUserRolesPermissionAndDirectPermission: UserWithRolesAndPermissions =
  {
    id: 1,
    fullName: "Snow Jon",
    email: "ex@gmail.com",
    accountStatus: 1,
    roles: [
      {
        id: 1,
        name: "admin",
        permissions: [
          { id: 1, name: "read:users", description: "read users" },
          { id: 3, name: "delete:users", description: "delete users" },
        ],
      },
      {
        id: 2,
        name: "finance",
        permissions: [
          { id: 2, name: "write:users", description: "write users" },
        ],
      },
    ],
    directPermissions: [
      { id: 2, name: "write:users", description: "write users" },
    ],
  };

export const fakeRoles: Role[] = [
  { id: 1, name: "admin" },
  { id: 2, name: "finance" },
  { id: 3, name: "guest" },
  { id: 4, name: "RRHH" },
];

export const fakeUserWithRoles: UserWithRoles = {
  id: 1,
  fullName: "Snow Jon",
  email: "ex@gmail.com",
  accountStatus: 1,
  roles: [
    { id: 1, name: "admin" },
    { id: 2, name: "finance" },
  ],
};
