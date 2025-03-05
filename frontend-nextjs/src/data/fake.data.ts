export const fakeUserRoles = [
  { id: 1, fullName: "Snow Jon", role: "admin", active: "inactive" },
  { id: 2, fullName: "Lannister Cersei", role: "finance", active: "active" },
  { id: 3, fullName: "Lannister Jaime", role: "admin", active: "inactive" },
  { id: 4, fullName: "Stark Arya", role: "guest", active: "inactive" },
  { id: 5, fullName: "Targaryen Daenerys", role: "guest", active: "inactive" },
  { id: 6, fullName: "Melisandre Hello", role: "guest", active: "inactive" },
  { id: 7, fullName: "Clifford Ferrara", role: "guest", active: "active" },
  { id: 8, fullName: "Frances Rossini", role: "RRHH", active: "active" },
  { id: 9, fullName: "Roxie Harvey", role: "admin", active: "active" },
];

export const fakeUserRolesPermissionAndDirectPermission = {
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
      permissions: [{ id: 2, name: "write:users", description: "write users" }],
    },
  ],
  directPermissions: [
    { id: 2, name: "write:users", description: "write users" },
  ],
};
