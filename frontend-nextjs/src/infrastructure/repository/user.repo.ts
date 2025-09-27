import { UserEntity } from "@/core/domain/entities/user.domain.entity";
import { IUserRepository } from "@/core/application/interfaces/auth/user.app.inter";
import { FirebaseClientProvider } from "../providers/firebase/firebase-client";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import {
  TCreateUserDto,
  TUserOutputRequestDto,
  TUpdateUserDto,
} from "@/core/application/dtos/user.app.dto";
import { ILogger } from "@/core/application/interfaces/ilog.app.inter";

export class UserRepository implements IUserRepository {
  constructor(
    private readonly logger: ILogger,
    private firebaseAdmin: FirebaseAdminProvider,
    private firebaseClient: FirebaseClientProvider
  ) {}
  async findAllByEmail(email: string): Promise<TUserOutputRequestDto[]> {
    try {
      const db = this.firebaseAdmin.db;
      const userRef = db.collection(this.firebaseAdmin.coll.NLQ_USERS);
      const querySnapshot = await userRef.where("email", "==", email).get();

      if (querySnapshot.empty) {
        this.logger.info("[UserRepository] No users found by email:", email);
        return [];
      }

      const users: TUserOutputRequestDto[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as TUserOutputRequestDto);
      });

      this.logger.info("[UserRepository] Users found by email:", email);
      return users;
    } catch (error) {
      this.logger.error(
        "[UserRepository] Error finding users by email:",
        error
      );
      throw new Error("Error finding users by email");
    }
  }

  async create(data: TCreateUserDto): Promise<string> {
    try {
      this.logger.info("[UserRepository] Creating user with data:", data);

      // Create user auth in Firebase Auth
      const userRecord = await this.firebaseAdmin.auth.createUser({
        email: data.email,
        password: data.password,
      });

      this.logger.info(
        "[UserRepository] User auth created with UID:",
        userRecord.uid
      );

      // Create user in Firestore with the same UID
      const db = this.firebaseAdmin.db;
      const userRef = db
        .collection(this.firebaseAdmin.coll.NLQ_USERS)
        .doc(userRecord.uid);
      await userRef.set({ ...data });

      this.logger.info(
        "[UserRepository] User created in Firestore with UID:",
        userRecord.uid
      );

      return userRecord.uid;
    } catch (error) {
      this.logger.error("[UserRepository] Error creating user:", error);
      throw new Error("Error creating user");
    }
  }

  async update(id: string, data: TUpdateUserDto): Promise<void> {
    try {
      this.logger.info("[UserRepository] Updating user:", data);

      // Update user auth in Firebase Auth
      if (data.email || data.password) {
        await this.firebaseAdmin.auth.updateUser(id, {
          email: data.email,
          password: data.password,
        });
        this.logger.info(
          "[UserRepository] Updated user auth in Firebase Auth for ID:",
          id
        );
      }

      // Update user data in Firestore
      const db = this.firebaseAdmin.db;
      const userRef = db.collection(this.firebaseAdmin.coll.NLQ_USERS).doc(id);
      await userRef.update({
        ...data,
      });
      this.logger.info(
        "[UserRepository] Updated user data in Firestore for ID:",
        id
      );
    } catch (error) {
      this.logger.error("[UserRepository] Error updating user:", error);
      throw new Error("Error updating user");
    }
  }
  async delete(id: string): Promise<void> {
    try {
      this.logger.info("[UserRepository] Deleting user with ID:", id);
      // Delete user auth in Firebase Auth
      await this.firebaseAdmin.auth.deleteUser(id);
      // Delete user data in Firestore permanently
      await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.NLQ_USERS)
        .doc(id)
        .delete();
    } catch (error) {
      this.logger.error("[UserRepository] Error deleting user:", error);
      throw new Error("Error deleting user");
    }
  }
  async findAll(): Promise<TUserOutputRequestDto[]> {
    try {
      const db = this.firebaseClient.getDb();
      const userCollection = collection(db, this.firebaseAdmin.coll.NLQ_USERS);
      const userSnapshot = await getDocs(userCollection);
      const users: TUserOutputRequestDto[] = [];
      userSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as TUserOutputRequestDto);
      });
      this.logger.info("[UserRepository] Found all users:", users);
      return users;
    } catch (error) {
      this.logger.error("[UserRepository] Error finding all users:", error);
      throw new Error("Error finding all users");
    }
  }
  async findById(id: string): Promise<TUserOutputRequestDto | null> {
    try {
      this.logger.info("[UserRepository] Finding user by ID:", id);
      const db = this.firebaseClient.getDb();
      const userDoc = await getDoc(
        doc(db, this.firebaseAdmin.coll.NLQ_USERS, id)
      );
      if (!userDoc.exists()) {
        return null;
      }
      this.logger.info("[UserRepository] User found by ID:", userDoc.id);
      return { id: userDoc.id, ...userDoc.data() } as TUserOutputRequestDto;
    } catch (error) {
      this.logger.error("[UserRepository] Error finding user by ID:", error);
      return null;
    }
  }
  async findByEmail(email: string): Promise<TUserOutputRequestDto | null> {
    try {
      this.logger.info("[UserRepository] Finding user by email:", email);
      const db = this.firebaseClient.getDb();
      const userQuery = query(
        collection(db, this.firebaseAdmin.coll.NLQ_USERS),
        where("email", "==", email)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        return null;
      }
      const userDoc = userSnapshot.docs[0];
      this.logger.info("[UserRepository] User found by email:", userDoc.id);
      return { id: userDoc.id, ...userDoc.data() } as TUserOutputRequestDto;
    } catch (error) {
      this.logger.error("[UserRepository] Error finding user by email:", error);
      return null;
    }
  }
  async findByName(name: string): Promise<TUserOutputRequestDto[]> {
    try {
      this.logger.info("[UserInfraRepository] Finding users by name:", name);
      const db = this.firebaseClient.getDb();
      const userQuery = query(
        collection(db, this.firebaseAdmin.coll.NLQ_USERS),
        where("name", "==", name)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        return [];
      }
      const users: TUserOutputRequestDto[] = [];
      userSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as TUserOutputRequestDto);
      });
      this.logger.info("[UserInfraRepository] Users found by name:", users);
      return users;
    } catch (error) {
      this.logger.error(
        "[UserInfraRepository] Error finding users by name:",
        error
      );
      return [];
    }
  }
  async findByRoleId(roleId: string): Promise<TUserOutputRequestDto[]> {
    try {
      this.logger.info(
        "[UserInfraRepository] Finding users by role ID:",
        roleId
      );
      // Remember that roleId is a list of roleIds in the user document
      const db = this.firebaseClient.getDb();
      const userQuery = query(
        collection(db, this.firebaseAdmin.coll.NLQ_USERS),
        where("roleIds", "array-contains", roleId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (userSnapshot.empty) {
        return [];
      }
      const users: TUserOutputRequestDto[] = [];
      userSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as TUserOutputRequestDto);
      });
      this.logger.info("[UserInfraRepository] Users found by role ID:", users);
      return users;
    } catch (error) {
      this.logger.error(
        "[UserInfraRepository] Error finding users by role ID:",
        error
      );
      return [];
    }
  }
}
