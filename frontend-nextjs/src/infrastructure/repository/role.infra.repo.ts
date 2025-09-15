import { IRoleRepository } from "@/core/application/interfaces/role.app.inter";
import { FirebaseClientProvider } from "../providers/firebase/firebase-client";
import {
  TCreateRoleDto,
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "@/core/application/dtos/role.domain.dto";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

export class RoleInfraRepository implements IRoleRepository {
  constructor(private firebaseClient: FirebaseClientProvider) {}
  async create(data: TCreateRoleDto): Promise<TRoleOutRequestDto> {
    try {
      const db = this.firebaseClient.getDb();
      const roleRef = doc(collection(db, "roles"));
      await setDoc(roleRef, { ...data, id: roleRef.id });
      console.log("RoleInfraRepository: Created role:", {
        id: roleRef.id,
        ...data,
      });
      return { id: roleRef.id, ...data };
    } catch (error) {
      console.error("RoleInfraRepository: Error creating role:", error);
      throw new Error("Error creating role");
    }
  }
  async update(id: string, data: TUpdateRoleDto): Promise<TRoleOutRequestDto> {
    try {
      const db = this.firebaseClient.getDb();
      const roleRef = doc(collection(db, "roles"), id);
      await setDoc(roleRef, data);
      return { ...data };
    } catch (error) {
      console.error(error);
      throw new Error("Error updating role");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      const db = this.firebaseClient.getDb();
      const roleRef = doc(collection(db, "roles"), id);
      await deleteDoc(roleRef);
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting role");
    }
  }
  async findById(id: string): Promise<TRoleOutRequestDto | null> {
    try {
      const db = this.firebaseClient.getDb();
      const roleRef = doc(collection(db, "roles"), id);
      const roleSnapshot = await getDoc(roleRef);
      if (!roleSnapshot.exists()) {
        return null;
      }
      return {
        id: roleSnapshot.id,
        ...roleSnapshot.data(),
      } as TRoleOutRequestDto;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async findAll(): Promise<TRoleOutRequestDto[]> {
    try {
      const db = this.firebaseClient.getDb();
      const rolesCollection = collection(db, "roles");
      const rolesSnapshot = await getDocs(rolesCollection);
      const roles: TRoleOutRequestDto[] = [];
      rolesSnapshot.forEach((doc) => {
        roles.push({ id: doc.id, ...doc.data() } as TRoleOutRequestDto);
      });
      return roles;
    } catch (error) {
      console.error(error);
      throw new Error("Error finding all roles");
    }
  }
  async findByName(name: string): Promise<TRoleOutRequestDto | null> {
    try {
      const db = this.firebaseClient.getDb();
      const rolesCollection = collection(db, "roles");
      const rolesSnapshot = await getDocs(rolesCollection);
      const role = rolesSnapshot.docs.find((doc) => doc.data().name === name);
      return role
        ? ({ id: role.id, ...role.data() } as TRoleOutRequestDto)
        : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
