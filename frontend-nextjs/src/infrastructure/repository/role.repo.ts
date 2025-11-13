import { IRoleRepository } from "@/core/application/interfaces/auth/role.app.inter";
import {
  TCreateRoleDto,
  TRoleOutRequestDto,
  TUpdateRoleDto,
} from "@/core/application/dtos/role.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";

export class RoleRepository implements IRoleRepository {
  constructor(
    private fbAdminProvider: FirebaseAdminProvider,
    private readonly logger: ILogger
  ) {}
  async create(data: TCreateRoleDto): Promise<string> {
    try {
      // Use Firebase Admin SDK to insert role
      const db = this.fbAdminProvider.db;
      const roleDocRef = await db
        .collection(this.fbAdminProvider.coll.NLQ_ROLES)
        .add(data);

      // Update the document with its generated ID
      await roleDocRef.update({ id: roleDocRef.id });

      this.logger.info("RoleInfraRepository: Created role:", {
        id: roleDocRef.id,
        ...data,
      });
      return roleDocRef.id;
    } catch (error) {
      this.logger.error("RoleInfraRepository: Error creating role:", error);
      throw new Error("Error creating role");
    }
  }
  async update(id: string, data: TUpdateRoleDto): Promise<void> {
    try {
      // Use Firebase Admin SDK to update role
      const db = this.fbAdminProvider.db;
      await db
        .collection(this.fbAdminProvider.coll.NLQ_ROLES)
        .doc(id)
        .update(data);
    } catch (error) {
      this.logger.error("RoleInfraRepository: Error updating role:", error);
      throw new Error("Error updating role");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      // Use Firebase Admin SDK to delete role
      const db = this.fbAdminProvider.db;
      await db.collection(this.fbAdminProvider.coll.NLQ_ROLES).doc(id).delete();
    } catch (error) {
      this.logger.error("RoleInfraRepository: Error deleting role:", error);
      throw new Error("Error deleting role");
    }
  }
  async findById(id: string): Promise<TRoleOutRequestDto | null> {
    try {
      // Use Firebase Admin SDK to fetch role by ID
      const db = this.fbAdminProvider.db;
      const roleDoc = await db
        .collection(this.fbAdminProvider.coll.NLQ_ROLES)
        .doc(id)
        .get();
      if (!roleDoc.exists) {
        return null;
      }
      return {
        id: roleDoc.id,
        ...roleDoc.data(),
      } as TRoleOutRequestDto;
    } catch (error) {
      this.logger.error(
        "RoleInfraRepository: Error finding role by ID:",
        error
      );
      return null;
    }
  }
  async findAll(): Promise<TRoleOutRequestDto[]> {
    try {
      // Use Firebase Admin SDK to fetch all roles
      const db = this.fbAdminProvider.db;
      const rolesSnapshot = await db
        .collection(this.fbAdminProvider.coll.NLQ_ROLES)
        .get();
      const roles: TRoleOutRequestDto[] = [];
      rolesSnapshot.forEach((doc) => {
        roles.push({ id: doc.id, ...doc.data() } as TRoleOutRequestDto);
      });
      return roles;
    } catch (error) {
      this.logger.error("RoleInfraRepository: Error finding all roles:", error);
      throw new Error("Error finding all roles");
    }
  }
  async findByName(name: string): Promise<TRoleOutRequestDto | null> {
    try {
      // Use Firebase Admin SDK to query role by name
      const db = this.fbAdminProvider.db;
      const querySnapshot = await db
        .collection(this.fbAdminProvider.coll.NLQ_ROLES)
        .where("name", "==", name)
        .get();
      if (querySnapshot.empty) {
        return null;
      }
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as TRoleOutRequestDto;
    } catch (error) {
      this.logger.error(
        "RoleInfraRepository: Error finding role by name:",
        error
      );
      return null;
    }
  }
}
